(function () {
    'use strict';

    var COMMUNES_API = 'https://geo.api.gouv.fr/communes';
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var IDF_CODES = ['75', '77', '78', '91', '92', '93', '94', '95'];
    // Départements côtiers — même liste que LITTORAL_DEPARTMENTS côté
    // pipeline Python (update_risques.py) : seuls ces départements peuvent
    // avoir un niveau Littoral non nul, donc seuls ceux-là reçoivent un
    // tracé sur le trait de côte.
    var LITTORAL_DEPARTMENT_CODES = [
        '59', '62', '80', '76', '14', '50', '35', '22', '29', '56',
        '44', '85', '17', '33', '40', '64',
        '66', '11', '34', '30', '13', '83', '06',
        '2A', '2B'
    ];
    var ICON_MIN_LEVEL = 2;

    // Icônes vectorielles épurées (monochromes, viewBox 24x24, dessinées à
    // la main — pas d'emoji, ni de dépendance externe). Chaque primitive
    // est rejouée à la fois en HTML (onglets, détail) et en SVG (badges sur
    // la carte) à partir de la même définition, pour éviter toute
    // divergence visuelle entre les deux usages.
    var ICONS = {
        orages: [
            { tag: 'path', d: 'M13 2 3 14h6l-1 8 10-12h-6l1-8z', fill: 'currentColor' }
        ],
        grele: [
            { tag: 'circle', cx: 7, cy: 9, r: 2.6, fill: 'currentColor' },
            { tag: 'circle', cx: 15, cy: 7, r: 2.1, fill: 'currentColor' },
            { tag: 'circle', cx: 11.5, cy: 15.5, r: 3, fill: 'currentColor' }
        ],
        pluie_inondation: [
            { tag: 'circle', cx: 8, cy: 11, r: 3.4, fill: 'currentColor' },
            { tag: 'circle', cx: 13, cy: 8.5, r: 4.4, fill: 'currentColor' },
            { tag: 'circle', cx: 17.2, cy: 11, r: 3.4, fill: 'currentColor' },
            { tag: 'rect', x: 5.4, y: 11, width: 13.6, height: 5.2, rx: 2.6, fill: 'currentColor' },
            { tag: 'path', d: 'M8 19.5l1.2 3h-2.4z', fill: 'currentColor' },
            { tag: 'path', d: 'M13 19.5l1.2 3h-2.4z', fill: 'currentColor' },
            { tag: 'path', d: 'M18 19.5l1.2 3h-2.4z', fill: 'currentColor' }
        ],
        vent: [
            { tag: 'path', d: 'M3 8h10.5a3 3 0 1 0-2.6-4.6', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', fill: 'none' },
            { tag: 'path', d: 'M3 13h14.5a3 3 0 1 1-2.6 4.6', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', fill: 'none' },
            { tag: 'path', d: 'M3 18h9', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', fill: 'none' }
        ],
        neige: [
            { tag: 'line', x1: 12, y1: 2, x2: 12, y2: 22, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 4.2, y1: 7, x2: 19.8, y2: 17, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 19.8, y1: 7, x2: 4.2, y2: 17, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }
        ],
        verglas: [
            { tag: 'ellipse', cx: 12, cy: 16.5, rx: 8, ry: 3.2, fill: 'currentColor', opacity: '.35' },
            { tag: 'line', x1: 7, y1: 15, x2: 10, y2: 11.5, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 12, y1: 14.5, x2: 15, y2: 9.5, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 16, y1: 15, x2: 19, y2: 10.5, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }
        ],
        chaleur: [
            { tag: 'circle', cx: 12, cy: 12, r: 4.2, fill: 'currentColor' },
            { tag: 'line', x1: 12, y1: 1.5, x2: 12, y2: 4.5, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 12, y1: 19.5, x2: 12, y2: 22.5, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 1.5, y1: 12, x2: 4.5, y2: 12, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 19.5, y1: 12, x2: 22.5, y2: 12, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 4.6, y1: 4.6, x2: 6.7, y2: 6.7, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 17.3, y1: 17.3, x2: 19.4, y2: 19.4, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 4.6, y1: 19.4, x2: 6.7, y2: 17.3, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 17.3, y1: 6.7, x2: 19.4, y2: 4.6, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }
        ],
        froid: [
            { tag: 'path', d: 'M12 3a2 2 0 0 0-2 2v8.1a4.2 4.2 0 1 0 4 0V5a2 2 0 0 0-2-2z', stroke: 'currentColor', 'stroke-width': 1.8, fill: 'none' },
            { tag: 'circle', cx: 12, cy: 18, r: 2.4, fill: 'currentColor' }
        ],
        brouillard: [
            { tag: 'line', x1: 4, y1: 7, x2: 20, y2: 7, stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 2.5, y1: 12, x2: 21.5, y2: 12, stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round' },
            { tag: 'line', x1: 4, y1: 17, x2: 20, y2: 17, stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round' }
        ],
        littoral: [
            { tag: 'path', d: 'M2 8c2 0 2-2.2 4-2.2s2 2.2 4 2.2 2-2.2 4-2.2 2 2.2 4 2.2 2-2.2 4-2.2', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', fill: 'none' },
            { tag: 'path', d: 'M2 13.5c2 0 2-2.2 4-2.2s2 2.2 4 2.2 2-2.2 4-2.2 2 2.2 4 2.2 2-2.2 4-2.2', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', fill: 'none' },
            { tag: 'path', d: 'M2 19c2 0 2-2.2 4-2.2s2 2.2 4 2.2 2-2.2 4-2.2 2 2.2 4 2.2 2-2.2 4-2.2', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', fill: 'none' }
        ],
        feu: [
            { tag: 'path', d: 'M12 2c1.6 2.8 1 4.6-.3 6.4-1.1 1.5-2.4 3-2.4 5.3a3.7 3.7 0 0 0 7.4 0c0-1.4-.5-2.3-1-3.1.2 1.2-.4 2-.4 2 .5-2.6-.9-4.4-1.7-5.6.2 1-.3 1.6-.3 1.6.4-2.6-.6-4.4-1.3-6.6z', fill: 'currentColor' },
            { tag: 'path', d: 'M11.2 22c-2.6 0-4.6-1.8-4.6-4.3 0-1.6.8-2.8 1.6-3.7-.2 1.3.3 2.1.3 2.1-.3-1.8.7-3 1.5-3.8-.1 1 .2 1.6.2 1.6 0-1.6 1-2.6 1-2.6-.6 1.8.2 3 .2 3 .7.4 1.2 1.2 1.2 2.2 0 1.6-1 2.5-1.4 3.5.6-.2 1.1-.6 1.4-1.1-.1 1.8-1.5 3.1-3.4 3.1z', fill: 'currentColor', opacity: '.55' }
        ]
    };
/* Icônes Météo-France (silhouettes) — intégrées au runtime : la
   bbox exacte est mesurée via getBBox() puis chaque chemin est
   repositionné dans le cadre 24×24. Aucun parser de chemin local. */
(function () {
    var MF_RAW = {
        orages: [{ d: 'M1514 1574 c-21 -26 -48 -57 -59 -69 -42 -48 -76 -87 -294 -345 -124 -146 -253 -298 -288 -339 -63 -74 -74 -97 -50 -107 11 -4 270 33 361 52 27 6 28 5 22 -22 -7 -31 -40 -210 -79 -437 -19 -110 -21 -140 -11 -148 8 -6 19 -7 27 -2 8 4 70 73 137 152 67 79 127 149 133 156 7 6 27 30 45 53 18 22 45 53 58 69 14 15 80 93 147 173 67 80 141 167 164 194 34 38 41 51 32 62 -15 19 -21 18 -202 -17 -88 -17 -161 -29 -163 -26 -2 2 1 26 6 53 11 53 52 298 77 461 23 147 6 169 -63 87z' }],
        vent: [{ d: 'M1017.8,5233.8c-20.2-5.4-26.4-9.5-169.2-118.1c-81.5-62.2-149.8-113.7-152-114.6c-3.1-1.3-4.2,4.7-5.6,30.9 c-1.4,24.6-3.1,34.4-7,40.4c-13.5,20.2-44.4,27.8-66,16.1c-6.7-3.8-13.8-10.4-15.5-14.8c-2.5-5.7-3.4-162.3-3.4-612.2v-604.3 l7.9-14.2l7.6-14.2l25.9-0.3H666l11.5,14.5l11.5,14.8v474.5c0,261.1,0.6,474.8,1.4,474.8c0.8,0,64.9-60.3,142.2-134.2 c77.6-73.9,143-134.2,145.8-134.2c2.8,0,53.7,9.8,113,21.8c142.5,29,237.2,47.4,347.9,66.6c237.2,41.7,313,57.8,485.3,102.9 c50.3,12.9,78.4,33.8,93.6,68.8c12.1,28.1,17.1,52.4,18.8,92.5c3.4,73.6-13.5,113.3-56.8,135.4c-16.6,8.5-55.1,17.7-310.5,73.6 c-41,9.2-198.7,43.9-350.1,77.7c-151.7,33.8-276.8,61.6-278.2,61.3C1040,5239.5,1029.3,5236.6,1017.8,5233.8z M1033.8,5178.2 c30.9-24.3,52.5-153.4,52.5-317.3c0.3-110.5-5.9-165.4-24.2-219.1c-10.7-30.9-30.1-55.6-43.6-55.6c-25.3,0-44.1,53-57.6,162.9 c-8.4,70.7-9,218.8-1.1,283.8c9.3,74.8,25,127.9,43.3,144C1011.3,5184.2,1025.3,5184.9,1033.8,5178.2z M1372.9,5126.1 c58.7-11.4,111.6-35.7,141.6-65c11-10.7,17.4-20.8,25.6-40.1c31.2-73.9,32.9-166.1,4.8-250.1c-25.3-75.1-81.2-114.9-185.7-132.6 c-31.2-5.4-77.3-6.3-77.3-1.9c0,1.6,3.7,20.5,8.4,42c18.5,85.9,23.6,141.1,21.6,229.2c-0.8,39.5-3.1,76.7-5.9,93.8 c-5.9,36.9-19.4,88.4-29.8,114.3l-8.4,20.8l35.7-1.9C1323.5,5133.4,1354.4,5129.9,1372.9,5126.1z M909.6,4955 c0.8-82.1,1.4-180.9,0.8-219.7l-0.8-70.4l-92.7,93.8c-50.9,51.8-102,103.2-113,114.6l-20.5,20.8l110.4,104.8 c60.4,57.5,111,104.8,111.8,104.8C906.8,5104,908.5,5036.8,909.6,4955z M1849.5,5026.4c40.5-11.7,68.3-35,83.5-70.1 c7.3-16.7,7.9-20.8,7.9-55.9c0-36-0.6-39.1-8.7-58.4c-10.7-25.6-30.9-51.1-47.2-60c-9.8-5.1-130.9-36-130.9-33.5 c0,0.3,2,7.9,4.2,16.4c14.9,57.1,18.3,154.1,7.6,222.3c-3.4,20.2-6.7,39.1-7.9,42.3c-2,5.7-0.3,6,35.7,4.1 C1814.7,5032.7,1839.4,5029.5,1849.5,5026.4z' }],
        pluie_inondation: [{ d: 'M1374.7,5135c-64.8-8.7-123.9-28.2-176.9-58.2c-69.6-39.3-135.7-108.3-172.4-179.5c-23.9-46.4-43.4-117.6-43.4-160 c0-24.1-2.6-29.4-13.1-29.4c-24.6,0-78.9-15.8-113.7-33.4C776,4634.7,715,4561,693,4478.4c-12.1-44.9-11.5-107.7,1.6-153.8 c25.5-89.5,96.7-166.2,188.4-202.8c58.7-23.5,21.4-22,538-23.2c480.9-0.9,496.2-0.6,547.9,11.8c167.6,40.9,293.1,182,305.6,343.9 c8.3,104.3-23.6,200.6-93.2,281.1c-73.4,85.4-193.2,139.3-309.1,139.6h-29.7l-10.2,21.4c-28.1,57.9-88.8,125.7-147.2,164.1 c-51.4,33.7-112.7,58.5-173.4,70C1480,5136.2,1404,5139,1374.7,5135z M1485.1,5031.3c72.2-12.1,136.7-44,187.7-92.6 c37.4-35.9,60-70.3,81.7-125.1c7.7-19.5,12.8-27.6,21.4-34.1l11.5-8.4l67.4-0.3c64.2,0,68.6-0.3,96.1-8.4 c57.8-17.3,102.8-44,141.8-84.2c58.4-60.7,85.9-139.9,76.6-221c-13.7-119.5-98.7-213.3-224.8-248.3l-25.5-7.1l-466.2-0.9 c-527.5-1.2-493.3-2.8-547.6,23.2c-70.9,33.7-115.3,101.8-115.9,178.6c-0.3,35.3,4.5,54.8,22,90.7c24.3,48.9,69.9,86.7,127.4,104.9 c22,6.8,31.6,8,68.6,8.7c46.9,0.6,57.2,3.4,69.9,18.9c10.2,12.7,12.5,25.7,9.6,55.7c-6.7,69.6,12.8,146.1,52.4,204.3 C1213.4,4995,1352.3,5053.2,1485.1,5031.3z' },{ d: 'M1031.4,4030.2c-15.6-7.1-172.1-158.5-176.9-171.5c-17.2-44,27.8-84.8,70.6-64.4c9.6,4.3,40.2,32.2,94.2,84.8 c68.6,66.9,80.8,79.9,83.7,91.3c5.1,17.6,1.6,33.1-10.5,46.4C1075.2,4036.1,1054.4,4040.7,1031.4,4030.2z' },{ d: 'M1353.3,4031.4c-5.4-2.2-47.3-40.2-92.9-84.5c-88.1-85.4-92.9-91.6-88.4-114.5c6.4-34.1,42.5-53.2,73.1-39.3 c5.7,2.8,47.9,41.5,93.6,86.1c72.2,70,83.7,82.6,85.6,92.9c5.1,26-5.7,48.3-28.4,58.2C1380.1,4037,1367.3,4037.3,1353.3,4031.4z' },{ d: 'M1673.2,4030.2c-15.6-7.1-172.1-158.8-177.2-171.5c-11.8-31.3,8-65,40.6-69.3c26.2-3.4,32.2,0.9,115.9,82.6 c94.2,91.9,89.4,86.7,92.6,101.2c7.3,30.3-18.8,63.1-50.1,62.8C1690.1,4036.1,1680.2,4033.3,1673.2,4030.2z' },{ d: 'M1994.7,4031.4c-11.8-5-158-143.6-171.8-162.8c-12.1-17-13.4-35-3.8-52.3c13.4-24.1,43.1-34.4,67.7-23.2 c5.7,2.8,47.9,41.5,93.6,86.1c72.2,70,83.7,82.6,85.6,92.9c5.1,26-5.7,48.3-28.4,58.2C2021.9,4037,2009.1,4037.3,1994.7,4031.4z' },{ d: 'M1053.8,3795.8c-11.8-5.6-169.5-157.6-175.9-169c-2.6-4.6-4.5-15.2-4.5-23.5c0-33.7,34.5-57.9,67.7-47.4 c7.3,2.5,36.1,28.2,95.8,86.4c70.2,68.4,85.6,84.8,88.4,95C1136.1,3777,1090.8,3814.4,1053.8,3795.8z' },{ d: 'M1376.3,3796.5c-14-6.2-176.2-165.9-178.5-175.2c-5.7-25.4-3.5-35.6,11.8-50.8c14.7-15.2,28.7-19.5,49.2-15.8 c10.5,1.9,24.3,13.6,96.4,83c46.3,44.6,86.2,85.4,88.4,91c14.7,32.8-6.7,68.4-42.5,71.2C1392.2,3800.5,1382,3799.2,1376.3,3796.5z' },{ d: 'M1695.5,3794.6c-17.9-8.7-168.9-155.7-175.3-170.9c-7-15.8-6.4-26.9,2.2-42.7c8.3-15.5,28.7-27.9,45-27.9 c21.1,0.3,34.5,10.8,117.5,91.6c70.6,69,82.1,81.7,84,91.9c5.1,25.4-5.1,47.1-27.1,57.9C1725.9,3802.3,1711.8,3802.3,1695.5,3794.6 z' }],
        chaleur: [{ d: 'M1415 1691 c-48 -22 -69 -44 -90 -94 -13 -31 -15 -104 -15 -483 l0 -447 -36 -40 c-20 -22 -48 -65 -62 -96 -23 -47 -27 -70 -27 -146 0 -76 4 -99 27 -147 34 -73 103 -142 176 -176 49 -23 70 -27 152 -27 84 0 102 3 152 28 109 54 190 167 204 287 11 99 -37 231 -111 300 l-25 23 0 462 0 462 -29 40 c-39 54 -90 73 -194 73 -58 0 -94 -6 -122 -19z m225 -64 c14 -7 33 -28 42 -47 16 -32 18 -77 18 -489 l0 -454 41 -44 c140 -152 105 -373 -72 -462 -148 -74 -314 -18 -388 131 -56 110 -38 226 50 322 l48 53 3 472 3 473 33 29 c30 27 38 29 115 29 45 0 93 -6 107 -13z' },{ d: 'M1484 1406 c-18 -14 -19 -30 -19 -412 l0 -397 -37 -23 c-20 -13 -47 -38 -61 -56 -141 -190 64 -430 274 -320 75 39 112 100 113 185 1 81 -30 140 -96 182 l-47 30 0 397 c-1 442 1 428 -70 428 -20 0 -46 -6 -57 -14z m12 -921 c3 -8 -4 -26 -15 -41 -13 -16 -21 -41 -21 -64 0 -40 -23 -61 -44 -40 -18 18 -10 86 14 124 22 37 56 48 66 21z' },{ d: 'M2071 1691 c-20 -13 -10 -105 12 -109 14 -3 17 5 17 52 0 57 -7 70 -29 57z' },{ d: 'M1885 1610 c-14 -23 69 -90 88 -71 8 8 2 20 -23 46 -35 36 -54 43 -65 25z' },{ d: 'M2211 1586 c-32 -33 -35 -56 -7 -56 15 0 76 62 76 78 0 23 -36 12 -69 -22z' },{ d: 'M2013 1540 c-87 -53 -82 -180 10 -223 43 -21 67 -21 111 -3 50 21 76 60 76 116 0 102 -110 164 -197 110z m126 -46 c79 -66 -7 -187 -98 -140 -59 31 -68 90 -22 137 37 37 79 38 120 3z' },{ d: 'M1067 1503 c-12 -12 -7 -60 7 -72 20 -17 87 -10 99 10 5 9 7 28 3 42 -6 25 -11 27 -55 27 -26 0 -51 -3 -54 -7z' },{ d: 'M1812 1433 c3 -15 13 -18 58 -18 42 0 55 3 55 15 0 11 -14 16 -58 18 -52 3 -58 1 -55 -15z' },{ d: 'M2236 1442 c-12 -20 13 -33 60 -30 37 2 50 7 52 21 3 14 -5 17 -52 17 -30 0 -57 -4 -60 -8z' },{ d: 'M1911 1296 c-32 -33 -35 -56 -7 -56 15 0 76 62 76 78 0 23 -36 12 -69 -22z' },{ d: 'M2185 1320 c-14 -23 69 -90 88 -71 8 8 2 20 -23 46 -35 36 -54 43 -65 25z' },{ d: 'M1067 1314 c-11 -12 -8 -59 5 -72 16 -16 70 -15 92 1 12 9 17 23 14 42 -3 28 -6 30 -53 33 -28 2 -54 0 -58 -4z' },{ d: 'M2062 1228 c2 -41 7 -54 21 -56 14 -3 17 5 17 52 0 50 -2 56 -21 56 -18 0 -20 -5 -17 -52z' },{ d: 'M1064 1116 c-14 -36 0 -60 39 -68 54 -11 79 4 75 45 -3 31 -5 32 -56 35 -39 2 -54 -1 -58 -12z' },{ d: 'M1064 926 c-3 -8 -4 -25 -2 -38 3 -21 8 -23 58 -23 l55 0 0 35 0 35 -53 3 c-39 2 -54 -1 -58 -12z' },{ d: 'M1100 751 c-32 -5 -35 -9 -35 -41 0 -35 0 -35 49 -38 52 -3 66 6 66 45 0 18 -29 47 -42 42 -2 -1 -19 -4 -38 -8z' }],
        froid: [{ d: 'M1415 1691 c-48 -22 -69 -44 -90 -94 -13 -31 -15 -104 -15 -483 l0 -447 -36 -40 c-20 -22 -48 -65 -62 -96 -23 -47 -27 -70 -27 -146 0 -76 4 -99 27 -147 34 -73 103 -142 176 -176 49 -23 70 -27 152 -27 84 0 102 3 152 28 109 54 190 167 204 287 11 99 -37 231 -111 300 l-25 23 0 462 0 462 -29 40 c-39 54 -90 73 -194 73 -58 0 -94 -6 -122 -19z m225 -64 c14 -7 33 -28 42 -47 16 -32 18 -77 18 -489 l0 -454 41 -44 c140 -152 105 -373 -72 -462 -148 -74 -314 -18 -388 131 -56 110 -38 226 50 322 l48 53 3 472 3 473 33 29 c30 27 38 29 115 29 45 0 93 -6 107 -13z' },{ d: 'M1484 706 c-14 -11 -19 -26 -19 -65 0 -46 -3 -52 -28 -62 -15 -7 -43 -29 -61 -50 -158 -185 49 -444 265 -331 75 39 112 100 113 185 1 81 -30 140 -96 182 -45 29 -47 32 -47 77 -1 28 -7 53 -17 62 -19 20 -84 21 -110 2z m12 -221 c3 -8 -4 -26 -15 -41 -13 -16 -21 -41 -21 -64 0 -40 -23 -61 -44 -40 -18 18 -10 86 14 124 22 37 56 48 66 21z' },{ d: 'M1067 1503 c-12 -12 -7 -60 7 -72 20 -17 87 -10 99 10 5 9 7 28 3 42 -6 25 -11 27 -55 27 -26 0 -51 -3 -54 -7z' },{ d: 'M1067 1314 c-11 -12 -8 -59 5 -72 16 -16 70 -15 92 1 12 9 17 23 14 42 -3 28 -6 30 -53 33 -28 2 -54 0 -58 -4z' },{ d: 'M1064 1116 c-14 -36 0 -60 39 -68 54 -11 79 4 75 45 -3 31 -5 32 -56 35 -39 2 -54 -1 -58 -12z' },{ d: 'M1064 926 c-3 -8 -4 -25 -2 -38 3 -21 8 -23 58 -23 l55 0 0 35 0 35 -53 3 c-39 2 -54 -1 -58 -12z' },{ d: 'M1950 920 c0 -16 -5 -19 -30 -13 -25 5 -29 3 -24 -11 3 -9 9 -16 13 -16 4 0 16 -7 27 -16 18 -15 18 -15 -8 -10 -21 5 -28 2 -34 -16 -7 -21 -9 -20 -14 11 -6 41 -30 55 -30 18 0 -20 -4 -23 -25 -19 -29 5 -34 -12 -7 -27 16 -9 16 -10 0 -16 -21 -8 -24 -35 -5 -35 7 0 23 7 35 16 25 17 28 13 10 -17 -11 -17 -10 -22 6 -35 17 -12 17 -14 4 -14 -9 0 -20 5 -23 10 -8 13 -45 13 -45 0 0 -5 7 -13 16 -18 14 -8 14 -10 0 -21 -24 -20 -19 -34 9 -27 20 5 25 3 25 -14 0 -11 7 -20 15 -20 11 0 15 11 16 38 0 33 1 35 10 13 7 -19 14 -22 37 -17 l27 6 -33 -28 c-36 -30 -34 -45 4 -36 18 5 24 2 24 -10 0 -9 5 -16 10 -16 6 0 10 9 10 20 0 17 3 19 19 10 26 -13 31 -13 31 3 0 8 -11 20 -25 27 -31 17 -32 29 -2 23 17 -3 26 2 34 19 11 21 12 21 12 -14 1 -27 5 -38 16 -38 8 0 15 9 15 20 0 17 5 19 25 14 29 -7 34 10 8 26 -17 10 -17 10 0 20 9 6 17 15 17 20 0 13 -37 13 -45 0 -3 -5 -14 -10 -23 -10 -16 1 -16 2 1 14 9 7 17 18 17 24 0 6 -8 16 -17 22 -16 10 -15 11 5 6 12 -3 31 -9 42 -12 24 -7 26 8 5 26 -14 11 -14 15 2 33 18 19 17 20 -9 15 -21 -4 -28 -1 -30 14 -5 32 -23 25 -26 -11 -3 -32 -4 -32 -18 -13 -9 14 -21 19 -36 15 -22 -4 -23 -4 -4 11 11 9 23 16 28 16 4 0 8 7 8 16 0 12 -6 15 -25 10 -20 -5 -25 -3 -25 14 0 11 -4 20 -10 20 -5 0 -10 -9 -10 -20z m0 -126 c0 -8 -6 -11 -15 -8 -8 4 -15 12 -15 20 0 8 6 11 15 8 8 -4 15 -12 15 -20z m37 -1 c-15 -16 -17 -16 -17 -1 0 9 6 18 13 21 20 7 22 -2 4 -20z m-63 -32 c3 -5 -1 -11 -9 -15 -15 -6 -29 7 -18 18 9 9 21 8 27 -3z m101 -1 c3 -5 -3 -10 -15 -10 -12 0 -18 5 -15 10 3 6 10 10 15 10 5 0 12 -4 15 -10z m-75 -39 c0 -12 -20 -25 -27 -18 -7 7 6 27 18 27 5 0 9 -4 9 -9z m50 -13 c0 -13 -23 -5 -28 10 -2 7 2 10 12 6 9 -3 16 -11 16 -16z' },{ d: 'M1100 751 c-32 -5 -35 -9 -35 -41 0 -35 0 -35 49 -38 52 -3 66 6 66 45 0 18 -29 47 -42 42 -2 -1 -19 -4 -38 -8z' }],
        neige: [{ d: 'M1177 1644 l-17 -35 44 -82 c41 -77 43 -84 31 -113 -28 -64 -39 -61 -85 22 -47 86 -49 86 -93 3 -13 -26 -31 -56 -40 -69 -15 -22 -15 -22 -41 23 l-26 44 59 107 60 107 -42 -3 c-39 -3 -43 -6 -73 -63 -18 -33 -36 -61 -41 -62 -4 -2 -24 26 -43 62 -19 36 -37 65 -40 65 -3 0 -16 -9 -29 -19 l-24 -18 37 -67 37 -66 -90 0 -91 0 17 -35 17 -35 92 0 92 0 26 -46 c14 -26 26 -48 26 -50 0 -2 -40 -4 -90 -4 -49 0 -90 -3 -90 -7 0 -5 20 -43 45 -86 l44 -78 -55 3 -55 3 -44 80 c-40 75 -45 80 -79 83 -20 2 -36 1 -36 -1 0 -9 32 -74 55 -112 13 -22 24 -43 25 -47 0 -5 -34 -8 -75 -8 l-75 0 0 -35 0 -35 80 0 81 0 -36 -63 c-40 -73 -42 -86 -17 -117 l19 -23 54 99 54 99 54 3 53 3 -46 -85 -47 -86 90 0 c52 0 91 -4 91 -10 0 -5 -9 -28 -21 -50 l-21 -40 -93 0 -93 0 -15 -32 -16 -33 84 -3 c47 -1 85 -6 85 -9 0 -4 -16 -35 -35 -71 -20 -35 -35 -65 -33 -66 2 -1 15 -10 30 -19 l27 -17 37 71 37 70 39 -70 c37 -66 42 -71 74 -71 19 0 34 4 34 9 0 9 -26 60 -83 159 l-25 44 25 44 c29 52 26 53 83 -53 19 -35 37 -63 41 -63 4 0 26 34 49 75 23 41 45 75 49 75 4 0 16 -19 28 -42 l20 -43 -20 -35 c-76 -134 -71 -120 -52 -156 10 -19 22 -31 26 -28 5 2 25 36 45 74 20 38 40 67 45 64 5 -3 23 -32 39 -65 26 -50 33 -58 48 -50 45 26 45 25 8 93 -20 35 -36 68 -36 71 0 4 33 7 74 7 74 0 75 0 90 32 9 17 16 33 16 35 0 1 -52 3 -115 3 l-115 0 -25 50 -25 49 99 3 99 3 -44 75 c-24 41 -44 78 -44 83 0 4 21 7 47 5 l48 -3 54 -99 54 -99 19 23 c25 31 23 44 -17 117 l-36 63 81 0 80 0 0 35 0 35 -75 0 c-41 0 -75 3 -75 8 1 4 12 25 25 47 23 38 55 103 55 112 0 2 -16 3 -36 1 -31 -3 -40 -9 -58 -43 -70 -130 -65 -125 -118 -125 -26 0 -48 2 -48 5 0 3 14 27 30 53 17 27 30 54 30 59 0 6 7 16 15 23 27 22 5 30 -86 30 -49 0 -89 3 -89 8 1 4 11 25 24 47 l23 40 111 3 111 3 -16 34 -17 35 -73 0 c-40 0 -73 2 -73 4 0 3 16 33 36 67 l37 62 -24 18 c-13 10 -27 19 -31 19 -4 0 -17 -19 -29 -42 -51 -99 -47 -99 -94 -14 -23 42 -44 78 -46 81 -3 2 -13 -11 -22 -31z m-37 -398 c-35 -69 -41 -72 -67 -29 -29 48 -29 56 3 111 l26 45 29 -46 28 -45 -19 -36z m-127 -61 l26 -45 -58 0 c-61 0 -58 -2 -99 83 -2 4 21 7 51 7 55 0 55 0 80 -45z m307 40 c0 -2 -9 -23 -21 -45 -21 -40 -21 -40 -81 -40 l-59 0 18 33 c31 55 33 57 89 57 30 0 54 -2 54 -5z m-280 -161 c0 -3 -12 -25 -26 -50 -26 -43 -27 -44 -80 -44 -30 0 -54 2 -54 4 0 2 12 24 26 50 26 46 26 46 80 46 30 0 54 -3 54 -6z m262 -44 l28 -50 -60 0 -59 0 -26 43 c-14 24 -25 47 -25 50 0 4 26 7 58 7 l57 0 27 -50z m-171 -47 l25 -46 -25 -48 c-14 -27 -28 -49 -31 -49 -3 0 -17 22 -31 49 l-25 48 25 47 c14 25 27 46 30 46 4 0 18 -21 32 -47z' },{ d: 'M1914 1005 c-28 -15 -185 -253 -406 -619 -66 -108 -62 -163 12 -201 44 -23 857 -22 900 0 37 19 64 69 57 105 -7 31 -396 662 -431 698 -29 30 -91 38 -132 17z m108 -42 c42 -47 418 -668 418 -689 0 -13 -9 -33 -20 -44 -19 -19 -33 -20 -453 -20 -401 0 -435 1 -449 18 -23 27 -29 52 -17 75 32 61 405 654 418 664 24 19 85 16 103 -4z' },{ d: 'M1801 706 c-6 -25 -15 -48 -21 -51 -15 -9 -12 -83 4 -92 8 -4 15 -17 18 -28 5 -27 32 -25 36 3 3 21 7 22 118 22 114 0 115 0 124 -26 10 -26 30 -25 30 2 0 8 9 23 20 34 23 23 26 62 6 82 -7 8 -17 33 -21 56 l-7 42 -148 0 -148 0 -11 -44z m281 -11 l5 -25 -129 0 c-115 0 -129 2 -124 16 3 9 6 20 6 25 0 5 53 9 119 9 119 0 119 0 123 -25z m28 -80 l0 -25 -155 0 c-144 0 -155 1 -155 18 0 10 3 22 7 25 3 4 73 7 155 7 l148 0 0 -25z' },{ d: 'M1810 476 c-5 -13 -36 -45 -69 -70 -83 -64 -91 -103 -30 -147 34 -25 63 -28 67 -6 2 10 -3 17 -12 17 -8 0 -28 11 -43 24 l-28 25 44 38 c88 76 111 101 111 122 0 29 -28 27 -40 -3z' },{ d: 'M2078 476 c-7 -13 -41 -46 -75 -74 -34 -28 -64 -60 -68 -71 -9 -30 10 -58 55 -81 47 -24 46 -24 54 -5 4 10 -7 21 -34 35 -22 11 -40 27 -40 35 0 8 28 38 63 66 63 53 93 92 82 109 -10 16 -24 11 -37 -14z' }],
        feu: [{ d: 'M4425.7,12553.3c-252.9-303.5-363.1-538.3-397.2-847.1l-6.8-60.9l-37.3,51.1c-20.4,28.2-37.3,49.2-37.3,47 s6.4-25.9,14-52.2c32.1-111.2,55.3-225.8,61.7-303.5c8.8-99.9,8.4-102.9-28.5-208.5c-37.7-108.9-67.7-172.8-170.3-366.3 c-69.7-131.5-97-188.6-123.8-263c-41.7-114.2-57.7-202.5-57.7-320.8c0-37.9-0.8-68.4-1.6-67.6c-1.2,1.5-15.6,103.7-26.5,189.3 c-9.6,78.5-13.6,143.1-13.2,232.9c0,105.2,5.2,156.7,23.2,232.9c5.6,22.5,10,45.8,10,51.5c0,17.3-18.8,134.1-30.1,186 c-33.3,153.6-91,273.9-176,364.4c-42.9,45.8-162.7,143.5-162.7,132.6c0-2.3,6.4-28.9,14.4-59.4c95-367.8,100.6-625.1,16.8-770.9 c-30.5-53.7-69.7-91.7-124.2-120.2c-22.4-11.6-23.2-12.4-58.5-74.4c-70.1-122.5-103.4-189.7-135.5-274.2 c-31.3-83-57.7-181.8-69.7-261.8c-2.4-16.5-6.4-40.9-8.4-54.5c-2-13.5-5.6-47.3-7.6-75.1c-2-31.2-6.8-61.6-12-78.9 c-13.6-45.1-26.9-106.7-35.7-164.5c-9.2-60.1-11.6-194.6-4.4-260c8.4-74.8,30.9-173.2,50.1-217.1c5.6-12.8,10-24,10-25.5 c0-3.8-68.9,32.3-108.2,56.7c-20.8,12.8-50.1,34.2-64.9,47c-15.2,12.8-27.3,21.8-27.3,19.9c0-7.9,35.3-98.4,67.3-173.9 c138.7-324.2,307.4-573.6,515.4-761.5c279.8-252.8,626.9-389.6,1082.6-425.6c34.9-2.6,65.7-7.9,93-15.4 c130.3-35.3,256.1-54.1,400-59.4c339.9-12.8,652.9,80,885.8,262.6c43.3,34.2,119,107.8,149.1,144.6 c109.8,136,176.4,287.8,199.6,454.6c18,128.9,8,278.4-27.3,415.1l-9.2,35.7l-9.6-16.9c-23.2-42.5-87.4-139-114.2-172.1 c-34.5-42.8-85.8-90.5-121.8-113.1c-30.1-19.2-97.8-50-127.5-58.2l-20.8-5.6l2.8,17.7c8,49.2,0.4,209.6-13.2,278.4 c-26.9,136.7-31.3,288.1-11.6,411.7c30.5,192,109.8,356.9,248.1,514.7c33.7,38.3,99,103.7,90.2,90.2c-2.8-4.1,0.8-1.5,8,5.6 c68.9,69.1,116.6,111.6,178,159.7c26.5,20.3,46.1,37.6,43.3,38.7c-2.8,0.8-3.2,4.5-0.4,12c9.2,24-15.6,47.3-59.7,56 c-35.7,7.1-66.5,4.1-149.5-12.8c-65.7-13.9-188-48.8-204-59c-4.8-2.6-4.4-3,2-1.1c37.3,11.6,55.7,16.9,56.9,15.4 c3.6-3.4,16.8-52.6,14.8-55.2c-2.8-4.5,0.8-4.1,26.5,2.3c12,3,24.8,5.3,28.1,5.3c3.2,0-10-4.1-30.1-9.4 c-108.6-27.8-232.5-74.8-304.2-115.7c-12.8-7.5-24-13.5-24.4-13.5s3.6,12.4,8.8,27.4c20.8,57.9,48.9,167.5,59.3,231.8 c35.3,221.6-6.4,417-124.6,583c-31.3,43.6-57.7,75.5-60.5,72.9c-1.2-1.1-15.2-38.7-31.3-83.8c-64.1-179.9-138.7-332.5-227.7-465.1 c-29.7-44.3-67.7-95.8-70.9-95.8c-1.2,0-10,14.3-19.6,31.9c-20.8,39.1-66.9,106.7-106.6,158.2l-29.7,37.6l13.6,50.7 c51.3,192,71.3,314.8,71.3,441c0,107.8-8,164.9-37.3,263c-6,20.7-12,52.2-13.2,70.3c-5.6,79.6-36.1,127.3-167.1,258.8 c-72.5,73.3-112.6,119.1-152.7,175.4c-128.3,181.1-190.4,393.3-203.2,695l-2.8,64.6L4425.7,12553.3z M5942,10230.2 c-1.2-1.1-4.8-1.5-7.6-0.4c-3.2,1.1-2,2.3,2.4,2.3C5941.2,10232.4,5943.6,10231.3,5942,10230.2z' },{ d: 'M3892.7,12170.1c-29.7-34.9-59.7-67.2-120.6-130c-139.5-142.4-185.6-213.8-210-324.9c-31.3-145,6.4-350.5,113.8-616.1 l13.2-32.7l32.1,36.1c82.2,93.2,128.7,168.7,150.7,243.8c10.4,35.3,13.6,102.9,7.2,144.3c-9.2,60.5-35.7,163-44.1,171.3 c-4,4.1-11.6,16.2-16.8,26.3c-8,16.2-9.2,24.4-8.8,62c0.4,48.1,0.8,50,46.5,206.6c36.9,127,66.1,240.4,61.7,240.4 C3916.3,12197.2,3905.1,12184.8,3892.7,12170.1z' },{ d: 'M5396.9,11721.2c-1.2-10.1-5.6-40.9-10.4-68.7c-4.4-27.8-10.8-74.4-14.4-103.3c-17.2-144.3-27.3-172.1-71.7-200.6 c-10.4-6.8-30.5-28.5-52.1-57.5c-51.3-67.2-65.7-96.9-74.9-152.9c-8-49.2,4-123.6,34.5-214.1l10.8-31.6l18,16.5 c83.8,76.6,182.4,196.5,224.4,273.5c38.1,69.9,50.5,115.3,50.9,184.5c0,62.4-5.2,87.9-38.1,176.6c-13.6,36.1-34.5,95-46.9,130.4 c-12.8,35.7-24,65-25.3,65C5400.1,11738.8,5398.1,11731,5396.9,11721.2z' },{ d: 'M3530.7,11725.3c0-4.1,1.2-5.3,2.4-2.3c1.2,2.6,0.8,6-0.4,7.1C3531.5,11731.7,3530.3,11729.5,3530.7,11725.3z' },{ d: 'M3518.7,11669c0-4.1,1.2-5.3,2.4-2.3c1.2,2.6,0.8,6-0.4,7.1C3519.5,11675.4,3518.3,11673.1,3518.7,11669z' },{ d: 'M3519.1,11517.2c0-5.3,0.8-7.1,2-4.5c0.8,2.3,0.8,6.8,0,9.4C3519.9,11524.3,3519.1,11522.5,3519.1,11517.2z' },{ d: 'M3522.7,11484.9c0-4.1,1.2-5.3,2.4-2.3c1.2,2.6,0.8,6-0.4,7.1C3523.5,11491.3,3522.3,11489,3522.7,11484.9z' },{ d: 'M3526.7,11454.8c0-4.1,1.2-5.3,2.4-2.3c1.2,2.6,0.8,6-0.4,7.1C3527.5,11461.2,3526.3,11459,3526.7,11454.8z' },{ d: 'M5146.4,11079.6c0-6,0.8-8.3,2-4.5c0.8,3.4,0.8,8.6,0,11.3C5147.2,11088.6,5146.4,11085.9,5146.4,11079.6z' },{ d: 'M5146.4,11025.1c0-7.1,0.8-10.1,2-6.4c0.8,3.4,0.8,9.4,0,13.1C5147.2,11035.2,5146.4,11032.2,5146.4,11025.1z' },{ d: 'M5150,10996.5c0-4.1,1.2-5.3,2.4-2.3c1.2,2.6,0.8,6-0.4,7.1C5150.8,11002.9,5149.6,11000.7,5150,10996.5z' },{ d: 'M5774.8,10255c-3.2-1.9-4-3.8-2-3.8c2.4,0,6.8,1.9,10,3.8c3.2,1.9,4.4,3.8,2,3.8C5782.8,10258.7,5778,10256.8,5774.8,10255 z' },{ d: 'M5754.8,10247.5c-3.2-1.9-4-3.8-2-3.8c2.4,0,6.8,1.9,10,3.8c3.2,1.9,4.4,3.8,2,3.8 C5762.8,10251.2,5758,10249.3,5754.8,10247.5z' },{ d: 'M5726.7,10236.2c-3.2-1.9-4-3.8-2-3.8c2.4,0,6.8,1.9,10,3.8c3.2,1.9,4.4,3.8,2,3.8 C5734.7,10239.9,5729.9,10238.1,5726.7,10236.2z' },{ d: 'M5956.8,10038.6c-29.3-33.4-84.2-106.7-80.2-106.7c1.2,0,9.6,10.5,19.2,23.7c21.2,29.3,52.9,68.4,68.9,84.1 c6.4,6.8,10.8,13.1,9.6,14.3C5973.2,10055.1,5965.6,10048,5956.8,10038.6z' },{ d: 'M6041.4,9896.6c-28.9-27-85.4-78.5-125.5-114.2c-75.4-67.2-112.2-107.4-139.9-152.9c-83.8-136.7-81-315.6,9.2-600.7 l15.2-48.8l45.7,45.1c79.4,77.8,127.5,145.4,149.1,210c14,41.7,15.2,104.8,2.8,182.2c-8,51.1-11.6,64.6-20,76.3 c-14.8,20.7-20.4,49.2-14.8,78.5c6,32.3,15.2,59,54.9,157c27.3,66.9,81.4,211.5,81.4,216.8 C6099.5,9950.3,6087,9939.4,6041.4,9896.6z' },{ d: 'M5859,9909.4c-2.4-4.1-3.2-7.5-2.4-7.5c1.2,0,4,3.4,6.4,7.5c2.4,4.1,3.2,7.5,2.4,7.5 C5864.2,9916.9,5861.4,9913.5,5859,9909.4z' },{ d: 'M5701.1,9555.5c-21.6-57.1-23.6-68-25.3-157.4c-2-86.4,3.2-138.6,20.4-211.9c7.2-30.1,7.2-18.4,0.4,75.1 c-10.4,133.7-7.2,210,12.8,292.3c3.2,14.3,5.2,26.7,4,27.4C5712.7,9582.2,5707.1,9570.5,5701.1,9555.5z' }],
    };
    var PAD = 2.2, BOX = 24, NS = "http://www.w3.org/2000/svg";
    function tokenize(d) { return d.match(/-?\d*\.?\d+(?:e[+-]?\d+)?|[a-zA-Z]/gi) || []; }
    function mapD(d, bb) {
        var bw = bb.width || 1;
        var bh = bb.height || 1;
        var k = Math.min((BOX - 2 * PAD) / bw, (BOX - 2 * PAD) / bh);
        var ox = PAD + (BOX - 2 * PAD - bw * k) / 2 - bb.x * k;
        var oy = PAD + (BOX - 2 * PAD - bh * k) / 2 - bb.y * k;
        var toks = tokenize(d), out = [], cmd = "l";
        var push = function (v) { out.push(String(Math.round(v * 1000) / 1000)); };
        for (var i = 0; i < toks.length;) {
            if (/[a-zA-Z]/.test(toks[i])) { out.push(toks[i]); cmd = toks[i]; i++; continue; }
            var key = cmd.toLowerCase(), rel = cmd === key;
            var ar = { m: 2, l: 2, t: 2, h: 1, v: 1, c: 6, s: 4, q: 4 }[key] || 2;
            var n = Math.min(ar, toks.length - i), nums = [];
            for (var j = 0; j < n; j++) nums.push(parseFloat(toks[i + j]));
            i += n;
            if (key === "h" || key === "v") {
                var isY = key === "v";
                push(rel ? nums[0] * k : nums[0] * k + (isY ? oy : ox));
            } else {
                for (var jj = 0; jj + 1 < nums.length; jj += 2) {
                    push(rel ? nums[jj] * k : nums[jj] * k + ox);
                    push(rel ? nums[jj + 1] * k : nums[jj + 1] * k + oy);
                }
            }
        }
        return out.join("");
    }
    function install() {
        var host = document.createElementNS(NS, "svg");
        host.style.cssText = "position:absolute;left:-9999px;top:0;width:300px;height:300px;visibility:hidden;";
        document.body.appendChild(host);
        var skip = { m: 0, z: 0 };
        for (var h in MF_RAW) {
            if (!ICONS[h]) continue;
            var g = document.createElementNS(NS, "g");
            MF_RAW[h].forEach(function (p) {
                var el = document.createElementNS(NS, "path");
                el.setAttribute("d", p.d);
                g.appendChild(el);
            });
            host.appendChild(g);
            var bb = g.getBBox();
            if (!bb || !bb.width || !bb.height) continue;
            ICONS[h] = MF_RAW[h].map(function (p) {
                return { tag: "path", d: mapD(p.d, bb), fill: "currentColor" };
            });
        }
        host.remove();
    }
    if (document.body) { install(); }
    else { document.addEventListener("DOMContentLoaded", install); }
})();


    function createSvgElement(tag, attrs) {
        var node = document.createElementNS(SVG_NS, tag);
        Object.keys(attrs || {}).forEach(function (key) {
            node.setAttribute(key, attrs[key]);
        });
        return node;
    }

    function appendIconPrimitives(container, name) {
        (ICONS[name] || []).forEach(function (primitive) {
            var attrs = {};
            Object.keys(primitive).forEach(function (key) {
                if (key !== 'tag') { attrs[key] = primitive[key]; }
            });
            container.appendChild(createSvgElement(primitive.tag, attrs));
        });
    }

    function buildIconNode(name, className) {
        var svg = createSvgElement('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' });
        svg.setAttribute('class', className);
        appendIconPrimitives(svg, name);
        return svg;
    }

    // 3 paliers par aléa (léger / modéré / sévère), choisis en fonction de
    // la position du niveau réel dans l'échelle de l'aléa (cf.
    // adviceTierIndex) — rien n'est affiché au niveau 0 (Nul).
    var ADVICE_TIERS = {
        orages: [
            'Des orages sont possibles. Consultez régulièrement les prévisions et restez attentifs.',
            'Des orages marqués sont attendus, avec un risque de grêle ou de rafales. Mettez à l’abri les objets sensibles.',
            'De violents orages sont attendus. Évitez les déplacements, éloignez-vous des points hauts et des zones exposées à la foudre.'
        ],
        grele: [
            'De la grêle est possible en cas d’averse orageuse.',
            'De la grêle marquée est possible. Mettez les véhicules à l’abri si possible.',
            'De la grêle intense est possible, avec un risque de dégâts. Mettez impérativement les véhicules et objets fragiles à l’abri.'
        ],
        pluie_inondation: [
            'De la pluie est attendue, pouvant localement provoquer des ruissellements.',
            'De fortes pluies sont attendues, avec un risque de ruissellement ou de débordement localisé. Évitez les sous-sols et les points bas.',
            'De très fortes pluies sont attendues, avec un risque d’inondation important. Ne vous engagez pas sur une route inondée et suivez les consignes des autorités.'
        ],
        vent: [
            'Des rafales de vent sont possibles. Rangez les objets légers susceptibles de s’envoler.',
            'De fortes rafales de vent sont attendues. Évitez les activités exposées et fixez ce qui peut être emporté.',
            'De violentes rafales de vent sont attendues. Évitez les déplacements non indispensables et restez à l’écart des arbres et structures fragiles.'
        ],
        neige: [
            'De la neige est possible, pouvant rendre les routes glissantes.',
            'Des chutes de neige marquées sont attendues. Anticipez vos déplacements et équipez votre véhicule si besoin.',
            'De fortes chutes de neige sont attendues. Évitez les déplacements non indispensables et suivez l’évolution des conditions de circulation.'
        ],
        verglas: [
            'Un risque de verglas localisé est possible au sol.',
            'Un risque de pluie verglaçante est possible : la chaussée peut devenir brutalement glissante. Adaptez votre conduite.',
            'Un épisode durable de pluie verglaçante est attendu. Évitez les déplacements non indispensables, la chaussée peut rester dangereuse plusieurs heures.'
        ],
        chaleur: [
            'Des températures élevées sont attendues. Hydratez-vous régulièrement.',
            'De fortes chaleurs sont attendues. Évitez les efforts aux heures les plus chaudes et surveillez les personnes fragiles.',
            'Une chaleur extrême est attendue. Limitez les sorties et les efforts, hydratez-vous fréquemment, veillez sur les personnes vulnérables.'
        ],
        froid: [
            'Des températures basses sont attendues. Pensez à vous couvrir.',
            'Un froid marqué est attendu. Limitez les expositions prolongées et protégez les canalisations sensibles au gel.',
            'Un froid extrême est attendu. Évitez les expositions prolongées et soyez vigilant vis-à-vis des personnes vulnérables et des risques de gel.'
        ],
        brouillard: [
            'La visibilité peut être réduite par endroits.',
            'La visibilité peut être fortement réduite. Réduisez votre vitesse et augmentez les distances de sécurité.',
            'La visibilité peut être très fortement réduite (brouillard dense). Redoublez de prudence, envisagez de reporter vos déplacements.'
        ],
        feu: [
            'Les conditions météo peuvent légèrement favoriser le développement d’un feu. Respectez les consignes locales.',
            'Les conditions météo peuvent favoriser le développement d’un feu. Respectez les consignes locales et évitez tout départ de flamme.',
            'Les conditions météo sont très favorables au développement et à la propagation d’un feu. Soyez extrêmement vigilant et respectez strictement les interdictions locales.'
        ],
        littoral: [
            'Des rafales et une mer agitée sont possibles sur le littoral. Restez prudent en bord de mer.',
            'De fortes rafales accompagnées d’une dépression marquée sont attendues sur le littoral, avec un risque de mer forte à très forte. Éloignez-vous du bord de mer et des ouvrages exposés.',
            'De violentes rafales et une tempête marquée sont attendues sur le littoral, avec un risque de submersion. Évitez tout déplacement en bord de mer et suivez les consignes des autorités.'
        ]
    };
    var FEU_DISCLAIMER = 'Important : ce niveau mesure seulement le cocktail météo chaleur, humidité, vent et pluie. Il reste non officiel et ne remplace pas la Météo des forêts.';
    var LITTORAL_DISCLAIMER = 'Important : ce niveau mesure seulement les rafales et la pression (pas de données de vagues, marée ni surcote). Il reste non officiel et ne remplace pas la Vigilance vagues-submersion de Météo-France.';

    function whenReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function fetchJson(url, options) {
        return fetch(url, Object.assign({ cache: 'no-cache' }, options || {})).then(function (response) {
            if (!response.ok) {
                throw new Error('Réponse HTTP ' + response.status);
            }
            return response.json();
        });
    }

    function fetchText(url) {
        return fetch(url, { cache: 'default' }).then(function (response) {
            if (!response.ok) {
                throw new Error('Réponse HTTP ' + response.status);
            }
            return response.text();
        });
    }

    // Certains thèmes (Avada/Fusion Builder) placent le shortcode dans une
    // colonne bien plus étroite que la ligne qui la contient. On mesure les
    // ancêtres réels au lieu de deviner une largeur fixe (même pattern que
    // harmonie-knmi.js, déjà corrigé d'une boucle infinie rétréci/agrandi).
    function clearWiden(card) {
        card.style.width = '';
        card.style.maxWidth = '';
        card.style.marginLeft = '';
        card.style.marginRight = '';
    }

    function widenToFitAncestor(card) {
        if (!card) {
            return;
        }
        if (window.innerWidth < 900) {
            clearWiden(card);
            return;
        }
        var parent = card.parentElement;
        if (!parent) {
            return;
        }
        clearWiden(card);
        var parentWidth = parent.getBoundingClientRect().width;
        var widest = parentWidth;
        var el = parent.parentElement;
        var hops = 0;
        while (el && hops < 6) {
            var rect = el.getBoundingClientRect();
            if (rect.width > widest) {
                widest = rect.width;
            }
            el = el.parentElement;
            hops += 1;
        }
        var viewportLimit = (document.documentElement.clientWidth || window.innerWidth) - 4;
        var target = Math.min(widest, 1700, viewportLimit);
        if (target <= parentWidth + 24) {
            return;
        }
        var offset = (target - parentWidth) / 2;
        card.style.maxWidth = target + 'px';
        card.style.width = target + 'px';
        card.style.marginLeft = (-offset) + 'px';
        card.style.marginRight = (-offset) + 'px';
    }

    // --- Projection GeoJSON -> SVG (équirectangulaire, corrigée en cosinus
    // de latitude pour ne pas déformer la France) : même principe que la
    // projection du fond de carte HARMONIE, mais bornes calculées
    // dynamiquement depuis les contours eux-mêmes plutôt que codées en dur.
    function computeBoundsFromFeatures(features) {
        var west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
        function visit(coords, depth) {
            if (depth === 0) {
                var lon = coords[0], lat = coords[1];
                if (lon < west) { west = lon; }
                if (lon > east) { east = lon; }
                if (lat < south) { south = lat; }
                if (lat > north) { north = lat; }
            } else {
                coords.forEach(function (item) { visit(item, depth - 1); });
            }
        }
        features.forEach(function (feature) {
            var geometry = feature.geometry;
            if (!geometry) { return; }
            var depth = geometry.type === 'Polygon' ? 2 : 3;
            visit(geometry.coordinates, depth);
        });
        return { west: west, east: east, south: south, north: north };
    }

    function buildProjector(bounds, viewSize, padding) {
        var latMid = (bounds.south + bounds.north) / 2;
        var scaleFactor = Math.cos(latMid * Math.PI / 180);
        var spanX = (bounds.east - bounds.west) * scaleFactor;
        var spanY = bounds.north - bounds.south;
        var usable = viewSize - padding * 2;
        var scale = usable / Math.max(spanX, spanY);
        var offsetX = padding + (usable - spanX * scale) / 2;
        var offsetY = padding + (usable - spanY * scale) / 2;
        return function project(lon, lat) {
            var x = (lon - bounds.west) * scaleFactor * scale + offsetX;
            var y = (bounds.north - lat) * scale + offsetY;
            return [x, y];
        };
    }

    function projectRing(ring, project) {
        return ring.map(function (point) { return project(point[0], point[1]); });
    }

    function pathForGeometry(geometry, project) {
        var polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
        var parts = [];
        polygons.forEach(function (polygon) {
            polygon.forEach(function (ring) {
                var points = projectRing(ring, project);
                var d = '';
                points.forEach(function (xy, index) {
                    d += (index === 0 ? 'M' : 'L') + xy[0].toFixed(2) + ',' + xy[1].toFixed(2) + ' ';
                });
                d += 'Z ';
                parts.push(d);
            });
        });
        return parts.join('');
    }

    // Centroïde (aire pondérée, formule du lacet) du plus grand contour
    // extérieur de la géométrie : plus fiable qu'une simple moyenne de
    // sommets pour placer une icône au centre visuel du département,
    // y compris pour les formes concaves ou multi-parties.
    function polygonSignedArea(points) {
        var sum = 0;
        for (var i = 0; i < points.length; i++) {
            var a = points[i];
            var b = points[(i + 1) % points.length];
            sum += a[0] * b[1] - b[0] * a[1];
        }
        return sum / 2;
    }

    function polygonCentroid(points) {
        var area = polygonSignedArea(points);
        if (Math.abs(area) < 1e-9) {
            var sx = 0, sy = 0;
            points.forEach(function (p) { sx += p[0]; sy += p[1]; });
            return [sx / points.length, sy / points.length];
        }
        var cx = 0, cy = 0;
        for (var i = 0; i < points.length; i++) {
            var a = points[i];
            var b = points[(i + 1) % points.length];
            var cross = a[0] * b[1] - b[0] * a[1];
            cx += (a[0] + b[0]) * cross;
            cy += (a[1] + b[1]) * cross;
        }
        return [cx / (6 * area), cy / (6 * area)];
    }

    function largestExteriorRingPoints(geometry, project) {
        var polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
        var best = null;
        var bestArea = -1;
        polygons.forEach(function (polygon) {
            if (!polygon.length) { return; }
            var points = projectRing(polygon[0], project);
            var area = Math.abs(polygonSignedArea(points));
            if (area > bestArea) {
                bestArea = area;
                best = points;
            }
        });
        return best || [];
    }

    // --- Trait littoral : le tracé Natural Earth (littoral-coastline.geojson,
    // même source que les cartes raster HARMONIE/AROME) est indépendant du
    // GeoJSON départemental — pas de correspondance directe entre ses points
    // et un département. On rattache chaque point du trait de côte au
    // département dont un sommet du contour est le plus proche (les deux
    // tracés suivent la même côte réelle, donc restent proches l'un de
    // l'autre), puis on découpe le trait en tronçons consécutifs de même
    // département pour pouvoir colorer chaque tronçon selon son niveau
    // d'alerte Littoral.
    function departmentExteriorLonLat(geometry) {
        var polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
        var points = [];
        polygons.forEach(function (polygon) {
            if (polygon.length) { points = points.concat(polygon[0]); }
        });
        return points;
    }

    function pointToSegmentDistanceSquared(px, py, ax, ay, bx, by) {
        var dx = bx - ax;
        var dy = by - ay;
        var lengthSquared = dx * dx + dy * dy;
        var t = lengthSquared > 0 ? ((px - ax) * dx + (py - ay) * dy) / lengthSquared : 0;
        t = Math.max(0, Math.min(1, t));
        var cx = ax + t * dx;
        var cy = ay + t * dy;
        var ex = px - cx;
        var ey = py - cy;
        return ex * ex + ey * ey;
    }

    function buildLittoralRuns(deptFeatures, coastGeojson, project) {
        var deptPoints = {};
        deptFeatures.forEach(function (feature) {
            var code = String((feature.properties || {}).code || '').toUpperCase();
            if (LITTORAL_DEPARTMENT_CODES.indexOf(code) === -1 || !feature.geometry) { return; }
            deptPoints[code] = departmentExteriorLonLat(feature.geometry);
        });
        var codes = Object.keys(deptPoints);
        if (!codes.length) { return []; }

        // Distance au contour (segment par segment), pas au sommet le plus
        // proche : un contour départemental n'a que quelques sommets le
        // long d'un tronçon de côte à peu près droit, donc la distance au
        // sommet le plus proche pouvait rester grande même pour un point du
        // trait de côte réellement à l'intérieur de ce département.
        //
        // Toujours renvoyer le département le plus proche, sans seuil de
        // rejet : un seuil laissait des trous visibles dans le trait à
        // chaque endroit où le tracé Natural Earth s'écarte un peu plus du
        // contour IGN (estuaires, caps), y compris entre deux départements
        // pourtant tous deux en alerte — exactement le défaut signalé
        // (couleurs qui ne se rejoignent pas). Le seul cas où ce choix
        // « au plus proche, toujours » déborde un peu est la portion de
        // côte belge/espagnole/italienne dans la marge de la zone
        // d'extraction, rattachée par défaut au département français
        // voisin le plus proche (Nord/Pyrénées-Orientales/Alpes-Maritimes)
        // — un léger débordement plutôt qu'un vide, plus proche de ce qui
        // était demandé.
        // Le trait Natural Earth suit la côte physique, pas les frontières
        // politiques : sans coupure, la côte belge (au nord du Nord),
        // espagnole (au sud des Pyrénées-Orientales) et italienne (à l'est
        // des Alpes-Maritimes) se rattachaient au département français le
        // plus proche et débordaient hors de France. Coordonnées
        // approximatives des points frontière réels sur la côte (De Panne,
        // Cerbère, Menton) — au-delà, on ignore le point plutôt que de
        // prolonger le trait sur un pays voisin.
        var BORDER_CUTOFFS = {
            '59': function (lon, lat) { return lat > 51.10; },
            '66': function (lon, lat) { return lat < 42.40; },
            '06': function (lon, lat) { return lon > 7.56; }
        };

        function nearestDepartmentInfo(lon, lat) {
            var bestCode = null;
            var bestDist = Infinity;
            codes.forEach(function (code) {
                var points = deptPoints[code];
                for (var i = 0; i < points.length - 1; i++) {
                    var dist = pointToSegmentDistanceSquared(
                        lon, lat,
                        points[i][0], points[i][1],
                        points[i + 1][0], points[i + 1][1]
                    );
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestCode = code;
                    }
                }
            });
            return { code: bestCode, dist: bestDist };
        }

        function nearestDepartment(lon, lat) {
            var code = nearestDepartmentInfo(lon, lat).code;
            var cutoff = BORDER_CUTOFFS[code];
            if (cutoff && cutoff(lon, lat)) { return null; }
            return code;
        }

        // Le tracé Natural Earth couvre aussi les côtes britanniques et
        // anglo-normandes (Kent, Cornouailles, Jersey, Guernesey...) comme
        // tronçons séparés du même fichier — sans filtre, un tronçon
        // entièrement étranger peut quand même se voir rattaché au
        // département français le plus proche point par point (la Manche
        // est étroite : Douvres n'est qu'à ~34 km de Calais), ce qui
        // prolongeait le trait jusqu'en Angleterre. On ne garde donc un
        // tronçon entier que si une bonne part de ses points colle
        // réellement à un contour départemental français (0,4 mesuré
        // empiriquement : sépare nettement les tronçons français, à ≥ 0,74,
        // des tronçons anglo-normands, à ≤ 0,33).
        var FEATURE_KEEP_FRACTION = 0.4;

        function isFrenchFeature(coords) {
            if (!coords.length) { return false; }
            var within = 0;
            coords.forEach(function (coord) {
                if (nearestDepartmentInfo(coord[0], coord[1]).dist <= 0.09) { within += 1; }
            });
            return within / coords.length >= FEATURE_KEEP_FRACTION;
        }

        var runs = [];
        (coastGeojson.features || []).forEach(function (feature) {
            var geometry = feature.geometry;
            if (!geometry || geometry.type !== 'LineString') { return; }
            var coords = geometry.coordinates;
            if (!isFrenchFeature(coords)) { return; }
            var pointCodes = coords.map(function (coord) { return nearestDepartment(coord[0], coord[1]); });
            var index = 0;
            while (index < coords.length) {
                var code = pointCodes[index];
                if (!code) { index += 1; continue; }
                var segment = [coords[index]];
                var next = index + 1;
                while (next < coords.length && pointCodes[next] === code) {
                    segment.push(coords[next]);
                    next += 1;
                }
                // Le point de transition est répété en fin de tronçon pour
                // que deux départements français voisins se rejoignent au
                // même pixel plutôt que de laisser un blanc à leur jointure
                // — sauf si ce point suivant est au-delà d'une frontière
                // internationale (code null), où le trait doit justement
                // s'arrêter net.
                if (next < coords.length && pointCodes[next]) {
                    segment.push(coords[next]);
                }
                if (segment.length >= 2) {
                    runs.push({ code: code, points: segment });
                }
                index = next;
            }
        });

        return runs.map(function (run) {
            return { code: run.code, points: run.points.map(function (c) { return project(c[0], c[1]); }) };
        });
    }

    function zonedDateKey(iso, tz) {
        // Journée « météo » : se termine à 6h du matin plutôt qu'à minuit,
        // J+1 reprend à 6h — les heures 0h-6h restent rattachées à la
        // journée précédente. Même décalage appliqué côté pipeline Python
        // (cf. _effective_date dans update_risques.py) pour que la frise
        // et le badge du jour restent cohérents entre eux.
        var shifted = new Date(new Date(iso).getTime() - 6 * 60 * 60 * 1000);
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(shifted);
    }

    // Notation météo « Xz JJ/MM » (ex. « 21z 27/08 ») pour le cycle du
    // modèle, en plus du format « JJ/MM HH:MM UTC » déjà affiché — calculée
    // à partir du même run_time publié, donc toujours à jour automatiquement.
    function zNotation(date) {
        var parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'UTC', hourCycle: 'h23',
            hour: '2-digit', day: '2-digit', month: '2-digit'
        }).formatToParts(date);
        var get = function (type) {
            var part = parts.filter(function (p) { return p.type === type; })[0];
            return part ? part.value : '';
        };
        return get('hour') + 'z ' + get('day') + '/' + get('month');
    }

    function initApp(app) {
        var baseUrl = (app.dataset.baseUrl || '').replace(/\/+$/, '');
        var geojsonUrl = app.dataset.geojsonUrl || '';
        var littoralUrl = app.dataset.littoralUrl || '';
        var defaultDepartment = (app.dataset.defaultDepartment || '').toUpperCase();
        var defaultHazard = app.dataset.defaultHazard || 'orages';
        var timezone = app.dataset.timezone || 'Europe/Paris';

        var input = app.querySelector('.hrw-city-input');
        var locateButton = app.querySelector('[data-hrw-locate]');
        var searchResults = app.querySelector('[data-hrw-search-results]');
        var runMeta = app.querySelector('[data-hrw-run]');
        var generated = app.querySelector('[data-hrw-generated]');
        var nationalSummaryBox = app.querySelector('[data-hrw-national-summary]');
        var summaryTitle = app.querySelector('[data-hrw-national-summary-title]');
        var summaryMax = app.querySelector('[data-hrw-summary-max]');
        var summaryMin = app.querySelector('[data-hrw-summary-min]');
        var summaryGust = app.querySelector('[data-hrw-summary-gust]');
        var summaryPrecip = app.querySelector('[data-hrw-summary-precip]');
        var hazardTabs = app.querySelector('[data-hrw-hazard-tabs]');
        var dayTabs = app.querySelector('[data-hrw-day-tabs]');
        var mapSvg = app.querySelector('[data-hrw-map]');
        var insetSvg = app.querySelector('[data-hrw-inset-map]');
        var mapWrap = app.querySelector('.hrw-map-wrap');
        var mapLoading = app.querySelector('[data-hrw-map-loading]');
        var legendTitle = app.querySelector('[data-hrw-legend-title]');
        var legend = app.querySelector('[data-hrw-legend]');
        var detailPlaceholder = app.querySelector('[data-hrw-detail-placeholder]');
        var detailContent = app.querySelector('[data-hrw-detail-content]');
        var detailTitle = app.querySelector('[data-hrw-detail-title]');
        var detailGrid = app.querySelector('[data-hrw-detail-grid]');
        var friseHazardLabel = app.querySelector('[data-hrw-frise-hazard]');
        var friseTrack = app.querySelector('[data-hrw-frise-track]');
        var friseLabels = app.querySelector('[data-hrw-frise-labels]');
        var adviceBox = app.querySelector('[data-hrw-advice]');
        var adviceText = app.querySelector('[data-hrw-advice-text]');
        var captureButton = app.querySelector('[data-hrw-capture]');
        var copyButton = app.querySelector('[data-hrw-copy]');

        var manifest = null;
        var mapEntries = {};
        var namesByCode = {};
        var littoralRuns = [];
        var littoralOverlayGroup = null;
        var currentHazard = defaultHazard;
        var currentDayIndex = 0;
        var selectedDepartment = defaultDepartment || null;
        var detailHazard = defaultHazard;
        var debounceTimer = null;
        var searchController = null;

        function dayFormatter() {
            return new Intl.DateTimeFormat('fr-FR', {
                weekday: 'short', day: '2-digit', month: '2-digit', timeZone: timezone
            });
        }

        function hourFormatter() {
            return new Intl.DateTimeFormat('fr-FR', {
                hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: timezone
            });
        }

        function localHourOf(date) {
            // formatToParts() plutôt que format() : certaines données ICU
            // ajoutent un suffixe d'unité (« 3 h ») au format heure-seule
            // en fr-FR, ce qui casse Number() sur la chaîne complète —
            // confirmé empiriquement (les ticks affichaient « NaNh »).
            // Lire directement la part de type "hour" évite ce piège quel
            // que soit le comportement local du moteur.
            var parts = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit', hourCycle: 'h23', timeZone: timezone
            }).formatToParts(date);
            var hourPart = parts.filter(function (part) { return part.type === 'hour'; })[0];
            return hourPart ? Number(hourPart.value) : 0;
        }

        // La journée météo change à 6h (cf. _effective_date côté pipeline
        // Python) — un onglet laissé ouvert à cheval sur cette limite doit
        // basculer tout seul sur la carte suivante plutôt que de rester
        // figé sur les données de la veille jusqu'à un rechargement manuel.
        // Un rechargement complet plutôt qu'un nouveau fetch en place :
        // beaucoup plus simple et sûr que de rejouer toute la séquence
        // d'initialisation (carte, onglets, etc.) une seconde fois sans
        // dupliquer d'écouteurs d'évènements.
        function scheduleNextDayBoundaryReload() {
            var parts = new Intl.DateTimeFormat('en-GB', {
                timeZone: timezone, hourCycle: 'h23',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).formatToParts(new Date());
            var get = function (type) {
                var part = parts.filter(function (p) { return p.type === type; })[0];
                return part ? Number(part.value) : 0;
            };
            var secondsSinceMidnight = get('hour') * 3600 + get('minute') * 60 + get('second');
            var boundarySeconds = 6 * 3600;
            var secondsUntilBoundary = boundarySeconds - secondsSinceMidnight;
            if (secondsUntilBoundary <= 0) {
                secondsUntilBoundary += 24 * 3600;
            }
            window.setTimeout(function () {
                window.location.reload();
            }, secondsUntilBoundary * 1000);
        }

        function levelInfo(hazard, level) {
            var scale = manifest && manifest.hazard_levels ? manifest.hazard_levels[hazard] : null;
            var info = scale ? scale[String(level)] : null;
            return info || { label: 'Inconnu', color: '#555', text_color: '#ffffff' };
        }

        function maxLevelFor(hazard) {
            var scale = manifest && manifest.hazard_levels ? manifest.hazard_levels[hazard] : null;
            return scale ? Object.keys(scale).length - 1 : 4;
        }

        // « (X/N) » à côté du libellé : les échelles n'ont plus toutes le
        // même nombre de paliers (4 à 8 selon l'aléa), utile pour situer un
        // niveau sans avoir la légende sous les yeux. Rien n'est affiché
        // pour le niveau 0 (Nul) : « Nul (0/7) » n'a pas de sens, il n'y a
        // pas d'alerte à situer sur l'échelle.
        function levelSuffix(hazard, level) {
            if (!level) { return ''; }
            return ' (' + level + '/' + maxLevelFor(hazard) + ')';
        }

        function hazardLabel(hazard) {
            return (manifest && manifest.hazards && manifest.hazards[hazard]) || hazard;
        }

        // Sépare « Modérée (≥ 28 °C) » en un mot principal + un seuil
        // entre parenthèses, pour les afficher sur deux lignes (mot en
        // gras, seuil plus petit en dessous) plutôt qu'à la suite sur une
        // seule ligne dans une case étroite — un seul long fragment de
        // texte y était illisible même sans le suffixe « (X/N) ».
        function splitHazardLabel(label) {
            var match = /^(.*?)\s(\([^)]*\))$/.exec(label);
            return match ? { main: match[1], sub: match[2] } : { main: label, sub: '' };
        }

        function departmentLevel(code, hazard, dayIndex) {
            var department = manifest && manifest.departments ? manifest.departments[code] : null;
            if (!department || !department.daily || !department.daily[dayIndex]) {
                return 0;
            }
            var hazards = department.daily[dayIndex].hazards || {};
            return hazards[hazard] || 0;
        }

        // Aplat neutre des départements sur l'onglet Littoral : l'alerte s'y
        // lit uniquement sur le trait de côte (cf. paintLittoralOverlay), pas
        // sur un remplissage département par département comme les autres
        // aléas — un aplat coloré partout (y compris les départements non
        // côtiers, toujours à « Nul ») donnait l'impression trompeuse que
        // l'aléa concernait la France entière plutôt que le seul littoral.
        var LITTORAL_NEUTRAL_FILL = '#dfe6ea';

        function paintMap() {
            var isLittoral = currentHazard === 'littoral';
            Object.keys(mapEntries).forEach(function (code) {
                var level = departmentLevel(code, currentHazard, currentDayIndex);
                var color = isLittoral ? LITTORAL_NEUTRAL_FILL : levelInfo(currentHazard, level).color;
                var showIconForLevel = !isLittoral && level >= ICON_MIN_LEVEL;
                mapEntries[code].forEach(function (entry) {
                    entry.path.setAttribute('fill', color);
                    entry.path.classList.toggle('is-selected', code === selectedDepartment);
                    if (showIconForLevel && entry.showIcon) {
                        entry.glyph.replaceChildren();
                        appendIconPrimitives(entry.glyph, currentHazard);
                        entry.iconGroup.style.display = '';
                    } else {
                        entry.iconGroup.style.display = 'none';
                    }
                });
            });
            paintLittoralOverlay();
            updateHazardTabBorders();
        }

        // Entoure chaque onglet d'aléa d'une bordure colorée dès qu'une
        // alerte existe quelque part en France ce jour-là (couleur du
        // niveau maximal national, cf. nationalMaxLevel) — repérer d'un
        // coup d'œil quels aléas sont actifs sans avoir à cliquer sur
        // chaque onglet un par un.
        function updateHazardTabBorders() {
            if (!hazardTabs) { return; }
            Array.prototype.forEach.call(hazardTabs.children, function (button) {
                var hazard = button.dataset.hazard;
                if (!hazard) { return; }
                var level = nationalMaxLevel(hazard, currentDayIndex);
                if (level > 0) {
                    button.style.boxShadow = 'inset 0 0 0 2px ' + levelInfo(hazard, level).color;
                } else {
                    button.style.boxShadow = '';
                }
            });
        }

        // Trait de côte coloré par le niveau d'alerte Littoral de chaque
        // département côtier — visible uniquement sur l'onglet Littoral (les
        // autres aléas gardent le seul remplissage à plat des départements),
        // demandé explicitement pour repérer l'alerte d'un coup d'œil sur la
        // ligne de côte plutôt que sur l'aplat du département entier.
        function paintLittoralOverlay() {
            if (!littoralOverlayGroup) { return; }
            littoralOverlayGroup.replaceChildren();
            if (currentHazard !== 'littoral' || !littoralRuns.length) {
                littoralOverlayGroup.style.display = 'none';
                return;
            }
            littoralOverlayGroup.style.display = '';
            littoralRuns.forEach(function (run) {
                var level = departmentLevel(run.code, 'littoral', currentDayIndex);
                var color = levelInfo('littoral', level).color;
                var d = run.points.map(function (xy, index) {
                    return (index === 0 ? 'M' : 'L') + xy[0].toFixed(2) + ',' + xy[1].toFixed(2);
                }).join(' ');
                var width = level > 0 ? (10 + level * 2) : 3;
                // Le style est posé via l'attribut `style` (pas `stroke`/
                // `stroke-width` en attributs de présentation) : la feuille
                // de styles a une règle générale `.hrw-map path { stroke:
                // ...; stroke-width: 1; }` qui s'applique à TOUS les <path>
                // de la carte, trait littoral compris — en SVG, une règle
                // CSS prime toujours sur un attribut de présentation, même
                // posé après coup en JS, donc `setAttribute('stroke', ...)`
                // était silencieusement écrasé par cette règle. `style`
                // inline a une priorité supérieure à la feuille de styles et
                // n'est pas concerné par ce piège.
                if (level > 0) {
                    // Liseré sombre sous le trait coloré : sur une carte de
                    // la France entière (viewBox 1000, rendue sur quelques
                    // centaines de pixels), un trait fin de la couleur du
                    // palier se fondait dans le fond clair et la frontière
                    // départementale déjà présente au même endroit — trop
                    // discret pour être vu sans zoomer fortement.
                    var casing = createSvgElement('path', { d: d, fill: 'none' });
                    casing.style.stroke = '#1c1f26';
                    casing.style.strokeWidth = (width + 4) + 'px';
                    casing.style.strokeLinecap = 'round';
                    casing.style.strokeLinejoin = 'round';
                    littoralOverlayGroup.appendChild(casing);
                }
                var path = createSvgElement('path', { d: d, fill: 'none' });
                path.style.stroke = level > 0 ? color : '#5b6b7a';
                path.style.strokeWidth = width + 'px';
                path.style.strokeLinecap = 'round';
                path.style.strokeLinejoin = 'round';
                path.style.opacity = level > 0 ? 1 : 0.55;
                littoralOverlayGroup.appendChild(path);
            });
        }

        // Le pire niveau trouvé n'importe où en France pour l'aléa/jour
        // courants — un indicateur national, pas celui d'un département
        // (peu importe lequel est sélectionné). Avant ce correctif le
        // texte était figé sur « 0/N » quel que soit le contenu réel de la
        // carte.
        function nationalMaxLevel(hazard, dayIndex) {
            var max = 0;
            if (!manifest || !manifest.departments) { return max; }
            Object.keys(manifest.departments).forEach(function (code) {
                var level = departmentLevel(code, hazard, dayIndex);
                if (level > max) { max = level; }
            });
            return max;
        }

        function updateLegendTitle() {
            if (!legendTitle) { return; }
            var maxLevel = maxLevelFor(currentHazard);
            var label = hazardLabel(currentHazard);
            var national = nationalMaxLevel(currentHazard, currentDayIndex);
            legendTitle.textContent = label + ' ' + national + '/' + maxLevel;
        }

        function buildLegend() {
            // L'échelle (nombre de paliers, libellés) dépend de l'aléa
            // affiché — la légende est donc reconstruite à chaque
            // changement d'aléa plutôt que dessinée une seule fois.
            legend.replaceChildren();
            var maxLevel = maxLevelFor(currentHazard);
            updateLegendTitle();
            for (var level = 0; level <= maxLevel; level++) {
                var info = levelInfo(currentHazard, level);
                var item = document.createElement('div');
                item.className = 'hrw-legend-item';
                var swatch = document.createElement('span');
                swatch.className = 'hrw-legend-swatch';
                swatch.style.backgroundColor = info.color;
                var label = document.createElement('span');
                label.textContent = info.label;
                item.appendChild(swatch);
                item.appendChild(label);
                legend.appendChild(item);
            }
        }

        function buildHazardTabs() {
            hazardTabs.replaceChildren();
            if (!manifest || !manifest.hazards) { return; }
            Object.keys(manifest.hazards).forEach(function (hazard) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'hrw-tab';
                button.dataset.hazard = hazard;
                button.appendChild(buildIconNode(hazard, 'hrw-tab-icon'));
                button.appendChild(document.createTextNode(manifest.hazards[hazard]));
                button.classList.toggle('is-active', hazard === currentHazard);
                button.addEventListener('click', function () {
                    setHazard(hazard);
                });
                hazardTabs.appendChild(button);
            });
        }

        function buildDayTabs() {
            dayTabs.replaceChildren();
            var department = manifest && manifest.departments ? manifest.departments[selectedDepartment || Object.keys(manifest.departments)[0]] : null;
            var daily = department ? department.daily : [];
            var formatter = dayFormatter();
            var labels = ['J0', 'J+1', 'J+2', 'J+3', 'J+4'];
            daily.forEach(function (entry, index) {
                var date = new Date(entry.date + 'T12:00:00Z');
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'hrw-tab';
                button.textContent = (labels[index] || ('J' + index)) + ' · ' + formatter.format(date);
                button.classList.toggle('is-active', index === currentDayIndex);
                button.addEventListener('click', function () {
                    setDay(index);
                });
                dayTabs.appendChild(button);
            });
        }

        function setHazard(hazard) {
            currentHazard = hazard;
            detailHazard = hazard;
            Array.prototype.forEach.call(hazardTabs.children, function (button) {
                button.classList.toggle('is-active', button.dataset.hazard === hazard);
            });
            buildLegend();
            paintMap();
            renderDetail();
        }

        function setDay(index) {
            currentDayIndex = index;
            Array.prototype.forEach.call(dayTabs.children, function (button, i) {
                button.classList.toggle('is-active', i === index);
            });
            paintMap();
            updateLegendTitle();
            renderDetail();
            renderNationalSummary();
        }

        function selectDepartment(code) {
            if (!manifest || !manifest.departments[code]) {
                return;
            }
            selectedDepartment = code;
            paintMap();
            updateLegendTitle();
            buildDayTabs();
            renderDetail();
        }

        function renderDetail() {
            if (!selectedDepartment || !manifest) {
                detailPlaceholder.hidden = false;
                detailContent.hidden = true;
                return;
            }
            var department = manifest.departments[selectedDepartment];
            if (!department || !department.daily[currentDayIndex]) {
                detailPlaceholder.hidden = false;
                detailContent.hidden = true;
                return;
            }
            detailPlaceholder.hidden = true;
            detailContent.hidden = false;

            var name = namesByCode[selectedDepartment] || selectedDepartment;
            detailTitle.textContent = name + ' (' + selectedDepartment + ')';

            var hazards = department.daily[currentDayIndex].hazards || {};
            detailGrid.replaceChildren();
            Object.keys(manifest.hazards).forEach(function (hazard) {
                var level = hazards[hazard] || 0;
                var info = levelInfo(hazard, level);
                var cell = document.createElement('div');
                cell.className = 'hrw-hazard-cell';
                cell.classList.toggle('is-active', hazard === detailHazard);
                var name2 = document.createElement('span');
                name2.className = 'hrw-hazard-name';
                name2.appendChild(buildIconNode(hazard, 'hrw-hazard-icon'));
                name2.appendChild(document.createTextNode(manifest.hazards[hazard]));
                var levelSpan = document.createElement('span');
                levelSpan.className = 'hrw-hazard-level';
                levelSpan.style.backgroundColor = info.color;
                levelSpan.style.color = info.text_color;
                // Pas de « (X/N) » ici : la case est trop étroite pour
                // l'empiler avec un libellé à seuil déjà entre parenthèses
                // (ex. « Modérée (≥ 28 °C) (2/7) ») — illisible, deux
                // groupes de parenthèses collés. Le rang complet reste
                // visible dans l'infobulle de la carte et celle de la
                // frise. Le mot et le seuil sont en plus séparés sur deux
                // lignes (mot en gras, seuil plus petit) : à la suite sur
                // une seule ligne, ça restait illisible dans une case
                // aussi étroite même sans le suffixe.
                var parts = splitHazardLabel(info.label);
                var mainLine = document.createElement('span');
                mainLine.className = 'hrw-hazard-level-main';
                mainLine.textContent = parts.main;
                levelSpan.appendChild(mainLine);
                if (parts.sub) {
                    levelSpan.appendChild(document.createElement('br'));
                    var subLine = document.createElement('span');
                    subLine.className = 'hrw-hazard-level-sub';
                    subLine.textContent = parts.sub;
                    levelSpan.appendChild(subLine);
                }
                cell.appendChild(name2);
                cell.appendChild(document.createElement('br'));
                cell.appendChild(levelSpan);
                cell.addEventListener('click', function () {
                    detailHazard = hazard;
                    renderDetail();
                });
                detailGrid.appendChild(cell);
            });

            renderFrise(department);
        }

        function renderAdvice(level) {
            if (!adviceText) { return; }
            // Rien à afficher au niveau Nul (0) : pas d'alerte, pas de
            // conseil à donner.
            if (!level) {
                if (adviceBox) { adviceBox.hidden = true; }
                adviceText.textContent = '';
                return;
            }
            if (adviceBox) { adviceBox.hidden = false; }

            // Palier léger/modéré/sévère choisi selon la position relative
            // du niveau dans l'échelle propre à l'aléa (4 à 9 paliers selon
            // les cas, donc un simple découpage en tiers plutôt que des
            // seuils absolus).
            var maxLevel = maxLevelFor(detailHazard);
            var ratio = maxLevel > 0 ? level / maxLevel : 1;
            var tierIndex = ratio <= 1 / 3 ? 0 : (ratio <= 2 / 3 ? 1 : 2);
            var tiers = ADVICE_TIERS[detailHazard] || [];
            var message = tiers[tierIndex] || tiers[tiers.length - 1] || '';

            if (detailHazard === 'feu') {
                message += ' ' + FEU_DISCLAIMER;
            } else if (detailHazard === 'littoral') {
                message += ' ' + LITTORAL_DISCLAIMER;
            }
            adviceText.textContent = message;
        }

        function renderFrise(department) {
            friseHazardLabel.textContent = hazardLabel(detailHazard);
            friseTrack.replaceChildren();
            if (friseLabels) { friseLabels.replaceChildren(); }

            var dayEntry = department.daily[currentDayIndex];
            if (!dayEntry) { return; }

            var hourlyAll = department.hourly || [];
            var dayHours = hourlyAll.filter(function (entry) {
                return zonedDateKey(entry.time, timezone) === dayEntry.date;
            });
            if (!dayHours.length) {
                if (adviceText) {
                    adviceText.textContent = 'Données HARMONIE indisponibles pour cette journée.';
                }
                return;
            }

            // La frise doit toujours partir de 6h (début de la journée
            // météo), même le jour où le run HARMONIE lui-même n'a démarré
            // que plus tard (ex. un run lancé à 9h ne peut pas avoir de
            // données pour 6h-8h ce jour-là) — sinon la première case
            // affichée n'était pas 6h mais l'heure de départ réelle du run,
            // ce qui semblait être un bug. On construit donc les 24 cases
            // une par une par heure locale, avec une case « pas de
            // données » pour les heures manquantes, plutôt que de se
            // contenter des entrées réellement présentes.
            var hourMap = {};
            dayHours.forEach(function (entry) {
                hourMap[localHourOf(new Date(entry.time))] = entry;
            });

            var lastIndex = hourlyAll.indexOf(dayHours[dayHours.length - 1]);
            var closingEntry = lastIndex >= 0 ? hourlyAll[lastIndex + 1] : null;

            var formatter = hourFormatter();

            function appendCell(hourLabel, entry) {
                var cell = document.createElement('div');
                cell.className = 'hrw-frise-hour';
                if (entry) {
                    var level = (entry.hazards || {})[detailHazard] || 0;
                    var info = levelInfo(detailHazard, level);
                    cell.style.backgroundColor = info.color;
                    cell.title = formatter.format(new Date(entry.time)) + ' — ' +
                        hazardLabel(detailHazard) + ' : ' + info.label + levelSuffix(detailHazard, level);
                } else {
                    cell.classList.add('hrw-frise-hour-empty');
                    cell.title = 'Données indisponibles pour cette heure (avant le début du run).';
                }
                friseTrack.appendChild(cell);

                if (friseLabels) {
                    var tick = document.createElement('span');
                    tick.className = 'hrw-frise-tick';
                    if (hourLabel % 3 === 0) {
                        tick.textContent = hourLabel + 'h';
                    }
                    friseLabels.appendChild(tick);
                }
            }

            // Journée « météo » 6h → 6h (pas minuit → minuit) : l'ordre
            // d'affichage suit ce même décalage, sinon les heures 0h-5h du
            // lendemain (incluses dans CETTE journée par zonedDateKey)
            // apparaîtraient avant 6h-23h alors qu'elles sont
            // chronologiquement après.
            for (var hour = 6; hour <= 23; hour++) {
                appendCell(hour, hourMap[hour] || null);
            }
            for (var hour2 = 0; hour2 <= 5; hour2++) {
                appendCell(hour2, hourMap[hour2] || null);
            }
            // Case de clôture « 6h » du lendemain, pour boucler l'affichage
            // 6h → 5h → 6h.
            appendCell(6, closingEntry);

            renderAdvice(dayEntry.hazards[detailHazard] || 0);
        }

        // --- Petit résumé national (records du jour J0 : maxi/mini de
        // température, rafale maxi, cumul de pluie maxi, chacun avec le
        // département qui le détient). Toujours J0, indépendant de l'onglet
        // jour actif — appelé une fois après le chargement des données.
        function renderNationalSummary() {
            if (!nationalSummaryBox) { return; }
            var entry = manifest && Array.isArray(manifest.national_summary)
                ? manifest.national_summary[currentDayIndex]
                : null;
            if (!entry) {
                nationalSummaryBox.hidden = true;
                return;
            }

            function label(field, unit, decimals) {
                if (!field) { return '—'; }
                var deptName = namesByCode[field.department] || field.department;
                return field.value.toFixed(decimals) + unit + ' (' + deptName + ')';
            }

            // Seuils d'alerte visuelle (pas les seuils de vigilance officielle,
            // juste un repère pour attirer l'œil sur une valeur nationale du
            // jour qui sort du lot). « extreme » = valeur au-delà du seuil ;
            // « bas » pour le mini uniquement, où c'est le froid qui est
            // extrême, pas la chaleur.
            function markExtreme(el, field, isExtreme) {
                if (!el) { return; }
                el.classList.toggle('hrw-summary-extreme', !!(field && isExtreme(field.value)));
            }

            if (summaryTitle) {
                var labels = ['J0', 'J+1', 'J+2', 'J+3', 'J+4'];
                var dayLabel = labels[currentDayIndex] || ('J' + currentDayIndex);
                var dateText = '';
                if (entry.date) {
                    var date = new Date(entry.date + 'T12:00:00Z');
                    dateText = ' · ' + dayFormatter().format(date);
                }
                summaryTitle.textContent = 'France — ' + dayLabel + dateText;
            }
            if (summaryMax) {
                summaryMax.textContent = label(entry.max_temperature, '°C', 1);
                markExtreme(summaryMax, entry.max_temperature, function (v) { return v >= 35; });
            }
            if (summaryMin) {
                summaryMin.textContent = label(entry.min_temperature, '°C', 1);
                markExtreme(summaryMin, entry.min_temperature, function (v) { return v <= -5; });
            }
            if (summaryGust) {
                summaryGust.textContent = label(entry.max_gust, ' km/h', 0);
                markExtreme(summaryGust, entry.max_gust, function (v) { return v >= 100; });
            }
            if (summaryPrecip) {
                summaryPrecip.textContent = label(entry.max_precip, ' mm', 1);
                markExtreme(summaryPrecip, entry.max_precip, function (v) { return v >= 50; });
            }
            nationalSummaryBox.hidden = false;
        }

        // --- Info-bulle au survol d'un département (nom, niveau de l'aléa
        // affiché, mini-frise de la journée sélectionnée) — indépendante du
        // clic, qui ouvre lui le panneau de détail complet.
        var tooltip = document.createElement('div');
        tooltip.className = 'hrw-map-tooltip';
        tooltip.hidden = true;
        if (mapWrap) { mapWrap.appendChild(tooltip); }

        function positionTooltip(anchorEl) {
            if (!mapWrap) { return; }
            var wrapRect = mapWrap.getBoundingClientRect();
            var anchorRect = anchorEl.getBoundingClientRect();
            var x = anchorRect.left + anchorRect.width / 2 - wrapRect.left;
            var y = anchorRect.top - wrapRect.top;

            // Le CSS applique translate(-50%, -100% - 10px) : le clamp
            // précédent ne bornait que la propriété "left" elle-même, pas
            // le décalage supplémentaire de moitié-largeur/hauteur que le
            // transform applique ensuite — un département à l'extrême
            // gauche de la carte (ex. Gironde) faisait ainsi déborder la
            // bulle hors écran (left négatif, coupée). On mesure la taille
            // réelle de la bulle (déjà remplie, juste rendue visible) pour
            // borner sa boîte finale plutôt que son seul point d'ancrage.
            tooltip.style.left = x + 'px';
            tooltip.style.top = Math.max(8, y) + 'px';
            var halfWidth = tooltip.offsetWidth / 2;
            var minX = halfWidth + 4;
            var maxX = wrapRect.width - halfWidth - 4;
            var clampedX = maxX >= minX ? Math.min(Math.max(x, minX), maxX) : wrapRect.width / 2;
            tooltip.style.left = clampedX + 'px';

            var tooltipHeight = tooltip.offsetHeight;
            var minY = tooltipHeight + 14;
            tooltip.style.top = Math.max(minY, y) + 'px';
        }

        function showDeptTooltip(code, anchorEl) {
            if (!manifest || !manifest.departments[code]) { return; }
            var department = manifest.departments[code];
            var dayEntry = department.daily[currentDayIndex];
            if (!dayEntry) { return; }
            var level = (dayEntry.hazards || {})[currentHazard] || 0;
            var info = levelInfo(currentHazard, level);

            tooltip.replaceChildren();
            var title = document.createElement('div');
            title.className = 'hrw-tooltip-title';
            title.textContent = (namesByCode[code] || code) + ' (' + code + ')';
            tooltip.appendChild(title);

            var chip = document.createElement('div');
            chip.className = 'hrw-tooltip-chip';
            chip.style.backgroundColor = info.color;
            chip.style.color = info.text_color;
            chip.textContent = hazardLabel(currentHazard) + ' — ' + info.label + levelSuffix(currentHazard, level);
            tooltip.appendChild(chip);

            var hourlyAll = department.hourly || [];
            var dayHours = hourlyAll.filter(function (entry) {
                return zonedDateKey(entry.time, timezone) === dayEntry.date;
            });
            if (dayHours.length) {
                var mini = document.createElement('div');
                mini.className = 'hrw-tooltip-frise';
                dayHours.forEach(function (entry) {
                    var hourLevel = (entry.hazards || {})[currentHazard] || 0;
                    var segment = document.createElement('span');
                    segment.style.backgroundColor = levelInfo(currentHazard, hourLevel).color;
                    mini.appendChild(segment);
                });
                tooltip.appendChild(mini);

                // Repères positionnés en absolu (premier, milieu, dernier)
                // plutôt qu'une case par heure en flex : dans une info-bulle
                // de 180px avec 20-30 heures, une case flex par heure était
                // trop étroite pour son propre texte, qui débordait sur les
                // voisines et devenait illisible (ex. « 22h » × 2 superposés
                // rendus comme « 2222h »).
                var miniLabels = document.createElement('div');
                miniLabels.className = 'hrw-tooltip-frise-labels';
                var lastIdx = dayHours.length - 1;
                var tickIndexes = lastIdx > 0
                    ? Array.from(new Set([0, Math.round(lastIdx / 2), lastIdx]))
                    : [0];
                tickIndexes.forEach(function (idx) {
                    var tick = document.createElement('span');
                    tick.className = 'hrw-tooltip-frise-tick-abs';
                    tick.textContent = localHourOf(new Date(dayHours[idx].time)) + 'h';
                    var pct = lastIdx > 0 ? (idx / lastIdx) * 100 : 50;
                    tick.style.left = pct + '%';
                    if (idx === 0) {
                        tick.style.transform = 'translateX(0)';
                    } else if (idx === lastIdx) {
                        tick.style.transform = 'translateX(-100%)';
                    } else {
                        tick.style.transform = 'translateX(-50%)';
                    }
                    miniLabels.appendChild(tick);
                });
                tooltip.appendChild(miniLabels);
            }

            // Rendre visible AVANT de positionner : positionTooltip() a
            // besoin de mesurer la largeur/hauteur réelle de la bulle
            // (offsetWidth/offsetHeight), qui valent 0 tant que l'élément
            // est masqué via [hidden].
            tooltip.hidden = false;
            positionTooltip(anchorEl);
        }

        function hideDeptTooltip() {
            tooltip.hidden = true;
        }

        function buildMapInto(svgEl, features, viewSize, padding, suppressIconCodes, iconRadius) {
            if (!svgEl || !features.length) { return; }
            var bounds = computeBoundsFromFeatures(features);
            var project = buildProjector(bounds, viewSize, padding);
            features.forEach(function (feature) {
                var code = String((feature.properties || {}).code || '').toUpperCase();
                var name = (feature.properties || {}).nom || code;
                if (!code) { return; }
                namesByCode[code] = name;

                var path = document.createElementNS(SVG_NS, 'path');
                path.setAttribute('d', pathForGeometry(feature.geometry, project));
                path.setAttribute('data-code', code);
                path.setAttribute('role', 'button');
                path.setAttribute('tabindex', '0');
                path.setAttribute('aria-label', name);
                path.addEventListener('click', function () {
                    selectDepartment(code);
                });
                path.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectDepartment(code);
                    }
                });
                path.addEventListener('mouseenter', function () { showDeptTooltip(code, path); });
                path.addEventListener('mouseleave', hideDeptTooltip);
                path.addEventListener('focus', function () { showDeptTooltip(code, path); });
                path.addEventListener('blur', hideDeptTooltip);
                svgEl.appendChild(path);

                var ringPoints = largestExteriorRingPoints(feature.geometry, project);
                var centroid = ringPoints.length ? polygonCentroid(ringPoints) : [0, 0];

                // Badge blanc + icône monochrome par-dessus, plutôt qu'un
                // glyphe nu : reste lisible quelle que soit la couleur
                // pastel du département en dessous.
                var iconGroup = createSvgElement('g', { class: 'hrw-dept-icon-wrap' });
                iconGroup.style.display = 'none';
                var badge = createSvgElement('circle', {
                    class: 'hrw-dept-icon-badge',
                    cx: centroid[0].toFixed(2),
                    cy: centroid[1].toFixed(2),
                    r: iconRadius
                });
                var glyphScale = (iconRadius * 1.25) / 24;
                var glyphX = centroid[0] - 12 * glyphScale;
                var glyphY = centroid[1] - 12 * glyphScale;
                var glyph = createSvgElement('g', {
                    class: 'hrw-dept-icon',
                    transform: 'translate(' + glyphX.toFixed(2) + ',' + glyphY.toFixed(2) + ') scale(' + glyphScale.toFixed(3) + ')'
                });
                iconGroup.appendChild(badge);
                iconGroup.appendChild(glyph);
                svgEl.appendChild(iconGroup);

                if (!mapEntries[code]) { mapEntries[code] = []; }
                mapEntries[code].push({
                    path: path,
                    iconGroup: iconGroup,
                    glyph: glyph,
                    showIcon: suppressIconCodes.indexOf(code) === -1
                });
            });
        }

        function buildMap(geojson, coastGeojson) {
            var features = geojson.features || [];
            buildMapInto(mapSvg, features, 1000, 12, IDF_CODES, 13);

            var idfFeatures = features.filter(function (feature) {
                var code = String((feature.properties || {}).code || '').toUpperCase();
                return IDF_CODES.indexOf(code) !== -1;
            });
            buildMapInto(insetSvg, idfFeatures, 300, 14, [], 17);

            littoralOverlayGroup = createSvgElement('g', { 'pointer-events': 'none' });
            mapSvg.appendChild(littoralOverlayGroup);
            if (coastGeojson) {
                var bounds = computeBoundsFromFeatures(features);
                var project = buildProjector(bounds, 1000, 12);
                littoralRuns = buildLittoralRuns(features, coastGeojson, project);
            }

            mapLoading.hidden = true;
        }

        function composeMapCanvas() {
            return new Promise(function (resolve, reject) {
                var rect = mapSvg.getBoundingClientRect();
                var width = Math.max(1, Math.round(rect.width || 1000));
                var height = Math.max(1, Math.round(rect.height || 1000));
                var clone = mapSvg.cloneNode(true);
                clone.setAttribute('width', width);
                clone.setAttribute('height', height);
                clone.setAttribute('xmlns', SVG_NS);
                var svgText = new XMLSerializer().serializeToString(clone);
                var svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
                var url = URL.createObjectURL(svgBlob);
                var image = new Image();
                image.onload = function () {
                    var canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    var context = canvas.getContext('2d');
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, width, height);
                    context.drawImage(image, 0, 0, width, height);
                    URL.revokeObjectURL(url);
                    resolve(canvas);
                };
                image.onerror = function () {
                    URL.revokeObjectURL(url);
                    reject(new Error('Rendu SVG indisponible'));
                };
                image.src = url;
            });
        }

        function exportFilename(extension) {
            function two(number) { return String(number).padStart(2, '0'); }
            var now = new Date();
            var stamp = now.getFullYear() + two(now.getMonth() + 1) + two(now.getDate()) +
                '-' + two(now.getHours()) + two(now.getMinutes()) + two(now.getSeconds());
            return 'vigilance-' + currentHazard + '-' + stamp + '.' + extension;
        }

        if (captureButton) {
            captureButton.addEventListener('click', function () {
                composeMapCanvas().then(function (canvas) {
                    canvas.toBlob(function (blob) {
                        if (!blob) { return; }
                        var url = URL.createObjectURL(blob);
                        var link = document.createElement('a');
                        link.href = url;
                        link.download = exportFilename('png');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
                    }, 'image/png');
                }).catch(function () {});
            });
        }

        if (copyButton) {
            copyButton.addEventListener('click', function () {
                if (!navigator.clipboard || !window.ClipboardItem) {
                    return;
                }
                composeMapCanvas().then(function (canvas) {
                    canvas.toBlob(function (blob) {
                        if (!blob) { return; }
                        navigator.clipboard.write([
                            new window.ClipboardItem({ 'image/png': blob })
                        ]).catch(function () {});
                    }, 'image/png');
                }).catch(function () {});
            });
        }

        // --- Recherche commune + géolocalisation (même API que le tableau
        // HARMONIE : geo.api.gouv.fr).
        function closeResults() {
            searchResults.hidden = true;
            searchResults.replaceChildren();
        }

        function displaySearchResults(candidates) {
            searchResults.replaceChildren();
            if (!candidates.length) {
                closeResults();
                return;
            }
            candidates.forEach(function (candidate) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'hrw-search-result';
                button.textContent = candidate.nom + ' (' + (candidate.codeDepartement || '') + ')';
                button.addEventListener('click', function () {
                    input.value = candidate.nom;
                    closeResults();
                    selectDepartment(String(candidate.codeDepartement || '').toUpperCase());
                });
                searchResults.appendChild(button);
            });
            searchResults.hidden = false;
        }

        function searchCommunes(query) {
            if (searchController) {
                searchController.abort();
            }
            searchController = new AbortController();
            var parameters = new URLSearchParams({
                fields: 'nom,code,codeDepartement,population',
                format: 'json',
                boost: 'population',
                limit: '10'
            });
            if (/^\d{5}$/.test(query)) {
                parameters.set('codePostal', query);
            } else {
                parameters.set('nom', query);
            }
            fetchJson(COMMUNES_API + '?' + parameters.toString(), { signal: searchController.signal })
                .then(function (payload) {
                    displaySearchResults(Array.isArray(payload) ? payload : []);
                })
                .catch(function (error) {
                    if (error.name === 'AbortError') { return; }
                    closeResults();
                });
        }

        if (input) {
            input.addEventListener('input', function () {
                var query = input.value.trim();
                window.clearTimeout(debounceTimer);
                if (query.length < 2) {
                    closeResults();
                    return;
                }
                debounceTimer = window.setTimeout(function () {
                    searchCommunes(query);
                }, 220);
            });
            document.addEventListener('click', function (event) {
                if (!app.contains(event.target)) { return; }
                if (!event.target.closest('.hrw-search')) {
                    closeResults();
                }
            });
        }

        if (locateButton) {
            locateButton.addEventListener('click', function () {
                if (!navigator.geolocation) { return; }
                locateButton.disabled = true;
                locateButton.textContent = '📍 Localisation…';
                navigator.geolocation.getCurrentPosition(function (position) {
                    var parameters = new URLSearchParams({
                        lat: String(position.coords.latitude),
                        lon: String(position.coords.longitude),
                        fields: 'nom,code,codeDepartement',
                        format: 'json'
                    });
                    fetchJson(COMMUNES_API + '?' + parameters.toString())
                        .then(function (payload) {
                            var candidates = Array.isArray(payload) ? payload : (payload ? [payload] : []);
                            if (!candidates.length) {
                                throw new Error('Position hors couverture');
                            }
                            var candidate = candidates[0];
                            if (input) {
                                input.value = candidate.nom;
                            }
                            selectDepartment(String(candidate.codeDepartement || '').toUpperCase());
                        })
                        .catch(function () {})
                        .then(function () {
                            locateButton.disabled = false;
                            locateButton.textContent = '📍 Me géolocaliser';
                        });
                }, function () {
                    locateButton.disabled = false;
                    locateButton.textContent = '📍 Me géolocaliser';
                });
            });
        }

        // --- Chargement initial.
        if (window.HRW_AUTOHEAL && window.HRW_AUTOHEAL.url) {
            fetch(window.HRW_AUTOHEAL.url, { method: 'POST', cache: 'no-store' }).catch(function () {});
        }

        if (!baseUrl) {
            mapLoading.textContent = 'Adresse des données de risques non configurée.';
            return;
        }

        widenToFitAncestor(app);
        var widenTimer = null;
        function scheduleWiden() {
            window.clearTimeout(widenTimer);
            widenTimer = window.setTimeout(function () {
                widenToFitAncestor(app);
            }, 150);
        }
        window.addEventListener('resize', scheduleWiden);

        // Les délais fixes ci-dessous ne suffisent pas si la mise en page
        // du thème bouge après coup (polices qui finissent de charger,
        // widgets Avada chargés en différé, etc.) : on observe aussi la
        // largeur réelle des ancêtres pour relancer l'agrandissement à
        // chaque changement, sans dépendre d'un minutage fixe.
        if (window.ResizeObserver) {
            var widenObserver = new ResizeObserver(scheduleWiden);
            var observedEl = app.parentElement;
            var observedHops = 0;
            while (observedEl && observedHops < 6) {
                widenObserver.observe(observedEl);
                observedEl = observedEl.parentElement;
                observedHops += 1;
            }
        }

        Promise.all([
            fetchJson(baseUrl + '/risques.json'),
            fetchText(geojsonUrl).then(function (text) { return JSON.parse(text); }),
            littoralUrl
                ? fetchText(littoralUrl).then(function (text) { return JSON.parse(text); }).catch(function () { return null; })
                : Promise.resolve(null)
        ]).then(function (results) {
            manifest = results[0];
            var geojson = results[1];
            var coastGeojson = results[2];
            if (!manifest || manifest.status !== 'ok') {
                throw new Error('Manifeste de risques invalide');
            }
            buildMap(geojson, coastGeojson);
            buildLegend();
            buildHazardTabs();
            buildDayTabs();
            paintMap();
            renderNationalSummary();

            if (manifest.run_time) {
                var runDate = new Date(manifest.run_time);
                runMeta.textContent = 'Run HARMONIE-AROME du ' +
                    new Intl.DateTimeFormat('fr-FR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
                    }).format(runDate) + ' UTC (Run ' + zNotation(runDate) + ')';
            }
            if (manifest.generated_at) {
                generated.textContent = 'Risques calculés le ' +
                    new Intl.DateTimeFormat('fr-FR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    }).format(new Date(manifest.generated_at));
            }

            if (selectedDepartment && manifest.departments[selectedDepartment]) {
                selectDepartment(selectedDepartment);
            }

            [300, 1000, 2500].forEach(function (delay) {
                window.setTimeout(function () { widenToFitAncestor(app); }, delay);
            });

            scheduleNextDayBoundaryReload();
        }).catch(function (error) {
            mapLoading.textContent = 'Les données de vigilance ne sont pas encore disponibles : ' + error.message;
        });
    }

    whenReady(function () {
        document.querySelectorAll('[data-hrw-app]').forEach(initApp);
    });
}());
