// Inspection du fichier SYNOP donneespubliques.meteofrance.fr
const now = new Date();
const m = Math.floor(now.getUTCMinutes()/6)*6;
const ts = new Date(now);
ts.setUTCMinutes(m-6, 0, 0);
const hh = String(ts.getUTCHours()).padStart(2,'0');
const mm = String(ts.getUTCMinutes()).padStart(2,'0');
const yyyymmdd = ts.toISOString().split('T')[0].replace(/-/g,'');

const url = `https://donneespubliques.meteofrance.fr/donnees_libres/Txt/Synop/synop.${yyyymmdd+hh}.csv`;
console.log('Fetching:', url);

const r = await fetch(url);
const text = await r.text();
const lines = text.split('\n').filter(l => l.trim());

// L'entête peut être vide ou séparé - chercher la vraie entête
console.log(`Nb lignes: ${lines.length}`);
console.log('Ligne 1:', lines[0].substring(0, 500));
console.log('Ligne 2:', lines[1] ? lines[1].substring(0, 500) : '(vide)');
console.log('Ligne 3:', lines[2] ? lines[2].substring(0, 500) : '(vide)');

// Chercher toutes les colonnes contenant des données de vent
const header = lines[0];
const cols = header.split(';');
console.log(`\nNb colonnes: ${cols.length}`);
console.log('Toutes les colonnes:');
cols.forEach((c, i) => console.log(`  [${i}] ${c}`));

// Chercher spécifiquement les colonnes de rafales
const windCols = cols.map((c, i) => ({name: c, idx: i})).filter(c => 
    /ff|fx|dd|vent|wind|rafale|gst|max/i.test(c.name)
);
console.log('\nColonnes vent/rafales trouvées:', windCols);

if (windCols.length > 0) {
    // Regarder les 5 premières lignes de données
    console.log('\nExemples de données (5 premières lignes):');
    lines.slice(1, 6).forEach(line => {
        const vals = line.split(';');
        windCols.forEach(c => {
            console.log(`  Station ${vals[0]}: ${c.name}=${vals[c.idx]}`);
        });
        console.log('---');
    });
}
