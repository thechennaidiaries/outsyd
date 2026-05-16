import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Extracts coordinates from various Google Maps URL formats
 */
async function extractCoordinates(url: string): Promise<Coordinates | null> {
  try {
    let targetUrl = url;

    // Follow redirects for short URLs (goo.gl, maps.app.goo.gl, share.google)
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl') || url.includes('share.google')) {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      targetUrl = response.url;
    }

    // Pattern 1: @lat,lng (most common in long URLs)
    const atMatch = targetUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return {
        latitude: parseFloat(atMatch[1]),
        longitude: parseFloat(atMatch[2]),
      };
    }

    // Pattern 2: !3dlat!4dlng (internal Google Maps format)
    const bangMatch = targetUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (bangMatch) {
      return {
        latitude: parseFloat(bangMatch[1]),
        longitude: parseFloat(bangMatch[2]),
      };
    }

    // Pattern 3: q=lat,lng (search parameter)
    const qMatch = targetUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return {
        latitude: parseFloat(qMatch[1]),
        longitude: parseFloat(qMatch[2]),
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to resolve/parse URL: ${url}`, error);
    return null;
  }
}

async function processTable(tableName: 'activities' | 'events') {
  console.log(`\n--- Processing Table: ${tableName} ---`);
  
  const linkColumn = tableName === 'activities' ? 'location_link' : 'maps_link';

  const { data: rows, error } = await supabase
    .from(tableName)
    .select(`id, ${linkColumn}`)
    .not(linkColumn, 'is', null)
    .is('latitude', null)
    .is('longitude', null);

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return;
  }

  if (!rows || rows.length === 0) {
    console.log(`No pending records found in ${tableName}.`);
    return;
  }

  console.log(`Found ${rows.length} records to process in ${tableName}.`);

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const row of rows) {
    const url = (row as any)[linkColumn];
    const coords = await extractCoordinates(url);

    if (coords) {
      const { error: updateError, data: updatedData } = await supabase
        .from(tableName)
        .update({
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
        .eq('id', row.id)
        .select();

      if (updateError) {
        console.error(`Failed to update ${tableName} ID ${row.id}:`, updateError);
        failCount++;
      } else if (!updatedData || updatedData.length === 0) {
        console.warn(`⚠️ Reported success but 0 rows affected for ${tableName} ID ${row.id}`);
        failCount++;
      } else {
        console.log(`✅ Verified Update ID ${row.id}: ${coords.latitude}, ${coords.longitude}`);
        successCount++;
      }
    } else {
      console.log(`⚠️ No coordinates in URL for ID ${row.id}: ${url}`);
      skipCount++;
    }
  }

  console.log(`\nSummary for ${tableName}:`);
  console.log(`- Total pending: ${rows.length}`);
  console.log(`- Success: ${successCount}`);
  console.log(`- Extraction failed: ${skipCount}`);
  console.log(`- Update failed: ${failCount}`);
}

async function main() {
  console.log('🚀 Starting Coordinate Enrichment Script...');
  await processTable('activities');
  await processTable('events');
  console.log('\n🏁 Script completed.');
}

main().catch(console.error);
