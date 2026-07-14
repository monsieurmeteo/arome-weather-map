// Vérification des fichiers Open Data de meteo.data.gouv.fr
// Ces fichiers sont complètement différents de l'API portail-api.meteofrance.fr

async function main() {
    const now = new Date();
    
    // Les fichiers obs sont publiés toutes les 6 minutes sur meteo.data.gouv.fr
    // Format: obs-infrahoraire-6m_<date>T<heure>:00:00Z.json
    // Arrondi aux 6 minutes
    const m6 = Math.floor(now.getUTCMinutes() / 6) * 6;
    const ts = new Date(now);
    ts.setUTCMinutes(m6 - 6, 0, 0);
    
    const yyyy = ts.getUTCFullYear();
    const MM = String(ts.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(ts.getUTCDate()).padStart(2, '0');
    const hh = String(ts.getUTCHours()).padStart(2, '0');
    const mm = String(ts.getUTCMinutes()).padStart(2, '0');
    
    console.log('=== TEST METEO.DATA.GOUV.FR ===');
    console.log(`Heure cible: ${yyyy}-${MM}-${dd}T${hh}:${mm}:00Z`);

    // URL du fichier d'observations 6 minutes sur data.gouv.fr
    const urlDataGouv = `https://object.files.data.gouv.fr/meteofrance/data/synop/obs/obs-infrahoraire-6m_${yyyy}-${MM}-${dd}T${hh}:${mm}:00Z.json`;
    console.log(`\nTest URL 1 (data.gouv.fr): ${urlDataGouv}`);
    
    try {
        const r1 = await fetch(urlDataGouv);
        console.log(`  Status: ${r1.status}`);
        if (r1.ok) {
            const data = await r1.json();
            console.log(`  ✅ Nb enregistrements: ${data.length || (data.features && data.features.length)}`);
            const sample = data[0] || (data.features && data.features[0]);
            console.log('  Clés:', Object.keys(sample || {}).join(', '));
            const fxiKeys = Object.keys(sample || {}).filter(k => /fx|gst|raf/i.test(k));
            console.log('  Clés rafales:', fxiKeys);
        }
    } catch(e) { console.log('  ❌ Erreur:', e.message); }

    // Alternative 1 : fichier CSV SYNOP 
    const urlSynop = `https://object.files.data.gouv.fr/meteofrance/data/synop/synop.${yyyy}${MM}${dd}${hh}.csv`;
    console.log(`\nTest URL 2 (SYNOP CSV): ${urlSynop}`);
    try {
        const r2 = await fetch(urlSynop);
        console.log(`  Status: ${r2.status}`);
        if (r2.ok) {
            const text = await r2.text();
            const lines = text.split('\n');
            console.log(`  ✅ Nb lignes: ${lines.length}`);
            console.log('  Entête:', lines[0]);
            const hasFxi = lines[0].toLowerCase().includes('fxi') || lines[0].toLowerCase().includes('rafale');
            console.log('  Contient fxi/rafale:', hasFxi);
        }
    } catch(e) { console.log('  ❌ Erreur:', e.message); }

    // Alternative 2 : fichier d'obs infra-horaire sur data.gouv.fr (autre format)
    const urlObs = `https://object.files.data.gouv.fr/meteofrance/data/obs/temp-sol/obs-sol_${yyyy}${MM}${dd}${hh}${mm}.csv`;
    console.log(`\nTest URL 3 (obs-sol): ${urlObs}`);
    try {
        const r3 = await fetch(urlObs);
        console.log(`  Status: ${r3.status}`);
    } catch(e) { console.log('  ❌ Erreur:', e.message); }

    // Alternative 3 : API meteo.data.gouv.fr REST
    const urlApi = `https://meteo.data.gouv.fr/api/v1/public/observations?period=1h&format=json`;
    console.log(`\nTest URL 4 (meteo.data.gouv.fr API REST): ${urlApi}`);
    try {
        const r4 = await fetch(urlApi);
        console.log(`  Status: ${r4.status}`);
        if (r4.ok) {
            const data = await r4.json();
            console.log('  Résultat:', JSON.stringify(data).substring(0, 500));
        }
    } catch(e) { console.log('  ❌ Erreur:', e.message); }
}

main().catch(console.error);
