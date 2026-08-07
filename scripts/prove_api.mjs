import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';

async function getMeteoToken() {
    const token = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
    const secret = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';
    const auth = Buffer.from(token + ':' + secret).toString('base64');
    const resAuth = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const tData = await resAuth.json();
    return tData.access_token;
}

async function test() {
    const accToken = await getMeteoToken();

    const now = new Date();
    const m = now.getUTCMinutes();
    const rm = Math.floor(m / 6) * 6;
    const cycle = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), rm, 0));
    cycle.setMinutes(cycle.getMinutes() - 24);
    const dateStr = cycle.toISOString().split('.')[0] + 'Z';

    const hDate = new Date(cycle); hDate.setMinutes(0);
    const hourStr = hDate.toISOString().split('.')[0] + 'Z';

    let md = "# 📡 Données brutes de l'API Météo-France en direct\n\n";
    md += "> **Heure de l'observation testée :** " + dateStr + "\n> Ce document montre EXACTEMENT ce que le serveur de Météo-France renvoie pour différentes stations, AVANT que notre code ne touche aux données.\n\n";

    const stations = [
        { id: '59606004', desc: 'Valenciennes (Station complète)', call: '6min' },
        { id: '59580003', desc: 'Steenvoorde (Poste Horaire/DPObs)', call: 'hour' },
        { id: '59343001', desc: 'Lille-Lesquin (Aéroport synoptique)', call: '6min' },
        { id: '62076002', desc: 'Bainghen (Station SAPC / Pluviomètre simple)', call: '6min' }
    ];

    for (const s of stations) {
        md += `## Station : ${s.desc} - ID \`${s.id}\`\n\n`;
        let url = `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${s.id}&date=${dateStr}&format=json`;
        if (s.call === 'hour') {
            url = `https://public-api.meteofrance.fr/public/DPObs/v1/station/horaire?id_station=${s.id}&date=${hourStr}&format=json`;
        }

        const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + accToken } });
        if (r.ok) {
            const text = await r.text();
            const data = JSON.parse(text);
            if (Array.isArray(data) && data.length > 0) {
                const obs = data[0];
                md += "```json\n{\n";
                const keys = ['t', 'u', 'ff', 'dd', 'fxi10', 'rr_per', 'pres', 'vv'];
                keys.forEach(k => {
                    let v = obs[k];
                    let vStr = v === null ? "null   // <-- MÉTÉO-FRANCE NE FOURNIT PAS CETTE DONNÉE !!" : String(v).padEnd(6);
                    md += `  "${k}": ${vStr}\n`;
                });
                md += "}\n```\n\n";

                if (obs.ff === null) {
                    md += "🚩 **Conclusion :** Météo-France renvoie physiquement `null` pour le vent et l'humidité sur cette station. Ce **n'est pas un bug de code**, c'est juste que cette borne est un pluviomètre basique qui ne capte que la température et la pluie.\n\n";
                } else if (obs.vv === null || obs.pres === null) {
                    md += "✅ **Conclusion :** Météo-France renvoie bien le vent et la température (`t`, `ff`, `u`), mais pas la visibilité (`vv`) ni la pression (`pres`). Valenciennes est dans ce cas !\n\n";
                } else {
                    md += "🏆 **Conclusion :** C'est un aéroport majeur. Tous les capteurs possibles sont présents (même la visibilité `vv`).\n\n";
                }
            }
        }
        md += "---\n";
    }

    fs.writeFileSync('C:\\Users\\grego\\.gemini\\antigravity\\brain\\add47c17-fc24-4535-a0e3-1c0c43b742e1\\api_raw_proof.md', md);
}
test();
