import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Calling get_france_live with pagination...");
    let allData = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .rpc('get_france_live')
            .range(from, from + batchSize - 1);

        if (error) {
            console.error("RPC Error at", from, error);
            break;
        }
        if (data && data.length > 0) {
            allData.push(...data);
            console.log(`Fetched ${data.length} records from ${from}`);
            if (data.length < batchSize) hasMore = false;
            else from += batchSize;
        } else {
            hasMore = false;
        }
    }

    console.log("RPC Success! Total data count:", allData.length);
    if (allData.length > 0) {
        console.log("Sample record:", allData[0]);
    }
}

test();

