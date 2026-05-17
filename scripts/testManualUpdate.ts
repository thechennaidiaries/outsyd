import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function testManualUpdate() {
  // Get an activity ID without coordinates
  const { data: row } = await supabase.from('activities').select('id').is('latitude', null).limit(1).single();
  
  if (!row) {
    console.log('No rows to test.');
    return;
  }

  console.log(`Testing update for ID: ${row.id}`);
  
  const { error, data } = await supabase
    .from('activities')
    .update({ latitude: 12.345, longitude: 67.890 })
    .eq('id', row.id)
    .select();

  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Update Success! Result:', data);
  }
}

testManualUpdate().catch(console.error);
