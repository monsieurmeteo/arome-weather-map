import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { geoConicConformal, geoPath } from "d3-geo";
import { supabase } from "../../services/api";
import { Download, RefreshCw, AlertCircle, Droplets, Calendar, ChevronLeft, ChevronRight, ChevronDown, Info } from "lucide-react";
import html2canvas from "html2canvas";
import { format, isValid, subDays, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import stationNamesData from "../../data/stationNames.json";
import stationsMetadata from "../../data/stationsMetadata.json";
import stationsListData from "../../data/stations_list.json";
import { Delaunay } from "d3-delaunay";
import { REGIONS } from "../../data/departments";// Échelle de couleurs officielle pour les cumuls de pluie 24h (extraite de la légende fournie)
const RAIN_SCALE = [
    { min: 0, max: 1, color: '#ffffff', label: '< 1' },
    { min: 1, max: 5, color: '#dcf0dc', label: '1 - 5' },
    { min: 5, max: 10, color: '#c8e6c8', label: '5 - 10' },
    { min: 10, max: 20, color: '#a3d4a3', label: '10 - 20' },
    { min: 20, max: 30, color: '#ffe680', label: '20 - 30' },
    { min: 30, max: 40, color: '#ffd24d', label: '30 - 40' },
    { min: 40, max: 50, color: '#ffa64d', label: '40 - 50' },
    { min: 50, max: 60, color: '#ff8533', label: '50 - 60' },
    { min: 60, max: 80, color: '#ff6600', label: '60 - 80' },
    { min: 80, max: 100, color: '#ff3300', label: '80 - 100' },
    { min: 100, max: 120, color: '#cc0000', label: '100 - 120' },
    { min: 120, max: 150, color: '#990066', label: '120 - 150' },
    { min: 150, max: 200, color: '#cc00cc', label: '150 - 200' },
    { min: 200, max: 250, color: '#9966ff', label: '200 - 250' },
    { min: 250, max: 300, color: '#6699ff', label: '250 - 300' },
    { min: 300, max: 350, color: '#66ccff', label: '300 - 350' },
    { min: 350, max: 400, color: '#99e6ff', label: '350 - 400' },
    { min: 400, max: 450, color: '#ccf2ff', label: '400 - 450' },
    { min: 450, max: 500, color: '#e6f7ff', label: '450 - 500' },
    { min: 500, max: Infinity, color: '#f0f0f0', label: '> 500' },
];

const RAIN_SCALE_LIVE = [
    { min: 0, max: 0.2, color: '#ffffff', label: '< 0.2' },
    { min: 0.2, max: 0.6, color: '#dcf0dc', label: '0.2 - 0.6' },
    { min: 0.6, max: 1.2, color: '#a3d4a3', label: '0.6 - 1.2' },
    { min: 1.2, max: 2.5, color: '#8cd5ff', label: '1.2 - 2.5' },
    { min: 2.5, max: 5.0, color: '#3399ff', label: '2.5 - 5.0' },
    { min: 5.0, max: 10.0, color: '#cc00cc', label: '5.0 - 10' },
    { min: 10.0, max: Infinity, color: '#6600aa', label: '> 10' },
];

const getRainColor = (value, scale = RAIN_SCALE) => {
    if (value === null || value === undefined || value <= 0) return '#ffffff';
    const range = scale.find(r => value >= r.min && value < r.max);
    return range ? range.color : scale[scale.length - 1].color;
};

// Échelle alternative Météo-France "Modèle" (légende officielle 0 à 800mm)
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

const RainfallMap = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [geoData, setGeoData] = useState(null);
    const [regionsGeoData, setRegionsGeoData] = useState(null);
    const [deptData, setDeptData] = useState({});
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRealTime, setIsRealTime] = useState(true);
    const [rainMode, setRainMode] = useState("cumul"); // "cumul" ou "direct"
    const [mapTitle, setMapTitle] = useState("Cumuls de pluie en 24h");
    const [showLabels, setShowLabels] = useState(true);
    const [showRegions, setShowRegions] = useState(true);
    const [showOnlyRain, setShowOnlyRain] = useState(false);
    const [isSmooth, setIsSmooth] = useState(true);
    const [selectedRegionName, setSelectedRegionName] = useState("France");
    const [hoveredStation, setHoveredStation] = useState(null);
    const [useAltScale, setUseAltScale] = useState(false);
    const [lastDataTimestamp, setLastDataTimestamp] = useState(null);
    const mapContainerRef = useRef(null);

    const activeRainScale = rainMode === 'direct' ? RAIN_SCALE_LIVE : (useAltScale ? RAIN_SCALE_MF : RAIN_SCALE);

    const WIDTH = 1000;
    const HEIGHT = 900;

    const stationsLookup = useMemo(() => {
        const map = {};
        if (stationsListData && stationsListData.features) {
            stationsListData.features.forEach(f => {
                const sid = f.properties.num;
                map[sid] = {
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0],
                    name: f.properties.nom
                };
            });
        }
        return map;
    }, []);

    useEffect(() => {
        fetch("/data/departements-version-simplifiee.geojson")
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Erreur GeoJSON Dépt:", err));

        fetch("/data/regions-version-simplifiee.geojson")
            .then(res => res.json())
            .then(data => setRegionsGeoData(data))
            .catch(err => console.error("Erreur GeoJSON Régions:", err));
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const realTime = selectedDate === today;
        setIsRealTime(realTime);
        if (!realTime && rainMode === "direct") {
            setRainMode("cumul");
        }
    }, [selectedDate, rainMode]);

    // Auto-update title when mode changes
    useEffect(() => {
        if (rainMode === "cumul") {
            setMapTitle("Cumuls de pluie en 24h");
        } else {
            setMapTitle("Intensité de pluie en Temps Réel (6 mn)");
        }
    }, [rainMode]);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            let rainMap = {};
            let stationList = [];

            try {
                if (rainMode === "direct") {
                    console.log("[RainfallMap] Chargement des précipitations en temps réel...");
                    let liveData = [];
                    let from = 0;
                    const batchSize = 1000;
                    let hasMore = true;

                    while (hasMore) {
                        const { data, error: liveError } = await supabase
                            .rpc('get_france_live')
                            .range(from, from + batchSize - 1);

                        if (liveError) throw liveError;
                        if (data && data.length > 0) {
                            liveData.push(...data);
                            if (data.length < batchSize) hasMore = false;
                            else from += batchSize;
                        } else {
                            hasMore = false;
                        }
                    }

                    if (liveData && liveData.length > 0) {
                        let maxTimestamp = null;
                        liveData.forEach(item => {
                            if (item.obs_time) {
                                const d = new Date(item.obs_time);
                                if (!maxTimestamp || d > maxTimestamp) {
                                    maxTimestamp = d;
                                }
                            }
                        });
                        setLastDataTimestamp(maxTimestamp);

                        const uniqueStations = new Map();
                        liveData.forEach(s => {
                            const rainVal = s.rain; // Precipitation in last 6 minutes is 'rain' in get_france_live
                            if (rainVal !== null && rainVal !== undefined && !isNaN(rainVal)) {
                                let sid = String(s.station_id);
                                if (sid.length === 7) sid = "0" + sid;

                                const meta = stationsLookup[sid];
                                const lat = meta?.lat;
                                const lon = meta?.lon;

                                if (lat && lon) {
                                    const geoKey = `${(Math.round(lat * 20) / 20).toFixed(2)}_${(Math.round(lon * 20) / 20).toFixed(2)}`;
                                    const existing = uniqueStations.get(geoKey);
                                    if (!existing || rainVal > existing.value) {
                                        uniqueStations.set(geoKey, {
                                            id: sid,
                                            lat,
                                            lon,
                                            value: rainVal,
                                            name: stationNamesData[sid] || meta?.name || sid
                                        });
                                    }
                                }
                            }
                        });

                        stationList = Array.from(uniqueStations.values());

                        console.log(`[RainfallMap] ${stationList.length} stations temps réel uniques.`);
                    }
                } else {
                    let allData = [];
                    let from = 0;
                    const batchSize = 1000;
                    let hasMore = true;

                    while (hasMore) {
                        const { data, error: rpcError } = await supabase
                            .rpc('get_daily_extremes_fast', {
                                target_date: selectedDate,
                                dept_codes: []
                            })
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

                    if (allData.length < 300) {
                        console.log(`[RainfallMap] Mode FAST incomplet (${allData.length} st.), passage en mode FULL SCAN...`);
                        allData = [];
                        from = 0;
                        hasMore = true;
                        while (hasMore) {
                            const { data, error: rpcError } = await supabase
                                .rpc('get_daily_extremes_full', { target_date: selectedDate })
                                .range(from, from + batchSize - 1);

                            if (rpcError) throw rpcError;
                            if (data && data.length > 0) {
                                allData.push(...data);
                                if (data.length < batchSize) hasMore = false;
                                else from += batchSize;
                            } else {
                                hasMore = false;
                            }
                        }
                    }

                    if (allData.length > 0) {
                        console.log(`[RainfallMap] ${allData.length} stations traitées pour le ${selectedDate}`);

                        const uniqueStations = new Map();

                        allData.forEach(s => {
                            const rain = s.rain_total;
                            if (rain !== null && rain !== undefined && rain >= 0) {
                                let sid = String(s.station_id);
                                if (sid.length === 7) sid = "0" + sid;

                                const dept = sid.substring(0, 2);
                                rainMap[dept] = Math.max(rainMap[dept] || 0, rain);

                                const meta = stationsLookup[sid];
                                const lat = meta?.lat || s.lat;
                                const lon = meta?.lon || s.lon;

                                if (lat && lon) {
                                    const geoKey = `${(Math.round(lat * 20) / 20).toFixed(2)}_${(Math.round(lon * 20) / 20).toFixed(2)}`;

                                    if (!uniqueStations.has(geoKey) || uniqueStations.get(geoKey).value < rain) {
                                        uniqueStations.set(geoKey, {
                                            id: sid,
                                            lat,
                                            lon,
                                            value: rain,
                                            name: stationNamesData[sid] || meta?.name || s.station_name || sid
                                        });
                                    }
                                }
                            }
                        });

                        stationList = Array.from(uniqueStations.values());

                        console.log(`[RainfallMap] ${stationList.length} stations uniques après regroupement.`);
                    }
                }
            } catch (err) {
                console.error("[RainfallMap] Erreur critique de chargement:", err);
            }

            setDeptData(rainMap);
            setStations(stationList.sort((a, b) => b.value - a.value));

            // Capturer le timestamp max pour afficher l'heure de mise à jour
            let maxTimestamp = null;
            if (isRealTime) {
                try {
                    const { data: latestObs } = await supabase
                        .from('observations_6mn')
                        .select('timestamp')
                        .order('timestamp', { ascending: false })
                        .limit(1);
                    if (latestObs && latestObs[0]) {
                        maxTimestamp = new Date(latestObs[0].timestamp);
                    }
                } catch (err) {
                    console.warn("Erreur fetch latest obs timestamp:", err);
                }
            }
            if (rainMode === "direct" && !maxTimestamp && stationList.length > 0) {
                // Si on est en direct, on a déjà extrait setLastDataTimestamp plus haut
            } else {
                setLastDataTimestamp(maxTimestamp);
            }

            if (stationList.length === 0) {
                setError(rainMode === "direct" ? "Aucune précipitation en cours sur les 6 dernières minutes." : "Aucune donnée de pluie archivée pour cette date.");
            }
        } catch (err) {
            console.error("Erreur chargement données pluie:", err);
            setError("Impossible de charger les données météo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedDate, isRealTime, rainMode]);

    // Auto-refresh in real-time mode every 3 minutes
    useEffect(() => {
        if (rainMode !== "direct" || !isRealTime) return;
        const interval = setInterval(() => {
            console.log("[RainfallMap] Auto-refreshing real-time rain observations...");
            loadData();
        }, 3 * 60 * 1000);
        return () => clearInterval(interval);
    }, [rainMode, isRealTime, selectedDate]);

    const projection = useMemo(() => {
        if (!geoData) return null;
        let proj;
        if (selectedRegionName !== "France" && regionsGeoData) {
            const regionFeature = regionsGeoData.features.find(f => f.properties.nom === selectedRegionName);
            if (regionFeature) proj = geoConicConformal().fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 180]], regionFeature);
        }
        if (!proj) {
            proj = geoConicConformal().fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 180]], geoData);
        }
        const t = proj.translate();
        return proj.translate([t[0] - 70, t[1]]);
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

    // Filtrage synchrone des stations par région pour éliminer les flashs visuels
    const visibleStations = useMemo(() => {
        let result = stations;
        if (selectedRegionName !== "France" && REGIONS[selectedRegionName]) {
            const regionDepts = REGIONS[selectedRegionName];
            result = result.filter(s => regionDepts.includes(s.id.startsWith("20") ? "2A" : s.id.substring(0, 2)));
        }
        if (showOnlyRain) {
            result = result.filter(s => s.value > 0);
        }
        return result;
    }, [stations, selectedRegionName, showOnlyRain]);

    const voronoiCells = useMemo(() => {
        if (!projection || !visibleStations.length) return [];
        const points = visibleStations.map(s => projection([s.lon, s.lat]));
        const delaunay = Delaunay.from(points);
        const voronoi = delaunay.voronoi([0, 0, WIDTH, HEIGHT]);
        return visibleStations.map((s, i) => ({
            station: s,
            path: voronoi.renderCell(i)
        }));
    }, [projection, visibleStations]);

    const interpolatedGrid = useMemo(() => {
        // Pour les petites régions, on réduit le seuil de stations requis à 5 au lieu de 20
        if (!isSmooth || visibleStations.length < 5 || !projection) return null;

        const gridResX = 60;
        const gridResY = 55;
        const grid = [];

        for (let y = 0; y < gridResY; y++) {
            for (let x = 0; x < gridResX; x++) {
                const posX = (x / gridResX) * WIDTH;
                const posY = (y / gridResY) * HEIGHT;

                const geoCoords = projection.invert([posX, posY]);
                if (!geoCoords) continue;

                let weightSum = 0;
                let valueSum = 0;

                visibleStations.forEach(s => {
                    const dx = s.lon - geoCoords[0];
                    const dy = s.lat - geoCoords[1];
                    const d2 = dx * dx + dy * dy;

                    if (d2 < 6) {
                        const w = 1 / (Math.pow(d2, 1.5) + 0.001);
                        weightSum += w;
                        valueSum += s.value * w;
                    }
                });

                if (weightSum > 0) {
                    const finalVal = valueSum / weightSum;
                    if (finalVal > 0.5) {
                        grid.push({
                            x: posX,
                            y: posY,
                            val: finalVal,
                            opacity: finalVal < 2 ? 0.3 : finalVal < 10 ? 0.6 : 0.9,
                            w: WIDTH / gridResX,
                            h: HEIGHT / gridResY
                        });
                    }
                }
            }
        }
        return grid;
    }, [isSmooth, visibleStations, projection]);

    const handleExport = () => {
        const el = document.getElementById("rain-map-container");
        if (!el) return;
        html2canvas(el, { scale: 2, useCORS: true }).then(canvas => {
            const link = document.createElement("a");
            link.download = `carte-pluie-${selectedDate}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    };

    const changeDate = (days) => {
        const d = new Date(selectedDate);
        const newDate = days > 0 ? addDays(d, days) : subDays(d, Math.abs(days));
        const today = new Date();
        if (newDate <= today) {
            setSelectedDate(newDate.toISOString().split('T')[0]);
        }
    };

    return (
        <div className="wind-map-page" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <header style={{
                maxWidth: '1300px',
                margin: '0 auto 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                background: 'white',
                padding: '24px',
                borderRadius: '20px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Droplets style={{ color: '#0ea5e9' }} size={28} /> {rainMode === 'cumul' ? 'Pluie 24h' : 'Pluie Direct'} : {selectedRegionName}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRealTime ? '#10b981' : '#f59e0b' }}></div>
                            <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
                                {isRealTime ? "Météo-France (Temps Réel)" : `Archives du ${format(new Date(selectedDate), "EEEE d MMMM yyyy", { locale: fr })}`}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '10px' }}>
                        {/* Sélecteur Cumul / Temps Réel */}
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '3px' }}>
                            {isRealTime && (
                                <button
                                    onClick={() => setRainMode('direct')}
                                    style={{
                                        padding: '6px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                        fontWeight: '800', fontSize: '0.85rem', transition: 'all 0.2s',
                                        background: rainMode === 'direct' ? '#0ea5e9' : 'transparent',
                                        color: rainMode === 'direct' ? 'white' : '#64748b'
                                    }}
                                >
                                    Temps Réel
                                </button>
                            )}
                            <button
                                onClick={() => setRainMode('cumul')}
                                style={{
                                    padding: '6px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                    fontWeight: '800', fontSize: '0.85rem', transition: 'all 0.2s',
                                    background: rainMode === 'cumul' ? '#0ea5e9' : 'transparent',
                                    color: rainMode === 'cumul' ? 'white' : '#64748b'
                                }}
                            >
                                Cumul 24h
                            </button>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <select
                                value={selectedRegionName}
                                onChange={(e) => setSelectedRegionName(e.target.value)}
                                style={{
                                    padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                    background: '#f8fafc', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b',
                                    outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '30px'
                                }}
                            >
                                <option value="France">Toute la France</option>
                                {regionsGeoData?.features.map(f => (
                                    <option key={f.properties.nom} value={f.properties.nom}>{f.properties.nom}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={() => setShowLabels(!showLabels)} style={{ ...navBtnStyle, background: showLabels ? '#e0f2fe' : 'transparent', color: showLabels ? '#0284c7' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: '1px solid #e2e8f0' }}>
                                VALEURS
                            </button>
                            <button onClick={() => setShowRegions(!showRegions)} style={{ ...navBtnStyle, background: showRegions ? '#e0f2fe' : 'transparent', color: showRegions ? '#0284c7' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: '1px solid #e2e8f0' }}>
                                RÉGIONS
                            </button>
                            <button onClick={() => setIsSmooth(!isSmooth)} style={{ ...navBtnStyle, background: isSmooth ? '#e0f2fe' : 'transparent', color: isSmooth ? '#0284c7' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: '1px solid #e2e8f0' }}>
                                LISSAGE
                            </button>
                            <button onClick={() => setUseAltScale(!useAltScale)} style={{ ...navBtnStyle, background: useAltScale ? '#f3e8ff' : 'transparent', color: useAltScale ? '#7c3aed' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: '1px solid #e2e8f0' }}>
                                {useAltScale ? 'MODÈLE MF' : 'STANDARD'}
                            </button>
                            <button onClick={() => setShowOnlyRain(!showOnlyRain)} style={{ ...navBtnStyle, background: showOnlyRain ? '#dcfce7' : 'transparent', color: showOnlyRain ? '#16a34a' : '#64748b', fontSize: '0.75rem', fontWeight: '800', padding: '6px 10px', border: `1px solid ${showOnlyRain ? '#86efac' : '#e2e8f0'}` }}>
                                💧 PLUIE SEULT
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '6px', borderRadius: '14px' }}>
                            <button onClick={() => changeDate(-1)} style={navBtnStyle}><ChevronLeft size={20} /></button>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                <Calendar size={18} style={{ marginRight: '10px', color: '#0ea5e9' }} />
                                <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>{format(new Date(selectedDate), "dd MMM yyyy", { locale: fr })}</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                />
                            </div>
                            <button
                                onClick={() => changeDate(1)}
                                style={navBtnStyle}
                                disabled={selectedDate === new Date().toISOString().split('T')[0]}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <button onClick={loadData} disabled={loading} style={iconBtnStyle} title="Actualiser">
                            <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={handleExport} style={{ ...iconBtnStyle, background: '#1e293b', color: 'white' }} title="Exporter l'image">
                            <Download size={22} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 18px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569', minWidth: 'fit-content' }}>Titre personnalisé :</span>
                    <input
                        type="text"
                        value={mapTitle}
                        onChange={(e) => setMapTitle(e.target.value)}
                        placeholder="Ex: Épisode Cévenol..."
                        style={{
                            flex: 1, padding: '10px 15px', borderRadius: '10px',
                            border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    />
                </div>
            </header>

            <main style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '25px', paddingBottom: '30px' }}>
                <div ref={mapContainerRef} id="rain-map-container" style={{
                    background: 'white', borderRadius: '4px', padding: '0',
                    boxShadow: 'none', position: 'relative',
                    aspectRatio: '1000 / 920', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', border: '1px solid #000'
                }}>
                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                            <div className="loader" style={{ width: '48px', height: '48px', border: '5px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ marginTop: '20px', fontWeight: '700', color: '#0369a1', fontSize: '1.1rem' }}>Saisie des mesures météo...</p>
                        </div>
                    )}

                    {/* Légende flottante intégrée au téléchargement (haut-droite) */}
                    <div style={{
                        position: 'absolute', top: '15px', right: '15px',
                        background: 'rgba(255, 255, 255, 0.92)', border: '1px solid #000',
                        borderRadius: '8px', padding: '10px 14px', zIndex: 5,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        display: 'flex', flexDirection: 'column', gap: '4px'
                    }}>
                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
                            {rainMode === 'direct' ? 'PLUIE EN 6 MIN (MM)' : 'CUMUL DE PLUIE (MM)'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
                            {activeRainScale.filter(r => r.min >= (rainMode === 'direct' ? 0.2 : 0.5) || r.min === 0).map(range => (
                                <div key={range.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: range.color, border: '0.5px solid rgba(0,0,0,0.2)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '9.5px', fontWeight: '700', color: '#1e293b' }}>{range.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {geoData && !error && (
                        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: '100%', height: '100%' }}>
                            <defs>
                                <clipPath id="france-clip-rain">
                                    <path d={combinedPath} />
                                </clipPath>
                                <filter id="grid-blur-rain">
                                    <feGaussianBlur stdDeviation="12" />
                                </filter>
                            </defs>

                            <g clipPath="url(#france-clip-rain)">
                                {isSmooth && interpolatedGrid ? (
                                    <g filter="url(#grid-blur-rain)">
                                        {interpolatedGrid.map((p, i) => (
                                            <rect
                                                key={`grid-${i}`}
                                                x={p.x - 1} y={p.y - 1}
                                                width={p.w + 2} height={p.h + 2}
                                                fill={getRainColor(p.val, activeRainScale)}
                                                fillOpacity={p.opacity}
                                            />
                                        ))}
                                    </g>
                                ) : (
                                    <g>
                                        {voronoiCells?.map((cell, idx) => (
                                            <path
                                                key={`cell-${cell.station.id}-${idx}`}
                                                d={cell.path}
                                                fill={getRainColor(cell.station.value, activeRainScale)}
                                                style={{ transition: 'fill 0.4s ease' }}
                                            />
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
                                {visibleStations.map(s => {
                                    const coords = projection([s.lon, s.lat]);
                                    if (!coords) return null;
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
                                            {showLabels && (
                                                <text
                                                    y={selectedRegionName === "France" ? -6 : 0}
                                                    dy={selectedRegionName === "France" ? 0 : "0.35em"}
                                                    textAnchor="middle"
                                                    style={{
                                                        fontSize: selectedRegionName === "France" ? '14px' : '28px', 
                                                        fontWeight: 'bold',
                                                        fill: s.value > (rainMode === 'direct' ? 5 : 50) ? '#fff' : '#000',
                                                        stroke: s.value > (rainMode === 'direct' ? 5 : 50) ? '#000' : '#fff',
                                                        strokeWidth: selectedRegionName === "France" ? '2px' : '4px', 
                                                        paintOrder: 'stroke',
                                                        pointerEvents: 'none', fontFamily: 'sans-serif'
                                                    }}
                                                >
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
                            <div style={{ marginTop: '4px', fontSize: '1rem', fontWeight: '900', color: '#38bdf8' }}>{Math.round(hoveredStation.value)} mm</div>
                        </div>
                    )}

                     {/* Bloc Titre Image */}
                     <div style={{ position: 'absolute', bottom: '55px', left: '30px', padding: '12px 20px', background: 'rgba(255,255,255,0.85)', borderRadius: '8px', border: '1px solid #000' }}>
                         <div style={{ fontSize: '1.6rem', fontWeight: '1000', color: '#000', textTransform: 'uppercase', lineHeight: '1.2' }}>{mapTitle}</div>
                         <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000', marginTop: '4px' }}>
                             {format(new Date(selectedDate), "EEEE d MMMM yyyy", { locale: fr })}
                         </div>
                         {lastDataTimestamp && (
                             <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#555', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                 <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: isRealTime ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
                                 Dernière obs. à {lastDataTimestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                             </div>
                         )}
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
                        padding: '6px 12px',
                        borderTop: '1px solid #000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '2px', flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: '10px', fontWeight: '1000', color: '#000', marginRight: '6px' }}>mm</span>
                        {activeRainScale.filter(r => r.min >= (rainMode === 'direct' ? 0.2 : 0.5) && r.max !== Infinity).map(range => (
                            <div key={range.min} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '24px', height: '14px', background: range.color, border: '0.5px solid rgba(0,0,0,0.3)' }} />
                                <span style={{ fontSize: '7px', fontWeight: '800', color: '#000', marginTop: '1px' }}>{range.min}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Légende */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                            {rainMode === 'cumul' ? 'Cumul de Pluie (mm)' : 'Précipitations (mm / 6mn)'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                            {activeRainScale.filter(r => r.min >= (rainMode === 'direct' ? 0.2 : 0.5) || r.min === 0).map(range => (
                                <div key={range.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: range.color, border: '1px solid rgba(0,0,0,0.1)' }}></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>{range.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Pluies */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 15px', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Droplets size={18} style={{ color: '#0ea5e9' }} /> {rainMode === 'cumul' ? 'Top Cumuls' : 'Top Intensités'}
                        </h3>
                        <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
                            {visibleStations.filter(s => s.value >= (rainMode === 'direct' ? 0.2 : 1)).length > 0 ? (
                                [...visibleStations].filter(s => s.value >= (rainMode === 'direct' ? 0.2 : 1)).sort((a, b) => b.value - a.value).slice(0, 15).map((s, i) => (
                                    <div key={s.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '8px 0', borderBottom: i === 14 ? 'none' : '1px solid #f1f5f9'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '180px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Dpt {s.id.substring(0, 2)}</span>
                                        </div>
                                        <div style={{
                                            background: getRainColor(s.value, activeRainScale),
                                            color: s.value > (rainMode === 'direct' ? 5 : 50) ? 'white' : '#1e293b',
                                            padding: '4px 8px', borderRadius: '6px',
                                            fontSize: '0.85rem', fontWeight: '800'
                                        }}>
                                            {Math.round(s.value)} <small>mm</small>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>Aucune donnée</p>
                            )}
                        </div>
                    </div>

                    {/* Infos API */}
                    <div style={{ background: '#e0f2fe', borderRadius: '20px', padding: '15px', display: 'flex', gap: '12px' }}>
                        <Info style={{ color: '#0369a1' }} size={20} />
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.4' }}>
                            Données issues des stations automatiques du réseau Météo-France.
                            {rainMode === 'cumul' 
                                ? " La valeur affichée est le cumul de pluie (RR) sur 24 heures." 
                                : " La valeur affichée correspond aux précipitations relevées au cours des 6 dernières minutes."}
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

export default RainfallMap;
