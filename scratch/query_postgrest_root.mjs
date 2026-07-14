import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
    const res = await fetch(`${url}/rest/v1/`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    if (!res.ok) {
        console.error('❌ Request failed:', res.status, res.statusText);
        return;
    }

    const data = await res.json();
    console.log('✅ PostgREST OpenAPI spec received.');
    
    console.log('\n--- Exposed Tables & Views ---');
    const paths = Object.keys(data.paths);
    paths.filter(p => !p.startsWith('/rpc/')).forEach(p => console.log(` - ${p}`));

    console.log('\n--- Exposed RPC Functions ---');
    paths.filter(p => p.startsWith('/rpc/')).forEach(p => {
        console.log(` - ${p}`);
        // Log parameters
        const postSpec = data.paths[p].post;
        if (postSpec && postSpec.parameters) {
            postSpec.parameters.forEach(param => {
                console.log(`     * Param: ${param.name} (${param.schema?.type || 'unknown'})`);
            });
        }
    });
}

run();
