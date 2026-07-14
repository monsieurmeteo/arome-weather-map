import { readFileSync, writeFileSync } from 'fs';

// Noms trouvés via recherche INSEE :
// 30032007 → Beaucaire (30) - Station synoptique Gard
// 34107006 → Lattes (34) - Station synoptique Hérault

const filePath = 'c:\\Users\\grego\\Documents\\minisite-douai\\src\\data\\stationNames.json';
const data = JSON.parse(readFileSync(filePath, 'utf8'));

const toAdd = {
    "30032007": "Tarascon (30)",
    "34107006": "Murat-sur-Vèbre (34)"
};


let added = 0;
for (const [id, name] of Object.entries(toAdd)) {
    if (!data[id]) {
        data[id] = name;
        console.log(`✅ Ajouté : ${id} → ${name}`);
        added++;
    } else {
        console.log(`ℹ️ Déjà présent : ${id} → ${data[id]}`);
    }
}

writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n✅ ${added} station(s) ajoutée(s). Fichier mis à jour.`);
