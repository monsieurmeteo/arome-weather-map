import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { geoConicConformal, geoPath } from "d3-geo";
import { supabase } from "../../services/api";
import { Download, RefreshCw, Calendar, ChevronDown, Info, Wind, Droplets, Thermometer } from "lucide-react";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import stationNamesData from "../../data/stationNames.json";
import stationsListData from "../../data/stations_list.json";
import { Delaunay } from "d3-delaunay";
import { REGIONS } from "../../data/departments";
// ======================= ÉCHELLES DE COULEURS ==========================

const WIND_SCALE = [
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

const RAIN_SCALE = [
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

const RAIN_SCALE_MF = [
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


const TEMP_SCALE = [
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

const TEMP_SCALE_MF = [
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

const getColorForParam = (value, param, useAltScale = false) => {
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

const getParams = (useAltScale = false) => ({
    wind: { label: 'Rafales Max', unit: 'km/h', icon: Wind, color: '#8b5cf6', field: 'wind_gust_max', agg: 'max', scale: WIND_SCALE, legendFilter: r => r.min >= 60, legendTop: { color: '#e6d8ff', label: '180' } },
    rain: { label: 'Cumul Pluie', unit: 'mm', icon: Droplets, color: '#0ea5e9', field: 'rain_total', agg: 'sum', scale: useAltScale ? RAIN_SCALE_MF : RAIN_SCALE, legendFilter: r => r.min >= (useAltScale ? 0.5 : 1) && r.max !== Infinity, legendTop: { color: '#440066', label: '800' } },
    tn: { label: 'Temp. Min (Tn)', unit: '°C', icon: Thermometer, color: '#3b82f6', field: 'temp_min', agg: 'min', scale: useAltScale ? TEMP_SCALE_MF : TEMP_SCALE, legendFilter: r => r.min !== -Infinity && r.max !== Infinity, legendTop: { color: '#f5d9f5', label: '46' } },
    tx: { label: 'Temp. Max (Tx)', unit: '°C', icon: Thermometer, color: '#ef4444', field: 'temp_max', agg: 'max', scale: useAltScale ? TEMP_SCALE_MF : TEMP_SCALE, legendFilter: r => r.min !== -Infinity && r.max !== Infinity, legendTop: { color: '#f5d9f5', label: '46' } },
});

// ======================= COMPOSANT PRINCIPAL ==========================

const MonthlyMapsHub = () => {
    const navigate = useNavigate();
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [activeParam, setActiveParam] = useState('wind');
    const [geoData, setGeoData] = useState(null);
    const [regionsGeoData, setRegionsGeoData] = useState(null);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState(null);
    const [mapTitle, setMapTitle] = useState("Rafales maximales");
    const [showLabels, setShowLabels] = useState(true);
    const [showRegions, setShowRegions] = useState(true);
    const [isSmooth, setIsSmooth] = useState(true);
    const [selectedRegionName, setSelectedRegionName] = useState("France");
    const [hoveredStation, setHoveredStation] = useState(null);
    const [useAltScale, setUseAltScale] = useState(false);
    const mapContainerRef = useRef(null);

    const WIDTH = 1000;
    const HEIGHT = 900;
    const PARAMS = getParams(useAltScale);
    const paramConfig = PARAMS[activeParam];

    const stationsLookup = useMemo(() => {
        const map = {};
        if (stationsListData && stationsListData.features) {
            stationsListData.features.forEach(f => {
                const sid = f.properties.num;
                map[sid] = { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], name: f.properties.nom };
            });
        }
        return map;
    }, []);

    useEffect(() => {
        fetch("/data/departements-version-simplifiee.geojson")
            .then(res => res.json()).then(data => setGeoData(data)).catch(err => console.error(err));
        fetch("/data/regions-version-simplifiee.geojson")
            .then(res => res.json()).then(data => setRegionsGeoData(data)).catch(err => console.error(err));
    }, []);

    // Mise à jour du titre par défaut quand le paramètre change
    useEffect(() => {
        const labels = { wind: 'Rafales maximales', rain: 'Cumul de pluie mensuel', tn: 'Températures minimales', tx: 'Températures maximales' };
        setMapTitle(labels[activeParam] || 'Données mensuelles');
    }, [activeParam]);

    // Déterminer les jours du mois sélectionné
    const daysInMonth = useMemo(() => {
        const days = [];
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const today = new Date();
        for (let d = 1; d <= lastDay; d++) {
            const dateObj = new Date(selectedYear, selectedMonth - 1, d);
            if (dateObj <= today) {
                days.push(dateObj.toISOString().split('T')[0]);
            }
        }
        return days;
    }, [selectedMonth, selectedYear]);

    // Charger et agréger les données sur tout le mois
    const loadMonthlyData = async () => {
        setLoading(true);
        setError(null);
        setProgress('Initialisation...');

        try {
            // Map: stationId -> { lat, lon, name, values: [] }
            const stationAgg = new Map();
            const field = paramConfig.field;
            const aggFunc = paramConfig.agg;

            for (let dayIdx = 0; dayIdx < daysInMonth.length; dayIdx++) {
                const dateStr = daysInMonth[dayIdx];
                setProgress(`Chargement jour ${dayIdx + 1}/${daysInMonth.length} (${dateStr})...`);

                // Pagination complète
                let allData = [];
                let from = 0;
                const batchSize = 1000;
                let hasMore = true;

                while (hasMore) {
                    const { data, error: rpcError } = await supabase
                        .rpc('get_daily_extremes_fast', { target_date: dateStr, dept_codes: [] })
                        .range(from, from + batchSize - 1);

                    if (rpcError) break;
                    if (data && data.length > 0) {
                        allData.push(...data);
                        if (data.length < batchSize) hasMore = false;
                        else from += batchSize;
                    } else {
                        hasMore = false;
                    }
                }

                // Fallback vers full scan si nécessaire
                if (allData.length < 300) {
                    allData = [];
                    from = 0;
                    hasMore = true;
                    while (hasMore) {
                        const { data, error: rpcError } = await supabase
                            .rpc('get_daily_extremes_full', { target_date: dateStr })
                            .range(from, from + batchSize - 1);
                        if (rpcError) break;
                        if (data && data.length > 0) {
                            allData.push(...data);
                            if (data.length < batchSize) hasMore = false;
                            else from += batchSize;
                        } else {
                            hasMore = false;
                        }
                    }
                }

                // Agréger les résultats par station
                allData.forEach(s => {
                    const val = s[field];
                    if (val === null || val === undefined || isNaN(val)) return;
                    // Pour la pluie, ignorer les valeurs négatives
                    if (activeParam === 'rain' && val < 0) return;

                    let sid = String(s.station_id);
                    if (sid.length === 7) sid = "0" + sid;

                    const meta = stationsLookup[sid];
                    const lat = meta?.lat || s.lat;
                    const lon = meta?.lon || s.lon;
                    if (!lat || !lon) return;

                    if (!stationAgg.has(sid)) {
                        stationAgg.set(sid, {
                            id: sid, lat, lon,
                            name: stationNamesData[sid] || meta?.name || s.station_name || sid,
                            values: []
                        });
                    }
                    stationAgg.get(sid).values.push(val);
                });
            }

            // Calculer la valeur finale par station
            setProgress('Agrégation des données...');
            const stationList = [];
            stationAgg.forEach((station) => {
                if (station.values.length === 0) return;
                let finalVal;
                if (aggFunc === 'max') finalVal = Math.max(...station.values);
                else if (aggFunc === 'min') finalVal = Math.min(...station.values);
                else if (aggFunc === 'sum') finalVal = station.values.reduce((a, b) => a + b, 0);
                else finalVal = station.values.reduce((a, b) => a + b, 0) / station.values.length;

                stationList.push({ ...station, value: finalVal, values: undefined });
            });

            // Regroupement géographique (même logique que les cartes quotidiennes)
            const uniqueStations = new Map();
            stationList.forEach(s => {
                const geoKey = `${(Math.round(s.lat * 20) / 20).toFixed(2)}_${(Math.round(s.lon * 20) / 20).toFixed(2)}`;
                const existing = uniqueStations.get(geoKey);
                const shouldReplace = activeParam === 'tn'
                    ? (!existing || s.value < existing.value)
                    : (!existing || s.value > existing.value);
                if (shouldReplace) {
                    uniqueStations.set(geoKey, s);
                }
            });

            let finalList = Array.from(uniqueStations.values());

            if (selectedRegionName !== "France" && REGIONS[selectedRegionName]) {
                const regionDepts = REGIONS[selectedRegionName];
                finalList = finalList.filter(s => regionDepts.includes(s.id.startsWith("20") ? "2A" : s.id.substring(0, 2)));
            }

            // Tri
            if (activeParam === 'tn') finalList.sort((a, b) => a.value - b.value);
            else finalList.sort((a, b) => b.value - a.value);

            setStations(finalList);
            console.log(`[MonthlyMap] ${finalList.length} stations agrégées pour ${selectedMonth}/${selectedYear}`);

            if (finalList.length === 0) {
                setError("Aucune donnée archivée pour ce mois.");
            }
        } catch (err) {
            console.error("[MonthlyMap] Erreur:", err);
            setError("Impossible de charger les données.");
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    useEffect(() => {
        if (daysInMonth.length > 0) loadMonthlyData();
    }, [selectedMonth, selectedYear, activeParam, selectedRegionName]);

    const projection = useMemo(() => {
        if (!geoData) return null;
        if (selectedRegionName !== "France" && regionsGeoData) {
            const regionFeature = regionsGeoData.features.find(f => f.properties.nom === selectedRegionName);
            if (regionFeature) return geoConicConformal().fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 180]], regionFeature);
        }
        return geoConicConformal().fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 180]], geoData);
    }, [geoData, regionsGeoData, selectedRegionName]);

    const pathGenerator = useMemo(() => projection ? geoPath().projection(projection) : null, [projection]);

    const combinedPath = useMemo(() => {
        if (!geoData || !pathGenerator) return "";
        if (selectedRegionName !== "France" && regionsGeoData) {
            const regionFeature = regionsGeoData.features.find(f => f.properties.nom === selectedRegionName);
            if (regionFeature) return pathGenerator(regionFeature);
        }
        return geoData.features.map(f => pathGenerator(f)).join(" ");
    }, [geoData, regionsGeoData, selectedRegionName, pathGenerator]);

    const voronoiCells = useMemo(() => {
        if (!projection || !stations.length) return [];
        const points = stations.map(s => projection([s.lon, s.lat]));
        const delaunay = Delaunay.from(points);
        const voronoi = delaunay.voronoi([0, 0, WIDTH, HEIGHT]);
        return stations.map((s, i) => ({ station: s, path: voronoi.renderCell(i) }));
    }, [projection, stations]);

    const interpolatedGrid = useMemo(() => {
        if (!isSmooth || stations.length < 20 || !projection) return null;
        const gridResX = 60, gridResY = 55;
        const grid = [];
        for (let y = 0; y < gridResY; y++) {
            for (let x = 0; x < gridResX; x++) {
                const posX = (x / gridResX) * WIDTH;
                const posY = (y / gridResY) * HEIGHT;
                const geoCoords = projection.invert([posX, posY]);
                if (!geoCoords) continue;
                let weightSum = 0, valueSum = 0;
                stations.forEach(s => {
                    const dx = s.lon - geoCoords[0], dy = s.lat - geoCoords[1];
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 6) {
                        const w = 1 / (Math.pow(d2, 1.5) + 0.001);
                        weightSum += w;
                        valueSum += s.value * w;
                    }
                });
                if (weightSum > 0) {
                    const finalVal = valueSum / weightSum;
                    // Seuil minimum pour afficher
                    const threshold = activeParam === 'rain' ? 0.5 : activeParam === 'wind' ? 28 : -999;
                    if (finalVal > threshold) {
                        grid.push({
                            x: posX, y: posY, val: finalVal,
                            opacity: activeParam === 'tn' || activeParam === 'tx' ? 0.85 : (finalVal < 40 ? 0.4 : finalVal < 70 ? 0.6 : 0.9),
                            w: WIDTH / gridResX, h: HEIGHT / gridResY
                        });
                    }
                }
            }
        }
        return grid;
    }, [isSmooth, stations, projection, activeParam]);

    const handleExport = () => {
        const el = document.getElementById("monthly-map-container");
        if (!el) return;
        html2canvas(el, { scale: 2, useCORS: true }).then(canvas => {
            const link = document.createElement("a");
            const monthStr = String(selectedMonth).padStart(2, '0');
            link.download = `carte-mensuelle-${activeParam}-${selectedYear}-${monthStr}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    };

    const monthName = format(new Date(selectedYear, selectedMonth - 1, 1), "MMMM yyyy", { locale: fr });
    const ParamIcon = paramConfig.icon;

    // Générer les options de mois (à partir de février 2026)
    const monthOptions = useMemo(() => {
        const opts = [];
        const startYear = 2026;
        const startMonth = 2;
        const nowDate = new Date();
        let y = startYear;
        let m = startMonth;
        while (y < nowDate.getFullYear() || (y === nowDate.getFullYear() && m <= nowDate.getMonth() + 1)) {
            opts.push({ year: y, month: m, label: format(new Date(y, m - 1, 1), "MMMM yyyy", { locale: fr }) });
            m++;
            if (m > 12) { m = 1; y++; }
        }
        return opts;
    }, []);

    // Nombre de valeurs à afficher avec décimales
    const valueFixed = activeParam === 'wind' ? 0 : 1;

    // Légende pour la carte intégrée
    const filteredLegend = paramConfig.scale.filter(paramConfig.legendFilter);

    return (
        <div className="wind-map-page" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <header style={{
                maxWidth: '1300px', margin: '0 auto 20px', display: 'flex', flexDirection: 'column', gap: '15px',
                background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ParamIcon style={{ color: paramConfig.color }} size={28} />
                            Carte Mensuelle : {paramConfig.label}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <Calendar size={16} style={{ color: paramConfig.color }} />
                            <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '600', textTransform: 'capitalize' }}>{monthName}</span>
                            {loading && <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600' }}>— {progress}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Sélecteur de paramètre */}
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '3px' }}>
                            {Object.entries(PARAMS).map(([key, cfg]) => {
                                const Icon = cfg.icon;
                                return (
                                    <button key={key} onClick={() => setActiveParam(key)} style={{
                                        padding: '6px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                        fontWeight: '800', fontSize: '0.78rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px',
                                        background: activeParam === key ? cfg.color : 'transparent',
                                        color: activeParam === key ? 'white' : '#64748b'
                                    }}>
                                        <Icon size={14} /> {key === 'wind' ? 'Vent' : key === 'rain' ? 'Pluie' : key === 'tn' ? 'Tn' : 'Tx'}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sélecteur de mois */}
                        <div style={{ position: 'relative' }}>
                            <select
                                value={`${selectedYear}-${selectedMonth}`}
                                onChange={(e) => {
                                    const [y, m] = e.target.value.split('-').map(Number);
                                    setSelectedYear(y);
                                    setSelectedMonth(m);
                                }}
                                style={{
                                    padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                    background: '#f8fafc', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b',
                                    outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '30px',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {monthOptions.map(opt => (
                                    <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                        </div>

                        {/* Sélecteur de Région */}
                        <div style={{ position: 'relative' }}>
                            <select value={selectedRegionName} onChange={(e) => setSelectedRegionName(e.target.value)}
                                style={{
                                    padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                    background: '#f8fafc', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b',
                                    outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '30px'
                                }}>
                                <option value="France">Toute la France</option>
                                {regionsGeoData?.features.map(f => (
                                    <option key={f.properties.nom} value={f.properties.nom}>{f.properties.nom}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={() => setShowLabels(!showLabels)} style={{ ...navBtnStyle, background: showLabels ? '#fef3c7' : 'transparent', color: showLabels ? '#d97706' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: '1px solid #e2e8f0' }}>VALEURS</button>
                            <button onClick={() => setShowRegions(!showRegions)} style={{ ...navBtnStyle, background: showRegions ? '#fef3c7' : 'transparent', color: showRegions ? '#d97706' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: '1px solid #e2e8f0' }}>RÉGIONS</button>
                            <button onClick={() => setIsSmooth(!isSmooth)} style={{ ...navBtnStyle, background: isSmooth ? '#fef3c7' : 'transparent', color: isSmooth ? '#d97706' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: '1px solid #e2e8f0' }}>LISSAGE</button>
                            {activeParam !== 'wind' && (
                                <button onClick={() => setUseAltScale(!useAltScale)} style={{ ...navBtnStyle, background: useAltScale ? '#f3e8ff' : 'transparent', color: useAltScale ? '#7c3aed' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: '1px solid #e2e8f0' }}>
                                    {useAltScale ? 'MODÈLE MF' : 'STANDARD'}
                                </button>
                            )}
                        </div>

                        <button onClick={loadMonthlyData} disabled={loading} style={iconBtnStyle} title="Actualiser">
                            <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={handleExport} style={{ ...iconBtnStyle, background: '#1e293b', color: 'white' }} title="Exporter l'image">
                            <Download size={22} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 18px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569', minWidth: 'fit-content' }}>Titre personnalisé :</span>
                    <input type="text" value={mapTitle} onChange={(e) => setMapTitle(e.target.value)}
                        placeholder="Ex: Bilan mensuel..."
                        style={{ flex: 1, padding: '10px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                    />
                </div>
            </header>

            <main style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '25px', paddingBottom: '30px' }}>
                <div ref={mapContainerRef} id="monthly-map-container" style={{
                    background: 'white', borderRadius: '4px', padding: '0', boxShadow: 'none', position: 'relative',
                    aspectRatio: '1000 / 920', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', border: '1px solid #000'
                }}>
                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                            <div className="loader" style={{ width: '48px', height: '48px', border: '5px solid #e2e8f0', borderTopColor: paramConfig.color, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ marginTop: '20px', fontWeight: '700', color: '#1e40af', fontSize: '1.1rem' }}>{progress || 'Chargement...'}</p>
                            <div style={{ marginTop: '10px', width: '200px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${(daysInMonth.length > 0 ? (parseInt(progress.match(/\d+/) || [0]) / daysInMonth.length) * 100 : 0)}%`, height: '100%', background: paramConfig.color, transition: 'width 0.3s', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                    )}

                    {geoData && !error && (
                        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: '100%', height: '100%' }}>
                            <defs>
                                <clipPath id="france-clip-monthly"><path d={combinedPath} /></clipPath>
                                <filter id="grid-blur-monthly"><feGaussianBlur stdDeviation="12" /></filter>
                            </defs>

                            {/* Fond pour les températures */}
                            {(activeParam === 'tn' || activeParam === 'tx') && (
                                <g clipPath="url(#france-clip-monthly)">
                                    <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#e2e8f0" />
                                </g>
                            )}

                            <g clipPath="url(#france-clip-monthly)">
                                {isSmooth && interpolatedGrid ? (
                                    <g filter="url(#grid-blur-monthly)">
                                        {interpolatedGrid.map((p, i) => (
                                            <rect key={`grid-${i}`} x={p.x - 1} y={p.y - 1} width={p.w + 2} height={p.h + 2}
                                                fill={getColorForParam(p.val, activeParam, useAltScale)} fillOpacity={p.opacity} />
                                        ))}
                                    </g>
                                ) : (
                                    <g>
                                        {voronoiCells?.map((cell, idx) => (
                                            <path key={`cell-${cell.station.id}-${idx}`} d={cell.path}
                                                fill={getColorForParam(cell.station.value, activeParam, useAltScale)}
                                                style={{ transition: 'fill 0.4s ease' }} />
                                        ))}
                                    </g>
                                )}
                            </g>

                            <g fill="none" stroke="black" strokeWidth="0.2" strokeOpacity="0.4">
                                {geoData.features.map((f, idx) => (
                                    <path key={`dept-${f.properties.code || idx}`} d={pathGenerator(f)} />
                                ))}
                            </g>

                            {showRegions && regionsGeoData && (
                                <g fill="none" stroke="black" strokeWidth="1.2" strokeOpacity="1">
                                    {regionsGeoData.features.map((f, idx) => (
                                        <path key={`region-${f.properties.code || f.properties.nom || idx}`} d={pathGenerator(f)} />
                                    ))}
                                </g>
                            )}

                            <path d={combinedPath} fill="none" stroke="black" strokeWidth="1.5" />

                            <g>
                                {stations.map(s => {
                                    const coords = projection([s.lon, s.lat]);
                                    if (!coords) return null;
                                    const highContrast = (activeParam === 'wind' && s.value > 100) || (activeParam === 'rain' && s.value > 80) || ((activeParam === 'tn' || activeParam === 'tx') && (s.value < -2 || s.value > 35));
                                    return (
                                        <g key={`marker-${s.id}`} transform={`translate(${coords[0]}, ${coords[1]})`}
                                            style={{ cursor: 'pointer' }}
                                            onMouseEnter={(e) => {
                                                const rect = mapContainerRef.current?.getBoundingClientRect();
                                                if (rect) setHoveredStation({ ...s, x: e.clientX - rect.left, y: e.clientY - rect.top });
                                            }}
                                            onMouseLeave={() => setHoveredStation(null)}
                                            onClick={() => navigate(`/observations/station/${s.id}`)}
                                        >
                                            <circle r={3} fill="transparent" />
                                            <circle r={0.6} fill="black" fillOpacity="0.2" />
                                            {showLabels && (activeParam !== 'rain' || s.value >= 0.1) && (
                                                <text y={selectedRegionName === "France" ? -6 : 0} dy={selectedRegionName === "France" ? 0 : "0.35em"} textAnchor="middle" style={{
                                                    fontSize: selectedRegionName === "France" ? '13px' : '25px', fontWeight: 'bold',
                                                    fill: highContrast ? '#fff' : '#000',
                                                    stroke: highContrast ? '#000' : '#fff',
                                                    strokeWidth: selectedRegionName === "France" ? '1.5px' : '3.5px', paintOrder: 'stroke',
                                                    pointerEvents: 'none', fontFamily: 'sans-serif'
                                                }}>
                                                    {Math.round(s.value)}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>
                    )}

                    {/* Tooltip au survol */}
                    {hoveredStation && (
                        <div style={{
                            position: 'absolute',
                            left: hoveredStation.x + 15, top: hoveredStation.y - 10,
                            background: 'rgba(15,23,42,0.95)', color: 'white',
                            padding: '8px 12px', borderRadius: '8px',
                            fontSize: '0.8rem', fontWeight: '700',
                            pointerEvents: 'none', zIndex: 20,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            whiteSpace: 'nowrap', maxWidth: '250px'
                        }}>
                            <div style={{ fontWeight: '800', marginBottom: '2px' }}>{hoveredStation.name}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Station {hoveredStation.id} — Dpt {hoveredStation.id.substring(0, 2)}</div>
                            <div style={{ marginTop: '4px', fontSize: '1rem', fontWeight: '900', color: paramConfig.color }}>
                                {activeParam === 'wind' ? Math.round(hoveredStation.value) : hoveredStation.value.toFixed(1)} {paramConfig.unit}
                            </div>
                        </div>
                    )}

                    {/* Titre Image */}
                    <div style={{ position: 'absolute', bottom: '55px', left: '30px', padding: '12px 20px', background: 'rgba(255,255,255,0.85)', borderRadius: '8px', border: '1px solid #000' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: '1000', color: '#000', textTransform: 'uppercase', lineHeight: '1.2' }}>{mapTitle}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000', marginTop: '4px', textTransform: 'capitalize' }}>{monthName}</div>
                    </div>

                    {/* Logo */}
                    <div style={{ position: 'absolute', bottom: '55px', right: '30px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <img src="/logo.jpg" alt="Logo" style={{ height: '60px', borderRadius: '8px', border: '1px solid #000', background: 'white' }} />
                        <span style={{ fontSize: '0.75rem', color: '#000', fontWeight: '900', letterSpacing: '0.05em' }}>WWW.METEO-CLIMAT.PRO</span>
                    </div>

                    {/* Légende Horizontale (sous la carte, pas de chevauchement) */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'rgba(255,255,255,0.95)',
                        padding: '6px 8px',
                        borderTop: '1px solid #000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '1px', flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: '10px', fontWeight: '1000', color: '#000', marginRight: '4px' }}>{paramConfig.unit}</span>
                        {(() => {
                            // Pour les températures (beaucoup d'entrées), on échantillonne 1 sur 2
                            const isTemp = activeParam === 'tn' || activeParam === 'tx';
                            const items = filteredLegend.filter((_, i) => isTemp ? i % 2 === 0 : true);
                            return items.map(range => (
                                <div key={range.min} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: isTemp ? '22px' : '26px', height: '14px', background: range.color, border: '0.5px solid rgba(0,0,0,0.3)' }} />
                                    <span style={{ fontSize: '7px', fontWeight: '800', color: '#000', marginTop: '1px' }}>{range.min}</span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Panneau Latéral */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Top Valeurs */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 15px', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ParamIcon size={18} style={{ color: paramConfig.color }} />
                            Top {paramConfig.label} — {monthName}
                        </h3>
                        <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
                            {stations.length > 0 ? (
                                stations.slice(0, 20).map((s, i) => (
                                    <div key={s.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '7px 0', borderBottom: i === 19 ? 'none' : '1px solid #f1f5f9'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '170px' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Dpt {s.id.substring(0, 2)}</span>
                                        </div>
                                        <div style={{
                                            background: getColorForParam(s.value, activeParam, useAltScale),
                                            color: ((activeParam === 'wind' && s.value > 100) || (activeParam === 'rain' && s.value > 80) || (s.value < -2 || s.value > 35)) ? 'white' : '#1e293b',
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800', whiteSpace: 'nowrap'
                                        }}>
                                            {Math.round(s.value)} <small>{paramConfig.unit}</small>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>Aucune donnée</p>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ background: '#e0f2fe', borderRadius: '20px', padding: '15px', display: 'flex', gap: '12px' }}>
                        <Info style={{ color: '#0369a1', flexShrink: 0 }} size={20} />
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.4' }}>
                            Données agrégées sur l'ensemble du mois à partir des résumés quotidiens Météo-France.
                            {activeParam === 'rain' && " Cumul = somme des précipitations quotidiennes par station."}
                            {activeParam === 'wind' && " Valeur = rafale maximale enregistrée dans le mois."}
                            {activeParam === 'tn' && " Valeur = température minimale absolue du mois."}
                            {activeParam === 'tx' && " Valeur = température maximale absolue du mois."}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

const navBtnStyle = {
    padding: '6px', borderRadius: '8px', border: 'none',
    background: 'transparent', cursor: 'pointer', color: '#64748b',
    display: 'flex', alignItems: 'center', transition: 'all 0.2s'
};

const iconBtnStyle = {
    width: '40px', height: '40px', borderRadius: '12px',
    border: '1px solid #e2e8f0', background: 'white',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#64748b', transition: 'all 0.2s'
};

export default MonthlyMapsHub;
