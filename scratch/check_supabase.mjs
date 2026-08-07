import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Checking Supabase connection with light query...');
  const start = Date.now();
  
  try {
    // Attempt a light query (select 1 from stations)
    const promise = supabase.from('stations').select('id').limit(1);
    
    // 5 second timeout
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out after 5s')), 5000)
    );
    
    const { data, error } = await Promise.race([promise, timeout]);
    
    const end = Date.now();
    console.log(`Response received in ${end - start}ms`);
    
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Success! Connection established.');
      console.log('Data:', data);
    }

    // Now try to check the row count of observations_6mn but with a faster approach if possible
    console.log('Checking row count in observations_6mn (approx)...');
    // Using an RPC if it exists, or just a count with a longer timeout
    const { count, error: countError } = await supabase
      .from('observations_6mn')
      .select('*', { count: 'estimated', head: true });
    
    if (countError) console.error('Count error:', countError);
    else console.log('Estimated count:', count);

  } catch (err) {
    console.error('Check failed:', err.message);
  }
}

check();
