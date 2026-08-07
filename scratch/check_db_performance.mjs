import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR@db.ubdevaemtwbzxksjlhjg.supabase.co:5432/postgres';

async function checkIndexes() {
    const client = new Client({ connectionString });
    await client.connect();
    
    console.log('Checking indexes on observations_6mn...');
    const res = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'observations_6mn';
    `);
    
    console.log('Indexes found:');
    res.rows.forEach(r => console.log(` - ${r.indexname}`));
    
    console.log('\nChecking table size...');
    const sizeRes = await client.query(`SELECT count(*) FROM observations_6mn;`);
    console.log(`Total records: ${sizeRes.rows[0].count}`);
    
    await client.end();
}

checkIndexes();
