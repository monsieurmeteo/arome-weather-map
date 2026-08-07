// Test des URLs data.gouv.fr pour les fichiers d'observations 6mn avec rafales
const now = new Date();
const m = Math.floor(now.getUTCMinutes()/6)*6;
const ts = new Date(now);
ts.setUTCMinutes(m-6, 0, 0);
const hh = String(ts.getUTCHours()).padStart(2,'0');
const mm = String(ts.getUTCMinutes()).padStart(2,'0');
const ymd = ts.toISOString().split('T')[0];
const yyyymmdd = ymd.replace(/-/g,'');

console.log(`Test à ${ymd}T${hh}:${mm}:00Z\n`);

const urls = [
    `https://object.files.data.gouv.fr/meteofrance/data/synop/obs/synop.${yyyymmdd+hh}.csv`,
    `https://object.files.data.gouv.fr/meteofrance/data/synop/obs/synop.${yyyymmdd+hh+mm}.csv`,
    `https://object.files.data.gouv.fr/meteofrance/data/synop/obs-6min/obs-infrahoraire-6m_${ymd}T${hh}:${mm}:00Z.json`,
    `https://object.files.data.gouv.fr/meteofrance/data/synop/obs-6min/obs-infrahoraire-6m_${ymd}T${hh}:${mm}:00Z.csv`,
    `https://object.files.data.gouv.fr/meteofrance/data/synop/recent/synop-obs_${ymd}T${hh}00.csv`,
    `https://donneespubliques.meteofrance.fr/donnees_libres/Txt/Synop/synop.${yyyymmdd+hh}.csv`,
    `https://donneespubliques.meteofrance.fr/donnees_libres/Txt/Synop/synop.${yyyymmdd+hh+mm}.csv`,
];

for (const u of urls) {
    try {
        const r = await fetch(u);
        if (r.ok) {
            const text = await r.text();
            const lines = text.split('\n');
            console.log(`✅ [${r.status}] ${u}`);
            console.log(`   ${lines.length} lignes - Entête: ${lines[0].substring(0,200)}`);
            // Chercher fxi dans l'entête
            if (lines[0].toLowerCase().includes('fxi') || lines[0].toLowerCase().includes('rafale')) {
                console.log('   🎯 CONTIENT DES RAFALES (fxi/rafale) !');
                // Trouver l'index de la colonne
                const cols = lines[0].split(';');
                const fxiIdx = cols.findIndex(c => c.toLowerCase().includes('fxi'));
                if (fxiIdx >= 0) {
                    console.log(`   Colonne rafale: ${cols[fxiIdx]} (index ${fxiIdx})`);
                    const vals = lines.slice(1, 10).map(l => l.split(';')[fxiIdx]).filter(v => v && v !== 'mq');
                    console.log(`   Exemples valeurs: ${vals.join(', ')}`);
                }
            }
        } else {
            console.log(`❌ [${r.status}] ${u}`);
        }
    } catch(e) {
        console.log(`💥 Erreur: ${u} → ${e.message}`);
    }
}
