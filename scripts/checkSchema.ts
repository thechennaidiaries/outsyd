import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkSchema() {
  const { data, error } = await supabase.from('activities').select('*').limit(1);
  if (data && data[0]) {
    console.log('Columns in activities:', Object.keys(data[0]));
    console.log('Sample row:', data[0]);
  } else {
    console.log('No data or error:', error);
  }
}

checkSchema().catch(console.error);
