import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const content = fs.readFileSync('.env.local', 'utf8');
const url = content.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const key = content.match(/VITE_SUPABASE_ANON_KEY="(.*?)"/)[1];

const supabase = createClient(url, key);

const { data, error } = await supabase.storage.from('vigilance-captures').list('', {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' }
});

if (error) {
    console.error("Error listing bucket:", error);
} else {
    console.log("Bucket files count:", data.length);
    const forestFiles = data.filter(f => f.name.includes('foret'));
    console.log("Forest files found:", forestFiles.map(f => ({ name: f.name, updated_at: f.updated_at })));
    
    const sampleFiles = data.slice(0, 10);
    console.log("Sample files in bucket:", sampleFiles.map(f => ({ name: f.name, updated_at: f.updated_at })));
}
