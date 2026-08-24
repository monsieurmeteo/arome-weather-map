(function () {
    'use strict';
    // Palettes Météo-Climat Pro — couleurs de référence (alertes-meteo.com/arome).
    var PALETTES = {
        temperature: {
            label: 'Température à 2 m', unit: '°C', decimals: 0, transparent_below: null,
            stops: [
                { value: -25, color: '#482173' },
                { value: -15, color: '#303fa5' },
                { value: -5, color: '#3478c5' },
                { value: 0, color: '#55b7dd' },
                { value: 5, color: '#53c6a8' },
                { value: 10, color: '#70cf66' },
                { value: 15, color: '#cbd83f' },
                { value: 20, color: '#f2d43d' },
                { value: 25, color: '#f2a331' },
                { value: 30, color: '#ea652b' },
                { value: 35, color: '#d93435' },
                { value: 40, color: '#a71f57' },
                { value: 45, color: '#5b1037' },
            ]
        },
        temperature_ressentie: {
            label: 'Refroidissement éolien', unit: '°C', decimals: 0, transparent_below: null,
            stops: [
                { value: -35, color: '#27145d' },
                { value: -25, color: '#482173' },
                { value: -15, color: '#303fa5' },
                { value: -5, color: '#3478c5' },
                { value: 0, color: '#55b7dd' },
                { value: 5, color: '#53c6a8' },
                { value: 10, color: '#70cf66' },
                { value: 15, color: '#cbd83f' },
                { value: 20, color: '#f2d43d' },
            ]
        },
        point_rosee: {
            label: 'Point de rosée à 2 m', unit: '°C', decimals: 0, transparent_below: null,
            stops: [
                { value: -25, color: '#57336f' },
                { value: -15, color: '#3855a3' },
                { value: -5, color: '#398bca' },
                { value: 0, color: '#56b7d8' },
                { value: 5, color: '#58c8a2' },
                { value: 10, color: '#79cf68' },
                { value: 15, color: '#d5d64a' },
                { value: 20, color: '#f0a83b' },
                { value: 25, color: '#df5d3c' },
                { value: 30, color: '#9f2955' },
            ]
        },
        humidex: {
            label: 'Humidex', unit: '', decimals: 0, transparent_below: null,
            stops: [
                { value: -10, color: '#3478c5' },
                { value: 0, color: '#55b7dd' },
                { value: 10, color: '#53c6a8' },
                { value: 20, color: '#b9d84c' },
                { value: 25, color: '#f2d43d' },
                { value: 30, color: '#f2a331' },
                { value: 35, color: '#ea652b' },
                { value: 40, color: '#d93435' },
                { value: 45, color: '#a71f57' },
                { value: 50, color: '#5b1037' },
            ]
        },
        pluie_1h: {
            label: 'Précipitations sur 1 h', unit: 'mm', decimals: 0, transparent_below: 0,
            stops: [
                { value: 0.1, color: '#f5f5f7' },
                { value: 1, color: '#c9e6ff' },
                { value: 2, color: '#7fbbff' },
                { value: 3, color: '#438fff' },
                { value: 5, color: '#1bd0ef' },
                { value: 7, color: '#00b8bd' },
                { value: 10, color: '#00ca76' },
                { value: 15, color: '#32e300' },
                { value: 20, color: '#86ed00' },
                { value: 25, color: '#d2ef00' },
                { value: 30, color: '#fff000' },
                { value: 40, color: '#ffd000' },
                { value: 50, color: '#ff9900' },
                { value: 60, color: '#ff6500' },
                { value: 70, color: '#ff2e00' },
                { value: 80, color: '#ef0054' },
                { value: 90, color: '#d000a7' },
                { value: 100, color: '#a000e8' },
            ]
        },
        pluie_cumul: {
            label: 'Précipitations totales', unit: 'mm', decimals: 0, transparent_below: 0,
            stops: [
                { value: 0.1, color: '#f5f5f7' },
                { value: 1, color: '#c9e6ff' },
                { value: 2, color: '#7fbbff' },
                { value: 3, color: '#438fff' },
                { value: 5, color: '#1bd0ef' },
                { value: 7, color: '#00b8bd' },
                { value: 10, color: '#00ca76' },
                { value: 15, color: '#32e300' },
                { value: 20, color: '#86ed00' },
                { value: 25, color: '#d2ef00' },
                { value: 30, color: '#fff000' },
                { value: 40, color: '#ffd000' },
                { value: 50, color: '#ff9900' },
                { value: 60, color: '#ff6500' },
                { value: 70, color: '#ff2e00' },
                { value: 80, color: '#ef0054' },
                { value: 90, color: '#d000a7' },
                { value: 100, color: '#a000e8' },
                { value: 125, color: '#6900dc' },
                { value: 150, color: '#4b00b4' },
                { value: 175, color: '#291078' },
                { value: 200, color: '#661070' },
                { value: 250, color: '#a548bd' },
                { value: 300, color: '#d487e1' },
                { value: 400, color: '#f0c8f2' },
                { value: 500, color: '#ffffff' },
            ]
        },
        neige: {
            label: 'Neige sur 1 h (équivalent eau)', unit: 'mm', decimals: 0, transparent_below: 0,
            stops: [
                { value: 0.1, color: '#f5f5f7' },
                { value: 1, color: '#c9e6ff' },
                { value: 2, color: '#7fbbff' },
                { value: 3, color: '#438fff' },
                { value: 5, color: '#1bd0ef' },
                { value: 7, color: '#00b8bd' },
                { value: 10, color: '#00ca76' },
                { value: 15, color: '#32e300' },
                { value: 20, color: '#86ed00' },
                { value: 25, color: '#d2ef00' },
                { value: 30, color: '#fff000' },
                { value: 40, color: '#ffd000' },
                { value: 50, color: '#ff9900' },
                { value: 60, color: '#ff6500' },
                { value: 70, color: '#ff2e00' },
                { value: 80, color: '#ef0054' },
                { value: 90, color: '#d000a7' },
                { value: 100, color: '#a000e8' },
            ]
        },
        neige_au_sol: {
            label: 'Cumul de neige fraîche (estimé)', unit: 'cm', decimals: 0, transparent_below: 0,
            stops: [
                { value: 0.1, color: '#f4f7fb' },
                { value: 1, color: '#d7efff' },
                { value: 2, color: '#a9d9ff' },
                { value: 5, color: '#70b8ef' },
                { value: 10, color: '#3a91d5' },
                { value: 20, color: '#536bc1' },
                { value: 30, color: '#7048ac' },
                { value: 50, color: '#963b92' },
                { value: 75, color: '#c65382' },
                { value: 100, color: '#f0b5cf' },
            ]
        },
        equivalent_eau_neige: {
            label: 'Cumul neigeux (équivalent eau)', unit: 'mm', decimals: 0, transparent_below: 0,
            stops: [
                { value: 0.1, color: '#f5f5f7' },
                { value: 1, color: '#c9e6ff' },
                { value: 2, color: '#7fbbff' },
                { value: 3, color: '#438fff' },
                { value: 5, color: '#1bd0ef' },
                { value: 7, color: '#00b8bd' },
                { value: 10, color: '#00ca76' },
                { value: 15, color: '#32e300' },
                { value: 20, color: '#86ed00' },
                { value: 25, color: '#d2ef00' },
                { value: 30, color: '#fff000' },
                { value: 40, color: '#ffd000' },
                { value: 50, color: '#ff9900' },
                { value: 60, color: '#ff6500' },
                { value: 70, color: '#ff2e00' },
                { value: 80, color: '#ef0054' },
                { value: 90, color: '#d000a7' },
                { value: 100, color: '#a000e8' },
                { value: 125, color: '#6900dc' },
                { value: 150, color: '#4b00b4' },
                { value: 175, color: '#291078' },
                { value: 200, color: '#661070' },
            ]
        },
        graupel: {
            label: 'Graupel', unit: 'mm', decimals: 0, transparent_below: 0,
            stops: [
                { value: 0.1, color: '#f5f5f7' },
                { value: 1, color: '#c9e6ff' },
                { value: 2, color: '#7fbbff' },
                { value: 3, color: '#438fff' },
                { value: 5, color: '#1bd0ef' },
                { value: 7, color: '#00b8bd' },
                { value: 10, color: '#00ca76' },
                { value: 15, color: '#32e300' },
                { value: 20, color: '#86ed00' },
                { value: 25, color: '#d2ef00' },
                { value: 30, color: '#fff000' },
                { value: 40, color: '#ffd000' },
                { value: 50, color: '#ff9900' },
                { value: 60, color: '#ff6500' },
                { value: 70, color: '#ff2e00' },
                { value: 80, color: '#ef0054' },
                { value: 90, color: '#d000a7' },
                { value: 100, color: '#a000e8' },
            ]
        },
        vent: {
            label: 'Vent moyen à 10 m', unit: 'km/h', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#eef7ea' },
                { value: 10, color: '#a7db8d' },
                { value: 20, color: '#5cc27d' },
                { value: 30, color: '#38aaa5' },
                { value: 40, color: '#347cc3' },
                { value: 50, color: '#6558b8' },
                { value: 60, color: '#a43e94' },
                { value: 80, color: '#d63c57' },
                { value: 100, color: '#7e1736' },
            ]
        },
        rafales: {
            label: 'Rafales à 10 m', unit: 'km/h', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#edf7e8' },
                { value: 20, color: '#a9d77d' },
                { value: 40, color: '#f0cf46' },
                { value: 60, color: '#ef8b2c' },
                { value: 80, color: '#db3d3d' },
                { value: 100, color: '#9e235d' },
                { value: 130, color: '#4d1647' },
                { value: 160, color: '#25152e' },
            ]
        },
        pression: {
            label: 'Pression au niveau de la mer (estimée)', unit: 'hPa', decimals: 0, transparent_below: 0,
            stops: [
                { value: 960, color: '#562a7c' },
                { value: 975, color: '#315ab4' },
                { value: 990, color: '#2f98c5' },
                { value: 1000, color: '#48b983' },
                { value: 1010, color: '#c6d64f' },
                { value: 1020, color: '#f0c646' },
                { value: 1030, color: '#e57a34' },
                { value: 1045, color: '#b52f43' },
            ]
        },
        pression_surface: {
            label: 'Pression au sol', unit: 'hPa', decimals: 0, transparent_below: 0,
            stops: [
                { value: 700, color: '#44205f' },
                { value: 800, color: '#3455a6' },
                { value: 900, color: '#36a1bd' },
                { value: 950, color: '#54bf7c' },
                { value: 1000, color: '#d6d64c' },
                { value: 1030, color: '#ed9a36' },
                { value: 1060, color: '#b52f43' },
            ]
        },
        nebulosite: {
            label: 'Nébulosité totale', unit: '%', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#dceef6' },
                { value: 20, color: '#c8dce5' },
                { value: 40, color: '#abbac5' },
                { value: 60, color: '#8997a4' },
                { value: 80, color: '#626e79' },
                { value: 100, color: '#343d46' },
            ]
        },
        nuages_bas: {
            label: 'Couverture nuageuse basse', unit: '%', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#e6f4fa' },
                { value: 20, color: '#cddfe7' },
                { value: 40, color: '#adbec8' },
                { value: 60, color: '#8997a4' },
                { value: 80, color: '#626e79' },
                { value: 100, color: '#343d46' },
            ]
        },
        nuages_moyens: {
            label: 'Couverture nuageuse moyenne', unit: '%', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#e6f4fa' },
                { value: 20, color: '#cddfe7' },
                { value: 40, color: '#adbec8' },
                { value: 60, color: '#8997a4' },
                { value: 80, color: '#626e79' },
                { value: 100, color: '#343d46' },
            ]
        },
        nuages_eleves: {
            label: 'Couverture nuageuse élevée', unit: '%', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#e6f4fa' },
                { value: 20, color: '#cddfe7' },
                { value: 40, color: '#adbec8' },
                { value: 60, color: '#8997a4' },
                { value: 80, color: '#626e79' },
                { value: 100, color: '#343d46' },
            ]
        },
        humidite: {
            label: 'Humidité relative à 2 m', unit: '%', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#9a5429' },
                { value: 20, color: '#d19a52' },
                { value: 40, color: '#e3d16b' },
                { value: 60, color: '#83ca82' },
                { value: 80, color: '#48a6b6' },
                { value: 100, color: '#28569f' },
            ]
        },
        mucape: {
            label: 'MUCAPE instantanée', unit: 'J/kg', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#f3f5f8' },
                { value: 100, color: '#d8ebff' },
                { value: 300, color: '#91c8ff' },
                { value: 500, color: '#41a8df' },
                { value: 800, color: '#31c878' },
                { value: 1200, color: '#d5e52f' },
                { value: 1800, color: '#ffc62d' },
                { value: 2500, color: '#ff7a22' },
                { value: 3500, color: '#e83028' },
                { value: 5000, color: '#8c1d74' },
            ]
        },
        reflectivite: {
            label: 'Réflectivité radar maximale', unit: 'dBZ', decimals: 0, transparent_below: null,
            stops: [
                { value: 0, color: '#f5f5f7' },
                { value: 5, color: '#c9e6ff' },
                { value: 10, color: '#7fbbff' },
                { value: 15, color: '#25cbe0' },
                { value: 20, color: '#00bd75' },
                { value: 25, color: '#5be000' },
                { value: 30, color: '#d5eb00' },
                { value: 35, color: '#ffe500' },
                { value: 40, color: '#ffae00' },
                { value: 45, color: '#ff6500' },
                { value: 50, color: '#f32020' },
                { value: 55, color: '#d00076' },
                { value: 60, color: '#9300c6' },
                { value: 70, color: '#ffffff' },
            ]
        },
        altitude: {
            label: 'Altitude du relief AROME', unit: 'm', decimals: 0, transparent_below: null,
            stops: [
                { value: -50, color: '#d6e8ef' },
                { value: 0, color: '#d8e8c1' },
                { value: 100, color: '#b8d98c' },
                { value: 300, color: '#9bc267' },
                { value: 600, color: '#c3b563' },
                { value: 1000, color: '#b88d58' },
                { value: 1500, color: '#966b52' },
                { value: 2200, color: '#765054' },
                { value: 3200, color: '#eeeeee' },
                { value: 4500, color: '#ffffff' },
            ]
        },
    };

    function getLayerPalette(key) {
        return PALETTES[key] || PALETTES.temperature;
    }

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
