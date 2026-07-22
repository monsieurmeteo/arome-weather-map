# 🎨 Audit Complet & Charte Graphique Figée — Design System Monsieur Météo

Ce document constitue **l'audit complet, la charte graphique officielle et la référence technique définitive** applicables à l'ensemble des cartes d'observations et prévisions météo (TV Broadcast 16:9 et TikTok/Mobile 9:16).

---

## 📜 1. HISTORIQUE & AUDIT DES DÉCISIONS DE DESIGN

Au cours de la refonte visuelle globale, les choix graphiques suivants ont été arbitrés et validés avec l'utilisateur :

1. **Typographie Infographie TV Broadcast** :
   - Abandon total des polices à empattements classiques.
   - Adoption d'une typographie sans-serif moderne, condensée et ultra-lisible : **`Roboto Condensed` / `Oswald` / `Outfit`**.
   - Valeurs numériques puissantes (`900` Ultra-bold), éléments en capitales et hiérarchie visuelle stricte.

2. **Ciel & Coucher de Soleil Monsieur Météo (Voile Studio 48 %)** :
   - Arrière-plan photographique du ciel au couchant (`CARTE PAYSAGE METEOCIEL.png` / `CARTE PORTRAIT METEOCIEL.png`) flouté à `blur(5px)`.
   - Voile bleu-nuit studio calibré à **48 % d'opacité** (`rgba(8, 14, 30, 0.48)`), restituant les nuances chaudes des nuages et du soleil couchant tout en garantissant un contraste exceptionnel pour la lisibilité des chiffres.

3. **Habillage des Titres & Postes sur 2 Lignes Structurées** :
   - **Titres principaux** : Les titres composés (*`TEMPÉRATURE<br/>MAXIMALE`*, *`CUMUL DE<br/>PRÉCIPITATIONS`*, *`RAFALES<br/>MAXIMALES`*) basculent automatiquement sur 2 lignes à l'interligne très serré (`line-height: 0.98`), empêchant tout débordement vers la droite.
   - **Noms de communes (Postes)** : Les communes longues ou composées (*Saint-Martin-de-Ré – Port des Salines*, *Chamonix-Mont-Blanc - Glacier Bossons*) basculent automatiquement sur 2 lignes (ligne 1 `34px` bold, ligne 2 `28px` semi-bold).
   - **Régions longues** : Les régions à intitulés longs (*Provence-Alpes-Côte d'Azur*, *Bourgogne-Franche-Comté*, *Auvergne-Rhône-Alpes*) sont affichées de manière responsive sur 2 lignes sans risque d'empiéter sur le logo.

4. **Décalage Gauche & Redistribution Idéale de la Grille (1080px Utile)** :
   - Décalage du tableau vers la gauche (`left: 760px` en paysage), comblant l'espace vide entre le titre et le tableau.
   - Redistribution des colonnes : `9 %` (Rang), `43 %` (Station sur 2 lignes), `25 %` (Badge Record), `23 %` (Valeur & Unité).
   - **Bénéfice** : Les données de droite (valeurs, unités `°C`, `mm`, `km/h` et badges records) ne sont plus du tout compressées ni collées au bord droit.

---

## 🔒 2. FICHE TECHNIQUE FICTIONNELLE & DÉFINITIVE (`:root`)

```css
:root {
  /* Arrière-plan & Voile Studio Monsieur Météo (48%) */
  --bg-dark-veil: rgba(8, 14, 30, 0.48);
  --panel-bg: linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.80) 100%);
  --panel-border: 1px solid rgba(255, 255, 255, 0.14);
  --panel-radius: 18px;
  --panel-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);

  /* Accents par phénomène météo */
  --accent-hot: #f43f5e;
  --accent-cold: #38bdf8;
  --accent-rain: #38bdf8;
  --accent-wind: #fbbf24;
  --accent-trophy: #f59e0b;
  --accent-gold: #ffcc00;

  /* Typographies Infographie Broadcast */
  --font-family: 'Roboto Condensed', 'Oswald', 'Outfit', sans-serif;
}
```

---

## 📐 3. GRILLE MAÎTRE & SPÉCIFICATIONS DES COLONNES

| Élément | Format TV (16:9 - 1920×1080) | Format Mobile TikTok (9:16 - 1080×1920) | Poids | Spécification Visuelle |
|---|---|---|---|---|
| **Conteneur Tableau** | `top: 135px`, `left: 760px`, `width: 1080px` | `top: 485px`, `left: 50%`, `width: 1000px` | -- | Décalé à gauche (TV) / Centré élargi (Mobile) |
| **Col 1 (Rang)** | `9 %` (`~97px`) | `9 %` (`~90px`) | `900` | Pastille `62×62px` (TV) / `54×54px` (Mobile), font `34px`/`30px` |
| **Col 2 (Station)** | `43 %` (`~464px`) | `43 %` (`~430px`) | `800` | Postes sur **2 lignes** (ligne 1 `34px`/`30px`, ligne 2 `28px`/`24px`) |
| **Col 3 (Record)** | `25 %` (`~270px`) | `25 %` (`~250px`) | `800` | Badge Record `22px` (`padding: 7px 18px`) + Date anc. `16px` |
| **Col 4 (Valeur)** | `23 %` (`~249px`, `min-width: 230px`) | `23 %` (`~230px`, `min-width: 190px`) | `900` | Chiffres `92px` (TV) / `86px` (Mobile), recul `48px`, Unités `0.32em` (`+8px`) |
| **Titre Principal** | `58px` (`line-height: 0.98`) | `48px` (`line-height: 0.98`) | `900` | 2 lignes structurées (`formatTitleHTML`), `max-width: 620px` |

---

## 🛠️ 4. FONCTIONS JAVASCRIPT CLÉS (`index_meteociel.html`)

```javascript
// 1. Titres composés sur 2 lignes structurées
function formatTitleHTML(rawTitle) {
  if (!rawTitle) return "";
  let t = rawTitle.toUpperCase().trim();
  if (t === "TEMPÉRATURE MAXIMALE") return "TEMPÉRATURE<br/>MAXIMALE";
  if (t === "TEMPÉRATURE MINIMALE") return "TEMPÉRATURE<br/>MINIMALE";
  if (t === "CUMUL DE PRÉCIPITATIONS") return "CUMUL DE<br/>PRÉCIPITATIONS";
  if (t === "RAFALES MAXIMALES") return "RAFALES<br/>MAXIMALES";
  if (t === "BILAN DU JOUR") return "BILAN DU<br/>JOUR";
  const words = t.split(' ');
  if (words.length === 2) return words[0] + "<br/>" + words[1];
  if (words.length > 2) {
    const mid = Math.ceil(words.length / 2);
    return words.slice(0, mid).join(' ') + "<br/>" + words.slice(mid).join(' ');
  }
  return t;
}

// 2. Postes / Communes structurés sur 2 lignes
function formatStationNameHTML(rawName) {
  if (!rawName) return "";
  let n = rawName.trim();
  if (n.includes(' – ')) {
    const pts = n.split(' – ');
    return `<span class="st-line1">${pts[0]}</span><span class="st-line2">– ${pts.slice(1).join(' – ')}</span>`;
  }
  if (n.includes(' - ')) {
    const pts = n.split(' - ');
    return `<span class="st-line1">${pts[0]}</span><span class="st-line2">- ${pts.slice(1).join(' - ')}</span>`;
  }
  if (n.length > 22) {
    const words = n.split(' ');
    if (words.length > 1) {
      const mid = Math.ceil(words.length / 2);
      return `<span class="st-line1">${words.slice(0, mid).join(' ')}</span><span class="st-line2">${words.slice(mid).join(' ')}</span>`;
    }
  }
  return `<span class="st-line1">${n}</span>`;
}

// 3. Valeurs numériques et unités alignées
function formatValueHTML(val, param) {
  if (val === null || val === undefined) return "--";
  let numStr = "", unitStr = "";
  if (param.includes('precip')) {
    numStr = val.toFixed(1).replace('.', ','); unitStr = " mm";
  } else if (param.includes('gust') || param === 'coups_de_vent') {
    numStr = Math.round(val).toString(); unitStr = " km/h";
  } else {
    numStr = val.toFixed(1).replace('.', ','); unitStr = " °c";
  }
  return `<div class="value-inline"><span class="val-num">${numStr}</span><span class="val-unit">${unitStr}</span></div>`;
}
```

---

## 🧪 5. SUITE DE TESTS & VERIFICATION AUTOMATIQUE

- **Script de stress autonome** : `python test_stress_cases.py`
- **Validation** : Testé sur 4 cas extrêmes (cumuls pluviométriques > 1 000 mm, stations ultra-longues, températures négatives, rafales d'ouragan 215 km/h).
- **Dossier d'exemples de référence** :
  - 📂 `C:\Users\grego\Desktop\EXEMPLES_CARTES_PAR_PARAMETRE`
  - 📂 `C:\Users\grego\Desktop\EXEMPLES_CARTES_PAR_PARAMETRE\TESTS_ROBUSTESSE`
