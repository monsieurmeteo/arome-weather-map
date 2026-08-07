import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ubdevaemtwbzxksjlhjg.supabase.co";
const supabaseKey = "sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sql = `
    SELECT pg_get_functiondef(p.oid) as def
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_france_live';
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.error("Error executing query:", error);
  } else {
    console.log("get_france_live definition:\n", data);
  }
}

run();
