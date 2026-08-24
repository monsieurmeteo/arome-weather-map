/**
 * Palettes Météorologiques Officielles — Source Unique de Vérité
 * =============================================================
 * Ces palettes sont l'EXACT miroir du dictionnaire `PALETTES` du pipeline
 * Python (`pipeline/fetch_and_render_all.py`). Elles sont utilisées par le
 * front-end pour :
 *   1. construire la légende (dégradé exact + 5 repères réels),
 *   2. inverser la couleur d'un pixel en valeur physique (sonde au survol).
 *
 * Ne jamais dupliquer ces couleurs ailleurs : toute évolution de palette doit
 * être faite ici ET dans le dictionnaire Python correspondant.
 */
(function () {
    'use strict';

    // Couleurs déjà converties du tuple RGBA Python vers l'hexadécimal #RRGGBB.
    // `transparent_below` indique la valeur météo affichée pour les pixels
    // totalement transparents (précipitations / nébulosité / nuages / CAPE…).
    var PALETTES = {
        temperature: {
            label: 'Température à 2 m', unit: '°C', decimals: 1, transparent_below: null,
            stops: [
                { value: -30, color: '#4900ff' }, { value: -15, color: '#0080ff' },
                { value: -5,  color: '#00ffe6' }, { value: 0,   color: '#ffffff' },
                { value: 5,   color: '#78ff78' }, { value: 10,  color: '#00c800' },
                { value: 15,  color: '#ffff00' }, { value: 20,  color: '#ffa500' },
                { value: 25,  color: '#ff5000' }, { value: 30,  color: '#c80000' },
                { value: 35,  color: '#8c0000' }, { value: 40,  color: '#640050' },
                { value: 45,  color: '#3c003c' }
            ]
        },
        temperature_ressentie: {
            label: 'Température ressentie', unit: '°C', decimals: 1, transparent_below: null,
            stops: [
                { value: -30, color: '#4900ff' }, { value: -10, color: '#00c8ff' },
                { value: 0,   color: '#ffffff' }, { value: 10,  color: '#78ff78' },
                { value: 20,  color: '#ffff00' }, { value: 30,  color: '#ff5000' },
                { value: 40,  color: '#8c0000' }
            ]
        },
        point_rosee: {
            label: 'Point de rosée à 2 m', unit: '°C', decimals: 1, transparent_below: null,
            stops: [
                { value: -10, color: '#c8c8ff' }, { value: 5,  color: '#64c8ff' },
                { value: 10,  color: '#32c864' }, { value: 15, color: '#00c800' },
                { value: 20,  color: '#c8c800' }, { value: 25, color: '#ff6400' }
            ]
        },
        humidex: {
            label: 'Indice Humidex', unit: '', decimals: 0, transparent_below: null,
            stops: [
                { value: 0,  color: '#c8c8ff' }, { value: 20, color: '#64ff64' },
                { value: 25, color: '#ffff00' }, { value: 30, color: '#ffa500' },
                { value: 35, color: '#ff5000' }, { value: 40, color: '#c80000' },
                { value: 54, color: '#640000' }
            ]
        },
        pluie_1h: {
            label: 'Pluie horaire', unit: 'mm/h', decimals: 1, transparent_below: 0,
            stops: [
                { value: 0.1, color: '#add8e6' }, { value: 1,  color: '#0064ff' },
                { value: 3,   color: '#00c800' }, { value: 7,  color: '#ffff00' },
                { value: 15,  color: '#ffa500' }, { value: 30, color: '#ff0000' },
                { value: 50,  color: '#a000a0' }
            ]
        },
        pluie_cumul: {
            label: 'Précipitations cumulées', unit: 'mm', decimals: 1, transparent_below: 0,
            stops: [
                { value: 1,   color: '#add8e6' }, { value: 5,   color: '#0064ff' },
                { value: 10,  color: '#00c800' }, { value: 25,  color: '#ffff00' },
                { value: 50,  color: '#ffa500' }, { value: 100, color: '#ff0000' },
                { value: 200, color: '#a000a0' }
            ]
        },
        reflectivite: {
            label: 'Réflectivité radar Doppler', unit: 'dBZ', decimals: 0, transparent_below: 0,
            stops: [
                { value: 5,  color: '#64c8ff' }, { value: 15, color: '#0000ff' },
                { value: 25, color: '#00ff00' }, { value: 35, color: '#ffff00' },
                { value: 45, color: '#ffa500' }, { value: 55, color: '#ff0000' },
                { value: 65, color: '#a000a0' }
            ]
        },
        graupel: {
            label: 'Graupel / Grésil', unit: 'mm', decimals: 1, transparent_below: 0,
            stops: [
                { value: 0.5, color: '#c8e6ff' }, { value: 2,  color: '#64c8ff' },
                { value: 5,   color: '#ffa500' }, { value: 15, color: '#c800c8' }
            ]
        },
        vent: {
            label: 'Vent moyen à 10 m', unit: 'km/h', decimals: 0, transparent_below: null,
            stops: [
                { value: 0,   color: '#c8e6ff' }, { value: 10,  color: '#00c8ff' },
                { value: 20,  color: '#00c864' }, { value: 40,  color: '#ffff00' },
                { value: 60,  color: '#ffa500' }, { value: 80,  color: '#ff3c00' },
                { value: 100, color: '#c80000' }, { value: 130, color: '#640064' }
            ]
        },
        rafales: {
            label: 'Rafales maximales', unit: 'km/h', decimals: 0, transparent_below: null,
            stops: [
                { value: 0,   color: '#c8e6ff' }, { value: 20,  color: '#00c8ff' },
                { value: 40,  color: '#00c864' }, { value: 60,  color: '#ffff00' },
                { value: 80,  color: '#ffa500' }, { value: 100, color: '#ff3c00' },
                { value: 130, color: '#c80000' }, { value: 160, color: '#640064' }
            ]
        },
        rafales_cumul: {
            label: 'Rafales maximales cumulées', unit: 'km/h', decimals: 0, transparent_below: null,
            stops: [
                { value: 0,   color: '#c8e6ff' }, { value: 20,  color: '#00c8ff' },
                { value: 40,  color: '#00c864' }, { value: 60,  color: '#ffff00' },
                { value: 80,  color: '#ffa500' }, { value: 100, color: '#ff3c00' },
                { value: 130, color: '#c80000' }, { value: 160, color: '#640064' }
            ]
        },
        nebulosite: {
            label: 'Nébulosité totale', unit: '%', decimals: 0, transparent_below: 0,
            stops: [
                { value: 10,  color: '#dce6f0' }, { value: 50, color: '#a0b4c8' },
                { value: 80,  color: '#647896' }, { value: 100, color: '#3c465a' }
            ]
        },
        nuages_bas: {
            label: 'Couverture nuages bas', unit: '%', decimals: 0, transparent_below: 0,
            stops: [
                { value: 20, color: '#fff0b4' }, { value: 60, color: '#ffb450' },
                { value: 100, color: '#c85000' }
            ]
        },
        nuages_moyens: {
            label: 'Couverture nuages moyens', unit: '%', decimals: 0, transparent_below: 0,
            stops: [
                { value: 20, color: '#b4f0c8' }, { value: 60, color: '#50c878' },
                { value: 100, color: '#008c3c' }
            ]
        },
        nuages_eleves: {
            label: 'Couverture nuages élevés', unit: '%', decimals: 0, transparent_below: 0,
            stops: [
                { value: 20, color: '#c8dcff' }, { value: 60, color: '#78a0f0' },
                { value: 100, color: '#2850c8' }
            ]
        },
        humidite: {
            label: 'Humidité relative à 2 m', unit: '%', decimals: 0, transparent_below: null,
            stops: [
                { value: 0,   color: '#c89664' }, { value: 20,  color: '#dcb478' },
                { value: 40,  color: '#ffffc8' }, { value: 60,  color: '#b4ffb4' },
                { value: 80,  color: '#00c8c8' }, { value: 90,  color: '#0064ff' },
                { value: 100, color: '#0000c8' }
            ]
        },
        mucape: {
            label: 'Instabilité convective (MUCAPE)', unit: 'J/kg', decimals: 0, transparent_below: 0,
            stops: [
                { value: 50,   color: '#6464ff' }, { value: 200,  color: '#00ffc8' },
                { value: 500,  color: '#00c800' }, { value: 1000, color: '#ffff00' },
                { value: 2000, color: '#ffa500' }, { value: 3500, color: '#ff0000' },
                { value: 5000, color: '#a000a0' }
            ]
        },
        neige: {
            label: 'Chutes de neige', unit: 'cm/h', decimals: 1, transparent_below: 0,
            stops: [
                { value: 0.1, color: '#c8e6ff' }, { value: 1,  color: '#64b4ff' },
                { value: 3,   color: '#3264c8' }, { value: 10, color: '#0000b4' },
                { value: 20,  color: '#640096' }
            ]
        },
        neige_au_sol: {
            label: 'Épaisseur neige au sol', unit: 'cm', decimals: 0, transparent_below: 0,
            stops: [
                { value: 1,   color: '#c8e6ff' }, { value: 5,   color: '#96c8ff' },
                { value: 20,  color: '#6496ff' }, { value: 50,  color: '#3264c8' },
                { value: 100, color: '#0000b4' }, { value: 200, color: '#640096' }
            ]
        },
        equivalent_eau_neige: {
            label: 'Cumul neigeux équivalent eau', unit: 'mm', decimals: 1, transparent_below: 0,
            stops: [
                { value: 1,  color: '#c8e6ff' }, { value: 5,  color: '#64b4ff' },
                { value: 15, color: '#3264c8' }, { value: 30, color: '#0000b4' }
            ]
        },
        pression: {
            label: 'Pression niveau mer', unit: 'hPa', decimals: 0, transparent_below: null,
            stops: [
                { value: 960,  color: '#820082' }, { value: 975,  color: '#0000c8' },
                { value: 985,  color: '#0096ff' }, { value: 995,  color: '#00c896' },
                { value: 1005, color: '#00b400' }, { value: 1013, color: '#c8c8c8' },
                { value: 1020, color: '#ffdc64' }, { value: 1030, color: '#ff9600' },
                { value: 1040, color: '#c85000' }
            ]
        },
        pression_surface: {
            label: 'Pression au sol', unit: 'hPa', decimals: 0, transparent_below: null,
            stops: [
                { value: 800,  color: '#820082' }, { value: 900, color: '#0000c8' },
                { value: 960,  color: '#00b400' }, { value: 1013, color: '#c8c8c8' },
                { value: 1040, color: '#c85000' }
            ]
        }
    };

    function getLayerPalette(key) {
        return PALETTES[key] || PALETTES.temperature;
    }

    // Dégradé CSS exact, avec des positions proportionnelles aux valeurs réelles
    // (et non des stops à espacement uniforme, ce qui fausserait l'échelle).
    function paletteGradientCSS(key) {
        var pal = getLayerPalette(key);
        var stops = pal.stops;
        if (!stops.length) return 'linear-gradient(to right, #000, #000)';
        var low = (pal.transparent_below !== null && pal.transparent_below !== undefined)
            ? pal.transparent_below : stops[0].value;
        var max = stops[stops.length - 1].value;
        var span = (max - low) || 1;
        var items = [];
        if (pal.transparent_below !== null && pal.transparent_below !== undefined) {
            items.push('rgba(0,0,0,0) 0%');
        }
        stops.forEach(function (s) {
            var pct = ((s.value - low) / span * 100).toFixed(1);
            items.push(s.color + ' ' + pct + '%');
        });
        return 'linear-gradient(to right, ' + items.join(', ') + ')';
    }

    // 5 repères chiffrés réels répartis uniformément entre la borne basse et la borne haute.
    function paletteTicks(key) {
        var pal = getLayerPalette(key);
        var stops = pal.stops;
        var low = (pal.transparent_below !== null && pal.transparent_below !== undefined)
            ? pal.transparent_below : stops[0].value;
        var max = stops[stops.length - 1].value;
        var ticks = [];
        for (var i = 0; i < 5; i += 1) {
            ticks.push(formatTickValue(low + (max - low) * i / 4));
        }
        return ticks;
    }

    function formatTickValue(v) {
        var abs = Math.abs(v);
        var rounded = abs >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
        return String(rounded);
    }

    window.WEATHER_PALETTES = PALETTES;
    window.getLayerPalette = getLayerPalette;
    window.paletteGradientCSS = paletteGradientCSS;
    window.paletteTicks = paletteTicks;
})();
