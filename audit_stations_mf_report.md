# 🔍 AUDIT DES STATIONS MÉTÉO-FRANCE — Données infrahoraires 6 min

> **Date d'audit** : 03/03/2026 11:44:21
> **Cycle analysé (principal)** : 2026-03-03T10:12:00Z
> **Cycle de comparaison** : 2026-03-03T10:06:00Z

## 📊 Résumé Global

| Métrique | Valeur |
|---|---|
| **Total stations reçues** | 1939 |
| **Stations complètes** (tous champs) | 149 (8%) |
| Avec Température | 1899 (98%) |
| Avec Vent moyen | 769 (40%) |
| Avec Rafales | 769 (40%) |
| Avec Précipitations | 1906 (98%) |
| Avec Pression | 213 (11%) |
| Avec Humidité | 752 (39%) |
| Avec Visibilité | 156 (8%) |
| Avec Direction vent | 769 (40%) |
| Avec Point de rosée | 751 (39%) |

### Champs nuls (tous départements confondus)

| Champ | Stations sans cette donnée | % manquant |
|---|---|---|
| **Température** (`t`) | 40 | 2% |
| **Point de rosée** (`td`) | 1188 | 61% |
| **Humidité** (`u`) | 1187 | 61% |
| **Vent moyen** (`ff`) | 1170 | 60% |
| **Direction vent** (`dd`) | 1170 | 60% |
| **Pression** (`pres`) | 1726 | 89% |
| **Précipitations** (`rr_per`) | 33 | 2% |
| **Rafales** (`fxi10`) | 1170 | 60% |
| **Visibilité** (`vv`) | 1783 | 92% |

---
## 🗺️ Analyse Département par Département

### Synthèse par département

| Dept | Nom | Stations | Complètes | Anomalies | % complètes |
|---|---|---|---|---|---|
| 01 | Ain | 15 | 1 | 14 | 🔴 7% |
| 02 | Aisne | 12 | 1 | 11 | 🔴 8% |
| 03 | Allier | 22 | 1 | 21 | 🔴 5% |
| 04 | Alpes-de-Haute-Provence | 19 | 1 | 18 | 🔴 5% |
| 05 | Hautes-Alpes | 24 | 0 | 24 | 🔴 0% |
| 06 | Alpes-Maritimes | 36 | 2 | 34 | 🔴 6% |
| 07 | Ardèche | 38 | 1 | 37 | 🔴 3% |
| 08 | Ardennes | 17 | 1 | 16 | 🔴 6% |
| 09 | Ariège | 11 | 1 | 10 | 🔴 9% |
| 10 | Aube | 18 | 1 | 17 | 🔴 6% |
| 11 | Aude | 23 | 1 | 22 | 🔴 4% |
| 12 | Aveyron | 23 | 2 | 21 | 🔴 9% |
| 13 | Bouches-du-Rhône | 21 | 3 | 18 | 🔴 14% |
| 14 | Calvados | 19 | 2 | 17 | 🔴 11% |
| 15 | Cantal | 24 | 1 | 23 | 🔴 4% |
| 16 | Charente | 12 | 2 | 10 | 🔴 17% |
| 17 | Charente-Maritime | 15 | 2 | 13 | 🔴 13% |
| 18 | Cher | 19 | 2 | 17 | 🔴 11% |
| 19 | Corrèze | 19 | 2 | 17 | 🔴 11% |
| 20 | Corse | 47 | 5 | 42 | 🔴 11% |
| 21 | Côte-d'Or | 24 | 1 | 23 | 🔴 4% |
| 22 | Côtes-d'Armor | 14 | 2 | 12 | 🔴 14% |
| 23 | Creuse | 18 | 1 | 17 | 🔴 6% |
| 24 | Dordogne | 14 | 1 | 13 | 🔴 7% |
| 25 | Doubs | 21 | 0 | 21 | 🔴 0% |
| 26 | Drôme | 29 | 2 | 27 | 🔴 7% |
| 27 | Eure | 8 | 1 | 7 | 🔴 13% |
| 28 | Eure-et-Loir | 16 | 2 | 14 | 🔴 13% |
| 29 | Finistère | 23 | 4 | 19 | 🔴 17% |
| 30 | Gard | 26 | 2 | 24 | 🔴 8% |
| 31 | Haute-Garonne | 16 | 3 | 13 | 🔴 19% |
| 32 | Gers | 14 | 1 | 13 | 🔴 7% |
| 33 | Gironde | 18 | 2 | 16 | 🔴 11% |
| 34 | Hérault | 23 | 2 | 21 | 🔴 9% |
| 35 | Ille-et-Vilaine | 17 | 2 | 15 | 🔴 12% |
| 36 | Indre | 20 | 1 | 19 | 🔴 5% |
| 37 | Indre-et-Loire | 15 | 1 | 14 | 🔴 7% |
| 38 | Isère | 37 | 1 | 36 | 🔴 3% |
| 39 | Jura | 13 | 1 | 12 | 🔴 8% |
| 40 | Landes | 16 | 3 | 13 | 🔴 19% |
| 41 | Loir-et-Cher | 12 | 1 | 11 | 🔴 8% |
| 42 | Loire | 27 | 1 | 26 | 🔴 4% |
| 43 | Haute-Loire | 26 | 1 | 25 | 🔴 4% |
| 44 | Loire-Atlantique | 16 | 2 | 14 | 🔴 13% |
| 45 | Loiret | 11 | 1 | 10 | 🔴 9% |
| 46 | Lot | 17 | 1 | 16 | 🔴 6% |
| 47 | Lot-et-Garonne | 13 | 1 | 12 | 🔴 8% |
| 48 | Lozère | 28 | 1 | 27 | 🔴 4% |
| 49 | Maine-et-Loire | 18 | 2 | 16 | 🔴 11% |
| 50 | Manche | 22 | 1 | 21 | 🔴 5% |
| 51 | Marne | 12 | 2 | 10 | 🔴 17% |
| 52 | Haute-Marne | 20 | 2 | 18 | 🔴 10% |
| 53 | Mayenne | 11 | 1 | 10 | 🔴 9% |
| 54 | Meurthe-et-Moselle | 11 | 2 | 9 | 🔴 18% |
| 55 | Meuse | 17 | 0 | 17 | 🔴 0% |
| 56 | Morbihan | 17 | 2 | 15 | 🔴 12% |
| 57 | Moselle | 23 | 1 | 22 | 🔴 4% |
| 58 | Nièvre | 17 | 1 | 16 | 🔴 6% |
| 59 | Nord | 9 | 1 | 8 | 🔴 11% |
| 60 | Oise | 11 | 2 | 9 | 🔴 18% |
| 61 | Orne | 17 | 1 | 16 | 🔴 6% |
| 62 | Pas-de-Calais | 11 | 2 | 9 | 🔴 18% |
| 63 | Puy-de-Dôme | 31 | 1 | 30 | 🔴 3% |
| 64 | Pyrénées-Atlantiques | 29 | 2 | 27 | 🔴 7% |
| 65 | Hautes-Pyrénées | 18 | 1 | 17 | 🔴 6% |
| 66 | Pyrénées-Orientales | 21 | 1 | 20 | 🔴 5% |
| 67 | Bas-Rhin | 17 | 1 | 16 | 🔴 6% |
| 68 | Haut-Rhin | 16 | 2 | 14 | 🔴 13% |
| 69 | Rhône | 18 | 1 | 17 | 🔴 6% |
| 70 | Haute-Saône | 16 | 1 | 15 | 🔴 6% |
| 71 | Saône-et-Loire | 20 | 3 | 17 | 🔴 15% |
| 72 | Sarthe | 18 | 1 | 17 | 🔴 6% |
| 73 | Savoie | 39 | 1 | 38 | 🔴 3% |
| 74 | Haute-Savoie | 34 | 1 | 33 | 🔴 3% |
| 75 | Paris | 5 | 1 | 4 | 🔴 20% |
| 76 | Seine-Maritime | 17 | 2 | 15 | 🔴 12% |
| 77 | Seine-et-Marne | 12 | 1 | 11 | 🔴 8% |
| 78 | Yvelines | 9 | 3 | 6 | 🔴 33% |
| 79 | Deux-Sèvres | 17 | 1 | 16 | 🔴 6% |
| 80 | Somme | 14 | 2 | 12 | 🔴 14% |
| 81 | Tarn | 11 | 1 | 10 | 🔴 9% |
| 82 | Tarn-et-Garonne | 7 | 1 | 6 | 🔴 14% |
| 83 | Var | 32 | 2 | 30 | 🔴 6% |
| 84 | Vaucluse | 18 | 2 | 16 | 🔴 11% |
| 85 | Vendée | 19 | 1 | 18 | 🔴 5% |
| 86 | Vienne | 14 | 1 | 13 | 🔴 7% |
| 87 | Haute-Vienne | 17 | 1 | 16 | 🔴 6% |
| 88 | Vosges | 20 | 0 | 20 | 🔴 0% |
| 89 | Yonne | 20 | 1 | 19 | 🔴 5% |
| 90 | Territoire de Belfort | 7 | 1 | 6 | 🔴 14% |
| 91 | Essonne | 5 | 1 | 4 | 🔴 20% |
| 92 | Hauts-de-Seine | 1 | 0 | 1 | 🔴 0% |
| 93 | Seine-Saint-Denis | 1 | 0 | 1 | 🔴 0% |
| 94 | Val-de-Marne | 1 | 0 | 1 | 🔴 0% |
| 95 | Val-d'Oise | 5 | 3 | 2 | 🟠 60% |
| 971 | Guadeloupe | 35 | 1 | 34 | 🔴 3% |
| 972 | Martinique | 16 | 0 | 16 | 🔴 0% |
| 973 | Guyane | 14 | 0 | 14 | 🔴 0% |
| 974 | La Réunion | 58 | 2 | 56 | 🔴 3% |
| 975 | 975 | 1 | 1 | 0 | ✅ 100% |
| 985 | 985 | 5 | 1 | 4 | 🔴 20% |
| 986 | 986 | 1 | 0 | 1 | 🔴 0% |
| 987 | 987 | 38 | 2 | 36 | 🔴 5% |
| 988 | 988 | 60 | 7 | 53 | 🔴 12% |

---
## 🚨 Détail des anomalies par département

### 974 — La Réunion (58 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 56/58 stations → **97%** manquant
- `pres` (Pression) : 55/58 stations → **95%** manquant
- `td` (Point de rosée) : 44/58 stations → **76%** manquant
- `u` (Humidité) : 43/58 stations → **74%** manquant
- `ff` (Vent moyen) : 43/58 stations → **74%** manquant
- `dd` (Direction vent) : 43/58 stations → **74%** manquant
- `fxi10` (Rafales) : 43/58 stations → **74%** manquant
- `t` (Température) : 11/58 stations → **19%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `97410250` | TAKAMAKA - PK12_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97410265` | CHEMIN DE CEINTURE_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97411155` | MONTAUBAN_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97411164` | LE BRULE - VAL FLEURI_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97412302` | COMMERSON_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97418170` | PLAINE DES FOUGERES_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97421240` | SALAZIE-VILLAGE_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97421260` | BELOUVE_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97421265` | ILET A VIDOT_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97424450` | ILET A CORDES_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97401520` | LE TEVELAVE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97403410` | LE DIMITILE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97403435` | BRAS-LONG_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97405420` | PITON-BLOC_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97408560` | AURERE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97408580` | LA NOUVELLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97408582` | DOS D'ANE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97409210` | BOIS-ROUGE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97409240` | MENCIOL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97410202` | BEAUVALLON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97411132` | CHAUDRON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97411146` | COLORADO_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97411150` | SAINT-FRANCOIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97411170` | PLAINE DES CHICOTS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97412336` | GRAND-COUDE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97412340` | GRAND-GALET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97412356` | LA CRETE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97412384` | ST-JOSEPH_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97413542` | ST-LEU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97413580` | PITON SAINT-LEU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97414409` | PLAINE DES MAKES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97415516` | BOIS DE NEFLES ST-PAUL_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97415541` | TAN-ROUGE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97415557` | LE GUILLAUME | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97417340` | LE TREMBLET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97419320` | HAUTS DE SAINTE-ROSE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97420150` | BAGATELLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97420180` | BRAS-PISTOLET_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97421210` | MARE A VIEILLE PLACE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97421220` | GRAND-ILET_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97422445` | BRAS-SEC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97422455` | PONT D'YVES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97424460` | PALMISTE-ROUGE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97424410` | CILAOS | 4/9 | ❄️ Pas de température, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97402240` | BELLEVUE BRAS-PANON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97404540` | PONT-MATHURIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97406220` | PLAINE DES PALMISTES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97413520` | COLIMACONS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97415536` | PETITE-FRANCE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97415566` | PITON-MAIDO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97415590` | POINTE DES TROIS-BASSINS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97417360` | LE BARIL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97419350` | GROS PITON SAINTE-ROSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97419380` | BELLECOMBE-JACOB | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97422440` | PLAINE DES CAFRES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97407520` | LE PORT | 1/9 | 🌫️ Pas de visibilité |

### 988 — 988 (60 stations, 7 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 52/60 stations → **87%** manquant
- `pres` (Pression) : 48/60 stations → **80%** manquant
- `ff` (Vent moyen) : 38/60 stations → **63%** manquant
- `dd` (Direction vent) : 38/60 stations → **63%** manquant
- `fxi10` (Rafales) : 38/60 stations → **63%** manquant
- `td` (Point de rosée) : 36/60 stations → **60%** manquant
- `u` (Humidité) : 36/60 stations → **60%** manquant
- `t` (Température) : 3/60 stations → **5%** manquant
- `rr_per` (Précipitations) : 3/60 stations → **5%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `98802008` | NASSIRAH | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98802102` | CAMP DES SAPINS | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98820003` | MOULI | 8/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98833002` | MEA | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98802001` | BOULOUPARIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98802006` | LA OUENGHI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98803001` | BOURAIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98803003` | NESSADIOU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98804001` | CANALA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98805001` | DUMBEA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98808002` | COL ROUSSETTES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98810001` | GOMEN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98810002` | OUACO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98811004` | TANGO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98813004` | POCQUEREUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98814003` | CHEPENEHE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98814004` | HAPETRA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98814007` | MOU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98815002` | TADINE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98817002` | PLUM | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98817005` | LA COULEE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98819001` | OUEGOA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98821002` | PAITA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98821005` | PORT LAGUERRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98822001` | POINDIMIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98823001` | PONERIHOUEN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98824001` | POUEBO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98825002` | KOPETO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98826001` | POUM | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98827001` | POYA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98829003` | BORINDI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98830003` | TIWAKA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98831001` | VOH | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98832002` | YATE MRIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98832005` | OUINNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98807001` | HIENGHENE GEND | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98808001` | HOUAILOU P | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98813001` | LA FOA | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98818003` | PHARE AMEDEE | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98823002` | AOUPINIE | 3/9 | 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98802003` | BOURAKE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98803005` | POE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98805004` | NAKUTAKOIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98817104` | GORO_USINE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98827002` | NEPOUI | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98832004` | MTGNE SOURCES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98832006` | RIVIERE BLANCHE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98832101` | GORO_ANCIENNE_PEPINIERE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98812001` | KOUMAC | 1/9 | 🌫️ Pas de visibilité |
| `98814001` | OUANAHAM | 1/9 | 🌧️ Pas de pluie |
| `98818001` | NOUMEA | 1/9 | 🌫️ Pas de visibilité |
| `98826002` | POINGAM | 1/9 | 🌫️ Pas de visibilité |
| `98830002` | TOUHO AEROD | 1/9 | 🌫️ Pas de visibilité |

### 20 — Corse (47 stations, 5 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 42/47 stations → **89%** manquant
- `pres` (Pression) : 39/47 stations → **83%** manquant
- `td` (Point de rosée) : 21/47 stations → **45%** manquant
- `u` (Humidité) : 21/47 stations → **45%** manquant
- `ff` (Vent moyen) : 20/47 stations → **43%** manquant
- `dd` (Direction vent) : 20/47 stations → **43%** manquant
- `fxi10` (Rafales) : 20/47 stations → **43%** manquant
- `rr_per` (Précipitations) : 1/47 stations → **2%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `20004014` | AJACCIO-MILELLI_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20023005` | ASCO_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20029003` | BARBAGGIO_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20033015` | BASTIA_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20054002` | CAMPILE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20108002` | EVISA-ONF | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20126001` | GIUNCAGGIO_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20135002` | ISOLACCIO DI FIUMORBO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20142001` | LEVIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20169007` | PONTE-LECCIA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20190002` | OLMI-CAPPELLA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20209003` | PERI_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20211001` | PETRETO BICCHISANO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20249003` | PROPRIANO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20264002` | RUSIO_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20272001` | SARTENE-CIMETIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20273001` | SCATA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20312001` | SANTA MARIA SICHE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20326001` | TOLLA_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20354008` | VIVARIO_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20281001` | CAP SAGRO | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `20235001` | PIOGGIOLA | 3/9 | 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20040004` | BOCOGNANO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20046002` | CAGNANO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20047006` | CALACUCCIA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20092001` | CONCA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20096008` | CORTE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20154001` | MARIGNANA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20160001` | MOCA-CROCE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20185003` | OLETTA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20223001` | PIETRALBA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20232002` | PILA-CANALE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20254006` | QUENZA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20255003` | QUERCITELLO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20258001` | RENNO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20268001` | SAMPOLO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20270001` | SARI D'ORCINO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20272004` | SARTENE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20314006` | SANTO PIETRO DI TENDA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `20093002` | ILE ROUSSE | 1/9 | 🌫️ Pas de visibilité |
| `20107001` | CAP CORSE | 1/9 | 🌫️ Pas de visibilité |
| `20303002` | ALISTRO | 1/9 | 🌫️ Pas de visibilité |

### 73 — Savoie (39 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 38/39 stations → **97%** manquant
- `pres` (Pression) : 37/39 stations → **95%** manquant
- `ff` (Vent moyen) : 29/39 stations → **74%** manquant
- `dd` (Direction vent) : 29/39 stations → **74%** manquant
- `fxi10` (Rafales) : 29/39 stations → **74%** manquant
- `td` (Point de rosée) : 28/39 stations → **72%** manquant
- `u` (Humidité) : 28/39 stations → **72%** manquant
- `rr_per` (Précipitations) : 1/39 stations → **3%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `73013002` | ALBIEZ-MONTROND | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73026001` | AVRIEUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73034002` | BEAUFORT-SUR-DORON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73040005` | BESSANS-CLIM | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73052002` | BOURGET EN HUILE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73055001` | BOZEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73064001` | CHALLES LES EAUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73098003` | FECLAZ_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73107001` | ENTREMONT LE VIEUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73139001` | JARSY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73146001` | LESCHERAINES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73150004` | LA PLAGNE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73167001` | MONTGELLAFREY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73187006` | LA LECHERE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73191001` | NOVALAISE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73220001` | ST-ALBAN DES HURTIERES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73229001` | ST-CHRISTOPHE LA-GROTTE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73242003` | ST JEAN D'ARVES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73244001` | ST-JEAN DE BELLEVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73257001` | ST-MARTIN DE BELLEVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73257005` | VAL THORENS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73258001` | ST-MARTIN DE LA PORTE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73261001` | ST-MICHEL DE MAURIENNE LE THYL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73261003` | ST MICHEL MAUR_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73280001` | ST-SORLIN D'ARVES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73290002` | TERMIGNON-CLIM | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73303005` | UGINE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73322001` | LA NORMA_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `73296005` | TIGNES_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73257003` | LA MASSE | 3/9 | 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73051001` | MONT DU CHAT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73132003` | COL-DES-SAISIES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73144001` | MONT CENIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73171002` | MONTMELIAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73255003` | STE MARIE CUINES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73297003` | ALBERTVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73304005` | VAL D'ISERE JOS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `73054001` | BOURG ST MAURICE | 1/9 | 🌫️ Pas de visibilité |

### 07 — Ardèche (38 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 37/38 stations → **97%** manquant
- `vv` (Visibilité) : 37/38 stations → **97%** manquant
- `td` (Point de rosée) : 28/38 stations → **74%** manquant
- `u` (Humidité) : 28/38 stations → **74%** manquant
- `ff` (Vent moyen) : 28/38 stations → **74%** manquant
- `dd` (Direction vent) : 28/38 stations → **74%** manquant
- `fxi10` (Rafales) : 28/38 stations → **74%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `07005001` | ALBA LA ROMAINE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07010001` | ANNONAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07011002` | ANTRAIGUES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07019005` | AUBENAS SA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07033001` | BESSAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07064001` | CHEYLARD SA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07066001` | CHOMERAC SA_RCE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07075001` | CROS GEORAND | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07099001` | GRAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07101001` | GROSPIERRES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07105001` | ISSANLAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07105003` | ISSANLAS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07117002` | LABLACHERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07128001` | LALOUVESC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07159001` | MIRABEL SA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07161001` | MONTPEZAT SA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07168001` | ORGNAC AVEN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07232001` | ST-ETIENNE LUGDARES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07240001` | ST-GEORGES BAIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07261001` | ST-LAURENT PAPE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07265001` | ST-MARCEL ANNONAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07279001` | ST-MONTAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07286002` | ST-PIERREVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07301002` | ST-VICTOR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07331001` | VALS-LES-BAINS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07334004` | LES VANS-SA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07338001` | VERNOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07347001` | VOCANCE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `07025001` | BARNAS RAD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `07032002` | BERZEME RAD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `07068001` | COLOMBIER JEUNE RAD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `07096001` | GLUIRAS RAD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `07154005` | MAZAN ABBAYE RAD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `07172002` | PEAUGRES RAD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `07187001` | CROIX MILLET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `07202002` | SABLIERES OARA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `07204008` | ST-AGREVE RAD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 38 — Isère (37 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 36/37 stations → **97%** manquant
- `pres` (Pression) : 35/37 stations → **95%** manquant
- `td` (Point de rosée) : 26/37 stations → **70%** manquant
- `u` (Humidité) : 26/37 stations → **70%** manquant
- `ff` (Vent moyen) : 26/37 stations → **70%** manquant
- `dd` (Direction vent) : 26/37 stations → **70%** manquant
- `fxi10` (Rafales) : 26/37 stations → **70%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `38021001` | AUTRANS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38034001` | BEAUREPAIRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38095001` | CHATTE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38103002` | CHICHILIANNE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38153001` | ENGINS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38162001` | FAVERGES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38186001` | GRESSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38207001` | LAVALDENS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38275002` | SERRE-NERPOL_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38285001` | ORNON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38299001` | PELLAFOL-CHANEAUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38315002` | PONT-DE-BEAUVOISIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38342001` | ROISSARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38349001` | SABLONS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38362001` | ST AUPRE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38366001` | ST-BAUDILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38375009` | ST CHRISTOPHE EN OISANS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38395004` | SAINT-HILAIRE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38446003` | ST-PIERRE-D'ENTREMONT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38501001` | TENCIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38504001` | THEYS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38504002` | PIPAY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38522004` | VALJOUFFREY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38524001` | VARCES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38527001` | VAUJANY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `38046002` | COL DE ROSSATIERE | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38538002` | GRENOBLE - LVD | 3/9 | 🌫️ Pas de visibilité, 💧 Pas d'humidité |
| `38053003` | BOURGOIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38133001` | COUBLEVIE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38185012` | GRENOBLE-CEA-RADOME | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38191002` | ALPE-D'HUEZ | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38269004` | LA MURE- RADOME | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38336001` | REVENTIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38442008` | ST-PIERRE-LES EGAUX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38548001` | VILLARD-DE-LANS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `38567002` | CHAMROUSSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 987 — 987 (38 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 36/38 stations → **95%** manquant
- `pres` (Pression) : 28/38 stations → **74%** manquant
- `td` (Point de rosée) : 20/38 stations → **53%** manquant
- `u` (Humidité) : 20/38 stations → **53%** manquant
- `ff` (Vent moyen) : 19/38 stations → **50%** manquant
- `dd` (Direction vent) : 19/38 stations → **50%** manquant
- `fxi10` (Rafales) : 19/38 stations → **50%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `98715003` | FAAA 3 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98723003` | HANAIAPA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98724001` | FARE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98724007` | PAREA 2 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98725010` | MAHINA 9 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98728001` | PETEI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98729003` | PAOPAO 1 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98729007` | AFAREAITU 2 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98729010` | PAPETOAI 4 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98731002` | HATIHEU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98736001` | PIRAE 1 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98738006` | PUNAAUIA 6 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98738007` | PUNAAUIA 7 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98739003` | RAIRUA 1 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98744005` | MOERAI 2 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98747005` | AFAAHITI 3 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98750003` | OPOA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98752001` | PAPEARI 1 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98753001` | MATAURA 1 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98711002` | ANAA1 | 3/9 | 🌫️ Pas de visibilité, 💧 Pas d'humidité |
| `98712001` | TETIAROA 1 | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98722026` | HITIAA 5 | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98725008` | MAHINA 8 | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98734007` | PAPARA 7 | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98734009` | PAPARA 8 | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98743003` | MOORERE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98747016` | AFAAHITI 7 | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98748001` | VAIRAO 1 | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98748012` | TEAHUPOO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98714002` | BORA-BORA-MOTU-AERO | 1/9 | 🌫️ Pas de visibilité |
| `98715002` | FAAA | 1/9 | 🌫️ Pas de visibilité |
| `98731007` | NUKUATAHA AERO | 1/9 | 🌫️ Pas de visibilité |
| `98740002` | RANGIROA AERO | 1/9 | 🌫️ Pas de visibilité |
| `98741001` | RAPA | 1/9 | 🌫️ Pas de visibilité |
| `98749001` | TAKAROA | 1/9 | 🌫️ Pas de visibilité |
| `98755002` | MORUROA | 1/9 | 🌫️ Pas de visibilité |

### 971 — Guadeloupe (35 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 34/35 stations → **97%** manquant
- `pres` (Pression) : 31/35 stations → **89%** manquant
- `td` (Point de rosée) : 21/35 stations → **60%** manquant
- `u` (Humidité) : 21/35 stations → **60%** manquant
- `ff` (Vent moyen) : 21/35 stations → **60%** manquant
- `dd` (Direction vent) : 21/35 stations → **60%** manquant
- `fxi10` (Rafales) : 21/35 stations → **60%** manquant
- `t` (Température) : 3/35 stations → **9%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `97107008` | CAPESTERRE-B-EAU CARBET_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97118008` | PETIT-BOURG PROVIDENCE_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97128004` | STE-ANNE MARLY | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97101014` | LES ABYMES CHAZEAU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97103008` | BAIE-MAHAULT CONVENANCE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97107009` | CAPESTERRE-BE BOIS DEBOUT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97113003` | LE GOSIER SAINT-FELIX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97113009` | LE GOSIER LEROUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97118009` | PETIT-BOURG ROUJOL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97118018` | PETIT-BOURG GROS-MORNE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97119006` | PETIT-CANAL GROS CAP | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97122004` | PORT-LOUIS GENDARMERIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97124006` | ST-CLAUDE MATOUBA_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97124009` | ST-CLAUDE CITERNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97124010` | ST-CLAUDE MAISON-VOLCAN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97128010` | SAINTE-ANNE DESHAUTEURS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97129011` | STE-ROSE CLUGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97129012` | STE-ROSE BELLE-RIVIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97129018` | SAINTE-ROSE GRANDE-H_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97133001` | VIEUX-FORT BOURG | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97134001` | VIEUX-HABITANTS GEND_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97102005` | ANSE-BERTRAND LA JOYEUSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97104005` | BAILLIF AERO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97107002` | CAPESTERRE-B-EAU NEUFCHATEAU | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97109003` | GOURBEYRE GROS-MORNE DOLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97114008` | GOYAVE CHRISTOPHE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97116002` | MORNE-A-L'EAU BLANCHET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97117013` | LE MOULE LAUREAL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97121002` | POINTE-NOIRE COL DES MAMELLES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97125011` | SAINT FRANCOIS AERODROME | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97129015` | STE-ROSE VIARD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97101015` | LE RAIZET AERO | 1/9 | 🌫️ Pas de visibilité |
| `97112003` | GRAND-BOURG LES BASSES AERO | 1/9 | 🌫️ Pas de visibilité |
| `97127004` | ST-MARTIN GRAND-CASE | 1/9 | 🌫️ Pas de visibilité |

### 06 — Alpes-Maritimes (36 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 34/36 stations → **94%** manquant
- `vv` (Visibilité) : 34/36 stations → **94%** manquant
- `td` (Point de rosée) : 19/36 stations → **53%** manquant
- `u` (Humidité) : 19/36 stations → **53%** manquant
- `ff` (Vent moyen) : 17/36 stations → **47%** manquant
- `dd` (Direction vent) : 17/36 stations → **47%** manquant
- `fxi10` (Rafales) : 17/36 stations → **47%** manquant
- `t` (Température) : 2/36 stations → **6%** manquant
- `rr_per` (Précipitations) : 1/36 stations → **3%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `06004004` | ANTIBES-GOLF | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06004009` | ANTIBES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06016001` | BEUIL-OBS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06033002` | CARROS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06050002` | COURSEGOULES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06059003` | EZE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06071001` | GUILLAUMES-OBS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06073005` | ISOLA 2000 | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06074005` | LANTOSQUE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06086001` | MOULINET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06099004` | PUGET THENIERS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06102001` | RIMPLAS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06103002` | BERTHEMONT-LES-BAINS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06120004` | ST ETIENNE DE TINEE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06125001` | ST MARTIN D'ENTRAUNES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06163001` | TENDE-OBS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06163007` | TENDE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06004002` | ANTIBES-GAROUPE | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06023004` | BREIL SUR ROYA | 5/9 | ❄️ Pas de température, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `06005001` | ASCROS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06037002` | CAUSSOLS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06038001` | CHATEAUNEUF GRASSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06075007` | LEVENS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06077006` | PEIRA CAVA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06079002` | MANDELIEU LA NAPOULE_SAPC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06081001` | LE MAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06083005` | MENTON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06088007` | NICE-RIMIEZ | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06090002` | PEGOMAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06091003` | PEILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06094002` | PEONE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06118002` | ST CEZAIRE SUR SIAGNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06136005` | SOSPEL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `06152002` | VALBONNE-SOPHIA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 74 — Haute-Savoie (34 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 33/34 stations → **97%** manquant
- `vv` (Visibilité) : 33/34 stations → **97%** manquant
- `td` (Point de rosée) : 24/34 stations → **71%** manquant
- `u` (Humidité) : 24/34 stations → **71%** manquant
- `ff` (Vent moyen) : 23/34 stations → **68%** manquant
- `dd` (Direction vent) : 23/34 stations → **68%** manquant
- `fxi10` (Rafales) : 23/34 stations → **68%** manquant
- `rr_per` (Précipitations) : 3/34 stations → **9%** manquant
- `t` (Température) : 1/34 stations → **3%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `74116004` | COL D'EVIRES | 9/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74014002` | LES CARROZ | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74024001` | AYZE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74035001` | BLOYE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74045001` | LE BOUCHET_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74051002` | CERCIER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74063002` | CHATEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74083002` | COMBLOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74087001` | CONTAMINE-SUR- ARVE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74093001` | CRAN-GEVRIER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74119002` | EVIAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74133001` | GAILLARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74137001` | GROISY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74143003` | HOUCHES (LES) | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74203001` | NOVEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74211002` | PERS JUSSY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74221001` | REPOSOIR (LE) | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74256001` | SALLANCHES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74258002` | SAMOENS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74266001` | SERVOZ | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74286001` | VACHERESSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74290003` | VALLORCINE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74014004` | FLAINE_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `74056006` | AIGUILLE DU MIDI | 5/9 | 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74060001` | CHAPELLE SAINT-MAURICE_SAPC | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `74236002` | MONT ARBOIS | 3/9 | 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `74042003` | BONNEVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `74056001` | CHAMONIX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `74056005` | LE TOUR | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `74119003` | EVIAN SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `74136005` | LE GRAND-BORNAND | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `74191003` | LE PLENEY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `74285002` | USINENS SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 63 — Puy-de-Dôme (31 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 30/31 stations → **97%** manquant
- `vv` (Visibilité) : 30/31 stations → **97%** manquant
- `td` (Point de rosée) : 20/31 stations → **65%** manquant
- `u` (Humidité) : 20/31 stations → **65%** manquant
- `ff` (Vent moyen) : 20/31 stations → **65%** manquant
- `dd` (Direction vent) : 20/31 stations → **65%** manquant
- `fxi10` (Rafales) : 20/31 stations → **65%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `63006002` | ANZAT-LE-LUGUET_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63077001` | CHAMBON-SUR-LAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63089001` | CHAPPES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63129001` | CROS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63132002` | CUNLHAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63157001` | FAYET-LE-CHATEA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63163001` | GELLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63222001` | MEILHAUD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63223001` | MENAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63236003` | LE MONT-DORE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63263005` | FONTAINE-DU-BER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63281001` | PIONSAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63282001` | PLAUZAT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63295001` | RANDAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63298001` | LA RENAUDIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63320001` | SAINT AVIT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63382001` | ST-PARDOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63393001` | ST-REMY-SUR-DUR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63417001` | SAYAT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63426001` | TAUVES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `63003004` | AMBERT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63038002` | SUPERBESSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63098001` | CHASTREIX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63125002` | COURPIERE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63178001` | ISSOIRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63319002` | ST-ANTHEME | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63353003` | ST-GERMAIN-L HE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63354004` | ST-GERVAIS-D AU | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63399002` | ST-SULPICE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `63451001` | VERNINES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 83 — Var (32 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 30/32 stations → **94%** manquant
- `pres` (Pression) : 26/32 stations → **81%** manquant
- `td` (Point de rosée) : 15/32 stations → **47%** manquant
- `u` (Humidité) : 15/32 stations → **47%** manquant
- `ff` (Vent moyen) : 12/32 stations → **38%** manquant
- `dd` (Direction vent) : 12/32 stations → **38%** manquant
- `fxi10` (Rafales) : 12/32 stations → **38%** manquant
- `t` (Température) : 3/32 stations → **9%** manquant
- `rr_per` (Précipitations) : 3/32 stations → **9%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `83002004` | AIGUINES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83004004` | LES ARCS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83007004` | AUPS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83042001` | COGOLIN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83043005` | COLLOBRIERES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83050007` | DRAGUIGNAN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83074002` | LA MARTRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83075001` | LES MAYONS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83080001` | MONS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83083001` | MONTFORT-SUR-ARGENS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83104001` | RIANS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83145001` | VARAGES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83101001` | CAP CAMARAT | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83118002` | LE DRAMONT | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83153001` | CAP CEPET | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `83019002` | BORMES LES MIMOSAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83044003` | COMPS-SUR-ARTUBY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83051001` | ENTRECASTEAUX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83061001` | FREJUS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83061007` | FREJUS MONT VINAIGRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83069002` | PORQUEROLLES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83102005` | REGUSSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83116022` | ST MAXIMIN LA STE BAUME | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83124002` | SEILLANS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83148002` | VIDAUBAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83150002` | VINON SUR VERDON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `83035001` | LE CASTELLET-AERO | 1/9 | 🌫️ Pas de visibilité |
| `83049005` | CUERS | 1/9 | 🌫️ Pas de visibilité |
| `83069003` | ILE DU LEVANT | 1/9 | 🌫️ Pas de visibilité |
| `83137001` | TOULON | 1/9 | 🌫️ Pas de visibilité |

### 26 — Drôme (29 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 27/29 stations → **93%** manquant
- `vv` (Visibilité) : 27/29 stations → **93%** manquant
- `ff` (Vent moyen) : 22/29 stations → **76%** manquant
- `dd` (Direction vent) : 22/29 stations → **76%** manquant
- `fxi10` (Rafales) : 22/29 stations → **76%** manquant
- `td` (Point de rosée) : 21/29 stations → **72%** manquant
- `u` (Humidité) : 21/29 stations → **72%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `26035001` | BEAUFORT-S-GERV | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26047001` | BELLEGARDE-EN-D | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26056001` | BOURDEAUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26074001` | CHAPELLE-EN-VERCORS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26113003` | DIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26116002` | DONZERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26179001` | MERCUROL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26182001` | MIRABEL-AUX-BAR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26189001` | MONTAUBAN-S-OUV | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26258001` | PUY-ST-MARTIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26273002` | ROCHEFORT-SAMSON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26281001` | ROMANS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26290002` | COL DE ROUSSET_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26295001` | ST-BARTHELEMY-V_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26298001` | ST-CHRISTOPHE-L_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26307001` | ST-JEAN-EN-ROYA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26328001` | ST SAUVEUR EN DIOIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26330001` | ST-SORLIN-EN-VA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26340001` | SEDERON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26361001` | VALDROME | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26377003` | VINSOBRES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `26050001` | BESIGNAN | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `26002003` | ALBON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `26124001` | ETOILE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `26168001` | LUS L CROIX HTE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `26292002` | ST-AUBAN-SUR-OUVEZE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `26327001` | ST ROMAN-DIOIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 48 — Lozère (28 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 27/28 stations → **96%** manquant
- `vv` (Visibilité) : 27/28 stations → **96%** manquant
- `td` (Point de rosée) : 21/28 stations → **75%** manquant
- `u` (Humidité) : 21/28 stations → **75%** manquant
- `ff` (Vent moyen) : 21/28 stations → **75%** manquant
- `dd` (Direction vent) : 21/28 stations → **75%** manquant
- `fxi10` (Rafales) : 21/28 stations → **75%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `48009001` | AUMONT AUBRAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48027002` | LE BLEYMARD BOURG | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48027003` | LE BLEYMARD_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48036001` | CASSAGNAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48043001` | CHATEAUNEUF-DE-RANDON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48051002` | LE COLLET-SAUVEPLANE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48060001` | FAU DE PEYRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48061002` | FLORAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48069001` | GATUZIERES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48070004` | GRANDRIEU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48094001` | LE MASSEGROS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48095004` | MENDE-VILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48103001` | MONTRODAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48108001` | LA PANOUSE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48110001` | PAULHAC EN MARGERIDE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48116001` | LE PONT-DE-MONTVERT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48130002` | ROUSSES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48146001` | STE ENIMIE-SAUVETERRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48156002` | ST GERMAIN DU TEIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48187003` | LES SALCES-FROMENTAL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48198001` | VILLEFORT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `48004001` | ALTIER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `48020003` | BASSURELS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `48032003` | LE BUISSON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `48148004` | ST-ETIENNE-VALLEE-FRANCAISE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `48176002` | ST PIERRE-DES-TRIPIERS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `48186001` | LA SALLE PRUNET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 64 — Pyrénées-Atlantiques (29 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 27/29 stations → **93%** manquant
- `pres` (Pression) : 26/29 stations → **90%** manquant
- `td` (Point de rosée) : 20/29 stations → **69%** manquant
- `u` (Humidité) : 20/29 stations → **69%** manquant
- `ff` (Vent moyen) : 20/29 stations → **69%** manquant
- `dd` (Direction vent) : 20/29 stations → **69%** manquant
- `fxi10` (Rafales) : 20/29 stations → **69%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `64006001` | ACCOUS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64068001` | ASSON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64092002` | BANCA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64123001` | BIDACHE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64160001` | CAMBO-LES-BAINS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64233001` | GARLIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64301002` | LAGOR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64310001` | LANNE-EN-BARETOUS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64316001` | LARRAU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64320003` | LARUNS-HOURAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64324002` | LASSEUBE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64331002` | LEMBEYE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64342001` | LICQ-ATHEREY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64379001` | MENDIVE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64416001` | NAVARRENX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64450001` | POMPS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64453002` | PONTACQ_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64480001` | ST-GLADIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64537001` | TROIS-VILLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64543001` | UREPEL_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `64010002` | AICIRITS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `64155001` | BUSTINCE - ST JEAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `64238001` | GER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `64316003` | IRATY ORGAMBIDE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `64422007` | OLORON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `64430003` | ORTHEZ | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `64189001` | SOCOA | 1/9 | 🌫️ Pas de visibilité |

### 42 — Loire (27 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 26/27 stations → **96%** manquant
- `pres` (Pression) : 25/27 stations → **93%** manquant
- `ff` (Vent moyen) : 22/27 stations → **81%** manquant
- `dd` (Direction vent) : 22/27 stations → **81%** manquant
- `fxi10` (Rafales) : 22/27 stations → **81%** manquant
- `td` (Point de rosée) : 21/27 stations → **78%** manquant
- `u` (Humidité) : 21/27 stations → **78%** manquant
- `rr_per` (Précipitations) : 1/27 stations → **4%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `42034001` | COL DE CERVIERES | 8/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42011001` | BALBIGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42019005` | BOEN-SUR-LIGNON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42023004` | BOURG-ARGENTAL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42040001` | COL DE LA LOGE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42059001` | CHAZELLES-LYON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42094003` | FEURS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42098001` | FOURNEAUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42102002` | GRAMMOND_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42145003` | MONTAGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42152001` | NANDAX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42159001` | NOIRETABLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42165003` | PANISSIERES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42204002` | ST-BONNET-LE-CHATEAU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42224003` | COL REPUBLIQUE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42227001` | ST GEORGES EN C | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42239001` | ST-MAURICE-SUR-LOIRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42248002` | ST-JUST-EN-CHEV | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42287001` | ST SAUVEUR EN R | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42299001` | SAVIGNEUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42322001` | LA VALLA EN GIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `42101001` | PILAT GRAIX | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `42039003` | CHALMAZEL_RA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `42207005` | ST-CHAMOND-P | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `42218011` | SAINT-ETIENNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `42253001` | ROANNE-RIORGES_AERO | 1/9 | 🌫️ Pas de visibilité |

### 43 — Haute-Loire (26 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 25/26 stations → **96%** manquant
- `vv` (Visibilité) : 25/26 stations → **96%** manquant
- `td` (Point de rosée) : 18/26 stations → **69%** manquant
- `u` (Humidité) : 18/26 stations → **69%** manquant
- `ff` (Vent moyen) : 18/26 stations → **69%** manquant
- `dd` (Direction vent) : 18/26 stations → **69%** manquant
- `fxi10` (Rafales) : 18/26 stations → **69%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `43003001` | ALLEGRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43014001` | AUTRAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43020002` | BAS-EN-BASSET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43037001` | LE BOUCHET-ST-NICOLAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43067001` | CHAVANIAC-LAFAYETTE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43071001` | CHOMELIX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43091005` | LES ESTABLES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43093001` | FELINES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43104001` | GREZES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43118001` | LAVOUTE-CHILHAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43150001` | LE PERTUIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43162001` | RETOURNAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43212002` | ST-PAL-DE-CHALENCON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43223001` | ST-ROMAIN-LACHALM | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43241002` | SOLIGNAC-SUR-LO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43244003` | TENCE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43246001` | TIRANGES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43268004` | YSSINGEAUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `43046001` | LE PUY-CHADRAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `43095001` | FIX-ST-GENEYS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `43096001` | FONTANNES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `43111002` | LANDOS-CHARBON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `43130002` | MAZET-VOLAMONT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `43137003` | MONISTROL-SUR-LOIRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `43234005` | SAUGUES-SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 30 — Gard (26 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 24/26 stations → **92%** manquant
- `pres` (Pression) : 23/26 stations → **88%** manquant
- `td` (Point de rosée) : 13/26 stations → **50%** manquant
- `u` (Humidité) : 13/26 stations → **50%** manquant
- `ff` (Vent moyen) : 12/26 stations → **46%** manquant
- `dd` (Direction vent) : 12/26 stations → **46%** manquant
- `fxi10` (Rafales) : 12/26 stations → **46%** manquant
- `t` (Température) : 1/26 stations → **4%** manquant
- `rr_per` (Précipitations) : 1/26 stations → **4%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `30009001` | ALZON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30068001` | CARDET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30076001` | CAVILLARGUES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30129001` | GENERARGUES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30202002` | PONT ST ESPRIT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30224001` | LA ROUVIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30243001` | ST CHRISTOL-LES-ALES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30263001` | ST HIPPOLYTE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30269006` | ST JEAN DU GARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30305001` | SALINDRES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30349001` | VIC LE FESQ | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30350001` | LE VIGAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30133005` | L'ESPIGUETTE | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `30003001` | AIGUES-MORTES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30087002` | COLOGNAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30101001` | DEAUX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30132004` | LA GRAND COMBE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30164001` | MEJANNES-LE-CLAP | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30176002` | MONTDARDIER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30209002` | PUJAUT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30297001` | ST SAUVEUR CAMPRIEU | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30334003` | UZES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30352002` | VILLEVIEILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `30189001` | NIMES-COURBESSAC | 1/9 | 🌫️ Pas de visibilité |

### 05 — Hautes-Alpes (24 stations, 0 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 24/24 stations → **100%** manquant
- `pres` (Pression) : 21/24 stations → **88%** manquant
- `td` (Point de rosée) : 12/24 stations → **50%** manquant
- `u` (Humidité) : 12/24 stations → **50%** manquant
- `ff` (Vent moyen) : 12/24 stations → **50%** manquant
- `dd` (Direction vent) : 12/24 stations → **50%** manquant
- `fxi10` (Rafales) : 12/24 stations → **50%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `05004001` | ANCELLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05027001` | CERVIERES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05038001` | CHATEAU-VILLE-VIEILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05090002` | MOTTE-MOLINES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05098001` | LES ORRES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05101001` | PELVOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05110001` | PUY-ST-VINCENT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05139006` | AGNIERES-EN-DEVOLUY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05142001` | ST FIRMIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05158001` | LE SAIX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05179001` | VEYNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05182001` | VILLAR LOUBIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `05007003` | ARVIEUX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05055001` | LA FAURIE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05061009` | GAP | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05070003` | LARAGNE MONTEGLIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05120002` | RISTOLAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05126001` | ROSANS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05136002` | ST CREPIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05145002` | ST JEAN-ST-NICOLAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05181002` | VILLAR D'ARENE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `05046001` | EMBRUN | 1/9 | 🌫️ Pas de visibilité |
| `05170001` | TALLARD | 1/9 | 🌫️ Pas de visibilité |
| `05183001` | VILLAR ST PANCRACE | 1/9 | 🌫️ Pas de visibilité |

### 15 — Cantal (24 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 23/24 stations → **96%** manquant
- `vv` (Visibilité) : 23/24 stations → **96%** manquant
- `td` (Point de rosée) : 17/24 stations → **71%** manquant
- `u` (Humidité) : 17/24 stations → **71%** manquant
- `ff` (Vent moyen) : 17/24 stations → **71%** manquant
- `dd` (Direction vent) : 17/24 stations → **71%** manquant
- `fxi10` (Rafales) : 17/24 stations → **71%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `15001003` | ALLANCHE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15014001` | AURILLAC - VILL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15050001` | LE CLAUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15085001` | LABROUSSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15101004` | LE LIORAN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15108003` | FAVEROLLES-STADE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15118002` | MARMANHAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15119001` | MASSIAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15138001` | MURAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15162003` | RIOM-MONTAGNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15187006` | ST FLOUR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15191001` | ST ILLIDE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15196001` | ST MAMET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15207002` | ST- PONCY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15226001` | SENEZERGUES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15235002` | LES TERNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15258004` | VIC SUR CERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `15025001` | PRAT DE BOUC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `15053001` | COLTINES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `15060002` | DEUX-VERGES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `15114002` | MARCENAT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `15120005` | MAURIAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `15122002` | MAURS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 21 — Côte-d'Or (24 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 23/24 stations → **96%** manquant
- `vv` (Visibilité) : 23/24 stations → **96%** manquant
- `td` (Point de rosée) : 18/24 stations → **75%** manquant
- `u` (Humidité) : 18/24 stations → **75%** manquant
- `ff` (Vent moyen) : 18/24 stations → **75%** manquant
- `dd` (Direction vent) : 18/24 stations → **75%** manquant
- `fxi10` (Rafales) : 18/24 stations → **75%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `21056001` | BEIRE LE CHATEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21116002` | BURE LES TEMPLIERS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21231001` | DIJON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21310001` | GROSBOIS-EN-MONTAGNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21326001` | JOURS LES BAIGNEUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21386001` | MARIGNY LE CAHOUET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21395001` | MASSINGY-LES-VITTEAUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21425001` | MONTBARD_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21454001` | NICEY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21501003` | POUILLY EN AUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21503001` | POUILLY SUR VINGEANNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21519001` | RECEY SUR OURCE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21527001` | LA ROCHEPOT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21564001` | ST NIC. CITEAUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21567001` | ARNAY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21603001` | SEMUR EN AUXOIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21633002` | THOREY SOUS CHARNY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21638002` | TIL-CHATEL_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `21065001` | BESSEY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `21131001` | PAGNY-LE-CHATEAU | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `21154001` | CHATILLON/SEINE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `21561003` | ST-MARTIN-DU-M | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `21584001` | SAULIEU | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 11 — Aude (23 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 22/23 stations → **96%** manquant
- `pres` (Pression) : 20/23 stations → **87%** manquant
- `td` (Point de rosée) : 11/23 stations → **48%** manquant
- `u` (Humidité) : 11/23 stations → **48%** manquant
- `ff` (Vent moyen) : 11/23 stations → **48%** manquant
- `dd` (Direction vent) : 11/23 stations → **48%** manquant
- `fxi10` (Rafales) : 11/23 stations → **48%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `11012001` | ARGELIERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11015001` | ARQUES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11136001` | FANJEAUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11144001` | FITOU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11159002` | RIBOUISSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11181002` | LABECEDE LAURAGAIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11185001` | LAGRASSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11206003` | LIMOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11253001` | MONTOLIEU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11266001` | PORT-LA-NOUVELLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11412001` | VILLARDEBELLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `11004001` | ALAIGNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11016003` | ARQUETTES-EN-VAL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11076001` | CASTELNAUDARY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11081003` | CAUNES-MINERVOIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11124003` | DURBAN-CORBIERES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11168001` | GRANES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11221004` | LES MARTYS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11260002` | MOUTHOUMET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11262005` | NARBONNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `11202001` | LEUCATE | 1/9 | 🌫️ Pas de visibilité |
| `11203004` | LEZIGNAN-CORBIERES | 1/9 | 🌫️ Pas de visibilité |

### 57 — Moselle (23 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 22/23 stations → **96%** manquant
- `vv` (Visibilité) : 22/23 stations → **96%** manquant
- `td` (Point de rosée) : 16/23 stations → **70%** manquant
- `u` (Humidité) : 16/23 stations → **70%** manquant
- `ff` (Vent moyen) : 16/23 stations → **70%** manquant
- `dd` (Direction vent) : 16/23 stations → **70%** manquant
- `fxi10` (Rafales) : 16/23 stations → **70%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `57019001` | MALANCOURT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57168001` | PHALSBOURG_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57253001` | GONDREXANGE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57322001` | HESTROFF_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57357002` | KAPPELKINGER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57395001` | LESSE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57465001` | METZERVISSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57469002` | MITTERSHEIM | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57489001` | MOUTERHOUSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57509002` | NITTING_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57524001` | OMMERAY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57550001` | PORCELETTE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57557001` | PUTTELANGE-LES-THIONVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57623003` | TURQUESTEIN-BLANCRUPT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57730001` | BOULAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57740001` | WALDWISSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `57039001` | METZ-FRESCATY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `57119001` | BUHL-LORRAINE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `57587003` | RODALBE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `57644001` | SEINGBOUSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `57689001` | VALMESTROFF | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `57732001` | VOLMUNSTER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 12 — Aveyron (23 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 21/23 stations → **91%** manquant
- `vv` (Visibilité) : 21/23 stations → **91%** manquant
- `td` (Point de rosée) : 15/23 stations → **65%** manquant
- `u` (Humidité) : 15/23 stations → **65%** manquant
- `ff` (Vent moyen) : 15/23 stations → **65%** manquant
- `dd` (Direction vent) : 15/23 stations → **65%** manquant
- `fxi10` (Rafales) : 15/23 stations → **65%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `12011001` | ARVIEU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12014001` | AURELLE-VERLAC_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12039001` | BRUSQUE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12050001` | CANET-DE-SALARS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12063003` | MILLAU-LARZAC_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12068001` | COLOMBIES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12092001` | DURENQUE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12094002` | ENTRAYGUES SUR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12096001` | ESPALION | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12150001` | MONTEILS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12179001` | PEUX-ET-COUFFOULEUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12189001` | PRADINAS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12224001` | ST-GENIEZ-D'OLT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12253001` | SALLES CURAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12298001` | VILLECOMTAL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `12005001` | ALPUECH | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `12077002` | CORNUS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `12154003` | MONTLAUR | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `12216001` | ST-COME-D'OLT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `12266002` | SEGUR | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `12300004` | VILLEFRANCHE-DE-ROUERGUE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 25 — Doubs (21 stations, 0 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 21/21 stations → **100%** manquant
- `pres` (Pression) : 20/21 stations → **95%** manquant
- `td` (Point de rosée) : 14/21 stations → **67%** manquant
- `u` (Humidité) : 14/21 stations → **67%** manquant
- `ff` (Vent moyen) : 14/21 stations → **67%** manquant
- `dd` (Direction vent) : 14/21 stations → **67%** manquant
- `fxi10` (Rafales) : 14/21 stations → **67%** manquant
- `t` (Température) : 1/21 stations → **5%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `25334001` | LEVIER_SAPC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25021001` | ARC-ET-SENANS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25047001` | BAUME-LES-DAMES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25087002` | BRANNE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25127001` | CHARQUEMONT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25222001` | ETALANS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25254001` | LES FOURGS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25285001` | GRAND'COMBE-CHATELEU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25320001` | LABERGEMENT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25372001` | MEDIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25413001` | MOUTHE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25453001` | PIERREFONTAINE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25512001` | LE RUSSEY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25621001` | VILLENEUVE-D'AMONT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `25219002` | EPENOY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `25223002` | COULANS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `25356003` | MAICHE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `25462001` | PONTARLIER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `25494001` | LA BOISSAUDE ROCHEJEAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `25529002` | SANCEY-LE-GRAND | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `25056001` | BESANCON | 1/9 | 🌫️ Pas de visibilité |

### 34 — Hérault (23 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 21/23 stations → **91%** manquant
- `pres` (Pression) : 20/23 stations → **87%** manquant
- `td` (Point de rosée) : 12/23 stations → **52%** manquant
- `u` (Humidité) : 12/23 stations → **52%** manquant
- `ff` (Vent moyen) : 12/23 stations → **52%** manquant
- `dd` (Direction vent) : 12/23 stations → **52%** manquant
- `fxi10` (Rafales) : 12/23 stations → **52%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `34032002` | BEZIERS-COURTADE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34046005` | CAMBON-ET-SALVERGUES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34055003` | CASTANET LE HAUT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34064003` | LE CAYLAR_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34142001` | LODEVE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34144001` | LUNAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34163001` | MONTARNAUD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34174002` | MOULES-ET-BAUCELS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34277001` | ST MAURICE-NAVACELLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34302001` | SIRAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34317001` | LA VACQUERIE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34319001` | VAILHAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `34028003` | BEDARIEUX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `34178001` | MURVIEL LES BEZIERS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `34205001` | LES PLANS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `34217001` | PRADES LE LEZ | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `34269001` | ST JEAN DE MINERVOIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `34274001` | ST MARTIN DE LONDRES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `34306001` | SOUMONT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `34311001` | PEZENAS-TOURBES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `34301002` | SETE | 1/9 | 🌫️ Pas de visibilité |

### 50 — Manche (22 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 21/22 stations → **95%** manquant
- `pres` (Pression) : 20/22 stations → **91%** manquant
- `td` (Point de rosée) : 16/22 stations → **73%** manquant
- `u` (Humidité) : 16/22 stations → **73%** manquant
- `ff` (Vent moyen) : 10/22 stations → **45%** manquant
- `dd` (Direction vent) : 10/22 stations → **45%** manquant
- `fxi10` (Rafales) : 10/22 stations → **45%** manquant
- `t` (Température) : 4/22 stations → **18%** manquant
- `rr_per` (Précipitations) : 4/22 stations → **18%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `50082001` | BRICQUEBEC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50139001` | CONDE SUR VIRE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50144001` | COULOUVRAY-BOISBENATRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50147001` | COUTANCES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50174001` | EQUILLY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50298001` | MEAUTIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50456001` | ST-CLEMENT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50484002` | ST-HILAIRE-DU-H | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50514001` | CHAULIEU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50531001` | ST OVIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50031001` | BARNEVILLE CART | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50129001` | CHERBOURG-HOMET | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50196001` | GATTEVILLE LE P | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50218001` | GRANVILLE | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50277001` | LONGUEVILLE | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50562001` | ST VAAST LA HOUGUE | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `50111001` | CERISY LA SALLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `50215002` | GOUVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `50410003` | PONTORSON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `50509002` | STE MARIE DU MO | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `50020001` | PTE DE LA HAGUE | 1/9 | 🌫️ Pas de visibilité |

### 03 — Allier (22 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 21/22 stations → **95%** manquant
- `pres` (Pression) : 20/22 stations → **91%** manquant
- `td` (Point de rosée) : 17/22 stations → **77%** manquant
- `u` (Humidité) : 17/22 stations → **77%** manquant
- `ff` (Vent moyen) : 17/22 stations → **77%** manquant
- `dd` (Direction vent) : 17/22 stations → **77%** manquant
- `fxi10` (Rafales) : 17/22 stations → **77%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `03036002` | BOURBON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03059001` | CHAREIL-CINTRAT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03061001` | CHARMES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03074001` | CHEVAGNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03100001` | DIOU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03106002` | DURDAT-LAREQUILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03108001` | ECHASSIERES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03114001` | FERTE-HAUTERIVE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03125001` | LA GUILLERMIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03130002` | ISLE-ET-BARDAIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03162001` | MARIGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03204001` | PARAY-SOUS-BRIAILLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03226001` | SAINT DIDIER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03240001` | ST-LEON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03285001` | TORTEZAIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03310001` | VICHY-VILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03321001` | YZEURE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `03155003` | LURCY-LEVIS SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `03185007` | MONTLUCON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `03248001` | ST-NICOLAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `03180001` | MONTBEUGNY | 1/9 | 🌫️ Pas de visibilité |

### 66 — Pyrénées-Orientales (21 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 20/21 stations → **95%** manquant
- `pres` (Pression) : 19/21 stations → **90%** manquant
- `ff` (Vent moyen) : 10/21 stations → **48%** manquant
- `dd` (Direction vent) : 10/21 stations → **48%** manquant
- `fxi10` (Rafales) : 10/21 stations → **48%** manquant
- `td` (Point de rosée) : 9/21 stations → **43%** manquant
- `u` (Humidité) : 9/21 stations → **43%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `66024001` | LE BOULOU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66037001` | CANET-EN-ROUSSILLON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66049001` | CERET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66074002` | EUS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66119002` | MOSSET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66157001` | RAILLEU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66183001` | ST MARSAL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66206004` | LE TECH LA LLAU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66230001` | VINCA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `66148001` | CAP BEAR | 4/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité |
| `66029003` | CAIXAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66082004` | FORMIGUERES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66088003` | ILLE-SUR-TET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66137003` | LE PERTHUS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66187006` | ST PAUL DE FENOUILLET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66194002` | SERRALONGUE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66202001` | TARGASONNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66204002` | TAURINYA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66212001` | TORREILLES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `66233001` | VIVES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 88 — Vosges (20 stations, 0 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 20/20 stations → **100%** manquant
- `vv` (Visibilité) : 20/20 stations → **100%** manquant
- `td` (Point de rosée) : 12/20 stations → **60%** manquant
- `u` (Humidité) : 12/20 stations → **60%** manquant
- `ff` (Vent moyen) : 12/20 stations → **60%** manquant
- `dd` (Direction vent) : 12/20 stations → **60%** manquant
- `fxi10` (Rafales) : 12/20 stations → **60%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `88075005` | LA_BRESSE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88095003` | CHATENOIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88147001` | DOMMARTIN-AUX-BOIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88176003` | FONTENOY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88196009` | GERARDMER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88201003` | GIRANCOURT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88248001` | ISCHES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88340001` | PADOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88383001` | REMIREMONT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88399001` | LE ROULIER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88408002` | RUPT-SUR-MOSELLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88430001` | ST OUEN-LES-PAREY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `88033002` | BAN-DE-SAPT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `88081004` | BUSSANG | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `88136001` | EPINAL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `88271001` | LIGNEVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `88393003` | ROLLAINVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `88402002` | ROVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `88486003` | VAGNEY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `88487003` | LE VAL-D'AJOL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 29 — Finistère (23 stations, 4 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 19/23 stations → **83%** manquant
- `pres` (Pression) : 17/23 stations → **74%** manquant
- `td` (Point de rosée) : 11/23 stations → **48%** manquant
- `u` (Humidité) : 11/23 stations → **48%** manquant
- `ff` (Vent moyen) : 5/23 stations → **22%** manquant
- `dd` (Direction vent) : 5/23 stations → **22%** manquant
- `fxi10` (Rafales) : 5/23 stations → **22%** manquant
- `t` (Température) : 4/23 stations → **17%** manquant
- `rr_per` (Précipitations) : 4/23 stations → **17%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `29018001` | BRENNILIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29022001` | CAMARET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29041002` | CORAY CHAT EAU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29113001` | LANMEUR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29277001` | SIZUN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29021001` | BRIGNOGAN | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29058003` | BEG_MEIL | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29158001` | PTE DE PENMARCH | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29190001` | PLOUGONVELIN | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29082001` | BATZ | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29168001` | PTE DU RAZ | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `29163003` | PLEYBER-CHRIST SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `29214001` | PLOVAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `29249002` | SAINT-GOAZEC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `29263002` | ST-SEGAL S A | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `29276001` | SIBIRIL S A | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `29293001` | TREGUNC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `29155005` | OUESSANT-STIFF | 1/9 | 🌫️ Pas de visibilité |
| `29178001` | PLOUDALMEZEAU | 1/9 | 🌫️ Pas de visibilité |

### 36 — Indre (20 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 19/20 stations → **95%** manquant
- `pres` (Pression) : 18/20 stations → **90%** manquant
- `ff` (Vent moyen) : 17/20 stations → **85%** manquant
- `dd` (Direction vent) : 17/20 stations → **85%** manquant
- `fxi10` (Rafales) : 17/20 stations → **85%** manquant
- `td` (Point de rosée) : 15/20 stations → **75%** manquant
- `u` (Humidité) : 15/20 stations → **75%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `36001001` | AIGURANDE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36018001` | LE BLANC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36034002` | CHABRIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36035002` | CHAILLAC_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36070001` | EGUZON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36093002` | LEVROUX - TREG. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36103001` | LUCAY-LE-MALE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36113001` | MARTIZAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36141001` | NEUVY-ST-SEP. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36147001` | ORVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36155001` | PELLEVOISIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36169001` | PRUNIERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36186001` | ST-CHRISTOPHE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36192001` | ST-GAULTIER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36208001` | STE-SEVERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `36088005` | ISSOUDUN_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `36219001` | TENDU_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `36127002` | MONTGIVRAY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `36173002` | ROSNAY | 1/9 | 🌫️ Pas de visibilité |

### 89 — Yonne (20 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 19/20 stations → **95%** manquant
- `vv` (Visibilité) : 19/20 stations → **95%** manquant
- `td` (Point de rosée) : 14/20 stations → **70%** manquant
- `u` (Humidité) : 14/20 stations → **70%** manquant
- `ff` (Vent moyen) : 14/20 stations → **70%** manquant
- `dd` (Direction vent) : 14/20 stations → **70%** manquant
- `fxi10` (Rafales) : 14/20 stations → **70%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `89003001` | AILLANT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89014001` | ARCES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89068001` | CHABLIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89086001` | CHARNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89131001` | CRUZY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89133001` | CUDOT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89173001` | FONTAINES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89192001` | GRANDCHAMP_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89206001` | JOIGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89260001` | MOLESMES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89273001` | ST FARGEAU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89279002` | NOYERS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89342001` | ST DENIS LES SENS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89349005` | ST-LEGER-VAUBAN_SA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `89333001` | ST ANDRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `89365001` | SAINT PRIVE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `89380001` | SAVIGNY/CLAIRIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `89387002` | SENS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `89418007` | TONNERRE JOUDRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 13 — Bouches-du-Rhône (21 stations, 3 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 18/21 stations → **86%** manquant
- `vv` (Visibilité) : 18/21 stations → **86%** manquant
- `td` (Point de rosée) : 6/21 stations → **29%** manquant
- `u` (Humidité) : 6/21 stations → **29%** manquant
- `ff` (Vent moyen) : 4/21 stations → **19%** manquant
- `dd` (Direction vent) : 4/21 stations → **19%** manquant
- `fxi10` (Rafales) : 4/21 stations → **19%** manquant
- `t` (Température) : 2/21 stations → **10%** manquant
- `rr_per` (Précipitations) : 2/21 stations → **10%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `13030001` | CUGES-LES-PINS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `13031002` | LA DESTROUSSE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `13055001` | MARSEILLE-OBS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `13092001` | ST CHAMAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `13028001` | BEC DE L AIGLE | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `13056002` | CAP COURONNE | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `13001009` | AIX EN PROVENCE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13004003` | ARLES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13005003` | AUBAGNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13022003` | CASSIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13036003` | EYRAGUES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13055029` | MARSEILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13062002` | MIMET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13074003` | PEYROLLES EN PROVENCE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13091002` | ST CANNAT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13108004` | TARASCON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13110003` | TRETS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `13111002` | VAUVENARGUES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 52 — Haute-Marne (20 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 18/20 stations → **90%** manquant
- `vv` (Visibilité) : 18/20 stations → **90%** manquant
- `td` (Point de rosée) : 15/20 stations → **75%** manquant
- `u` (Humidité) : 15/20 stations → **75%** manquant
- `ff` (Vent moyen) : 15/20 stations → **75%** manquant
- `dd` (Direction vent) : 15/20 stations → **75%** manquant
- `fxi10` (Rafales) : 15/20 stations → **75%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `52023002` | AUBERIVE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52061002` | BOURDONS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52074002` | BREUVANNES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52114001` | CHATEAUVILLAIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52123003` | CHEVILLON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52131002` | CIRFONTAINES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52145001` | COUBLANC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52197003` | FAYL-BILLOT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52294001` | LOUVEMONT - MAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52332001` | VAL-DE-MEUSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52348003` | NEUILLY-L'EVEQUE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52443001` | SAILLY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52447001` | ST-CIERGUES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52450002` | SAINT-LOUP-SUR-AUJON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52529001` | VILLEGUSIEN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `52055001` | BLECOURT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `52248002` | IS-EN-BASSIGNY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `52469001` | CHAUMONT-SEMOUTIERS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 85 — Vendée (19 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 18/19 stations → **95%** manquant
- `pres` (Pression) : 17/19 stations → **89%** manquant
- `td` (Point de rosée) : 11/19 stations → **58%** manquant
- `u` (Humidité) : 11/19 stations → **58%** manquant
- `ff` (Vent moyen) : 9/19 stations → **47%** manquant
- `dd` (Direction vent) : 9/19 stations → **47%** manquant
- `fxi10` (Rafales) : 9/19 stations → **47%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `85005001` | ANTIGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85051001` | CHANTONNAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85097001` | LA-GAUBRETIERE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85109001` | LES HERBIERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85152001` | LA MOTHE ACHARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85153002` | MOUCHAMPS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85169002` | PALLUAU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85190001` | ROCHESERVIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85215002` | ST-FULGENT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85113001` | L ILE D YEU | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85216001` | SAINTE GEMME LA PLAINE_SAPC | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `85060002` | CHATEAU-D'OLONNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `85092004` | FONTENAY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `85104001` | GRUES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `85163001` | NOIRMOUTIER EN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `85172001` | LE PERRIER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `85182004` | POUZAUGES SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `85113004` | L'ILE D'YEU AERO | 1/9 | 🌫️ Pas de visibilité |

### 04 — Alpes-de-Haute-Provence (19 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 18/19 stations → **95%** manquant
- `vv` (Visibilité) : 18/19 stations → **95%** manquant
- `td` (Point de rosée) : 11/19 stations → **58%** manquant
- `u` (Humidité) : 11/19 stations → **58%** manquant
- `ff` (Vent moyen) : 11/19 stations → **58%** manquant
- `dd` (Direction vent) : 11/19 stations → **58%** manquant
- `fxi10` (Rafales) : 11/19 stations → **58%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `04006005` | ALLOS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04022001` | BARREME | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04023001` | BAYONS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04024004` | BEAUJEU ST PIERRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04039001` | CASTELLANE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04041001` | LE CASTELLET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04096002` | JAUSIERS-ST ANNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04115001` | MEAILLES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04126001` | MONTCLAR_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04184001` | ST JURS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04222001` | TURRIERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `04019001` | BARCELONNETTE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `04068001` | DAUPHIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `04070009` | DIGNE LES BAINS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `04134002` | LA MOTTE DU CAIRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `04136001` | LA MURE-ARGENS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `04209005` | SISTERON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `04230001` | VALENSOLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 10 — Aube (18 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 17/18 stations → **94%** manquant
- `vv` (Visibilité) : 17/18 stations → **94%** manquant
- `td` (Point de rosée) : 13/18 stations → **72%** manquant
- `u` (Humidité) : 13/18 stations → **72%** manquant
- `ff` (Vent moyen) : 13/18 stations → **72%** manquant
- `dd` (Direction vent) : 13/18 stations → **72%** manquant
- `fxi10` (Rafales) : 13/18 stations → **72%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `10002001` | AILLEVILLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10021001` | AVANT-LES-RAMERUPT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10042001` | BERULLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10099002` | CHESSY-LES-PRES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10119001` | CUNFIN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10130001` | DOSNON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10166002` | GRANDES-CHAPELL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10238001` | MESNIL-ST-PERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10241001` | METZ-ROBERT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10261001` | MUSSY-SUR-SEINE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10323001` | ROMILLY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10401001` | VENDEUVRE-SUR-B | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10419001` | VILLEMOYENNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `10057001` | BOUY-SUR-ORVIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `10070001` | CELLES-SUR-OURCE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `10228002` | MATHAUX-ETAPE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `10350001` | ST-MARDS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 14 — Calvados (19 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 17/19 stations → **89%** manquant
- `vv` (Visibilité) : 17/19 stations → **89%** manquant
- `td` (Point de rosée) : 13/19 stations → **68%** manquant
- `u` (Humidité) : 13/19 stations → **68%** manquant
- `ff` (Vent moyen) : 12/19 stations → **63%** manquant
- `dd` (Direction vent) : 12/19 stations → **63%** manquant
- `fxi10` (Rafales) : 12/19 stations → **63%** manquant
- `t` (Température) : 1/19 stations → **5%** manquant
- `rr_per` (Précipitations) : 1/19 stations → **5%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `14047002` | BAYEUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14096001` | BREMOY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14229001` | DOZULE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14239001` | ENGLESQUEVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14296001` | LEGAST_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14357002` | LASSY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14366002` | LISIEUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14446001` | MONTIGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14501002` | PIERREFITTE CIN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14624001` | L OUDON LIEURY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14634001` | SAINT MICHEL DE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14659001` | ST SYLVAIN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14515001` | PORT EN BESSIN | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `14066001` | BERNIERES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `14216001` | DAMBLAINVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `14372001` | LIVRY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `14762004` | VIRE HIPPODROME | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 18 — Cher (19 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 17/19 stations → **89%** manquant
- `vv` (Visibilité) : 17/19 stations → **89%** manquant
- `td` (Point de rosée) : 12/19 stations → **63%** manquant
- `u` (Humidité) : 12/19 stations → **63%** manquant
- `ff` (Vent moyen) : 12/19 stations → **63%** manquant
- `dd` (Direction vent) : 12/19 stations → **63%** manquant
- `fxi10` (Rafales) : 12/19 stations → **63%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `18003003` | LES AIX-D'ANG. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18036001` | BRINAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18037001` | BRINON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18047001` | CHAPELLE-D'ANG_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18057003` | CHATEAUMEILLANT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18087001` | DUN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18089001` | EPINEUIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18207003` | ST-FLORENT/CHER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18223003` | ST-MARTIN-D'A. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18231001` | ST-PIERRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18242001` | SANCOINS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18279001` | VIERZON - VEVES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `18015003` | AUBIGNY-SUR-NERE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `18125004` | LERE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `18172003` | ORVAL RAD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `18175003` | OUROUER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `18187004` | PREVERANGES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 19 — Corrèze (19 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 17/19 stations → **89%** manquant
- `vv` (Visibilité) : 17/19 stations → **89%** manquant
- `td` (Point de rosée) : 12/19 stations → **63%** manquant
- `u` (Humidité) : 12/19 stations → **63%** manquant
- `ff` (Vent moyen) : 12/19 stations → **63%** manquant
- `dd` (Direction vent) : 12/19 stations → **63%** manquant
- `fxi10` (Rafales) : 12/19 stations → **63%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `19016001` | BAR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19033001` | BUGEAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19034001` | CAMPS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19121002` | LUBERSAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19125001` | MARCILLAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19136002` | MEYMAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19139001` | MILLEVACHES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19237001` | ST-PRIVAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19264001` | SOURSAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19272001` | TULLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19275001` | USSEL-LAMARTINE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19288004` | VOUTEZAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `19010001` | ARGENTAT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `19073006` | EGLETONS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `19164001` | PEYRELEVADE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `19201001` | USSEL-THALAMY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `19276006` | UZERCHE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 23 — Creuse (18 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 17/18 stations → **94%** manquant
- `vv` (Visibilité) : 17/18 stations → **94%** manquant
- `td` (Point de rosée) : 12/18 stations → **67%** manquant
- `u` (Humidité) : 12/18 stations → **67%** manquant
- `ff` (Vent moyen) : 12/18 stations → **67%** manquant
- `dd` (Direction vent) : 12/18 stations → **67%** manquant
- `fxi10` (Rafales) : 12/18 stations → **67%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `23008004` | AUBUSSON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23013001` | AUZANCES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23021001` | BENEVENT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23025001` | BONNAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23031002` | BOUSSAC_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23046001` | CHAMBONCHARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23069002` | CROCQ | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23075001` | DUN LE PALESTEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23090003` | GENTIOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23113001` | LUPERSAT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23155001` | PONTARION_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23209001` | SAINT-LOUP_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `23030004` | BOURGANEUF | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `23067001` | LA COURTINE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `23079002` | FELLETIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `23089001` | GENOUILLAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `23176001` | LA SOUTERRAINE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 55 — Meuse (17 stations, 0 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 17/17 stations → **100%** manquant
- `pres` (Pression) : 16/17 stations → **94%** manquant
- `td` (Point de rosée) : 10/17 stations → **59%** manquant
- `u` (Humidité) : 10/17 stations → **59%** manquant
- `ff` (Vent moyen) : 10/17 stations → **59%** manquant
- `dd` (Direction vent) : 10/17 stations → **59%** manquant
- `fxi10` (Rafales) : 10/17 stations → **59%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `55014001` | AUBREVILLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55041001` | BEHONNE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55060002` | BONZEE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55067001` | BOVIOLLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55073001` | BRAS-SUR-MEUSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55108004` | CHAUMONT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55123002` | CONDE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55179001` | ERNEVILLE AUX BOIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55328001` | MAXEY-SUR-VAISE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55517002` | TRIAUCOURT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `55129001` | COUROUVRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `55364001` | MOUZAY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `55386002` | NONSARD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `55443001` | ROUVRES-EN-WOEVRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `55484001` | SEPTSARGES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `55531001` | VASSINCOURT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `55248001` | HOUDELAINCOURT | 1/9 | 🌫️ Pas de visibilité |

### 65 — Hautes-Pyrénées (18 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 17/18 stations → **94%** manquant
- `vv` (Visibilité) : 17/18 stations → **94%** manquant
- `ff` (Vent moyen) : 11/18 stations → **61%** manquant
- `dd` (Direction vent) : 11/18 stations → **61%** manquant
- `fxi10` (Rafales) : 11/18 stations → **61%** manquant
- `td` (Point de rosée) : 10/18 stations → **56%** manquant
- `u` (Humidité) : 10/18 stations → **56%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `65018001` | ARBEOST_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65055001` | AYROS ARBOUIX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65138005` | CAUTERETS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65188005` | GAVARNIE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65258001` | LANNEMEZAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65278001` | LOMNE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65295003` | LUZ SAINT SAUVEUR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65304001` | MAUBOURGUET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65388001` | ST LARY SOUL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65447001` | TOURNAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `65059022` | LA MONGIE_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `65001001` | ADAST | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `65059001` | PIC DU MIDI - OBSERVATOIRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `65125001` | CAMPISTROUS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `65129003` | CASTELNAU MAGNOAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `65283001` | LOUDERVIELLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `65460002` | VIC EN BIGORRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 69 — Rhône (18 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/18 stations → **89%** manquant
- `vv` (Visibilité) : 16/18 stations → **89%** manquant
- `ff` (Vent moyen) : 12/18 stations → **67%** manquant
- `dd` (Direction vent) : 12/18 stations → **67%** manquant
- `fxi10` (Rafales) : 12/18 stations → **67%** manquant
- `td` (Point de rosée) : 11/18 stations → **61%** manquant
- `u` (Humidité) : 11/18 stations → **61%** manquant
- `rr_per` (Précipitations) : 1/18 stations → **6%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `69008001` | ANCY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69066003` | COURS LA VILLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69123002` | LYON TETE D'OR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69135001` | MONSOLS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69141001` | MORNANT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69196001` | ST-DIDIER-BEAUJ | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69203001` | ST-GENIS-L'ARGENTIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69204002` | ST-GENIS-LAVAL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69238001` | ST-SYMPHORIEN-C | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69239002` | SAINT-VERAND | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69264001` | VILLEFRANCHE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `69114001` | LIERGUES_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `69028001` | BRINDAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `69174002` | LES SAUVAGES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `69206001` | ST-GEORGES-REN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `69258001` | VAUXRENARD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `69029001` | LYON-BRON | 1/9 | 🌧️ Pas de pluie |

### 71 — Saône-et-Loire (20 stations, 3 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 17/20 stations → **85%** manquant
- `vv` (Visibilité) : 17/20 stations → **85%** manquant
- `td` (Point de rosée) : 14/20 stations → **70%** manquant
- `u` (Humidité) : 14/20 stations → **70%** manquant
- `ff` (Vent moyen) : 14/20 stations → **70%** manquant
- `dd` (Direction vent) : 14/20 stations → **70%** manquant
- `fxi10` (Rafales) : 14/20 stations → **70%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `71022003` | BAUDEMONT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71056003` | BRANGES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71106001` | CHAROLLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71190001` | EPINAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71230002` | GUEUGNON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71240001` | JALOGNY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71267001` | LUGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71289001` | MATOUR_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71340002` | PALINGES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71464001` | ST-MAURICE-LES-COUCHES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71482001` | ST-SYMPHORIEN DE MARMAGNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71523001` | SIMARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71541001` | TORPES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71589001` | VITRY/LOIRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `71014004` | AUTUN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `71320001` | MT-ST-VINCENT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `71558001` | VARENNES-ST-SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 72 — Sarthe (18 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 17/18 stations → **94%** manquant
- `vv` (Visibilité) : 17/18 stations → **94%** manquant
- `td` (Point de rosée) : 14/18 stations → **78%** manquant
- `u` (Humidité) : 14/18 stations → **78%** manquant
- `ff` (Vent moyen) : 14/18 stations → **78%** manquant
- `dd` (Direction vent) : 14/18 stations → **78%** manquant
- `fxi10` (Rafales) : 14/18 stations → **78%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `72042001` | BOULOIRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72086001` | COMMERVEIL_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72093001` | CORMES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72137006` | LA FRESNAYE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72189001` | MAROLLES LES BR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72237001` | PIRMIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72264001` | SABLE SUR SARTH | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72275003` | SAINT CORNEILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72284001` | SAINT GERMAIN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72339001` | SOULIGNE FLACE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72351002` | TENNIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72357001` | THOREE LES PINS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72361001` | TRESSON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72377002` | VILLAINES-SOUS-MALICORNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `72172003` | LE LUART | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `72175002` | LUCHE-PRINGE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `72255001` | ROUESSE-VASSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 33 — Gironde (18 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/18 stations → **89%** manquant
- `vv` (Visibilité) : 16/18 stations → **89%** manquant
- `td` (Point de rosée) : 9/18 stations → **50%** manquant
- `u` (Humidité) : 9/18 stations → **50%** manquant
- `ff` (Vent moyen) : 8/18 stations → **44%** manquant
- `dd` (Direction vent) : 8/18 stations → **44%** manquant
- `fxi10` (Rafales) : 8/18 stations → **44%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `33042001` | BELIN-BELIET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33063001` | BORDEAUX-PAULIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33095001` | CAPTIEUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33195001` | GRIGNOLS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33214002` | LACANAU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33484001` | ST-SYMPHORIEN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33494001` | SALAUNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33504001` | SAUTERNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33236002` | CAP-FERRET | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `33042005` | BELIN BELIET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `33116001` | CAZATS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `33314005` | PAUILLAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `33394002` | ST EMILION | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `33415001` | ST GERVAIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `33482001` | ST SULPICE DE POMMIERS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `33540001` | VENDAYS-MONTALIVE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 46 — Lot (17 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/17 stations → **94%** manquant
- `vv` (Visibilité) : 16/17 stations → **94%** manquant
- `td` (Point de rosée) : 12/17 stations → **71%** manquant
- `u` (Humidité) : 12/17 stations → **71%** manquant
- `ff` (Vent moyen) : 12/17 stations → **71%** manquant
- `dd` (Direction vent) : 12/17 stations → **71%** manquant
- `fxi10` (Rafales) : 12/17 stations → **71%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `46005001` | ANGLARS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46031001` | BLARS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46038002` | BRETENOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46128002` | GRAMAT - PARC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46143001` | LACAPELLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46160001` | LATRONQUIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46173006` | LIMOGNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46176001` | LIVERNON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46201001` | MONTCUQ - ROUIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46287001` | SAINT-PAUL-FLAUGNAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46330002` | VAYRAC - BROUSS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46332001` | VIAZAC - LABOUD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `46071001` | COMIAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `46100001` | FAYCELLES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `46181001` | LUNEGARDE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `46197002` | LE MONTAT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 49 — Maine-et-Loire (18 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 16/18 stations → **89%** manquant
- `pres` (Pression) : 15/18 stations → **83%** manquant
- `td` (Point de rosée) : 12/18 stations → **67%** manquant
- `u` (Humidité) : 12/18 stations → **67%** manquant
- `ff` (Vent moyen) : 12/18 stations → **67%** manquant
- `dd` (Direction vent) : 12/18 stations → **67%** manquant
- `fxi10` (Rafales) : 12/18 stations → **67%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `49007011` | ANGERS VILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49022001` | BEAULIEU-S-LAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49027001` | BEGROLLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49176001` | LE LION D'ANG. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49248003` | POUANCE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49276001` | ST FLORENT VIEI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49281001` | ST GEORGES GARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49307001` | ST MATHURIN S L | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49328001` | SAUMUR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49331003` | SEGRE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49368001` | VERNANTES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49373001` | VIHIERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `49008001` | ANGRIE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `49138001` | FONTAINE-GUERIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `49191001` | MARTIGNE-BRIAND | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `49099003` | CHOLET | 1/9 | 🌫️ Pas de visibilité |

### 58 — Nièvre (17 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/17 stations → **94%** manquant
- `vv` (Visibilité) : 16/17 stations → **94%** manquant
- `td` (Point de rosée) : 12/17 stations → **71%** manquant
- `u` (Humidité) : 12/17 stations → **71%** manquant
- `ff` (Vent moyen) : 12/17 stations → **71%** manquant
- `dd` (Direction vent) : 12/17 stations → **71%** manquant
- `fxi10` (Rafales) : 12/17 stations → **71%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `58023001` | BAZOCHES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58061001` | CHASNAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58104001` | DORNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58106005` | DUN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58132001` | GUIPY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58145002` | LORMES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58148001` | LUTHENAY UXELOU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58149001` | LUZY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58177001` | MONTIGNY EN MORVAN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58199001` | ONLAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58264001` | ST PIERRE LE MOUTIER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58304005` | VARZY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `58019001` | AVREE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `58062001` | CHATEAU CHINON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `58079004` | CLAMECY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `58218006` | PREMERY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 61 — Orne (17 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/17 stations → **94%** manquant
- `vv` (Visibilité) : 16/17 stations → **94%** manquant
- `td` (Point de rosée) : 12/17 stations → **71%** manquant
- `u` (Humidité) : 12/17 stations → **71%** manquant
- `ff` (Vent moyen) : 12/17 stations → **71%** manquant
- `dd` (Direction vent) : 12/17 stations → **71%** manquant
- `fxi10` (Rafales) : 12/17 stations → **71%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `61179001` | FRESNAYE-AU-SAUVAGE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61275001` | LE MERLERAULT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61345003` | REMALARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61369001` | ST BOMER-LES-FORGES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61377001` | ST CORNIER-DES-LANDES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61387001` | ST-FRAIMBAULT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61426001` | BELLEME_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61464001` | SEES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61479001` | TANQUES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61483002` | BAGNOLES-DE-L_ORNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61485002` | TICHEVILLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61491002` | TOUROUVRE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `61006005` | ARGENTAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `61169003` | FLERS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `61214002` | L AIGLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `61404001` | ST-HILAIRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 67 — Bas-Rhin (17 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/17 stations → **94%** manquant
- `vv` (Visibilité) : 16/17 stations → **94%** manquant
- `td` (Point de rosée) : 11/17 stations → **65%** manquant
- `u` (Humidité) : 11/17 stations → **65%** manquant
- `ff` (Vent moyen) : 11/17 stations → **65%** manquant
- `dd` (Direction vent) : 11/17 stations → **65%** manquant
- `fxi10` (Rafales) : 11/17 stations → **65%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `67067001` | BRUMATH | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67083002` | DAMBACH_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67115001` | EBERSHEIM | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67122001` | WANGENBOURG_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67126002` | ERCKARTSWILLER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67165006` | GRANDFONTAINE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67180001` | HAGUENAU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67210002` | LE HOHWALD_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67482001` | STRASBOURG - BOTANIQUE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67498001` | UHRWILLER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67507003` | VILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `67027001` | BELMONT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `67029001` | BERG | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `67443001` | SCHEIBENHARD | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `67462004` | SELESTAT SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `67516001` | WALTENHEIM-SUR-ZORN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 79 — Deux-Sèvres (17 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/17 stations → **94%** manquant
- `vv` (Visibilité) : 16/17 stations → **94%** manquant
- `td` (Point de rosée) : 12/17 stations → **71%** manquant
- `u` (Humidité) : 12/17 stations → **71%** manquant
- `ff` (Vent moyen) : 12/17 stations → **71%** manquant
- `dd` (Direction vent) : 12/17 stations → **71%** manquant
- `fxi10` (Rafales) : 12/17 stations → **71%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `79017001` | NUEIL-LES-AUBIERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79079013` | MAULEON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79134001` | GLENAY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79148001` | LEZAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79176001` | MENIGOUTE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79202003` | PARTHENAY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79215001` | POUGNE-HERISSON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79220002` | PRIN-DEYRANCON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79270003` | SAINT-MAIXENT-L-ECOLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79311002` | SECONDIGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79320002` | SURIN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79329001` | THOUARS-STNA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `79049004` | BRESSUIRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `79174002` | MELLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `79309001` | SCILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `79326004` | THENEZAY STNA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 84 — Vaucluse (18 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 16/18 stations → **89%** manquant
- `pres` (Pression) : 15/18 stations → **83%** manquant
- `td` (Point de rosée) : 6/18 stations → **33%** manquant
- `u` (Humidité) : 6/18 stations → **33%** manquant
- `ff` (Vent moyen) : 6/18 stations → **33%** manquant
- `dd` (Direction vent) : 6/18 stations → **33%** manquant
- `fxi10` (Rafales) : 6/18 stations → **33%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `84003002` | APT-VITON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `84015002` | BEAUMONT-MT  SEREIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `84054001` | ISLE SUR SORGUE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `84064001` | LAPALUD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `84069001` | MALAUCENE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `84074004` | MERINDOL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `84003003` | APT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84009002` | LA BASTIDE DES JOURDANS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84025001` | CABRIERES D'AVIGNON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84026003` | CADENET | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84085004` | MURS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84086001` | OPPEDE CRETE DU PETIT  LUBERON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84094001` | PUYMERAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84107002` | ST CHRISTOL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84150001` | VISAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `84031001` | CARPENTRAS | 1/9 | 🌫️ Pas de visibilité |

### 87 — Haute-Vienne (17 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/17 stations → **94%** manquant
- `vv` (Visibilité) : 16/17 stations → **94%** manquant
- `td` (Point de rosée) : 12/17 stations → **71%** manquant
- `u` (Humidité) : 12/17 stations → **71%** manquant
- `ff` (Vent moyen) : 12/17 stations → **71%** manquant
- `dd` (Direction vent) : 12/17 stations → **71%** manquant
- `fxi10` (Rafales) : 12/17 stations → **71%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `87009003` | BEAUMONT DU LAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87011002` | BELLAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87032004` | CHALUS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87041001` | CHATEAUPONSAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87044001` | CHERONNAC_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87059001` | LE DORAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87103002` | NANTIAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87106001` | NEXON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87113001` | LE PALAIS SUR VIENNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87146002` | ST GERMAIN BELL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87159002` | ST LEGER LA MONTAGNE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87183001` | ST SYLV CROUZIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `87064005` | EYMOUTIERS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `87089003` | MAGNAC-LAVAL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `87154003` | ST JUNIEN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `87187003` | ST YRIEIX LA PE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 972 — Martinique (16 stations, 0 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 16/16 stations → **100%** manquant
- `pres` (Pression) : 14/16 stations → **88%** manquant
- `td` (Point de rosée) : 10/16 stations → **63%** manquant
- `u` (Humidité) : 10/16 stations → **63%** manquant
- `ff` (Vent moyen) : 10/16 stations → **63%** manquant
- `dd` (Direction vent) : 10/16 stations → **63%** manquant
- `fxi10` (Rafales) : 10/16 stations → **63%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `97201001` | AJOUPA-BOUILLON EDEN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97202002` | ANSE D'ARLET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97203003` | BASSEPOINTE-CHAL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97206001` | DIAMANT - JACQUA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97212004` | GROS-MORNE BELLEVUE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97215001` | MACOUBA-BELL. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97218002` | MORNE-ROUGE-CHAMP | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97223001` | ST-ESPRIT GEND | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97225001` | ST-PIERRE DEPAZ | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97232005` | VAUCLIN-RAQUETT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97209007` | FORT-D-FRANCE-PTE NEGRES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97210001` | FRANCOIS-CHOPOT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97222002` | ROBERT-PTE FORT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97232003` | VAUCLIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97209004` | FORT-DE-FRANCE DESAIX | 1/9 | 🌫️ Pas de visibilité |
| `97213004` | LAMENTIN-AERO | 1/9 | 🌫️ Pas de visibilité |

### 08 — Ardennes (17 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 16/17 stations → **94%** manquant
- `vv` (Visibilité) : 16/17 stations → **94%** manquant
- `td` (Point de rosée) : 12/17 stations → **71%** manquant
- `u` (Humidité) : 12/17 stations → **71%** manquant
- `ff` (Vent moyen) : 12/17 stations → **71%** manquant
- `dd` (Direction vent) : 12/17 stations → **71%** manquant
- `fxi10` (Rafales) : 12/17 stations → **71%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `08046001` | BANOGNE-RECOUVRANCE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08089003` | BUZANCY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08116001` | LE CHESNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08207001` | HAM-SUR-MEUSE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08239001` | JUNIVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08244001` | LAMETZ_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08248002` | LAUNOIS-SUR-VENCE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08254002` | LIART_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08255001` | LINAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08296002` | MONTCHEUTIN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08419001` | SIGNY-L'ABBAYE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08420002` | SIGNY-LE-PETIT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `08145001` | DOUZY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `08353001` | RANCENNES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `08367002` | ROCROI | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `08401001` | SAULCES-CHAMPENOISES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 35 — Ille-et-Vilaine (17 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 15/17 stations → **88%** manquant
- `vv` (Visibilité) : 15/17 stations → **88%** manquant
- `td` (Point de rosée) : 10/17 stations → **59%** manquant
- `u` (Humidité) : 10/17 stations → **59%** manquant
- `ff` (Vent moyen) : 10/17 stations → **59%** manquant
- `dd` (Direction vent) : 10/17 stations → **59%** manquant
- `fxi10` (Rafales) : 10/17 stations → **59%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `35026001` | BLERUAIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35044001` | BROUALAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35115001` | FOUGERES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35178001` | MEZIERES-SUR-C. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35224001` | PLERGUER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35225001` | PLESDER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35238003` | RENNES GALLET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35294001` | SAINTE MARIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35335001` | THOURIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35347001` | VAL-D-IZE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `35005001` | ARBRISSEL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `35057003` | LA-CHAPELLE-BOUEXIC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `35110003` | FEINS  SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `35162003` | LOUVIGNE-DU-DESERT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `35202001` | LA-NOE-BLANCHE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 56 — Morbihan (17 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 15/17 stations → **88%** manquant
- `pres` (Pression) : 13/17 stations → **76%** manquant
- `td` (Point de rosée) : 7/17 stations → **41%** manquant
- `u` (Humidité) : 7/17 stations → **41%** manquant
- `ff` (Vent moyen) : 6/17 stations → **35%** manquant
- `dd` (Direction vent) : 6/17 stations → **35%** manquant
- `fxi10` (Rafales) : 6/17 stations → **35%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `56004001` | ARZAL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `56007001` | AURAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `56031001` | CAMORS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `56163001` | PLOERDUT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `56166005` | PLOUAY-SA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `56240003` | SARZEAU SA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `56009001` | BELLE ILE-LE TALUT | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `56017003` | BIGNAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `56069001` | ILE DE GROIX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `56151001` | PONTIVY AERODROME | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `56159001` | PLEUCADEUC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `56165003` | PLOERMEL | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `56243001` | VANNES-SENE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `56009003` | BELLE-ILE_AERO | 1/9 | 🌫️ Pas de visibilité |
| `56186003` | QUIBERON-AERODROME | 1/9 | 🌫️ Pas de visibilité |

### 70 — Haute-Saône (16 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 15/16 stations → **94%** manquant
- `vv` (Visibilité) : 15/16 stations → **94%** manquant
- `td` (Point de rosée) : 10/16 stations → **63%** manquant
- `u` (Humidité) : 10/16 stations → **63%** manquant
- `ff` (Vent moyen) : 10/16 stations → **63%** manquant
- `dd` (Direction vent) : 10/16 stations → **63%** manquant
- `fxi10` (Rafales) : 10/16 stations → **63%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `70006001` | AILLEVILLERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70061002` | BELFAHY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70104001` | BUCEY-LES-GY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70165001` | COMBEAUFONTAINE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70168001` | CONFLANS-SUR-LA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70229001` | FAYMONT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70245003` | FOUGEROLLES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70261001` | FROTEY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70414001` | PLANCHER-LES-MI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70550001` | VESOUL VILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `70132001` | CHARGEY-LES-GRAY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `70283006` | BALLON DE SERVANCE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `70447002` | RIOZ | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `70545001` | VENISEY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `70561002` | VILLERSEXEL SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 76 — Seine-Maritime (17 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 15/17 stations → **88%** manquant
- `pres` (Pression) : 14/17 stations → **82%** manquant
- `td` (Point de rosée) : 10/17 stations → **59%** manquant
- `u` (Humidité) : 10/17 stations → **59%** manquant
- `ff` (Vent moyen) : 9/17 stations → **53%** manquant
- `dd` (Direction vent) : 9/17 stations → **53%** manquant
- `fxi10` (Rafales) : 9/17 stations → **53%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `76171001` | LA CHAPELLE-SAINT-OUEN_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76208001` | CUY SAINT FIACRE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76255002` | EU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76276001` | FORGES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76302002` | GODERVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76378001` | JUMIEGES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76540009` | ROUEN - JARDIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76582001` | ST-GERMAIN-D'ETABLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76679001` | SOMMESNIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76259001` | FECAMP | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `76228001` | ECTOT LES BAONS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `76473001` | NOTRE-DAME DE BLIQUETUIT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `76552001` | CAP-DE-LA-HEVE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `76746001` | VINNEMERVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `76217001` | DIEPPE | 1/9 | 🌫️ Pas de visibilité |

### 28 — Eure-et-Loir (16 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 14/16 stations → **88%** manquant
- `vv` (Visibilité) : 14/16 stations → **88%** manquant
- `td` (Point de rosée) : 13/16 stations → **81%** manquant
- `u` (Humidité) : 13/16 stations → **81%** manquant
- `ff` (Vent moyen) : 13/16 stations → **81%** manquant
- `dd` (Direction vent) : 13/16 stations → **81%** manquant
- `fxi10` (Rafales) : 13/16 stations → **81%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `28051002` | BONNEVAL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28064002` | BU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28190002` | GUILLONVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28195001` | HOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28196003` | ILLIERS-COMBRAY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28214003` | LA LOUPE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28239002` | MARVILLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28322001` | RUEIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28363001` | SAINVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28373002` | SENONCHES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28380003` | SOURS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28386001` | THIMERT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28406002` | EOLE_VIABON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `28407001` | VICHERES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 37 — Indre-et-Loire (15 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 14/15 stations → **93%** manquant
- `vv` (Visibilité) : 14/15 stations → **93%** manquant
- `ff` (Vent moyen) : 10/15 stations → **67%** manquant
- `dd` (Direction vent) : 10/15 stations → **67%** manquant
- `fxi10` (Rafales) : 10/15 stations → **67%** manquant
- `td` (Point de rosée) : 7/15 stations → **47%** manquant
- `u` (Humidité) : 7/15 stations → **47%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `37003001` | AMBOISE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `37113001` | LE GRAND-PRES. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `37119001` | L'ILE-BOUCHARD | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `37128002` | LIGNIERES-DE-T. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `37170001` | NEUVY-LE-ROI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `37216003` | SAINT EPAIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `37241001` | SAVIGNE/LATHAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `37023002` | BEAUMONT_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `37122001` | JOUE-LES-TOURS OB | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `37253001` | SUBLAINES | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `37192001` | REIGNAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `37213003` | ST-CHRISTOPHE-SUR-NAIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `37240001` | SAUNAY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `37242002` | SAVIGNY - VERON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 44 — Loire-Atlantique (16 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 14/16 stations → **88%** manquant
- `vv` (Visibilité) : 14/16 stations → **88%** manquant
- `td` (Point de rosée) : 12/16 stations → **75%** manquant
- `u` (Humidité) : 12/16 stations → **75%** manquant
- `ff` (Vent moyen) : 11/16 stations → **69%** manquant
- `dd` (Direction vent) : 11/16 stations → **69%** manquant
- `fxi10` (Rafales) : 11/16 stations → **69%** manquant
- `t` (Température) : 1/16 stations → **6%** manquant
- `rr_per` (Précipitations) : 1/16 stations → **6%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `44015001` | BLAIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44067001` | GUEMENE-PENFAO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44072002` | HERBIGNAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44109012` | NANTES-VILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44113001` | NOZAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44117002` | LE PALLET_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44120002` | PELLERIN(LE) | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44129001` | PONTCHATEAU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44131002` | PORNIC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44180005` | ST-MARS-LA-JAIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44188001` | ST-PHILBERT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44184001` | PTE DE CHEMOULIN | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `44110002` | NORT-SUR-ERDRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `44181001` | ST-MEME-LE-TENU | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 68 — Haut-Rhin (16 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 14/16 stations → **88%** manquant
- `vv` (Visibilité) : 14/16 stations → **88%** manquant
- `td` (Point de rosée) : 11/16 stations → **69%** manquant
- `u` (Humidité) : 11/16 stations → **69%** manquant
- `ff` (Vent moyen) : 11/16 stations → **69%** manquant
- `dd` (Direction vent) : 11/16 stations → **69%** manquant
- `fxi10` (Rafales) : 11/16 stations → **69%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `68102001` | GEISHOUSE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68112005` | GUEBWILLER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68165001` | KIFFIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68171002` | KRUTH_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68188002` | LINTHAL_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68190001` | LUCELLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68226005` | MUNSTER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68231001` | NEUF-BRISACH | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68287001` | ROUFFACH - CHS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68307001` | SEWEN - LAC ALFELD_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68338001` | TROIS-EPIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `68062001` | CARSPACH | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `68224006` | MULHOUSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `68247003` | MARKSTEIN CRETE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 973 — Guyane (14 stations, 0 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 14/14 stations → **100%** manquant
- `pres` (Pression) : 11/14 stations → **79%** manquant
- `td` (Point de rosée) : 10/14 stations → **71%** manquant
- `u` (Humidité) : 10/14 stations → **71%** manquant
- `ff` (Vent moyen) : 10/14 stations → **71%** manquant
- `dd` (Direction vent) : 10/14 stations → **71%** manquant
- `fxi10` (Rafales) : 10/14 stations → **71%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `97301001` | REGINA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97303001` | IRACOUBO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97305001` | TONATE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97305002` | SOULA_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97307003` | LARIVOT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97309005` | DEGRAD CANNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97310006` | CACAO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97311005` | CHARVEIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97360003` | APATOU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97361001` | AWALA-YALIMAPO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `97302005` | CAYENNE SUZINI | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `97307001` | CAYENNE-MATOURY | 1/9 | 🌫️ Pas de visibilité |
| `97311001` | SAINT LAURENT | 1/9 | 🌫️ Pas de visibilité |
| `97353001` | MARIPASOULA | 1/9 | 🌫️ Pas de visibilité |

### 01 — Ain (15 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 14/15 stations → **93%** manquant
- `vv` (Visibilité) : 13/15 stations → **87%** manquant
- `td` (Point de rosée) : 9/15 stations → **60%** manquant
- `u` (Humidité) : 9/15 stations → **60%** manquant
- `ff` (Vent moyen) : 9/15 stations → **60%** manquant
- `dd` (Direction vent) : 9/15 stations → **60%** manquant
- `fxi10` (Rafales) : 9/15 stations → **60%** manquant
- `rr_per` (Précipitations) : 1/15 stations → **7%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `01064001` | VERIZIEU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01072001` | CEYZERIAT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01143002` | DIVONNE ZA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01200002` | LA BALME SUR CERDON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01235001` | MARLIEUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01247003` | MIJOUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01269001` | NANTUA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01367002` | SAINT JULIEN SUR REYSSOUZE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01027003` | BALAN_AERO | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌧️ Pas de pluie, 📊 Pas de pression |
| `01384003` | ST RAMBERT CG01 | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `01014002` | ARBENT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `01034004` | BELLEY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `01071001` | CESSY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `01414001` | SUTRIEU | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 17 — Charente-Maritime (15 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 13/15 stations → **87%** manquant
- `pres` (Pression) : 11/15 stations → **73%** manquant
- `td` (Point de rosée) : 8/15 stations → **53%** manquant
- `u` (Humidité) : 8/15 stations → **53%** manquant
- `ff` (Vent moyen) : 7/15 stations → **47%** manquant
- `dd` (Direction vent) : 7/15 stations → **47%** manquant
- `fxi10` (Rafales) : 7/15 stations → **47%** manquant
- `t` (Température) : 1/15 stations → **7%** manquant
- `rr_per` (Précipitations) : 1/15 stations → **7%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `17093002` | CHATEAU D'OLERON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `17111001` | CLION | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `17218001` | MARANS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `17224001` | MATHA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `17243002` | MONTLIEU_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `17248001` | MORTAGNE-SUR-GIRONDE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `17477001` | VILLIERS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `17318001` | SAINT-CLEMENT DES BALEINES | 6/9 | ❄️ Pas de température, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `17268002` | NUAILLE SUR BOUTONNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `17339002` | ST GERMAIN DE LUSIGNAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `17415003` | SAINTES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `17306004` | ROYAN-MEDIS | 1/9 | 🌫️ Pas de visibilité |
| `17323001` | CHASSIRON | 1/9 | 🌫️ Pas de visibilité |

### 24 — Dordogne (14 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 13/14 stations → **93%** manquant
- `vv` (Visibilité) : 13/14 stations → **93%** manquant
- `td` (Point de rosée) : 7/14 stations → **50%** manquant
- `u` (Humidité) : 7/14 stations → **50%** manquant
- `ff` (Vent moyen) : 7/14 stations → **50%** manquant
- `dd` (Direction vent) : 7/14 stations → **50%** manquant
- `fxi10` (Rafales) : 7/14 stations → **50%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `24064001` | BRANTOME | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `24152001` | DOMME | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `24172001` | LES EYZIES DE TAYAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `24226001` | LAMOTHE MONTRAV | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `24280001` | MONPAZIER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `24291001` | MONTIGNAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `24547002` | TERRASSON-LAVILLEDIEU | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `24035003` | BELVES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `24138004` | COULOUNIEIX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `24452001` | ST MARTIAL VIVEYROLS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `24453001` | ST MARTIN  DE FRESSENGEAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `24516002` | SALIGNAC-EYVIGUES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `24550003` | THENON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 31 — Haute-Garonne (16 stations, 3 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 13/16 stations → **81%** manquant
- `vv` (Visibilité) : 13/16 stations → **81%** manquant
- `td` (Point de rosée) : 9/16 stations → **56%** manquant
- `u` (Humidité) : 9/16 stations → **56%** manquant
- `ff` (Vent moyen) : 9/16 stations → **56%** manquant
- `dd` (Direction vent) : 9/16 stations → **56%** manquant
- `fxi10` (Rafales) : 9/16 stations → **56%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `31011001` | ARBAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31037002` | AVIGNONET-LAURAGAIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31070004` | BLAJAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31374001` | MONTESQUIEU-LAURAGAIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31403002` | ONDES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31451001` | REVEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31454001` | RIEUMES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31540001` | SEGREVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31579001` | VILLARIES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `31042012` | LUCHON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `31147001` | CLARAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `31406002` | PALAMINY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `31478001` | ST-FELIX-LAURAGAIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 32 — Gers (14 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 13/14 stations → **93%** manquant
- `vv` (Visibilité) : 13/14 stations → **93%** manquant
- `td` (Point de rosée) : 8/14 stations → **57%** manquant
- `u` (Humidité) : 8/14 stations → **57%** manquant
- `ff` (Vent moyen) : 8/14 stations → **57%** manquant
- `dd` (Direction vent) : 8/14 stations → **57%** manquant
- `fxi10` (Rafales) : 8/14 stations → **57%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `32035001` | BEAUCAIRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `32132001` | FLEURANCE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `32147001` | GIMONT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `32190001` | LANNEPAX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `32245001` | MAUMUSSON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `32256001` | MIRANDE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `32355001` | SADEILLAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `32414001` | SARRAGACHIES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `32107006` | CONDOM | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `32155001` | LE HOUGA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `32182001` | LAHAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `32248001` | MAUROUX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `32315001` | PEYRUSSE-GRANDE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 40 — Landes (16 stations, 3 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 13/16 stations → **81%** manquant
- `vv` (Visibilité) : 13/16 stations → **81%** manquant
- `td` (Point de rosée) : 7/16 stations → **44%** manquant
- `u` (Humidité) : 7/16 stations → **44%** manquant
- `ff` (Vent moyen) : 7/16 stations → **44%** manquant
- `dd` (Direction vent) : 7/16 stations → **44%** manquant
- `fxi10` (Rafales) : 7/16 stations → **44%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `40031001` | BEGAAR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `40033001` | BELIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `40134001` | LABOUHEYRE DFCI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `40218002` | PARLEBOSCQ | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `40227001` | PISSOS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `40286001` | SAMADET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `40304001` | SOORTS-HOSSEGOR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `40065002` | CAPBRETON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `40087001` | CREON D'ARMAGNAC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `40164004` | CAPTIEUX-RETJONS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `40243001` | RION-DES-LANDES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `40246003` | SABRES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `40321002` | URGONS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 86 — Vienne (14 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 13/14 stations → **93%** manquant
- `vv` (Visibilité) : 13/14 stations → **93%** manquant
- `td` (Point de rosée) : 9/14 stations → **64%** manquant
- `u` (Humidité) : 9/14 stations → **64%** manquant
- `ff` (Vent moyen) : 9/14 stations → **64%** manquant
- `dd` (Direction vent) : 9/14 stations → **64%** manquant
- `fxi10` (Rafales) : 9/14 stations → **64%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `86015001` | AVAILLES-LIMOUZ | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86021002` | BENASSAY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86032001` | BONNEUIL-MATOUR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86039001` | BRUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86066001` | CHATELLERAULT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86097001` | LA FERRIERE AIROUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86140001` | LUSSAC-LES-CHAT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86273001` | LA TRIMOUILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86289001` | LE-VIGEANT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `86009001` | ARCHIGNY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `86078002` | CIVRAY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `86137003` | LOUDUN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `86165005` | MONTMORILLON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 22 — Côtes-d'Armor (14 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 12/14 stations → **86%** manquant
- `pres` (Pression) : 11/14 stations → **79%** manquant
- `td` (Point de rosée) : 4/14 stations → **29%** manquant
- `u` (Humidité) : 4/14 stations → **29%** manquant
- `ff` (Vent moyen) : 3/14 stations → **21%** manquant
- `dd` (Direction vent) : 3/14 stations → **21%** manquant
- `fxi10` (Rafales) : 3/14 stations → **21%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `22108001` | LANLEFF | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `22147006` | MERDRIGNAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `22243001` | PLUSQUELLEC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `22016001` | ILE-DE-BREHAT | 4/9 | 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `22005003` | BELLE-ISLE-EN-TERRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `22092001` | KERPERT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `22219003` | PLOUGUENAST | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `22247002` | POMMERIT-JAUDY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `22261002` | QUINTENIC | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `22266001` | ROSTRENEN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `22282001` | SAINT-CAST-LE-G | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `22168001` | PLOUMANAC'H | 1/9 | 🌫️ Pas de visibilité |

### 39 — Jura (13 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 12/13 stations → **92%** manquant
- `vv` (Visibilité) : 12/13 stations → **92%** manquant
- `td` (Point de rosée) : 8/13 stations → **62%** manquant
- `u` (Humidité) : 8/13 stations → **62%** manquant
- `ff` (Vent moyen) : 8/13 stations → **62%** manquant
- `dd` (Direction vent) : 8/13 stations → **62%** manquant
- `fxi10` (Rafales) : 8/13 stations → **62%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `39013004` | ARBOIS_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `39156001` | COGNA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `39159002` | COLONNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `39177001` | CRANCOT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `39198001` | DOLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `39225002` | LE FIED_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `39235001` | FRAISANS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `39240001` | LE FRASNOIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `39097003` | CHAMPAGNOLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `39362001` | LONS LE SAUNIER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `39413001` | LA PESSE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `39485002` | ST JULIEN - SA | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 47 — Lot-et-Garonne (13 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 12/13 stations → **92%** manquant
- `vv` (Visibilité) : 12/13 stations → **92%** manquant
- `td` (Point de rosée) : 8/13 stations → **62%** manquant
- `u` (Humidité) : 8/13 stations → **62%** manquant
- `ff` (Vent moyen) : 8/13 stations → **62%** manquant
- `dd` (Direction vent) : 8/13 stations → **62%** manquant
- `fxi10` (Rafales) : 8/13 stations → **62%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `47004001` | AIGUILLON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `47086001` | DURAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `47138001` | LAROQUE-TIMBAUT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `47175001` | MONFLANQUIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `47213001` | PRAYSSAS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `47221001` | REAUP | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `47254001` | SAINT-MARTIN-CURTO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `47327001` | XAINTRAILLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `47093002` | FARGUES-SUR-OURBISE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `47123002` | LACAPELLE-BIRON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `47163001` | MAUVEZIN-SUR-GUPIE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `47323004` | VILLENEUVE-SUR-LOT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 80 — Somme (14 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 12/14 stations → **86%** manquant
- `pres` (Pression) : 11/14 stations → **79%** manquant
- `td` (Point de rosée) : 8/14 stations → **57%** manquant
- `u` (Humidité) : 8/14 stations → **57%** manquant
- `ff` (Vent moyen) : 8/14 stations → **57%** manquant
- `dd` (Direction vent) : 8/14 stations → **57%** manquant
- `fxi10` (Rafales) : 8/14 stations → **57%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `80041001` | AUMONT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `80248001` | DOMPIERRE-SUR-AUTHIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `80253002` | DOULLENS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `80606002` | OISEMONT_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `80628001` | LE-PLESSIER-ROZAINVILLERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `80630001` | POIX-DE-PICARDIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `80713001` | SAINT-QUENTIN EN TT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `80801001` | VILLERS-CARBONNEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `80086002` | BERNAVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `80182003` | CAYEUX-SUR-MER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `80682001` | ROUVROY-EN-SANTERRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `80379002` | AMIENS-GLISY | 1/9 | 🌫️ Pas de visibilité |

### 41 — Loir-et-Cher (12 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 11/12 stations → **92%** manquant
- `pres` (Pression) : 10/12 stations → **83%** manquant
- `td` (Point de rosée) : 7/12 stations → **58%** manquant
- `u` (Humidité) : 7/12 stations → **58%** manquant
- `ff` (Vent moyen) : 7/12 stations → **58%** manquant
- `dd` (Direction vent) : 7/12 stations → **58%** manquant
- `fxi10` (Rafales) : 7/12 stations → **58%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `41018001` | BLOIS - VILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `41050002` | CHEVERNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `41075003` | DROUE - MORACHE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `41080001` | FAVEROLLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `41106001` | LAMOTTE-BEUVRON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `41269001` | VENDOME | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `41285001` | VILLENY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `41053001` | CHOUE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `41152001` | MONTRIEUX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `41173003` | OUZOUER | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `41097001` | ROMORANTIN | 1/9 | 🌫️ Pas de visibilité |

### 77 — Seine-et-Marne (12 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 11/12 stations → **92%** manquant
- `vv` (Visibilité) : 11/12 stations → **92%** manquant
- `td` (Point de rosée) : 5/12 stations → **42%** manquant
- `u` (Humidité) : 5/12 stations → **42%** manquant
- `ff` (Vent moyen) : 5/12 stations → **42%** manquant
- `dd` (Direction vent) : 5/12 stations → **42%** manquant
- `fxi10` (Rafales) : 5/12 stations → **42%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `77159001` | DONNEMARIE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `77239001` | JOUY-LE-CHATEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `77320002` | MOUROUX_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `77489001` | VAUX-SUR-LUNAIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `77530001` | VOULTON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `77054001` | LA BROSSE-MX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `77084001` | CHANGIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `77113002` | CHEVRU | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `77211001` | NANGIS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `77333003` | NEMOURS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `77468001` | TORCY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 02 — Aisne (12 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 11/12 stations → **92%** manquant
- `vv` (Visibilité) : 10/12 stations → **83%** manquant
- `td` (Point de rosée) : 7/12 stations → **58%** manquant
- `u` (Humidité) : 7/12 stations → **58%** manquant
- `ff` (Vent moyen) : 7/12 stations → **58%** manquant
- `dd` (Direction vent) : 7/12 stations → **58%** manquant
- `fxi10` (Rafales) : 7/12 stations → **58%** manquant
- `t` (Température) : 1/12 stations → **8%** manquant
- `rr_per` (Précipitations) : 1/12 stations → **8%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `02077001` | BERZY-LE-SEC | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌧️ Pas de pluie, 📊 Pas de pression, 💧 Pas d'humidité |
| `02058001` | BEAURIEUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `02346001` | GIZY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `02381001` | HIRSON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `02471001` | MARTIGNY-COURPI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `02585001` | PARCY-ET-TIGNY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `02738001` | TERGNIER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `02037002` | AULNOIS-SS-LAON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `02094001` | BLESMES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `02110002` | BRAINE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `02321002` | FONTAINE-LES-VV | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 16 — Charente (12 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 10/12 stations → **83%** manquant
- `vv` (Visibilité) : 10/12 stations → **83%** manquant
- `td` (Point de rosée) : 6/12 stations → **50%** manquant
- `u` (Humidité) : 6/12 stations → **50%** manquant
- `ff` (Vent moyen) : 6/12 stations → **50%** manquant
- `dd` (Direction vent) : 6/12 stations → **50%** manquant
- `fxi10` (Rafales) : 6/12 stations → **50%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `16028001` | BARBEZIEUX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `16193001` | LOUZAC ST ANDRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `16256001` | PASSIRAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `16363001` | SAULGOND_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `16366001` | SEGONZAC_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `16403001` | LE VIEUX CERIER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `16113001` | LA COURONNE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `16225001` | MONTEMBOEUF | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `16279001` | RIOUX MARTIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `16390001` | TUSSON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 45 — Loiret (11 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 10/11 stations → **91%** manquant
- `vv` (Visibilité) : 10/11 stations → **91%** manquant
- `td` (Point de rosée) : 8/11 stations → **73%** manquant
- `u` (Humidité) : 8/11 stations → **73%** manquant
- `ff` (Vent moyen) : 8/11 stations → **73%** manquant
- `dd` (Direction vent) : 8/11 stations → **73%** manquant
- `fxi10` (Rafales) : 8/11 stations → **73%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `45069001` | CHAMBON-LA-F. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `45145001` | FERRIERES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `45187001` | LORRIS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `45193001` | MARCILLY-EN-V. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `45199003` | MELLEROY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `45245001` | OUZOUER_SUR_TREZEE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `45253001` | PITHIVIERS-LE-V | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `45270002` | ST-BENOIT/LOIRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `45004001` | AMILLY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `45340002` | VILLEMURLIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 51 — Marne (12 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 10/12 stations → **83%** manquant
- `vv` (Visibilité) : 10/12 stations → **83%** manquant
- `td` (Point de rosée) : 5/12 stations → **42%** manquant
- `u` (Humidité) : 5/12 stations → **42%** manquant
- `ff` (Vent moyen) : 5/12 stations → **42%** manquant
- `dd` (Direction vent) : 5/12 stations → **42%** manquant
- `fxi10` (Rafales) : 5/12 stations → **42%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `51210001` | DIZY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `51298001` | IGNY-COMBLIZY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `51545001` | SOMMESOUS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `51588001` | VALMY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `51590002` | VANAULT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `51015001` | ARGERS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `51153001` | CHOUILLY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `51237002` | ESTERNAY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `51262001` | FRIGNICOURT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `51388003` | MOURMELON-GRAND | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 53 — Mayenne (11 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 10/11 stations → **91%** manquant
- `vv` (Visibilité) : 10/11 stations → **91%** manquant
- `td` (Point de rosée) : 7/11 stations → **64%** manquant
- `u` (Humidité) : 7/11 stations → **64%** manquant
- `ff` (Vent moyen) : 7/11 stations → **64%** manquant
- `dd` (Direction vent) : 7/11 stations → **64%** manquant
- `fxi10` (Rafales) : 7/11 stations → **64%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `53077001` | COSSE-LE-VIVIEN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `53078001` | COUDRAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `53083001` | COURCITE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `53097001` | EVRON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `53147001` | MAYENNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `53159002` | MONTOURTIER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `53185001` | PRE-EN-PAIL_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `53096004` | ERNEE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `53110002` | GREZ-EN-BOUERE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `53116003` | LE HORPS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 81 — Tarn (11 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 10/11 stations → **91%** manquant
- `vv` (Visibilité) : 10/11 stations → **91%** manquant
- `td` (Point de rosée) : 4/11 stations → **36%** manquant
- `u` (Humidité) : 4/11 stations → **36%** manquant
- `ff` (Vent moyen) : 4/11 stations → **36%** manquant
- `dd` (Direction vent) : 4/11 stations → **36%** manquant
- `fxi10` (Rafales) : 4/11 stations → **36%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `81014001` | ANGLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `81069001` | CORDES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `81081002` | DOURGNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `81124001` | LACAUNE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `81115002` | LABASTIDE-ROUAIROUX | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `81140002` | LAVAUR | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `81182004` | MONTREDON-LABESSONNIE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `81192005` | MURAT SUR VEBRE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `81217002` | PUYCELSI | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `81292001` | TANUS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 09 — Ariège (11 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 10/11 stations → **91%** manquant
- `vv` (Visibilité) : 10/11 stations → **91%** manquant
- `td` (Point de rosée) : 6/11 stations → **55%** manquant
- `u` (Humidité) : 6/11 stations → **55%** manquant
- `ff` (Vent moyen) : 6/11 stations → **55%** manquant
- `dd` (Direction vent) : 6/11 stations → **55%** manquant
- `fxi10` (Rafales) : 6/11 stations → **55%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `09023002` | ASCOU LAVAIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `09027001` | AUGIREIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `09047001` | BELESTA | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `09094001` | CERIZOLS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `09301001` | SOULAN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `09328001` | VERDUN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `09024004` | ASTON | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `09099001` | COS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `09161003` | LERAN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `09199002` | MONTAUT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 54 — Meurthe-et-Moselle (11 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 9/11 stations → **82%** manquant
- `vv` (Visibilité) : 9/11 stations → **82%** manquant
- `td` (Point de rosée) : 6/11 stations → **55%** manquant
- `u` (Humidité) : 6/11 stations → **55%** manquant
- `ff` (Vent moyen) : 6/11 stations → **55%** manquant
- `dd` (Direction vent) : 6/11 stations → **55%** manquant
- `fxi10` (Rafales) : 6/11 stations → **55%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `54040001` | BADONVILLER | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `54181001` | ERROUVILLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `54182001` | ESSEY-ET-MAIZE. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `54322001` | LONGUYON | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `54407001` | OGNEVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `54415001` | PAGNY-SUR-MOSELLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `54171001` | DONCOURT-LES-CONFLANS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `54481001` | ST MAURICE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `54582001` | VILLETTE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 60 — Oise (11 stations, 2 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 9/11 stations → **82%** manquant
- `td` (Point de rosée) : 8/11 stations → **73%** manquant
- `u` (Humidité) : 8/11 stations → **73%** manquant
- `ff` (Vent moyen) : 8/11 stations → **73%** manquant
- `dd` (Direction vent) : 8/11 stations → **73%** manquant
- `fxi10` (Rafales) : 8/11 stations → **73%** manquant
- `vv` (Visibilité) : 8/11 stations → **73%** manquant
- `t` (Température) : 1/11 stations → **9%** manquant
- `rr_per` (Précipitations) : 1/11 stations → **9%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `60500005` | PLESSIS-BELLEVILLE AERO | 8/9 | ❄️ Pas de température, 🌬️ Pas de vent, 💨 Pas de rafales, 🌧️ Pas de pluie, 📊 Pas de pression, 💧 Pas d'humidité |
| `60107001` | BREUIL-LE-VERT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `60260001` | FRESNOY-LA-RIVIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `60276001` | GODENVILLERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `60445001` | NAMPCEL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `60518001` | PUITS-LA-VALLEE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `60623001` | SONGEONS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `60652001` | VALDAMPIERRE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `60322001` | JAMERICOURT | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 62 — Pas-de-Calais (11 stations, 2 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 9/11 stations → **82%** manquant
- `pres` (Pression) : 8/11 stations → **73%** manquant
- `td` (Point de rosée) : 3/11 stations → **27%** manquant
- `u` (Humidité) : 3/11 stations → **27%** manquant
- `ff` (Vent moyen) : 3/11 stations → **27%** manquant
- `dd` (Direction vent) : 3/11 stations → **27%** manquant
- `fxi10` (Rafales) : 3/11 stations → **27%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `62044001` | ATTIN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `62333001` | FIEFS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `62468001` | HUMIERES_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `62054001` | CAP-GRIS-NEZ | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `62516002` | LILLERS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `62685001` | RADINGHEM | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `62784001` | SAULTY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `62873001` | ARRAS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `62160001` | BOULOGNE-SEM | 1/9 | 🌫️ Pas de visibilité |

### 59 — Nord (9 stations, 1 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 8/9 stations → **89%** manquant
- `pres` (Pression) : 6/9 stations → **67%** manquant
- `td` (Point de rosée) : 5/9 stations → **56%** manquant
- `u` (Humidité) : 5/9 stations → **56%** manquant
- `ff` (Vent moyen) : 5/9 stations → **56%** manquant
- `dd` (Direction vent) : 5/9 stations → **56%** manquant
- `fxi10` (Rafales) : 5/9 stations → **56%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `59178001` | DOUAI | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `59392001` | MAUBEUGE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `59512001` | ROUBAIX | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `59604001` | TROISVILLES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `59647001` | WATTEN | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `59534001` | ST-HILAIRE-SUR-HELPE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `59183001` | DUNKERQUE | 1/9 | 🌫️ Pas de visibilité |
| `59606004` | VALENCIENNES | 1/9 | 🌫️ Pas de visibilité |

### 27 — Eure (8 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 7/8 stations → **88%** manquant
- `vv` (Visibilité) : 7/8 stations → **88%** manquant
- `td` (Point de rosée) : 4/8 stations → **50%** manquant
- `u` (Humidité) : 4/8 stations → **50%** manquant
- `ff` (Vent moyen) : 4/8 stations → **50%** manquant
- `dd` (Direction vent) : 4/8 stations → **50%** manquant
- `fxi10` (Rafales) : 4/8 stations → **50%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `27016001` | LES ANDELYS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `27112001` | BRETEUIL | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `27306001` | GUICHAINVILLE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `27375001` | LOUVIERS | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `27056003` | BERNAY | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `27100001` | BOULLEVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `27422001` | MUIDS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 78 — Yvelines (9 stations, 3 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 6/9 stations → **67%** manquant
- `vv` (Visibilité) : 6/9 stations → **67%** manquant
- `td` (Point de rosée) : 4/9 stations → **44%** manquant
- `u` (Humidité) : 4/9 stations → **44%** manquant
- `ff` (Vent moyen) : 4/9 stations → **44%** manquant
- `dd` (Direction vent) : 4/9 stations → **44%** manquant
- `fxi10` (Rafales) : 4/9 stations → **44%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `78380001` | MAULE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `78486002` | LE PERRAY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `78505001` | PRUNAY-LE-TEMPLE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `78562001` | ST-LEGER_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `78005002` | ACHERES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `78354001` | MAGNANVILLE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 82 — Tarn-et-Garonne (7 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 6/7 stations → **86%** manquant
- `vv` (Visibilité) : 6/7 stations → **86%** manquant
- `td` (Point de rosée) : 2/7 stations → **29%** manquant
- `u` (Humidité) : 2/7 stations → **29%** manquant
- `ff` (Vent moyen) : 2/7 stations → **29%** manquant
- `dd` (Direction vent) : 2/7 stations → **29%** manquant
- `fxi10` (Rafales) : 2/7 stations → **29%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `82174001` | ST-VINCENT | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `82180001` | SERIGNAC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `82033005` | CASTELSARRASIN | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `82038006` | CAYLUS | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `82094004` | LAUZERTE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |
| `82178002` | SAVENES | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 90 — Territoire de Belfort (7 stations, 1 complètes)

**Champs les plus souvent absents :**
- `td` (Point de rosée) : 6/7 stations → **86%** manquant
- `u` (Humidité) : 6/7 stations → **86%** manquant
- `ff` (Vent moyen) : 6/7 stations → **86%** manquant
- `dd` (Direction vent) : 6/7 stations → **86%** manquant
- `pres` (Pression) : 6/7 stations → **86%** manquant
- `fxi10` (Rafales) : 6/7 stations → **86%** manquant
- `vv` (Visibilité) : 6/7 stations → **86%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `90044001` | FELON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `90052002` | GIROMAGNY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `90056002` | JONCHEREY | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `90065003` | BALLON_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `90074001` | NOVILLARD_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `90090001` | ST DIZIER-L'EVEQUE_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |

### 75 — Paris (5 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 4/5 stations → **80%** manquant
- `vv` (Visibilité) : 4/5 stations → **80%** manquant
- `td` (Point de rosée) : 3/5 stations → **60%** manquant
- `u` (Humidité) : 3/5 stations → **60%** manquant
- `ff` (Vent moyen) : 2/5 stations → **40%** manquant
- `dd` (Direction vent) : 2/5 stations → **40%** manquant
- `rr_per` (Précipitations) : 2/5 stations → **40%** manquant
- `fxi10` (Rafales) : 2/5 stations → **40%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `75114007` | PARIS-MONTSOURIS-DOUBLE | 8/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `75110001` | LARIBOISIERE | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `75107005` | TOUR EIFFEL | 5/9 | 🌧️ Pas de pluie, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `75116008` | LONGCHAMP | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 91 — Essonne (5 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 4/5 stations → **80%** manquant
- `vv` (Visibilité) : 4/5 stations → **80%** manquant
- `td` (Point de rosée) : 3/5 stations → **60%** manquant
- `u` (Humidité) : 3/5 stations → **60%** manquant
- `ff` (Vent moyen) : 3/5 stations → **60%** manquant
- `dd` (Direction vent) : 3/5 stations → **60%** manquant
- `fxi10` (Rafales) : 3/5 stations → **60%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `91103001` | BRETIGNY_SAPC | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `91275001` | GOMETZ-LE-CHAT. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `91405002` | MILLY-LA-FORET | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `91184001` | COURDIMANCHE | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 985 — 985 (5 stations, 1 complètes)

**Champs les plus souvent absents :**
- `pres` (Pression) : 4/5 stations → **80%** manquant
- `vv` (Visibilité) : 4/5 stations → **80%** manquant
- `ff` (Vent moyen) : 3/5 stations → **60%** manquant
- `dd` (Direction vent) : 3/5 stations → **60%** manquant
- `fxi10` (Rafales) : 3/5 stations → **60%** manquant
- `td` (Point de rosée) : 1/5 stations → **20%** manquant
- `u` (Humidité) : 1/5 stations → **20%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `98512001` | MTZAMBORO | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |
| `98502001` | DZOUMOGNE_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98511003` | VAHIBE_SAPC | 5/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression |
| `98514001` | COCONI OUANGANI | 2/9 | 🌫️ Pas de visibilité, 📊 Pas de pression |

### 95 — Val-d'Oise (5 stations, 3 complètes)

**Champs les plus souvent absents :**
- `ff` (Vent moyen) : 2/5 stations → **40%** manquant
- `dd` (Direction vent) : 2/5 stations → **40%** manquant
- `pres` (Pression) : 2/5 stations → **40%** manquant
- `fxi10` (Rafales) : 2/5 stations → **40%** manquant
- `td` (Point de rosée) : 1/5 stations → **20%** manquant
- `u` (Humidité) : 1/5 stations → **20%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `95492001` | LE PLESSIS GASSOT | 6/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 📊 Pas de pression, 💧 Pas d'humidité |
| `95580001` | ST WITZ | 4/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 📊 Pas de pression |

### 92 — Hauts-de-Seine (1 stations, 0 complètes)

**Champs les plus souvent absents :**
- `td` (Point de rosée) : 1/1 stations → **100%** manquant
- `u` (Humidité) : 1/1 stations → **100%** manquant
- `ff` (Vent moyen) : 1/1 stations → **100%** manquant
- `dd` (Direction vent) : 1/1 stations → **100%** manquant
- `pres` (Pression) : 1/1 stations → **100%** manquant
- `fxi10` (Rafales) : 1/1 stations → **100%** manquant
- `vv` (Visibilité) : 1/1 stations → **100%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `92073001` | SURESNES | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |

### 93 — Seine-Saint-Denis (1 stations, 0 complètes)

**Champs les plus souvent absents :**
- `td` (Point de rosée) : 1/1 stations → **100%** manquant
- `u` (Humidité) : 1/1 stations → **100%** manquant
- `ff` (Vent moyen) : 1/1 stations → **100%** manquant
- `dd` (Direction vent) : 1/1 stations → **100%** manquant
- `pres` (Pression) : 1/1 stations → **100%** manquant
- `fxi10` (Rafales) : 1/1 stations → **100%** manquant
- `vv` (Visibilité) : 1/1 stations → **100%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `93050001` | NEUILLY-SUR-M. | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |

### 94 — Val-de-Marne (1 stations, 0 complètes)

**Champs les plus souvent absents :**
- `td` (Point de rosée) : 1/1 stations → **100%** manquant
- `u` (Humidité) : 1/1 stations → **100%** manquant
- `ff` (Vent moyen) : 1/1 stations → **100%** manquant
- `dd` (Direction vent) : 1/1 stations → **100%** manquant
- `pres` (Pression) : 1/1 stations → **100%** manquant
- `fxi10` (Rafales) : 1/1 stations → **100%** manquant
- `vv` (Visibilité) : 1/1 stations → **100%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `94068001` | ST-MAUR | 7/9 | 🌬️ Pas de vent, 💨 Pas de rafales, 🌫️ Pas de visibilité, 📊 Pas de pression, 💧 Pas d'humidité |

### 986 — 986 (1 stations, 0 complètes)

**Champs les plus souvent absents :**
- `vv` (Visibilité) : 1/1 stations → **100%** manquant

| Station | Nom | Champs manquants | Détails |
|---|---|---|---|
| `98613001` | HIHIFO | 1/9 | 🌫️ Pas de visibilité |

---
## 🔎 Stations connues absentes de l'API infrahoraire-6m

> **209** stations référencées dans `stationNames.json` ne sont PAS présentes dans les données infrahoraires 6m de l'API.

| Dept | Nom dept | Nb absentes | Stations |
|---|---|---|---|
| 02 | Aisne | 2 | CHAUNY (`02173002`), NIZY-LE-COMTE (`02705001`) |
| 04 | Alpes-de-Haute-Provence | 1 | RESTEFOND-NIVOSE (`04096401`) |
| 05 | Hautes-Alpes | 5 | PARPAILLON-NIVOSE (`05044400`), LA MEIJE-NIVOSE (`05063402`), COL AGNEL-NIVOSE (`05077402`), GALIBIER-NIVOSE (`05079402`), ORCIERES-NIVOSE (`05096404`) |
| 06 | Alpes-Maritimes | 1 | MILLEFONTS-NIVOSE (`06153400`) |
| 07 | Ardèche | 2 | MAYRES (`07153001`), LA SOUCHE (`07315004`) |
| 09 | Ariège | 2 | LE MAS D AZIL (`09181003`), PORT D'AULA-NIVOSE (`09285400`) |
| 10 | Aube | 1 | SOULAINES (`10372001`) |
| 11 | Aude | 1 | BELCAIRE (`11028001`) |
| 17 | Charente-Maritime | 1 | ST-LAURENT PREE-INRAE (`17353001`) |
| 18 | Cher | 1 | HENRICHEMONT (`18109002`) |
| 20 | Corse | 8 | AJACCIO-PARATA (`20004003`), SPONDE-NIVOSE (`20007402`), BOCOGNANO-GARE (`20040001`), CAP PERTUSATO (`20041001`), CASTIRLA (`20083001`), RESTONICA_SAPC (`20096009`), LA CHIAPPA (`20247001`), MANICCIA-NIVOSE (`20341400`) |
| 26 | Drôme | 2 | GLANDAGE_SAPC (`26142001`), ST-MARCEL-LES-V-INRAE (`26313001`) |
| 27 | Eure | 1 | GAILLON (`27275001`) |
| 28 | Eure-et-Loir | 3 | CHAPELLE-GUILLAUME_SAPC (`28078001`), LAONS (`28206001`), NOGENT-LE-ROTROU (`28280001`) |
| 29 | Finistère | 2 | PLOMELIN-INRAE (`29170001`), PLOUDANIEL-INRAE (`29179001`) |
| 31 | Haute-Garonne | 1 | AUZEVILLE-TOLOSANE-INRAE (`31035001`) |
| 33 | Gironde | 3 | CADAUJAC-INRAE (`33080001`), PIERROTON-INRAE (`33122003`), VILLENAVE D'ORNON-INRAE (`33550001`) |
| 34 | Hérault | 4 | MARSEILLAN-INRAE (`34150001`), ROUJAN-INRAE (`34237001`), ST ANDRE DE SANGONIS (`34239002`), VILLENEUVE-LES-MAG-INRAE (`34337001`) |
| 35 | Ille-et-Vilaine | 1 | LE RHEU-INRAE (`35240001`) |
| 36 | Indre | 1 | NEUILLAY (`36139001`) |
| 37 | Indre-et-Loire | 1 | FERRIERE-LARCON (`37107001`) |
| 38 | Isère | 5 | AIGLETON-NIVOSE (`38005402`), LE GUA-NIVOSE (`38187400`), LES ECRINS-NIVOSE (`38375402`), ST HILAIRE-NIVOSE (`38395403`), COL DE PORTE-NIVOSE (`38472403`) |
| 39 | Jura | 1 | CHAUX-DES-PRES-INRAE (`39130002`) |
| 40 | Landes | 1 | ST M HINX STNA-INRAE (`40272002`) |
| 42 | Loire | 1 | TARENTAISE (`42306001`) |
| 47 | Lot-et-Garonne | 1 | BOURRAN-INRAE (`47038002`) |
| 49 | Maine-et-Loire | 1 | MONT-BELLAY-INRAE (`49215002`) |
| 51 | Marne | 1 | FAGNIERES-INRAE (`51242001`) |
| 52 | Haute-Marne | 1 | BUSSON_SAPC (`52084002`) |
| 54 | Meurthe-et-Moselle | 1 | CHAMPENOUX-ARBO-INRAE (`54113002`) |
| 56 | Morbihan | 1 | NAIZIN-INRAE (`56144001`) |
| 59 | Nord | 1 | STEENVOORDE (`59580003`) |
| 60 | Oise | 5 | LIERVILLE (`60363001`), MARGNY-LES-COMPIEGNE (`60382001`), PLESSIS-BELLEVILLE (`60500004`), ROUVROY-LES-MERLES (`60555002`), SAINT-ARNOULT (`60566001`) |
| 61 | Orne | 2 | COULONCHE  -LA- (`61124001`), PIN AU HARAS-INRAE (`61328001`) |
| 62 | Pas-de-Calais | 3 | BAINGHEN_SAPC (`62076002`), CAMBRAI-EPINOY (`62298001`), NIELLES-LES-BLEQUIN_SAPC (`62613001`) |
| 63 | Puy-de-Dôme | 2 | LAQUEUILLE-INRAE (`63189005`), ST-GENES-CHPLLE-INRAE (`63345002`) |
| 64 | Pyrénées-Atlantiques | 2 | BENEJACQ (`64109001`), SOUM COUY-NIVOSE (`64330400`) |
| 65 | Hautes-Pyrénées | 1 | LAC D'ARDIDEN-NIVOSE (`65413400`) |
| 66 | Pyrénées-Orientales | 2 | PUIGMAL-NIVOSE (`66067402`), CANIGOU-NIVOSE (`66204400`) |
| 68 | Haut-Rhin | 5 | BERGHEIM-INRAE (`68028001`), COLMAR-INRAE (`68066001`), HUNINGUE (`68149001`), ODEREN - VALLEE (`68247001`), ORBEY LAC BLANC_SAPC (`68249002`) |
| 73 | Savoie | 6 | BONNEVAL-NIVOSE (`73040402`), BELLECOTE-NIVOSE (`73071403`), GRANDE PAREI-NIVOSE (`73093001`), ALLANT-NIVOSE (`73139401`), LE CHEVRIL-NIVOSE (`73296406`), LES ROCHILLES-NIVOSE (`73306401`) |
| 74 | Haute-Savoie | 5 | AIGUILLES ROUGES-NIVOSE (`74056405`), COUVERCLE-NIVOSE (`74056421`), DOUVAINE SA (`74105002`), GIEZ (`74135001`), THONON-INRAE (`74281001`) |
| 75 | Paris | 1 | LUXEMBOURG (`75106001`) |
| 76 | Seine-Maritime | 1 | BOUELLES (`76130001`) |
| 77 | Seine-et-Marne | 3 | CROUY-SUR-OURCQ (`77148002`), FONTAINEBLEAU_SAPC (`77186002`), ST-LOUP-DE-NAUD (`77418001`) |
| 78 | Yvelines | 2 | LE PECQ (`78481001`), VERSAILLES- INRAE (`78646002`) |
| 80 | Somme | 2 | EPEHY_SAPC (`80271002`), ESTREES-MONS-INRAE (`80557001`) |
| 83 | Var | 3 | LE CASTELLET_SAPC (`83035002`), MEOUNES LES MONTRIEUX_SAPC (`83077001`), PLAN D'AUPS - STE BAUME_SAPC (`83093005`) |
| 86 | Vienne | 2 | LUSIGNAN-INRAE (`86139001`), MAUPREVOIR (`86152002`) |
| 88 | Vosges | 1 | MIRECOURT-INRAE (`88304006`) |
| 91 | Essonne | 1 | DOURDAN (`91200002`) |
| 95 | Val-d'Oise | 1 | WY-DIT (`95690001`) |
| 971 | Guadeloupe | 14 | BASSE-TERRE GUILLARD (`97105002`), BOUILLANTE GEND PIGEON_SAPC (`97106001`), CAPESTERRE-M-GALANTE BELLEVUE (`97108001`), LA DESIRADE GENDARMERIE (`97110001`), LA DESIRADE METEO (`97110002`), LE MOULE GARDEL-INRAE (`97117012`), PETIT-BOURG DUCLOS-INRAE (`97118007`), PETIT-CANAL GODET-INRAE (`97119008`), POINTE-NOIRE BELLEVUE (`97121005`), POINTE NOIRE MORPHY (`97121006`), ST-BARTHELEMY METEO (`97123001`), ST-FRANCOIS RENEVILLE (`97125001`), ST-MARTIN MARIGOT GENDARMERIE (`97127002`), SAINTE-ROSE SOFAIA_SAPC (`97129017`) |
| 972 | Martinique | 31 | DUCOS (`97207002`), FOND-DENIS-CADET (`97208001`), FOND-DENIS GLIS (`97208006`), FORT-D-FRANCE-DONIS (`97209002`), FORT-FRANCE COLSON (`97209017`), FRANCOIS-SIMON (`97210004`), GRANDRIVIERE (`97211003`), GROS-MORNE BOISLEZ (`97212007`), LORRAIN VALLON (`97214001`), LORRAIN PIROGUE (`97214005`), MACOUBA-POTICHE (`97215002`), MARIGOT-BELLEVU (`97216002`), MARIN (`97217003`), PRECHEUR-SAVST (`97219006`), RIVIERE-PILOTE CAPRON (`97220005`), RIVIERE-PILOTE STADE (`97220007`), ST-ESPRIT BALD (`97223003`), ST-JOSEPH RABUCH (`97224001`), ST-JOSEPH LEZARD (`97224004`), ST-JOSEPH BPARC (`97224011`), ST-PIERRE (`97225007`), STE ANNE-SECI (`97226004`), STE ANNE-SALINES (`97226006`), STE- LUCE (`97227001`), STE-MARIE GEND (`97228001`), STE MARIE PEROU (`97228006`), TRINITE-CARAVEL (`97230001`), TRINITE-SPOUTOU (`97230002`), TRINITE-RESERVOIR (`97230007`), TROIS-ILETS GOLF (`97231002`), BELLEFONTAINE-VER (`97234002`) |
| 973 | Guyane | 17 | ILE ROYALE (`97304001`), KOUROU CSG (`97304003`), KOUROU PLAGE (`97304005`), PARIACABO (`97304006`), MANA AERODROME (`97306007`), SAINT GEORGES (`97308001`), ROURA (`97310004`), MONTAGNE-DE-KAW (`97310009`), SINNAMARY (`97312002`), EUGENIE-SINNAMARY (`97312009`), MONTSINERY (`97313001`), SAUL_SAPC (`97352001`), TALUEN_SAPC (`97353007`), CAMOPI_SAPC (`97356001`), TROIS_SAUTS_SAPC (`97356003`), GRAND SANTI_SAPC (`97357001`), SAINT ELIE (`97358001`) |
| 974 | La Réunion | 12 | LES AVIRONS - CIRAD (`97401540`), SAINT-BENOIT (`97410238`), SAINT-LEU - CIRAD (`97413545`), ETANG SAINT-LEU - CIRAD (`97413550`), LE TAPAGE - CIRAD (`97414451`), L'ERMITAGE - CIRAD (`97415550`), RAVINE DES CABRIS - CIRAD (`97416410`), LIGNE-PARADIS - CIRAD (`97416465`), LA MARE - CIRAD (`97418123`), RIVIERE DE L'EST - CIRAD (`97419310`), GRAND-HAZIER - CIRAD (`97420110`), LE TAMPON - CIRAD (`97422465`) |
| 984 | 984 | 8 | GLORIEUSES (`98403001`), JUAN DE NOVA (`98403002`), EUROPA (`98403003`), TROMELIN (`98403004`), KERGUELEN (`98404001`), NOUVELLE AMSTERDAM (`98404002`), DUMONT D'URVILLE (`98404003`), CROZET (`98404004`) |
| 985 | 985 | 1 | BANDRELE (`98503001`) |
| 986 | 986 | 1 | MAOPOOPO (`98611001`) |
| 987 | 987 | 14 | NUNUE 3 (`98714007`), ANAU3 (`98714009`), OMOA (`98718001`), MANGAREVA (`98719005`), PAPENOO 1 (`98722003`), TIAREI 2 (`98722005`), PUAMAU (`98723004`), HAAPITI5 (`98729015`), TAIPIVAI (`98731003`), PAEA 3 (`98733003`), PAPEETE 2 (`98735002`), AFAAHITI 2 (`98747004`), TAIARAPU-EST (`98747011`), TUBUAI AERO (`98753002`) |
| 988 | 988 | 2 | SURPRISE (`98818201`), CHESTERFIELD (`98818202`) |

---
## 🆕 Stations présentes dans l'API mais absentes de stationNames.json

> ✅ Toutes les stations de l'API sont référencées localement.


---
## 🔄 Stabilité entre deux cycles consécutifs

| | Cycle 1 (2026-03-03T10:12:00Z) | Cycle 2 (2026-03-03T10:06:00Z) |
|---|---|---|
| Total stations | 1939 | 1945 |
| Communes | 1939 | - |
| Uniquement cycle 1 | 0 | - |
| Uniquement cycle 2 | - | 6 |

**Stations absentes du cycle 1 (instabilité) :**
- `20247001` LA CHIAPPA
- `68249002` ORBEY LAC BLANC_SAPC
- `77148002` CROUY-SUR-OURCQ
- `97224011` ST-JOSEPH BPARC
- `97228006` STE MARIE PEROU
- `97304003` KOUROU CSG

---
## 🧪 Échantillon de données brutes (1 station/dept)

| Dept | Station | T(K) | T(°C) | U(%) | FF(m/s) | FXi10(m/s) | DD(°) | RR(mm) | Pres(hPa) | VV(m) |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | ARBENT | 285.15 | 12 | 64 | 1.1 | 3.1 | 320 | 0 | ❌ | ❌ |
| 02 | AULNOIS-SS-LAON | 285.25 | 12.1 | 69 | 1.3 | 2.2 | 80 | 0 | ❌ | ❌ |
| 03 | BOURBON_SAPC | 285.95 | 12.8 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 04 | ALLOS_SAPC | 283.15 | 10 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 05 | ANCELLE | 280.85 | 7.7 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 06 | ANTIBES-GAROUPE | ❌ | ❌ | ❌ | 3.5 | 8.2 | 50 | ❌ | ❌ | ❌ |
| 07 | ALBA LA ROMAINE | 284.45 | 11.3 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 08 | BANOGNE-RECOUVRANCE | 286.45 | 13.3 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 09 | ASCOU LAVAIL | 287.15 | 14 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 10 | AILLEVILLE_SAPC | 287.15 | 14 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 11 | ALAIGNE | 287.25 | 14.1 | 75 | 5.3 | 10.2 | 80 | 0 | ❌ | ❌ |
| 12 | ALPUECH | 280.85 | 7.7 | 80 | 6.7 | 11.5 | 170 | 0 | ❌ | ❌ |
| 13 | AIX EN PROVENCE | 287.85 | 14.7 | 56 | 2.1 | 6.7 | 90 | 0 | ❌ | ❌ |
| 14 | BAYEUX | 288.75 | 15.6 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 15 | ALLANCHE | 281.65 | 8.5 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 16 | BARBEZIEUX | 289.35 | 16.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 17 | CHATEAU D'OLERON | 287.05 | 13.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 18 | LES AIX-D'ANG. | 288.05 | 14.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 19 | ARGENTAT | 284.45 | 11.3 | 67 | 0.6 | 2.1 | 260 | 0 | ❌ | ❌ |
| 20 | AJACCIO | 290.05 | 16.9 | 67 | 3.5 | 5.7 | 240 | 0 | 102310 | 60000 |
| 21 | BEIRE LE CHATEL | 285.85 | 12.7 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 22 | BELLE-ISLE-EN-TERRE | 288.05 | 14.9 | 69 | 0.7 | 2 | 280 | 0 | ❌ | ❌ |
| 23 | AUBUSSON_SAPC | 286.35 | 13.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 24 | BELVES | 285.35 | 12.2 | 75 | 2.3 | 3.9 | 70 | 0 | ❌ | ❌ |
| 25 | ARC-ET-SENANS | 287.95 | 14.8 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 26 | ALBON | 285.35 | 12.2 | 75 | 0.8 | 2.4 | 170 | 0 | ❌ | ❌ |
| 27 | LES ANDELYS | 287.35 | 14.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 28 | BONNEVAL | 283.05 | 9.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 29 | BRENNILIS | 288.05 | 14.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 30 | AIGUES-MORTES | 286.15 | 13 | 74 | 3.3 | 4.5 | 50 | 0 | ❌ | ❌ |
| 31 | ARBAS | 283.55 | 10.4 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 32 | AUCH | 286.15 | 13 | 80 | 2.5 | 4.3 | 110 | 0 | 100620 | 19890 |
| 33 | BELIN-BELIET | 284.65 | 11.5 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 34 | BEDARIEUX | 283.25 | 10.1 | 93 | 2.8 | 6.6 | 100 | 0 | ❌ | ❌ |
| 35 | ARBRISSEL | 286.55 | 13.4 | 71 | 2.3 | 3.4 | 110 | 0 | ❌ | ❌ |
| 36 | AIGURANDE | 286.75 | 13.6 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 37 | AMBOISE | 288.05 | 14.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 38 | AUTRANS | 278.55 | 5.4 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 39 | ARBOIS_SAPC | 287.75 | 14.6 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 40 | BEGAAR | 284.35 | 11.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 41 | BLOIS - VILLE | 287.55 | 14.4 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 42 | ST ETIENNE-BOUTHEON | 284.75 | 11.6 | 70 | 4.7 | 5.9 | 170 | 0 | 97800 | 24570 |
| 43 | ALLEGRE | 281.55 | 8.4 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 44 | BLAIN | 287.85 | 14.7 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 45 | AMILLY | 287.75 | 14.6 | 60 | 0.8 | 2.5 | 120 | 0 | ❌ | ❌ |
| 46 | ANGLARS | 284.65 | 11.5 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 47 | AIGUILLON | 285.15 | 12 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 48 | ALTIER | 280.05 | 6.9 | 88 | 3.4 | 8.2 | 170 | 0 | ❌ | ❌ |
| 49 | ANGERS VILLE | 287.15 | 14 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 50 | PTE DE LA HAGUE | 284.75 | 11.6 | 89 | 3.6 | 4.8 | 60 | 0 | 102380 | ❌ |
| 51 | ARGERS | 287.15 | 14 | 66 | 1.9 | 3.1 | 170 | 0 | ❌ | ❌ |
| 52 | AUBERIVE_SAPC | 287.35 | 14.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 53 | COSSE-LE-VIVIEN | 287.85 | 14.7 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 54 | BADONVILLER | 287.35 | 14.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 55 | AUBREVILLE_SAPC | 288.15 | 15 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 56 | ARZAL | 284.95 | 11.8 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 57 | MALANCOURT | 287.45 | 14.3 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 58 | AVREE | 286.15 | 13 | 69 | 4.2 | 6.1 | 120 | 0 | ❌ | ❌ |
| 59 | DOUAI | 286.45 | 13.3 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 60 | BAILLEUL-LE-SOC | 285.15 | 12 | 78 | 0.8 | 1.8 | 320 | 0 | 101000 | 16080 |
| 61 | ALENCON | 286.15 | 13 | 68 | 2.3 | 3.7 | 10 | 0 | 100740 | 19380 |
| 62 | ATTIN | 288.45 | 15.3 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 63 | AMBERT | 285.25 | 12.1 | 65 | 1.4 | 2.7 | 250 | 0 | ❌ | ❌ |
| 64 | ACCOUS | 286.15 | 13 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 65 | ADAST | 284.95 | 11.8 | 59 | 0.9 | 1.5 | 320 | 0 | ❌ | ❌ |
| 66 | LE BOULOU | 287.25 | 14.1 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 67 | BELMONT | 283.35 | 10.2 | 55 | 2.4 | 5.1 | 120 | 0 | ❌ | ❌ |
| 68 | CARSPACH | 284.35 | 11.2 | 68 | 0.9 | 2 | 20 | 0 | ❌ | ❌ |
| 69 | ANCY_SAPC | 285.35 | 12.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 70 | AILLEVILLERS | 286.65 | 13.5 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 71 | AUTUN | 284.15 | 11 | 75 | 1.2 | 2.5 | 30 | 0 | ❌ | ❌ |
| 72 | BOULOIRE | 287.95 | 14.8 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 73 | ALBIEZ-MONTROND | 279.55 | 6.4 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 74 | LES CARROZ | 280.45 | 7.3 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 75 | TOUR EIFFEL | 284.45 | 11.3 | ❌ | 3.2 | 5.4 | 100 | ❌ | ❌ | ❌ |
| 76 | ROUEN-BOOS | 287.05 | 13.9 | 59 | 1.3 | 2.5 | 100 | 0 | 100670 | 18580 |
| 77 | LA BROSSE-MX | 285.35 | 12.2 | 71 | 1.3 | 3.2 | 70 | 0 | ❌ | ❌ |
| 78 | ACHERES | 286.35 | 13.2 | 69 | 1 | 2 | 320 | 0 | ❌ | ❌ |
| 79 | NUEIL-LES-AUBIERS | 287.15 | 14 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 80 | ABBEVILLE | 285.55 | 12.4 | 74 | 0.5 | 1.4 | 50 | 0 | 101730 | 18470 |
| 81 | ANGLES | 282.05 | 8.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 82 | CASTELSARRASIN | 285.55 | 12.4 | 80 | 1.5 | 2.9 | 60 | 0 | ❌ | ❌ |
| 83 | AIGUINES_SAPC | 287.55 | 14.4 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 84 | APT-VITON | 286.55 | 13.4 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 85 | ANTIGNY | 288.05 | 14.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 86 | ARCHIGNY | 288.25 | 15.1 | 60 | 2.2 | 3.6 | 120 | 0 | ❌ | ❌ |
| 87 | BEAUMONT DU LAC | 286.25 | 13.1 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 88 | BAN-DE-SAPT | 285.45 | 12.3 | 59 | 1.3 | 3 | 260 | 0 | ❌ | ❌ |
| 89 | AILLANT | 285.05 | 11.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 90 | DORANS | 284.35 | 11.2 | 64 | 2.7 | 5.4 | 70 | 0 | 97890 | 20000 |
| 91 | ORLY | 286.15 | 13 | 62 | 2 | 3.7 | 80 | 0 | 101460 | 18300 |
| 92 | SURESNES | 287.95 | 14.8 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 93 | NEUILLY-SUR-M. | 287.95 | 14.8 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 94 | ST-MAUR | 287.35 | 14.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 95 | PONTOISE - AERO | 285.15 | 12 | 75 | 1 | 2.1 | 360 | 0 | 101470 | 17300 |
| 971 | LES ABYMES CHAZEAU_SAPC | 295.35 | 22.2 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 972 | AJOUPA-BOUILLON EDEN | 295.45 | 22.3 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 973 | REGINA | 295.45 | 22.3 | ❌ | ❌ | ❌ | ❌ | 0.2 | ❌ | ❌ |
| 974 | LE TEVELAVE | 294.05 | 20.9 | ❌ | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 975 | ST-PIERRE | 266.55 | -6.6 | 57 | 13.5 | 18.8 | 280 | 0 | 102860 | 19530 |
| 985 | DZOUMOGNE_SAPC | 303.55 | 30.4 | 76 | ❌ | ❌ | ❌ | 0 | ❌ | ❌ |
| 986 | HIHIFO | 300.65 | 27.5 | 77 | 2 | 4.5 | 120 | 0 | 100780 | ❌ |
| 987 | ANAA1 | 300.65 | 27.5 | ❌ | 6.3 | 8 | 140 | 0 | 101150 | ❌ |
| 988 | BELEP AEROD | 300.15 | 27 | 81 | 9 | 16.9 | 120 | 0 | 99740 | 18490 |