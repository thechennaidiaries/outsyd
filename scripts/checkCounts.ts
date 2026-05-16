import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function inspectUrls() {
  const { data: noCoords } = await supabase
    .from('activities')
    .select('id, title, location_link')
    .is('latitude', null)
    .limit(10);

  console.log('\n--- Activities WITHOUT Coordinates ---');
  if (noCoords) {
    noCoords.forEach((a, i) => {
      console.log(`${i+1}. [${a.id}] ${a.title}`);
      console.log(`   URL: ${a.location_link}\n`);
    });
  }
}

inspectUrls().catch(console.error);
