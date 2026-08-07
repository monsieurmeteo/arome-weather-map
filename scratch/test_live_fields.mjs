import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ubdevaemtwbzxksjlhjg.supabase.co";
const supabaseKey = "sb_publishable_1qhA0xAnNSd3VxpoLdxYrQ_yUemEhaP";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Fetching live data...");
  const { data, error } = await supabase.rpc('get_france_live').limit(2);
  if (error) {
    console.error("Error calling get_france_live:", error);
    return;
  }
  console.log("Response data:", JSON.stringify(data, null, 2));
}

check();
