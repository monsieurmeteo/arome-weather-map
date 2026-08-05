import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { geoConicConformal, geoPath } from "d3-geo";
import { REGIONS, DEPARTMENTS } from "../../data/departments";
import { supabase } from "../../services/api";
import { Download, RefreshCw, AlertCircle, Zap, Clock, Upload, Palette, Type } from "lucide-react";
import html2canvas from "html2canvas";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";

// Cache global
const CACHE = { stations: new Map(), geo: new Map(), preloaded: false };

const MAP_PALETTES = {
    default: { name: "Classique", fill: "#f1f5f9", stroke: "#cbd5e1" },
    dark: { name: "Sombre", fill: "#1e293b", stroke: "#475569" },
    light: { name: "Blanc", fill: "#ffffff", stroke: "#d1d5db" },
};

const HOUR_COLORS = [
    "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", // 0-5h (Bleu)
    "#10b981", "#10b981", "#10b981", "#10b981", "#10b981", "#10b981", // 6-11h (Vert)
    "#EAB308", "#EAB308", "#EAB308", "#EAB308", "#EAB308", "#EAB308", // 12-17h (Jaune)
    "#ef4444", "#ef4444", "#ef4444", "#ef4444", "#ef4444", "#ef4444"  // 18-23h (Rouge)
];

// Couleurs de fond (arrière-plan)
const BG_COLORS = {
    white: "#ffffff",
    light: "#f8fafc",
    dark: "#0f172a",
    blue: "#0c4a6e",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
};

// Liste des départements pour France entière (inclut Corse 2A et 2B)
const ALL_DEPTS = [...DEPARTMENTS.map(d => d.code), '2A', '2B'].filter((v, i, a) => a.indexOf(v) === i);

const VectorRegionPreview = () => {
    const navigate = useNavigate();
    // Sélection géographique
    const [geoMode, setGeoMode] = useState("region"); // "region", "dept", "france"
    const [selectedRegion, setSelectedRegion] = useState("Hauts-de-France");
    const [selectedDept, setSelectedDept] = useState("59");

    const [selectedParam, setSelectedParam] = useState("temp_max");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeMode, setTimeMode] = useState("daily");
    const [selectedHour, setSelectedHour] = useState("12");

    const [geoData, setGeoData] = useState(null);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [perf, setPerf] = useState(0);

    // Options d'affichage
    const [valueColorMode, setValueColorMode] = useState("dynamic");
    const [framedMode, setFramedMode] = useState(false);
    const [showLegend, setShowLegend] = useState(true);
    const [legendPosition, setLegendPosition] = useState("top-right");
    const [mapPalette, setMapPalette] = useState("default");
    const [bgColor, setBgColor] = useState("white");
    const [valueSize, setValueSize] = useState(20);
    const [showShadow, setShowShadow] = useState(false); // Ombre sous les valeurs
    const [customTitle, setCustomTitle] = useState(""); // Titre personnalisé
    const [useBlackText, setUseBlackText] = useState(false); // Texte noir fixe

    const [logoUrl, setLogoUrl] = useState(null);
    const logoInputRef = useRef(null);
    const [strikes, setStrikes] = useState([]);

    const WIDTH = 1200;
    const HEIGHT = 900;

    const PARAMS = {
        temp_max: { label: "T° max", unit: "°C", full: "Températures maximales" },
        temp_min: { label: "T° min", unit: "°C", full: "Températures minimales" },
        wind_gust_max: { label: "Rafales", unit: "km/h", full: "Rafales maximales" },
        wind_speed: { label: "Vent moyen", unit: "km/h", full: "Vent moyen" },
        rain_total: { label: "Pluie", unit: "mm", full: "Précipitations" },
        foudre: { label: "Foudre ⚡", unit: "", full: "Activité électrique (Impacts)" }
    };

    const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

    // Palettes de couleurs pour les valeurs
    const COLOR_SCALES = {
        temp: ['#1e3a8a', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#facc15', '#f97316', '#ef4444', '#991b1b', '#7e22ce'],
        wind: ['#94a3b8', '#10b981', '#84cc16', '#facc15', '#f97316', '#ef4444', '#991b1b'],
        rain: ['#f1f5f9', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e3a8a']
    };

    const getStationColor = (val, type, regionMin, regionMax) => {
        if (val === null || val === undefined) return 'transparent';
        const v = parseFloat(val);
        let palette = type.includes('temp') ? COLOR_SCALES.temp : type.includes('rain') ? COLOR_SCALES.rain : COLOR_SCALES.wind;
        if (regionMax === regionMin) return palette[Math.floor(palette.length / 2)];
        const t = Math.max(0, Math.min(1, (v - regionMin) / (regionMax - regionMin)));
        return palette[Math.min(Math.floor(t * palette.length), palette.length - 1)];
    };

    const getLegendGradient = (type) => {
        let palette = type.includes('temp') ? COLOR_SCALES.temp : type.includes('rain') ? COLOR_SCALES.rain : COLOR_SCALES.wind;
        return `linear-gradient(to right, ${palette.join(', ')})`;
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            const reader = new FileReader();
            reader.onload = (event) => setLogoUrl(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Obtenir les départements selon le mode
    const getTargetDepts = () => {
        if (geoMode === "france") return ALL_DEPTS;
        if (geoMode === "dept") return [selectedDept];
        return REGIONS[selectedRegion] || [];
    };

    // Preload stations
    useEffect(() => {
        const preload = async () => {
            if (CACHE.preloaded || !supabase) return;
            const all = [];
            for (let i = 0; i < 5; i++) {
                const { data } = await supabase.from('stations').select('id, name, lat, lon').range(i * 1000, (i + 1) * 1000 - 1);
                if (!data || data.length === 0) break;
                all.push(...data);
            }
            all.forEach(s => CACHE.stations.set(s.id, s));
            CACHE.preloaded = true;
        };
        preload();
    }, []);

    const loadData = async () => {
        if (!supabase) return;
        setLoading(true);
        setError(null);
        const t0 = performance.now();

        try {
            const regionDepts = getTargetDepts();

            // GeoJSON
            const geoKey = `geo-${geoMode}-${geoMode === 'region' ? selectedRegion : geoMode === 'dept' ? selectedDept : 'france'}`;
            if (!CACHE.geo.has(geoKey)) {
                if (!CACHE.geo.has('base-fr')) {
                    const res = await fetch("/data/departements-version-simplifiee.geojson");
                    CACHE.geo.set('base-fr', await res.json());
                }
                CACHE.geo.set(geoKey, { type: "FeatureCollection", features: CACHE.geo.get('base-fr').features.filter(f => regionDepts.includes(f.properties.code)) });
            }
            setGeoData(CACHE.geo.get(geoKey));

            let rawObs = [];

            if (selectedParam !== 'foudre') { // Only fetch station data if not in foudre mode
                if (timeMode === "daily") {
                    let result = await supabase.rpc('get_daily_extremes_fast', { target_date: selectedDate, dept_codes: regionDepts });
                    if (result.error) result = await supabase.rpc('get_daily_extremes_region', { target_date: selectedDate, dept_codes: regionDepts });
                    if (result.error) {
                        // Pagination pour France entière
                        let allData = [];
                        for (let i = 0; i < 5; i++) {
                            const { data, error } = await supabase.rpc('get_daily_extremes', { target_date: selectedDate }).range(i * 1000, (i + 1) * 1000 - 1);
                            if (error) throw error;
                            if (!data || data.length === 0) break;
                            allData.push(...data);
                        }
                        result = { data: allData.filter(o => regionDepts.includes(o.station_id?.startsWith("20") ? "2A" : o.station_id?.substring(0, 2))) };
                    }
                    if (result.error) throw result.error;
                    rawObs = (result.data || []).map(s => ({ ...s, wind_speed: s.wind_mean_max }));
                } else {
                    const localHour = parseInt(selectedHour);
                    const month = new Date(selectedDate).getMonth();
                    const offset = (month >= 2 && month <= 9) ? 2 : 1;
                    const utcHour = (localHour - offset + 24) % 24;
                    const utcHourStr = String(utcHour).padStart(2, '0');
                    const minTs = `${selectedDate}T${utcHourStr}:00:00Z`;
                    const maxTs = `${selectedDate}T${utcHourStr}:59:59Z`;

                    let allData = [];
                    let from = 0;
                    while (true) {
                        const { data, error } = await supabase.from('observations_6mn').select('station_id, t, ff, fxi, rr_per, dd').gte('timestamp', minTs).lte('timestamp', maxTs).range(from, from + 999);
                        if (error) throw error;
                        if (!data || data.length === 0) break;
                        allData.push(...data);
                        if (data.length < 1000) break;
                        from += 1000;
                    }

                    const filtered = allData.filter(o => regionDepts.includes(o.station_id?.startsWith("20") ? "2A" : o.station_id?.substring(0, 2)));
                    const agg = {};
                    filtered.forEach(o => {
                        if (!agg[o.station_id]) agg[o.station_id] = { station_id: o.station_id, temp_min: o.t, temp_max: o.t, wind_speed: o.ff, wind_gust_max: o.fxi, rain_total: o.rr_per || 0, wind_dir: o.dd };
                        else {
                            const a = agg[o.station_id];
                            if (o.t !== null) { a.temp_min = Math.min(a.temp_min ?? o.t, o.t); a.temp_max = Math.max(a.temp_max ?? o.t, o.t); }
                            if (o.ff !== null) a.wind_speed = Math.max(a.wind_speed || 0, o.ff);
                            if (o.fxi !== null) a.wind_gust_max = Math.max(a.wind_gust_max || 0, o.fxi);
                            if (o.dd !== null) a.wind_dir = o.dd; // Prend la dernière direction dispo
                            a.rain_total += (o.rr_per || 0);
                        }
                    });
                    rawObs = Object.values(agg);
                }
            }

            const final = selectedParam === 'foudre' ? [] : rawObs.filter(o => o.station_id && !o.station_id.startsWith('SIMULATION')).map(o => {
                const meta = CACHE.stations.get(o.station_id);
                if (!meta) return null;
                return { ...o, lat: meta.lat, lon: meta.lon, name: meta.name, value: o[selectedParam], wind_dir: o.wind_dir };
            }).filter(s => s && s.value !== null);

            setStations(final);

            // Fetch Lightning if needed
            if (selectedParam === 'foudre') {
                // FETCH STRATEGY:
                // 1. If Date == TODAY : Use Live API Agate (always fresh)
                // 2. If Date < TODAY : Use Supabase History (archived data)

                const isToday = selectedDate === new Date().toISOString().split('T')[0];

                try {
                    if (isToday) {
                        const res = await fetch('https://meteo-npdc.fr/api/v2/lightning/get_latest?minutes=1440', {
                            referrerPolicy: "no-referrer"
                        });
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);

                        const json = await res.json();
                        if (json.success && Array.isArray(json.data)) {
                            setStrikes(json.data.map(s => {
                                const d = new Date(s.timestamp ? s.timestamp.replace(' ', 'T') : Date.now());
                                const timeMs = d.getTime();
                                const validTime = isNaN(timeMs) ? Date.now() : timeMs;
                                const validD = new Date(validTime);
                                return {
                                    lat: parseFloat(s.latitude),
                                    lon: parseFloat(s.longitude),
                                    time: validTime,
                                    h: validD.getHours(),
                                    raw: validD.toISOString().substring(11, 19)
                                };
                            }));
                        } else {
                            setStrikes([]);
                        }
                    } else {
                        // HISTORICAL MODE (Supabase)
                        const CLEAN_SLATE_DATE = '2026-01-24';

                        if (selectedDate < CLEAN_SLATE_DATE) {
                            console.log("Date antérieure au nettoyage (24/01/2026) -> Ignorée.");
                            setStrikes([]);
                        } else {
                            console.log(`📜 Chargement historique foudre pour ${selectedDate}...`);

                            const startUTC = `${selectedDate}T00:00:00Z`;
                            const endUTC = `${selectedDate}T23:59:59Z`;

                            let allArchived = [];
                            let from = 0;
                            while (true) {
                                const { data, error } = await supabase
                                    .from('lightning_strikes')
                                    .select('lat, lon, strike_time')
                                    .gte('strike_time', startUTC)
                                    .lte('strike_time', endUTC)
                                    .range(from, from + 999);

                                if (error) { console.error("Supabase Error:", error); break; }
                                if (!data || data.length === 0) break;

                                allArchived.push(...data);
                                if (data.length < 1000) break;
                                from += 1000;
                            }

                            // Fallback : Si Supabase est vide pour cette date historique, tenter de charger depuis les archives statiques JSON
                            if (allArchived.length === 0) {
                                try {
                                    const formattedDateFile = selectedDate.replace(/-/g, '');
                                    const ARCHIVE_BASE = 'https://raw.githubusercontent.com/monsieurmeteo/europe-1-v2/master/public/archives_orage';
                                    const res = await fetch(`${ARCHIVE_BASE}/orage_${formattedDateFile}.json?t=${Date.now()}`, { cache: 'no-store' });
                                    if (res.ok) {
                                        const json = await res.json();
                                        if (Array.isArray(json)) {
                                            allArchived = json.map(s => {
                                                const cleanDate = s.date.replace(/\//g, '-');
                                                const dateObj = new Date(`${cleanDate}T${s.heure}:00`);
                                                return {
                                                    lat: parseFloat(s.lat),
                                                    lon: parseFloat(s.lon),
                                                    strike_time: dateObj.toISOString()
                                                };
                                            });
                                        }
                                    }
                                } catch (err) {
                                    console.warn(`Aucune archive statique trouvée pour le générateur de cartes : ${selectedDate}`);
                                }
                            }

                            // Convert to display format
                            setStrikes(allArchived.map(s => {
                                const d = new Date(s.strike_time);
                                return {
                                    lat: s.lat,
                                    lon: s.lon,
                                    time: d.getTime(),
                                    h: d.getHours(),
                                    raw: d.toISOString()
                                };
                            }));
                        }
                    }
                } catch (e) {
                    console.error("Erreur Fetch Foudre Générateur:", e);
                    setStrikes([]);
                }
            } else {
                setStrikes([]);
            }

            setPerf(Math.round(performance.now() - t0));
            if (rawObs.length === 0 && selectedParam !== 'foudre') setError("Aucune donnée pour cette sélection.");
        } catch (err) {
            console.error(err);
            setError("Erreur: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [geoMode, selectedRegion, selectedDept, selectedDate, selectedHour, timeMode, selectedParam]);

    const handleExport = () => {
        const el = document.getElementById("export-container");
        if (!el) return;
        html2canvas(el, { scale: 2, useCORS: true }).then(canvas => {
            const name = geoMode === 'france' ? 'France' : geoMode === 'dept' ? selectedDept : selectedRegion;
            const link = document.createElement("a");
            link.download = `carte-${name}-${selectedParam}-${selectedDate}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    };

    const projection = useMemo(() => {
        if (!geoData) return null;
        const padRight = showLegend && legendPosition.includes('right') ? 260 : 50;
        const padTop = customTitle ? 80 : 50; // Plus d'espace si titre personnalisé
        return geoConicConformal().fitExtent([[50, padTop], [WIDTH - padRight, HEIGHT - 50]], geoData);
    }, [geoData, showLegend, legendPosition, customTitle]);

    const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

    const vals = stations.map(s => s.value);
    const minV = vals.length ? Math.min(...vals) : 0;
    const maxV = vals.length ? Math.max(...vals) : 0;
    const avgV = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : 0;

    const title = useMemo(() => {
        const d = new Date(selectedDate);
        if (!isValid(d)) return "";
        const fDate = format(d, "d MMMM yyyy", { locale: fr });
        const paramInfo = PARAMS[selectedParam] || PARAMS.none;
        return timeMode === 'daily' ? `${paramInfo.full} - ${fDate}` : `${paramInfo.full} - ${fDate} à ${selectedHour}h`;
    }, [selectedDate, selectedHour, timeMode, selectedParam]);

    const mp = MAP_PALETTES[mapPalette];
    const bgStyle = bgColor === 'gradient' ? { background: BG_COLORS.gradient } : { background: BG_COLORS[bgColor] };

    return (
        <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
            <header style={{ maxWidth: '1100px', margin: '0 auto 15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '1.5rem' }}>Cartes Météo</h1>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Zap size={12} /> {perf}ms • {stations.length} stations
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={loadData} disabled={loading} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={handleExport} style={{ padding: '6px 14px', borderRadius: '8px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer' }}>
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                {/* Ligne 1 : Sélections */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                    {/* Mode temps */}
                    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                        {['daily', 'hourly'].map(m => (
                            <button key={m} onClick={() => setTimeMode(m)} style={{ padding: '5px 10px', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', background: timeMode === m ? 'white' : 'transparent', color: timeMode === m ? '#3b82f6' : '#64748b' }}>
                                {m === 'daily' ? 'Jour' : 'Heure'}
                            </button>
                        ))}
                    </div>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                    {timeMode === 'hourly' && (
                        <select value={selectedHour} onChange={e => setSelectedHour(e.target.value)} style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                            {HOURS.map(h => <option key={h} value={h}>{h}h</option>)}
                        </select>
                    )}

                    <div style={{ height: '20px', width: '1px', background: '#e2e8f0' }} />

                    {/* Mode géographique */}
                    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                        {[{ k: 'region', l: 'Région' }, { k: 'dept', l: 'Dépt' }, { k: 'france', l: 'France' }].map(({ k, l }) => (
                            <button key={k} onClick={() => setGeoMode(k)} style={{ padding: '5px 10px', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', background: geoMode === k ? 'white' : 'transparent', color: geoMode === k ? '#10b981' : '#64748b' }}>
                                {l}
                            </button>
                        ))}
                    </div>

                    {geoMode === 'region' && (
                        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', minWidth: '150px' }}>
                            {Object.keys(REGIONS).sort().map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    )}
                    {geoMode === 'dept' && (
                        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', minWidth: '150px' }}>
                            {DEPARTMENTS.map(d => <option key={d.code} value={d.code}>{d.code} - {d.name}</option>)}
                        </select>
                    )}

                    <select value={selectedParam} onChange={e => setSelectedParam(e.target.value)} style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                        {Object.keys(PARAMS).map(k => <option key={k} value={k}>{PARAMS[k].label}</option>)}
                    </select>
                </div>

                {/* Ligne 2 : Options visuelles */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="checkbox" checked={useBlackText} onChange={e => setUseBlackText(e.target.checked)} /> Texte noir
                    </label>
                    <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="checkbox" checked={framedMode} onChange={e => setFramedMode(e.target.checked)} /> Encadré
                    </label>
                    <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} /> Légende
                    </label>
                    <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="checkbox" checked={showShadow} onChange={e => setShowShadow(e.target.checked)} /> Ombre
                    </label>

                    <div style={{ height: '20px', width: '1px', background: '#e2e8f0' }} />

                    {/* Taille valeurs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                        <Type size={14} />
                        <input type="range" min="12" max="32" value={valueSize} onChange={e => setValueSize(parseInt(e.target.value))} style={{ width: '80px' }} />
                        <span>{valueSize}px</span>
                    </div>

                    <div style={{ height: '20px', width: '1px', background: '#e2e8f0' }} />

                    {/* Palette carte */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                        <Palette size={14} />
                        <span>Carte:</span>
                        <select value={mapPalette} onChange={e => setMapPalette(e.target.value)} style={{ padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                            {Object.entries(MAP_PALETTES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                        </select>
                    </div>

                    {/* Fond */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                        <span>Fond:</span>
                        <select value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                            <option value="white">Blanc</option>
                            <option value="light">Gris clair</option>
                            <option value="dark">Sombre</option>
                            <option value="gradient">Dégradé</option>
                        </select>
                    </div>

                    <div style={{ height: '20px', width: '1px', background: '#e2e8f0' }} />

                    {/* Logo */}
                    <input type="file" ref={logoInputRef} accept="image/png,image/jpeg" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    <button onClick={() => logoInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: logoUrl ? '#dcfce7' : 'white', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <Upload size={14} /> {logoUrl ? '✓' : 'Logo'}
                    </button>
                    {logoUrl && <button onClick={() => setLogoUrl(null)} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer', fontSize: '0.75rem' }}>×</button>}
                </div>

                {/* Ligne 3 : Titre personnalisé */}
                <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Titre:</span>
                    <input
                        type="text"
                        value={customTitle}
                        onChange={e => setCustomTitle(e.target.value)}
                        placeholder="Titre personnalisé (optionnel)"
                        style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    {customTitle && <button onClick={() => setCustomTitle("")} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer', fontSize: '0.75rem' }}>×</button>}
                </div>
            </header>

            <main style={{ display: 'flex', justifyContent: 'center' }}>
                <div id="export-container" style={{ position: 'relative', width: WIDTH, height: HEIGHT, borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden', ...bgStyle }}>
                    {loading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#3b82f6' }}>Chargement...</div>}
                    {error && stations.length === 0 && <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', gap: '10px' }}><AlertCircle size={40} /><p>{error}</p></div>}

                    {geoData && (
                        <>
                            <svg width={WIDTH} height={HEIGHT} style={{ position: 'relative', zIndex: 1 }}>
                                {/* Définitions pour l'ombre et le clip géographique */}
                                <defs>
                                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.5" />
                                    </filter>
                                    {/* Masque précis indexé sur le GeoJSON actuel */}
                                    <clipPath id="geo-clip">
                                        {geoData.features.map((f, i) => (
                                            <path key={i} d={pathGenerator(f)} />
                                        ))}
                                    </clipPath>
                                </defs>

                                <g>{geoData.features.map((f, i) => <path key={i} d={pathGenerator(f)} fill={mp.fill} stroke={mp.stroke} strokeWidth={1.5} />)}</g>
                                {stations.map(s => {
                                    const coords = projection([s.lon, s.lat]);
                                    if (!coords) return null;
                                    const color = getStationColor(s.value, selectedParam, minV, maxV);
                                    const textColor = useBlackText ? '#000000' : color;
                                    const strokeColor = bgColor === 'dark' || bgColor === 'gradient' ? '#1e293b' : 'white';
                                    const boxW = valueSize * 1.8;
                                    const boxH = valueSize * 1.6;
                                    const isWind = selectedParam.includes('wind');

                                    return (
                                        <g
                                            key={s.station_id}
                                            transform={`translate(${coords[0]}, ${coords[1]})`}
                                            filter={showShadow ? "url(#shadow)" : undefined}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/observations/station/${s.station_id}`)}
                                        >
                                            <title>{s.name} ({s.station_id})</title>
                                            {framedMode && <rect x={-boxW / 2} y={-boxH / 2} width={boxW} height={boxH} rx={6} fill={bgColor === 'dark' || bgColor === 'gradient' ? 'rgba(0,0,0,0.5)' : 'white'} stroke={color} strokeWidth={2} />}

                                            {/* Valeur */}
                                            <text textAnchor="middle" dominantBaseline="middle" style={{ fontSize: `${valueSize}px`, fill: textColor, fontWeight: "800", stroke: strokeColor, strokeWidth: "3px", paintOrder: "stroke" }}>
                                                {Math.round(s.value)}
                                            </text>

                                            {/* Flèche Vent */}
                                            {isWind && s.wind_dir !== undefined && s.wind_dir !== null && (
                                                <g transform={`translate(0, ${valueSize * 0.9})`}>
                                                    <g transform={`rotate(${s.wind_dir})`}>
                                                        <path d="M0,-7 L4,4 L0,2 L-4,4 Z" fill={textColor} stroke={strokeColor} strokeWidth="1" />
                                                    </g>
                                                </g>
                                            )}
                                        </g>
                                    );
                                })}

                                {/* Calque Foudre (Synchronisé avec design Expert et clipping territorial) */}
                                {selectedParam === 'foudre' && (
                                    <g clipPath="url(#geo-clip)">
                                        {strikes.map((s, i) => {
                                            const coords = projection([parseFloat(s.lon), parseFloat(s.lat)]);
                                            if (!coords) return null;
                                            const color = HOUR_COLORS[s.h] || '#ef4444';

                                            return (
                                                <circle
                                                    key={`strike-gen-${i}`}
                                                    cx={coords[0]}
                                                    cy={coords[1]}
                                                    r={3.5}
                                                    fill={color}
                                                    stroke="#000"
                                                    strokeWidth={1}
                                                    style={{ opacity: 1 }}
                                                />
                                            );
                                        })}
                                    </g>
                                )}
                            </svg>

                            {logoUrl && <img src={logoUrl} alt="Logo" style={{ position: 'absolute', bottom: '16px', left: '16px', maxHeight: '60px', maxWidth: '150px', objectFit: 'contain', borderRadius: '8px', zIndex: 5 }} />}

                            {/* Titre personnalisé */}
                            {customTitle && (
                                <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', background: bgColor === 'dark' || bgColor === 'gradient' ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '1.1rem', color: bgColor === 'dark' || bgColor === 'gradient' ? '#f1f5f9' : '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                                    {customTitle}
                                </div>
                            )}

                            {showLegend && (
                                <div style={{ position: 'absolute', width: '220px', background: bgColor === 'dark' || bgColor === 'gradient' ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '14px', boxShadow: '0 6px 16px rgba(0,0,0,0.1)', zIndex: 5, fontSize: '0.8rem', color: bgColor === 'dark' || bgColor === 'gradient' ? '#f1f5f9' : '#0f172a', top: customTitle ? '70px' : '16px', right: '16px' }}>
                                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${bgColor === 'dark' || bgColor === 'gradient' ? '#475569' : '#f1f5f9'}`, fontWeight: '700', lineHeight: 1.3 }}>{title}</div>
                                    {selectedParam === 'foudre' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', fontWeight: '800', color: '#ef4444', fontSize: '1.2rem' }}>
                                                {strikes.length} impacts
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                                                {[0, 6, 12, 18].map((hBase, idx) => {
                                                    const labels = ["0-6h", "6-12h", "12-18h", "18-24h"];
                                                    const cols = ["#3b82f6", "#10b981", "#EAB308", "#ef4444"];
                                                    return (
                                                        <div key={hBase} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <div style={{ width: '100%', height: '6px', background: cols[idx], borderRadius: '2px' }}></div>
                                                            <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>{labels[idx]}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                                                <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Min</div><div style={{ fontWeight: '700', color: getStationColor(minV, selectedParam, minV, maxV) }}>{Math.round(minV)}{PARAMS[selectedParam].unit}</div></div>
                                                <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Moy</div><div style={{ fontWeight: '700' }}>{avgV}{PARAMS[selectedParam].unit}</div></div>
                                                <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Max</div><div style={{ fontWeight: '700', color: getStationColor(maxV, selectedParam, minV, maxV) }}>{Math.round(maxV)}{PARAMS[selectedParam].unit}</div></div>
                                            </div>
                                            <div style={{ height: '12px', borderRadius: '6px', background: getLegendGradient(selectedParam) }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}><span>{Math.round(minV)}</span><span>{Math.round(maxV)}</span></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div >
    );
};

export default VectorRegionPreview;
