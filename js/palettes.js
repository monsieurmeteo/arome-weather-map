/**
 * Palettes Météorologiques Officielles Météo-France & TV Pro
 */
const ColorThemes = {
    standard: {
        id: 'standard',
        name: 'Météo-France / TV Pro (Officiel)',
        temperature: [
            { value: -15, color: '#28146e', label: '-15°' },
            { value: -5,  color: '#2d5fc3', label: '-5°' },
            { value: 0,   color: '#46afeb', label: '0°' },
            { value: 5,   color: '#5ac8b9', label: '5°' },
            { value: 10,  color: '#73d26e', label: '10°' },
            { value: 15,  color: '#afe141', label: '15°' },
            { value: 20,  color: '#f0e12d', label: '20°' },
            { value: 24,  color: '#f5af1e', label: '24°' },
            { value: 28,  color: '#f07319', label: '28°' },
            { value: 32,  color: '#e1371e', label: '32°' },
            { value: 36,  color: '#be142d', label: '36°' },
            { value: 42,  color: '#910a4b', label: '42°' }
        ],
        pluie_1h: [
            { value: 0,   color: 'rgba(0, 0, 0, 0)', label: '0' },
            { value: 0.2, color: '#78c8ff', label: '0.2' },
            { value: 1.0, color: '#3296f5', label: '1' },
            { value: 2.5, color: '#28be6e', label: '2.5' },
            { value: 6.0, color: '#f0d71e', label: '6' },
            { value: 12,  color: '#f57814', label: '12' },
            { value: 25,  color: '#e61e28', label: '25' },
            { value: 45,  color: '#f550e6', label: '45+' }
        ],
        rafales: [
            { value: 0,   color: 'rgba(0, 0, 0, 0)', label: '0' },
            { value: 30,  color: '#46b4dc', label: '30' },
            { value: 50,  color: '#50cd78', label: '50' },
            { value: 70,  color: '#f0c81e', label: '70' },
            { value: 90,  color: '#f56e19', label: '90' },
            { value: 110, color: '#e6232d', label: '110' },
            { value: 130, color: '#960f5f', label: '130+' }
        ],
        mucape: [
            { value: 0,    color: 'rgba(0, 0, 0, 0)', label: '0' },
            { value: 200,  color: '#82d2ff', label: '200' },
            { value: 500,  color: '#3cb964', label: '500' },
            { value: 1000, color: '#f5d21e', label: '1000' },
            { value: 1600, color: '#f56e14', label: '1600' },
            { value: 2400, color: '#e61928', label: '2400' },
            { value: 3200, color: '#dc1ed2', label: '3200+' }
        ]
    }
};

const WeatherPalettes = {
    temperature: { name: 'Température à 2 m', unit: '°C', min: -15, max: 42 },
    temperature_ressentie: { name: 'Température ressentie', unit: '°C', min: -15, max: 45 },
    pluie_1h: { name: 'Pluie horaire', unit: 'mm/h', min: 0, max: 60 },
    pluie_cumul: { name: 'Précipitations cumulées', unit: 'mm', min: 0, max: 150 },
    vent: { name: 'Vent moyen', unit: 'km/h', min: 0, max: 100 },
    rafales: { name: 'Rafales de vent', unit: 'km/h', min: 0, max: 130 },
    mucape: { name: 'Instabilité orageuse (CAPE)', unit: 'J/kg', min: 0, max: 3200 }
};

function getActiveStops(layerKey, themeKey = 'standard') {
    const theme = ColorThemes.standard;
    if (theme[layerKey]) return theme[layerKey];
    if (layerKey.includes('temp') || layerKey.includes('rosee')) return theme.temperature;
    if (layerKey.includes('pluie') || layerKey.includes('radar') || layerKey.includes('reflect')) return theme.pluie_1h;
    if (layerKey.includes('vent') || layerKey.includes('rafal')) return theme.rafales;
    if (layerKey.includes('cape') || layerKey.includes('orage')) return theme.mucape;
    return theme.temperature;
}

function getPaletteGradientCSS(layerKey, themeKey = 'standard') {
    const stops = getActiveStops(layerKey, themeKey);
    const pal = WeatherPalettes[layerKey] || WeatherPalettes.temperature;
    const items = stops.map(s => {
        const pct = Math.max(0, Math.min(100, ((s.value - pal.min) / (pal.max - pal.min)) * 100));
        return `${s.color} ${pct.toFixed(1)}%`;
    });
    return `linear-gradient(to right, ${items.join(', ')})`;
}

window.ColorThemes = ColorThemes;
window.WeatherPalettes = WeatherPalettes;
window.getActiveStops = getActiveStops;
window.getPaletteGradientCSS = getPaletteGradientCSS;
