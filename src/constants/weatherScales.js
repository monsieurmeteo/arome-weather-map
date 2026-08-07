import { Wind, Droplets, Thermometer } from "lucide-react";

export const WIND_SCALE = [
    { min: 0, max: 60, color: '#ffffe0', label: '< 60' },
    { min: 60, max: 70, color: '#fef0b9', label: '60-70' },
    { min: 70, max: 80, color: '#fde492', label: '70-80' },
    { min: 80, max: 90, color: '#fccb70', label: '80-90' },
    { min: 90, max: 100, color: '#fbaf53', label: '90-100' },
    { min: 100, max: 110, color: '#f88e36', label: '100-110' },
    { min: 110, max: 120, color: '#f26829', label: '110-120' },
    { min: 120, max: 130, color: '#e23b30', label: '120-130' },
    { min: 130, max: 140, color: '#c61d5f', label: '130-140' },
    { min: 140, max: 150, color: '#a02c91', label: '140-150' },
    { min: 150, max: 160, color: '#802eaf', label: '150-160' },
    { min: 160, max: 170, color: '#9d66e5', label: '160-170' },
    { min: 170, max: 180, color: '#c39cf5', label: '170-180' },
    { min: 180, max: Infinity, color: '#e6d8ff', label: '> 180' },
];

export const RAIN_SCALE = [
    { min: 0, max: 1, color: '#ffffff', label: '< 1' },
    { min: 1, max: 5, color: '#dcf0dc', label: '1-5' },
    { min: 5, max: 10, color: '#c8e6c8', label: '5-10' },
    { min: 10, max: 20, color: '#a3d4a3', label: '10-20' },
    { min: 20, max: 30, color: '#ffe680', label: '20-30' },
    { min: 30, max: 40, color: '#ffd24d', label: '30-40' },
    { min: 40, max: 50, color: '#ffa64d', label: '40-50' },
    { min: 50, max: 60, color: '#ff8533', label: '50-60' },
    { min: 60, max: 80, color: '#ff6600', label: '60-80' },
    { min: 80, max: 100, color: '#ff3300', label: '80-100' },
    { min: 100, max: 120, color: '#cc0000', label: '100-120' },
    { min: 120, max: 150, color: '#990066', label: '120-150' },
    { min: 150, max: 200, color: '#cc00cc', label: '150-200' },
    { min: 200, max: 250, color: '#9966ff', label: '200-250' },
    { min: 250, max: 300, color: '#6699ff', label: '250-300' },
    { min: 300, max: 350, color: '#66ccff', label: '300-350' },
    { min: 350, max: 400, color: '#99e6ff', label: '350-400' },
    { min: 400, max: 450, color: '#ccf2ff', label: '400-450' },
    { min: 450, max: 500, color: '#e6f7ff', label: '450-500' },
    { min: 500, max: Infinity, color: '#f0f0f0', label: '> 500' },
];

export const RAIN_SCALE_MF = [
    { min: 0, max: 0.5, color: '#ffffff', label: '< 0.5' },
    { min: 0.5, max: 1, color: '#e6f5e6', label: '0.5-1' },
    { min: 1, max: 2, color: '#c8e6c8', label: '1-2' },
    { min: 2, max: 5, color: '#99d699', label: '2-5' },
    { min: 5, max: 10, color: '#66c266', label: '5-10' },
    { min: 10, max: 20, color: '#33aa55', label: '10-20' },
    { min: 20, max: 30, color: '#009966', label: '20-30' },
    { min: 30, max: 40, color: '#00b399', label: '30-40' },
    { min: 40, max: 50, color: '#00cccc', label: '40-50' },
    { min: 50, max: 60, color: '#00bbee', label: '50-60' },
    { min: 60, max: 70, color: '#0099ff', label: '60-70' },
    { min: 70, max: 80, color: '#0077ee', label: '70-80' },
    { min: 80, max: 90, color: '#0055dd', label: '80-90' },
    { min: 90, max: 100, color: '#0033cc', label: '90-100' },
    { min: 100, max: 150, color: '#ffee00', label: '100-150' },
    { min: 150, max: 200, color: '#ffbb00', label: '150-200' },
    { min: 200, max: 300, color: '#ff8800', label: '200-300' },
    { min: 300, max: 400, color: '#ff4400', label: '300-400' },
    { min: 400, max: 500, color: '#dd0000', label: '400-500' },
    { min: 500, max: 600, color: '#aa0044', label: '500-600' },
    { min: 600, max: 700, color: '#880088', label: '600-700' },
    { min: 700, max: 800, color: '#6600aa', label: '700-800' },
    { min: 800, max: Infinity, color: '#440066', label: '> 800' },
];

export const TEMP_SCALE = [
    { min: -Infinity, max: -12, color: '#1a1a6e', label: '< -12' },
    { min: -12, max: -10, color: '#23239e', label: '-12/-10' },
    { min: -10, max: -8, color: '#2b2bcf', label: '-10/-8' },
    { min: -8, max: -6, color: '#3366e6', label: '-8/-6' },
    { min: -6, max: -4, color: '#4d8cf0', label: '-6/-4' },
    { min: -4, max: -2, color: '#66b3f5', label: '-4/-2' },
    { min: -2, max: 0, color: '#80d4fc', label: '-2/0' },
    { min: 0, max: 2, color: '#99e6ff', label: '0/2' },
    { min: 2, max: 4, color: '#b3f0ff', label: '2/4' },
    { min: 4, max: 6, color: '#ccffcc', label: '4/6' },
    { min: 6, max: 8, color: '#a3e6a3', label: '6/8' },
    { min: 8, max: 10, color: '#7acc7a', label: '8/10' },
    { min: 10, max: 12, color: '#52b352', label: '10/12' },
    { min: 12, max: 14, color: '#339933', label: '12/14' },
    { min: 14, max: 16, color: '#669900', label: '14/16' },
    { min: 16, max: 18, color: '#99b300', label: '16/18' },
    { min: 18, max: 20, color: '#cccc00', label: '18/20' },
    { min: 20, max: 22, color: '#e6cc00', label: '20/22' },
    { min: 22, max: 24, color: '#ffcc00', label: '22/24' },
    { min: 24, max: 26, color: '#ffaa00', label: '24/26' },
    { min: 26, max: 28, color: '#ff8800', label: '26/28' },
    { min: 28, max: 30, color: '#ff6600', label: '28/30' },
    { min: 30, max: 32, color: '#ff4400', label: '30/32' },
    { min: 32, max: 34, color: '#ff1a1a', label: '32/34' },
    { min: 34, max: 36, color: '#e60000', label: '34/36' },
    { min: 36, max: 38, color: '#cc0033', label: '36/38' },
    { min: 38, max: 40, color: '#b30059', label: '38/40' },
    { min: 40, max: 42, color: '#cc00cc', label: '40/42' },
    { min: 42, max: 44, color: '#e066e0', label: '42/44' },
    { min: 44, max: 46, color: '#f0b3f0', label: '44/46' },
    { min: 46, max: Infinity, color: '#f5d9f5', label: '> 46' },
];

export const TEMP_SCALE_MF = [
    { min: -Infinity, max: -24, color: '#2a004f', label: '< -24' },
    { min: -24, max: -22, color: '#3d006b', label: '-24/-22' },
    { min: -22, max: -20, color: '#4a0082', label: '-22/-20' },
    { min: -20, max: -18, color: '#2d0099', label: '-20/-18' },
    { min: -18, max: -15, color: '#1500b3', label: '-18/-15' },
    { min: -15, max: -14, color: '#0000cd', label: '-15/-14' },
    { min: -14, max: -12, color: '#0019e6', label: '-14/-12' },
    { min: -12, max: -10, color: '#0040ff', label: '-12/-10' },
    { min: -10, max: -8, color: '#0066ff', label: '-10/-8' },
    { min: -8, max: -6, color: '#0099ff', label: '-8/-6' },
    { min: -6, max: -4, color: '#00bbff', label: '-6/-4' },
    { min: -4, max: -2, color: '#00ddff', label: '-4/-2' },
    { min: -2, max: 0, color: '#55eeff', label: '-2/0' },
    { min: 0, max: 2, color: '#99ffff', label: '0/2' },
    { min: 2, max: 4, color: '#bbffe8', label: '2/4' },
    { min: 4, max: 6, color: '#ccffcc', label: '4/6' },
    { min: 6, max: 8, color: '#80e680', label: '6/8' },
    { min: 8, max: 10, color: '#4dcc4d', label: '8/10' },
    { min: 10, max: 12, color: '#33b333', label: '10/12' },
    { min: 12, max: 14, color: '#339900', label: '12/14' },
    { min: 14, max: 16, color: '#66aa00', label: '14/16' },
    { min: 16, max: 18, color: '#99bb00', label: '16/18' },
    { min: 18, max: 20, color: '#cccc00', label: '18/20' },
    { min: 20, max: 22, color: '#ffe600', label: '20/22' },
    { min: 22, max: 24, color: '#ffcc00', label: '22/24' },
    { min: 24, max: 26, color: '#ffaa00', label: '24/26' },
    { min: 26, max: 28, color: '#ff8800', label: '26/28' },
    { min: 28, max: 30, color: '#ff6600', label: '28/30' },
    { min: 30, max: 32, color: '#ff3300', label: '30/32' },
    { min: 32, max: 34, color: '#e60000', label: '32/34' },
    { min: 34, max: 36, color: '#cc0033', label: '34/36' },
    { min: 36, max: 38, color: '#cc0066', label: '36/38' },
    { min: 38, max: 40, color: '#dd0099', label: '38/40' },
    { min: 40, max: 42, color: '#ee00cc', label: '40/42' },
    { min: 42, max: 44, color: '#ff66dd', label: '42/44' },
    { min: 44, max: Infinity, color: '#ff99ee', label: '> 44' },
];

export const getColorForParam = (value, param, useAltScale = false) => {
    if (value === null || value === undefined) return '#e2e8f0';
    let scale;
    if (param === 'wind') {
        if (value < 30) return '#ffffff';
        scale = WIND_SCALE;
    } else if (param === 'rain') {
        if (value < (useAltScale ? 0.5 : 1)) return '#ffffff';
        scale = useAltScale ? RAIN_SCALE_MF : RAIN_SCALE;
    } else {
        scale = useAltScale ? TEMP_SCALE_MF : TEMP_SCALE;
    }
    const range = scale.find(r => value >= r.min && value < r.max);
    return range ? range.color : scale[scale.length - 1].color;
};

export const getParamsConfig = (useAltScale = false) => ({
    wind: { label: 'Rafales Max', unit: 'km/h', icon: Wind, color: '#8b5cf6', field: 'wind_gust_max', agg: 'max', scale: WIND_SCALE, legendFilter: r => r.min >= 60, legendTop: { color: '#e6d8ff', label: '180' } },
    rain: { label: 'Cumul Pluie', unit: 'mm', icon: Droplets, color: '#0ea5e9', field: 'rain_total', agg: 'sum', scale: useAltScale ? RAIN_SCALE_MF : RAIN_SCALE, legendFilter: r => r.min >= (useAltScale ? 0.5 : 1) && r.max !== Infinity, legendTop: { color: '#440066', label: '800' } },
    tn: { label: 'Temp. Min (Tn)', unit: '°C', icon: Thermometer, color: '#3b82f6', field: 'temp_min', agg: 'min', scale: useAltScale ? TEMP_SCALE_MF : TEMP_SCALE, legendFilter: r => r.min !== -Infinity && r.max !== Infinity, legendTop: { color: '#f5d9f5', label: '46' } },
    tx: { label: 'Temp. Max (Tx)', unit: '°C', icon: Thermometer, color: '#ef4444', field: 'temp_max', agg: 'max', scale: useAltScale ? TEMP_SCALE_MF : TEMP_SCALE, legendFilter: r => r.min !== -Infinity && r.max !== Infinity, legendTop: { color: '#f5d9f5', label: '46' } },
});
