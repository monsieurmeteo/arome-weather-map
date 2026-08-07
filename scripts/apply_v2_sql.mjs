import fs from 'fs';
import pg from 'pg';
import path from 'path';
const { Client } = pg;

async function applyOptimizations() {
    const sql = fs.readFileSync('supabase/migrations/99999999_final_fix_v2.sql', 'utf8');
    
    const client = new Client({
        host: 'db.ubdevaemtwbzxksjlhjg.supabase.co',
        port: 5432,
        user: 'postgres',
        password: 'Meteoclimatpro',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(sql);
        console.log('✅ Fonction de synchronisation optimisée appliquée avec succès !');
        await client.end();
    } catch (e) {
        console.error('❌ Erreur :', e.message);
        await client.end();
    }
}

applyOptimizations();
