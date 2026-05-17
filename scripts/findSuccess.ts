import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function findSuccess() {
  const { data } = await supabase
    .from('activities')
    .select('id, title, location_link, latitude, longitude')
    .not('latitude', 'is', null)
    .limit(5);

  console.log('\n--- Activities WITH Coordinates ---');
  console.table(data);
}

findSuccess().catch(console.error);
