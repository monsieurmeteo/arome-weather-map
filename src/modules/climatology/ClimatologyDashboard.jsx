import React, { useState, useEffect, useMemo } from 'react';
import { geoService } from '../../services/geoService';
import { weatherAPI } from '../../services/api';
import { climatologyService } from '../../services/climatologyService';
import {
    Search, MapPin, Thermometer, CloudRain,
    Wind, Activity, Clock, Info, AlertCircle, CheckCircle2,
    ChevronDown, ChevronUp, TrendingUp, TrendingDown,
    Calendar, CornerDownRight, Home, Sun, Zap, Navigation,
    CloudSnow, CloudLightning, CloudFog, Cloud, FileText, ExternalLink
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import stationsGeo from '../../data/stations_list.json';
import recordsData from '../../data/all_stations_records.json';
import listeFichesClim from '../../data/liste_fiches_clim.json';
import './ClimatologyDashboard.css';

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Année'];

export default function ClimatologyDashboard() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [officialData, setOfficialData] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [loadingOfficial, setLoadingOfficial] = useState(false);
    const [activeTab, setActiveTab] = useState('summary');

    const currentMonthIdx = new Date().getMonth();

    // Initial load from URL or search
    useEffect(() => {
        const id = searchParams.get('station');
        if (id) {
            handleStationIdSelected(id);
        }
    }, [searchParams]);

    const handleStationIdSelected = async (id) => {
        const fullId = id.toString().padStart(8, '0');

        // 1. Load Local Baseline immediately (High Quality fallback)
        if (recordsData[fullId]) {
            const local = recordsData[fullId];
            setSelectedStation({ ...local, distance: 0 });
            setSearchTerm(local.name);

            // Populate charts and tables with local data first
            const tm = local.tx.map((val, idx) => (val + local.tn[idx]) / 2);

            setOfficialData({
                metadata: { name: local.name, id: fullId },
                normals: { tx: local.tx, tn: local.tn, tm, pr: local.pr, sun: local.sun || [] },
                records: local.records || {},
                days: local.days || {}
            });
        } else {
            const found = listeFichesClim.features.find(f => f.properties.num === fullId);
            if (found) {
                setSelectedStation({
                    id: fullId,
                    name: found.properties.nom,
                    officialUrl: found.properties.chemin,
                    distance: 0
                });
                setSearchTerm(found.properties.nom);
            }
        }

        // 2. Parallel enrichments
        fetchLiveForStation(fullId);
        fetchOfficialFiche(fullId);
    };

    const fetchOfficialFiche = async (stationId) => {
        setLoadingOfficial(true);
        try {
            const raw = await climatologyService.fetchStationData(stationId);
            if (raw) {
                const parsed = climatologyService.parseFiche(raw);

                const isValidArr = (arr) => Array.isArray(arr) && arr.length > 0 && arr.some(v => v !== null);

                // MERGE: Keep local data if online data is missing or empty
                setOfficialData(prev => {
                    if (!prev) return parsed;
                    return {
                        ...prev,
                        metadata: { ...prev.metadata, ...parsed.metadata },
                        normals: {
                            tx: isValidArr(parsed.normals.tx) ? parsed.normals.tx : prev.normals.tx,
                            tn: isValidArr(parsed.normals.tn) ? parsed.normals.tn : prev.normals.tn,
                            tm: isValidArr(parsed.normals.tm) ? parsed.normals.tm : prev.normals.tm,
                            pr: isValidArr(parsed.normals.pr) ? parsed.normals.pr : prev.normals.pr,
                            sun: isValidArr(parsed.normals.sun) ? parsed.normals.sun : prev.normals.sun,
                            dju: isValidArr(parsed.normals.dju) ? parsed.normals.dju : prev.normals.dju,
                            wind: isValidArr(parsed.normals.wind) ? parsed.normals.wind : prev.normals.wind
                        },
                        records: {
                            maxT: isValidArr(parsed.records.maxT?.vals) ? parsed.records.maxT : prev.records.maxT,
                            minT: isValidArr(parsed.records.minT?.vals) ? parsed.records.minT : prev.records.minT,
                            maxRain: isValidArr(parsed.records.maxRain?.vals) ? parsed.records.maxRain : prev.records.maxRain,
                            maxWind: isValidArr(parsed.records.maxWind?.vals) ? parsed.records.maxWind : prev.records.maxWind
                        },
                        days: { ...prev.days, ...parsed.days }
                    };
                });

                if (parsed.metadata.name) {
                    setSelectedStation(prev => ({
                        ...prev,
                        name: parsed.metadata.name,
                        dept: parsed.metadata.dept,
                        alt: parsed.metadata.alt,
                        id: stationId
                    }));
                }
            }
        } catch (e) {
            console.error("Official fiche enrichment failed", e);
        } finally {
            setLoadingOfficial(false);
        }
    };

    const fetchLiveForStation = async (stationId) => {
        try {
            const data = await weatherAPI.getStation6mnHistory(stationId, new Date());
            if (data && data.length > 0) {
                const latest = data[data.length - 1];

                // Calculate today's extremes since 00:00 UTC
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);
                const todayPoints = data.filter(pt => pt.time >= today);

                const txDay = todayPoints.reduce((max, pt) => Math.max(max, pt.temp), -99);
                const tnDay = todayPoints.reduce((min, pt) => Math.min(min, pt.temp), 99);
                const windDay = todayPoints.reduce((max, pt) => Math.max(max, pt.gust || 0), 0);
                const rainDay = todayPoints.reduce((sum, pt) => sum + (pt.rain || 0), 0);

                setLiveData({
                    ...latest,
                    wind: latest.wind || 0,
                    gust: latest.gust || 0,
                    txDay: txDay === -99 ? latest.temp : txDay,
                    tnDay: tnDay === 99 ? latest.temp : tnDay,
                    windDay,
                    rainDay
                });
            } else {
                setLiveData(null);
            }
        } catch (e) {
            console.error("Live fetch failed", e);
        }
    };

    // Advanced Search Logic (Full official list + API Adresse)
    useEffect(() => {
        if (searchTerm.length < 2 || (selectedStation && searchTerm === selectedStation.name)) {
            setSuggestions([]);
            return;
        }

        const delay = setTimeout(async () => {
            // Search in local official list first
            const localMatches = listeFichesClim.features
                .filter(f => f.properties.nom.toLowerCase().includes(searchTerm.toLowerCase()) || f.properties.num.includes(searchTerm))
                .slice(0, 5)
                .map(f => ({
                    type: 'station',
                    id: f.properties.num,
                    label: f.properties.nom,
                    context: `Station Officielle (${f.properties.num.substring(0, 2)})`,
                    feature: f
                }));

            // Search in API Adresse for geo location
            const addresses = await geoService.searchAddress(searchTerm);
            const addressMatches = (addresses || []).map(a => ({
                type: 'address',
                label: a.properties.label,
                context: a.properties.context,
                feature: a
            }));

            setSuggestions([...localMatches, ...addressMatches]);
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm, selectedStation]);

    const handleSelectSuggestion = (s) => {
        if (s.type === 'station') {
            navigate(`/climatologie?station=${s.id}`);
            setSuggestions([]);
        } else {
            const [lon, lat] = s.feature.geometry.coordinates;
            setSearchTerm(s.feature.properties.label);
            setSuggestions([]);
            findNearestOfficialStation(lat, lon);
        }
    };

    const findNearestOfficialStation = (lat, lon) => {
        let nearest = null;
        let minDistance = Infinity;

        const getDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        listeFichesClim.features.forEach(f => {
            const [sLon, sLat] = f.geometry.coordinates;
            const dist = getDistance(lat, lon, sLat, sLon);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = { id: f.properties.num, dist };
            }
        });

        if (nearest) {
            navigate(`/climatologie?station=${nearest.id}`);
        }
    };

    const comparison = useMemo(() => {
        if (!liveData || !officialData) return null;

        const txNorm = officialData.normals.tx?.[currentMonthIdx];
        const tnNorm = officialData.normals.tn?.[currentMonthIdx];

        if (txNorm === null || tnNorm === null) return null;

        // 1. Dual Anomalies (Day Extr vs Norms)
        const diffTx = liveData.txDay != null && txNorm != null ? liveData.txDay - txNorm : null;
        const diffTn = liveData.tnDay != null && tnNorm != null ? liveData.tnDay - tnNorm : null;

        // 2. Record Monitoring (DAY PEAK vs RECORD)
        const recordMax = officialData.records.maxT?.vals?.[currentMonthIdx];
        const recordMin = officialData.records.minT?.vals?.[currentMonthIdx];

        const isBrokenMax = recordMax !== null && liveData.txDay >= recordMax;
        const isNearMax = recordMax !== null && !isBrokenMax && (recordMax - liveData.txDay < 1.5);

        const isBrokenMin = recordMin !== null && liveData.tnDay <= recordMin;
        const isNearMin = recordMin !== null && !isBrokenMin && (liveData.tnDay - recordMin < 1.5);

        return {
            diffTx,
            diffTn,
            recordMax,
            recordMin,
            isBrokenMax,
            isNearMax,
            isBrokenMin,
            isNearMin,
            peakReached: liveData.txDay,
            lowReached: liveData.tnDay
        };
    }, [liveData, officialData, currentMonthIdx]);

    const chartData = useMemo(() => {
        if (!officialData) return [];
        return MONTHS_SHORT.slice(0, 12).map((m, i) => ({
            name: m,
            tx: officialData.normals.tx?.[i],
            tn: officialData.normals.tn?.[i],
            pr: officialData.normals.pr?.[i],
            sun: officialData.normals.sun?.[i] || 0
        }));
    }, [officialData]);

    const renderNormalRow = (label, data, unit = "", decimals = 1, icon = null) => {
        if (!data || data.length === 0) return null;
        const annual = data[12];

        return (
            <tr>
                <td className="param-label">{icon} <span>{label}</span></td>
                {data.slice(0, 12).map((v, i) => <td key={i} className={`val-cell ${i === currentMonthIdx ? 'current-month' : ''}`}>{typeof v === 'number' && !isNaN(v) ? v.toFixed(decimals) : '--'}</td>)}
                <td className="val-cell annual">{typeof annual === 'number' && !isNaN(annual) ? annual.toFixed(decimals) : '--'}{unit}</td>
            </tr>
        );
    };

    const RecordPair = ({ label, recData, unit = "", color = "#ef4444" }) => {
        if (!recData || !recData.vals) return null;
        const currentVal = recData.vals[currentMonthIdx];
        const currentDate = recData.dates?.[currentMonthIdx];
        const absVal = recData.vals[12];
        const absDate = recData.dates?.[12];
        const periodText = recData.period ? `Archives depuis ${recData.period[0].split('-')[2]}` : '';

        return (
            <div className="record-mini-card-pro">
                <div className="card-top-line" style={{ background: color }}></div>
                <div className="card-content-p">
                    <div className="flex justify-between items-start mb-3">
                        <span className="label-text">{label}</span>
                        {periodText && <span className="period-badge">{periodText}</span>}
                    </div>

                    <div className="records-duo">
                        <div className="rec-item-box">
                            <span className="t">Record {MONTHS_SHORT[currentMonthIdx]}</span>
                            <span className="v" style={{ color }}>{typeof currentVal === 'number' && !isNaN(currentVal) ? currentVal.toFixed(1) : '--'}<small>{unit}</small></span>
                            <span className="d">{currentDate || '--'}</span>
                        </div>
                        <div className="rec-item-box active-abs">
                            <span className="t">ABSOLU</span>
                            <span className="v" style={{ color }}>{typeof absVal === 'number' && !isNaN(absVal) ? absVal.toFixed(1) : '--'}<small>{unit}</small></span>
                            <span className="d">{absDate || '--'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="climatol-pro">
            <header className="climatol-nav">
                <div className="nav-brand" onClick={() => navigate('/')}>
                    <Activity size={24} color="#3b82f6" />
                    <span className="brand-text">MÉTÉO-FRANCE <small>OBSERVATORY</small></span>
                </div>
                <div className="search-bar-pro">
                    <Search size={18} />
                    <input
                        placeholder="Ville (Lille), Code Postal (59000), ou ID Station..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                        <div className="results-dropdown">
                            {suggestions.map((s, i) => (
                                <div key={i} className="res-item" onClick={() => handleSelectSuggestion(s)}>
                                    <MapPin size={14} color={s.type === 'station' ? '#3b82f6' : '#94a3b8'} />
                                    <div className="res-text">
                                        <div className="label">{s.label}</div>
                                        <div className="ctx">{s.context}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {!selectedStation ? (
                <div className="empty-state-pro">
                    <div className="hero-search-visual">
                        <Zap size={60} className="pulse-slow" color="#3b82f6" />
                        <h2>Suivi Climatologique Officiel</h2>
                        <p>Analyse des normales 1991-2020 et records historiques pour 3153 stations Météo-France.</p>
                        <div className="search-hint">Saisissez un Code Postal ou une Ville pour commencer</div>
                    </div>
                </div>
            ) : (
                <main className="report-container animate-fade">
                    <div className="station-header-box">
                        <div className="meta-left">
                            <div className="station-badges">
                                <span className="badge-blue">STATION OFFICIELLE</span>
                                {loadingOfficial && <span className="badge-grey animate-pulse">SYNCHRO METEO-FRANCE...</span>}
                                {officialData && <span className="badge-green">DATA CERTIFIED</span>}
                                <span className="badge-grey">ID: {selectedStation.id}</span>
                                {selectedStation.dept && <span className="badge-grey">Dépt: {selectedStation.dept}</span>}
                                {selectedStation.alt && <span className="badge-grey">Alt: {selectedStation.alt}m</span>}
                            </div>
                            <h1>{selectedStation.name}</h1>
                            <div className="official-links mt-4 flex gap-4">
                                <a href={`https://object.files.data.gouv.fr/meteofrance/data/synchro_ftp/REF_STATION/FICHECLIM_${selectedStation.id}.pdf`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                    <FileText size={16} /> Fiche PDF Officielle
                                </a>
                            </div>
                        </div>
                        <div className="meta-right">
                            {liveData ? (
                                <div className="live-monitor">
                                    <div className="monitor-head">
                                        <div className="live-dot"></div>
                                        <span>DIRECT ({liveData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                                    </div>
                                    <div className="monitor-val">{typeof liveData.temp === 'number' && !isNaN(liveData.temp) ? liveData.temp.toFixed(1) : '--'}°C</div>
                                    <div className="monitor-extremes flex justify-end gap-3 mt-1 text-[10px] font-bold">
                                        <span className="text-red-400">Tx {typeof liveData.txDay === 'number' && !isNaN(liveData.txDay) ? liveData.txDay.toFixed(1) : '--'}°</span>
                                        <span className="text-blue-400">Tn {typeof liveData.tnDay === 'number' && !isNaN(liveData.tnDay) ? liveData.tnDay.toFixed(1) : '--'}°</span>
                                        {liveData.rainDay > 0 && <span className="text-sky-400">{typeof liveData.rainDay === 'number' && !isNaN(liveData.rainDay) ? liveData.rainDay.toFixed(1) : '0.0'}mm</span>}
                                    </div>
                                    {comparison && (
                                        <div className="monitor-anomalies-duo">
                                            {comparison.diffTx !== null && (
                                                <div className={`ano-item ${comparison.diffTx > 0 ? 'plus' : 'minus'}`}>
                                                    <span className="l">TX :</span>
                                                    <span className="v">{(comparison.diffTx > 0 ? '+' : '') + (typeof comparison.diffTx === 'number' && !isNaN(comparison.diffTx) ? comparison.diffTx.toFixed(1) : '--')}°</span>
                                                </div>
                                            )}
                                            {comparison.diffTn !== null && (
                                                <div className={`ano-item ${comparison.diffTn > 0 ? 'plus' : 'minus'}`}>
                                                    <span className="l">TN :</span>
                                                    <span className="v">{(comparison.diffTn > 0 ? '+' : '') + (typeof comparison.diffTn === 'number' && !isNaN(comparison.diffTn) ? comparison.diffTn.toFixed(1) : '--')}°</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : <div className="live-monitor-placeholder"> {loadingOfficial ? 'Récupération...' : 'Pas de données live récentes'}</div>}
                        </div>
                    </div>

                    {/* ALERTS SECTION - PEAK BASED */}
                    {comparison && (comparison.isBrokenMax || comparison.isNearMax || comparison.isBrokenMin || comparison.isNearMin) && (
                        <div className="climatol-alerts">
                            {comparison.isBrokenMax && (
                                <div className="alert-box broken border-red-500 border-2 mb-2">
                                    <Zap size={32} color="#ef4444" className="animate-bounce" />
                                    <div className="alert-content"><strong>RECORD DE CHALEUR BATTU !</strong><span>Le pic du jour ({typeof comparison.peakReached === 'number' && !isNaN(comparison.peakReached) ? comparison.peakReached.toFixed(1) : '--'}°C) a franchi le record de {typeof comparison.recordMax === 'number' && !isNaN(comparison.recordMax) ? comparison.recordMax.toFixed(1) : '--'}°C.</span></div>
                                </div>
                            )}
                            {comparison.isNearMax && !comparison.isBrokenMax && (
                                <div className="alert-box warning border-amber-500 border-2 mb-2">
                                    <AlertCircle size={32} color="#f59e0b" />
                                    <div className="alert-content"><strong>PROCHE RECORD DE CHALEUR</strong><span>Le pic du jour ({typeof comparison.peakReached === 'number' && !isNaN(comparison.peakReached) ? comparison.peakReached.toFixed(1) : '--'}°C) approche le record de {typeof comparison.recordMax === 'number' && !isNaN(comparison.recordMax) ? comparison.recordMax.toFixed(1) : '--'}°C.</span></div>
                                </div>
                            )}
                            {comparison.isBrokenMin && (
                                <div className="alert-box broken border-blue-500 border-2 bg-blue-50 mb-2">
                                    <Zap size={32} color="#3b82f6" className="animate-pulse" />
                                    <div className="alert-content"><strong className="text-blue-900">RECORD DE FROID BATTU !</strong><span className="text-blue-800">Le minimum du jour ({typeof comparison.lowReached === 'number' && !isNaN(comparison.lowReached) ? comparison.lowReached.toFixed(1) : '--'}°C) est descendu sous le record de {typeof comparison.recordMin === 'number' && !isNaN(comparison.recordMin) ? comparison.recordMin.toFixed(1) : '--'}°C.</span></div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="dashboard-tabs">
                        <button className={activeTab === 'summary' ? 'active' : ''} onClick={() => setActiveTab('summary')}>Vue d'ensemble</button>
                        <button className={activeTab === 'temperatures' ? 'active' : ''} onClick={() => setActiveTab('temperatures')}>Températures & DJU</button>
                        <button className={activeTab === 'rain' ? 'active' : ''} onClick={() => setActiveTab('rain')}>Pluie & Humidité</button>
                        <button className={activeTab === 'wind_solar' ? 'active' : ''} onClick={() => setActiveTab('wind_solar')}>Vent & Soleil</button>
                        <button className={activeTab === 'records' ? 'active' : ''} onClick={() => setActiveTab('records')}>Records Historiques</button>
                    </div>

                    {!officialData && !loadingOfficial && (
                        <div className="p-10 text-center bg-white rounded-3xl shadow-sm border border-slate-100">
                            <Info size={40} className="mx-auto mb-4 opacity-30" />
                            <p className="text-slate-500">Données climatologiques indisponibles ou en erreur.</p>
                            <button onClick={() => fetchOfficialFiche(selectedStation.id)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Réessayer le chargement</button>
                        </div>
                    )}

                    {officialData && activeTab === 'summary' && (
                        <div className="tab-content grid-layout animate-fade">
                            <div className="chart-card">
                                <h3>Températures Maximales/Minimales</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" fontSize={10} axisLine={false} />
                                        <YAxis fontSize={10} axisLine={false} unit="°" />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="tx" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="Tx Moy" />
                                        <Area type="monotone" dataKey="tn" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} name="Tn Moy" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-card">
                                <h3>Précipitations Mensuelles (mm)</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" fontSize={10} axisLine={false} />
                                        <YAxis fontSize={10} axisLine={false} unit="mm" />
                                        <Tooltip />
                                        <Bar dataKey="pr" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pluie" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="records-2x2-grid">
                                <RecordPair label="Température Maximale" recData={officialData.records.maxT} unit="°C" color="#ef4444" />
                                <RecordPair label="Température Minimale" recData={officialData.records.minT} unit="°C" color="#3b82f6" />
                                <RecordPair label="Précipitations (24h)" recData={officialData.records.maxRain} unit=" mm" color="#0ea5e9" />
                                <RecordPair label="Rafales de Vent" recData={officialData.records.maxWind} unit=" km/h" color="#f59e0b" />
                            </div>
                        </div>
                    )}

                    {officialData && activeTab === 'temperatures' && (
                        <div className="tab-content animate-fade">
                            <section className="report-section">
                                <div className="section-title"><Thermometer size={18} /> <h3>Bloc Températures & Jours Remarquables</h3></div>
                                <div className="table-resp">
                                    <table className="clim-table">
                                        <thead><tr><th>Paramètres</th>{MONTHS_SHORT.map(m => <th key={m}>{m}</th>)}</tr></thead>
                                        <tbody>
                                            {renderNormalRow("Température Maximale Moy. (°C)", officialData.normals.tx, "", 1, <ChevronUp size={14} color="#ef4444" />)}
                                            {renderNormalRow("Température Moyenne (°C)", officialData.normals.tm, "", 1)}
                                            {renderNormalRow("Température Minimale Moy. (°C)", officialData.normals.tn, "", 1, <ChevronDown size={14} color="#3b82f6" />)}
                                            {renderNormalRow("Nb jours Chaleur (>= 30°C)", officialData.days.tx30, "", 1)}
                                            {renderNormalRow("Nb jours été (>= 25°C)", officialData.days.tx25, "", 1)}
                                            {renderNormalRow("Nb jours sans dégel (Tx <= 0°C)", officialData.days.tx0, "", 1)}
                                            {renderNormalRow("Nb jours de Gel (Tn <= 0°C)", officialData.days.tn0, "", 1)}
                                            {renderNormalRow("Nb jours Fort Gel (Tn <= -5°C)", officialData.days.tnMinus5, "", 1)}
                                            {renderNormalRow("Nb jours Très Fort Gel (Tn <= -10°C)", officialData.days.tnMinus10, "", 1)}
                                            {officialData.normals.dju && renderNormalRow("DJU (Degrés Jours Unifiés)", officialData.normals.dju, "", 0)}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                    {officialData && activeTab === 'rain' && (
                        <div className="tab-content animate-fade">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-2">
                                <div className="chart-card">
                                    <h3>Fréquence des Précipitations (Jours)</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={MONTHS_SHORT.slice(0, 12).map((m, i) => ({
                                            name: m,
                                            r1: officialData.days.rain1?.[i] || 0,
                                            r10: officialData.days.rain10?.[i] || 0
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" fontSize={10} axisLine={false} />
                                            <YAxis fontSize={10} axisLine={false} unit="j" />
                                            <Tooltip />
                                            <Bar dataKey="r1" fill="#3b82f6" name="Pluie >= 1mm" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="r10" fill="#1e40af" name="Pluie >= 10mm" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="chart-card">
                                    <h3>Occurrence des Phénomènes (Moy. jours)</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={MONTHS_SHORT.slice(0, 12).map((m, i) => ({
                                            name: m,
                                            neige: officialData.days.snow?.[i] || 0,
                                            orage: officialData.days.storm?.[i] || 0,
                                            brouillard: officialData.days.fog?.[i] || 0
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" fontSize={10} axisLine={false} />
                                            <YAxis fontSize={10} axisLine={false} unit="j" />
                                            <Tooltip />
                                            <Bar dataKey="neige" fill="#94a3b8" name="Neige" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="orage" fill="#f59e0b" name="Orage" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="brouillard" fill="#64748b" name="Brouillard" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <section className="report-section">
                                <div className="section-title"><CloudRain size={18} /> <h3>Pluviométrie & Phénomènes</h3></div>
                                <div className="table-resp">
                                    <table className="clim-table">
                                        <thead><tr><th>Paramètres</th>{MONTHS_SHORT.map(m => <th key={m}>{m}</th>)}</tr></thead>
                                        <tbody>
                                            {renderNormalRow("Hauteur de pluie moyenne (mm)", officialData.normals.pr, " mm", 1, <CloudRain size={14} color="#3b82f6" />)}
                                            {renderNormalRow("Nb jours de pluie (>= 1mm)", officialData.days.rain1, "", 1)}
                                            {renderNormalRow("Nb jours de pluie (>= 5mm)", officialData.days.rain5, "", 1)}
                                            {renderNormalRow("Nb jours de pluie (>= 10mm)", officialData.days.rain10, "", 1)}
                                            <tr className="divider-row"><td colSpan="14"></td></tr>
                                            {renderNormalRow("Nb jours de Neige", officialData.days.snow, "", 1, <CloudSnow size={14} />)}
                                            {renderNormalRow("Nb jours de Grêle", officialData.days.hail, "", 1)}
                                            {renderNormalRow("Nb jours d'Orage", officialData.days.storm, "", 1, <CloudLightning size={14} />)}
                                            {renderNormalRow("Nb jours de Brouillard", officialData.days.fog, "", 1, <CloudFog size={14} />)}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                            {officialData.normals.etp && (
                                <section className="report-section mt-6">
                                    <div className="section-title"><Activity size={18} /> <h3>Evapotranspiration (ETP Penman)</h3></div>
                                    <div className="table-resp">
                                        <table className="clim-table">
                                            <thead><tr><th>Paramètre</th>{MONTHS_SHORT.map(m => <th key={m}>{m}</th>)}</tr></thead>
                                            <tbody>{renderNormalRow("ETP Penman moyenne (mm)", officialData.normals.etp, " mm", 1)}</tbody>
                                        </table>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {officialData && activeTab === 'wind_solar' && (
                        <div className="tab-content animate-fade">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-2">
                                <div className="chart-card">
                                    <h3>Durée d'Insolation (heures)</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" fontSize={10} axisLine={false} />
                                            <YAxis fontSize={10} axisLine={false} unit="h" />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="sun" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} name="Heures Soleil" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="chart-card">
                                    <h3>Vent Moyen 10mn (m/s)</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={MONTHS_SHORT.slice(0, 12).map((m, i) => ({
                                            name: m,
                                            wind: officialData.normals.wind?.[i] || 0
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" fontSize={10} axisLine={false} />
                                            <YAxis fontSize={10} axisLine={false} unit="m/s" />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="wind" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={2} name="Moy. 10mn" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <section className="report-section">
                                <div className="section-title"><Wind size={18} /> <h3>Vent & Rafales</h3></div>
                                <div className="table-resp">
                                    <table className="clim-table">
                                        <thead><tr><th>Paramètres</th>{MONTHS_SHORT.map(m => <th key={m}>{m}</th>)}</tr></thead>
                                        <tbody>
                                            {renderNormalRow("Vitesse moyenne du vent (m/s)", officialData.normals.wind, " m/s", 1)}
                                            {renderNormalRow("Nb jours rafales >= 16 m/s (58 km/h)", officialData.days.wind16, "", 1)}
                                            {renderNormalRow("Nb jours rafales >= 28 m/s (101 km/h)", officialData.days.wind28, "", 1)}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="report-section mt-6">
                                <div className="section-title"><Sun size={18} /> <h3>Ensoleillement & Rayonnement</h3></div>
                                <div className="table-resp">
                                    <table className="clim-table">
                                        <thead><tr><th>Paramètres</th>{MONTHS_SHORT.map(m => <th key={m}>{m}</th>)}</tr></thead>
                                        <tbody>
                                            {renderNormalRow("Durée d'insolation (h)", officialData.normals.sun, " h", 1, <Sun size={14} color="#f59e0b" />)}
                                            {renderNormalRow("Rayonnement global (J/cm²)", officialData.normals.rad, " J/cm²", 0)}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                    {officialData && activeTab === 'records' && (
                        <div className="tab-content animate-fade">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <RecordPair label="Chaleur (TX)" recData={officialData.records.maxT} unit="°C" color="#ef4444" />
                                <RecordPair label="Froid (TN)" recData={officialData.records.minT} unit="°C" color="#3b82f6" />
                                <RecordPair label="Pluviométrie (24h)" recData={officialData.records.maxRain} unit=" mm" color="#0ea5e9" />
                                {officialData.records.maxWind && (
                                    <RecordPair label="Rafales de Vent" recData={officialData.records.maxWind} unit=" km/h" color="#f59e0b" />
                                )}
                            </div>

                            <section className="report-section mt-10">
                                <div className="section-title"><Calendar size={18} /> <h3>Historique Complet des Records Mensuels</h3></div>
                                <div className="table-resp">
                                    <table className="clim-table records-full-table">
                                        <thead>
                                            <tr>
                                                <th>Mois</th>
                                                <th className="text-red-600">Max Temp (°C)</th>
                                                <th className="text-blue-600">Min Temp (°C)</th>
                                                <th className="text-sky-600">Pluie Max 24h (mm)</th>
                                                <th className="text-amber-600">Vent Max (km/h)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MONTHS_SHORT.slice(0, 12).map((m, i) => (
                                                <tr key={m} className={i === currentMonthIdx ? 'current-month-row' : ''}>
                                                    <td className="font-bold">{m}</td>
                                                    <td className="rec-cell">
                                                        <span className="val">{typeof officialData.records.maxT?.vals[i] === 'number' && !isNaN(officialData.records.maxT?.vals[i]) ? officialData.records.maxT?.vals[i].toFixed(1) : '--'}</span>
                                                        <span className="date">{officialData.records.maxT?.dates[i]}</span>
                                                    </td>
                                                    <td className="rec-cell">
                                                        <span className="val">{typeof officialData.records.minT?.vals[i] === 'number' && !isNaN(officialData.records.minT?.vals[i]) ? officialData.records.minT?.vals[i].toFixed(1) : '--'}</span>
                                                        <span className="date">{officialData.records.minT?.dates[i]}</span>
                                                    </td>
                                                    <td className="rec-cell">
                                                        <span className="val">{officialData.records.maxRain?.vals[i]}</span>
                                                        <span className="date">{officialData.records.maxRain?.dates[i]}</span>
                                                    </td>
                                                    <td className="rec-cell">
                                                        <span className="val">{officialData.records.maxWind?.vals[i] || '--'}</span>
                                                        <span className="date">{officialData.records.maxWind?.dates[i] || '--'}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="abs-record-row border-t-2 border-slate-200 font-black">
                                                <td className="uppercase bg-slate-50">ABSOLU</td>
                                                <td className="rec-cell abs bg-red-50">
                                                    <span className="val text-red-700">{typeof officialData.records.maxT?.vals[12] === 'number' && !isNaN(officialData.records.maxT?.vals[12]) ? officialData.records.maxT?.vals[12].toFixed(1) : '--'}</span>
                                                    <span className="date text-red-600">{officialData.records.maxT?.dates[12]}</span>
                                                </td>
                                                <td className="rec-cell abs bg-blue-50">
                                                    <span className="val text-blue-700">{typeof officialData.records.minT?.vals[12] === 'number' && !isNaN(officialData.records.minT?.vals[12]) ? officialData.records.minT?.vals[12].toFixed(1) : '--'}</span>
                                                    <span className="date text-blue-600">{officialData.records.minT?.dates[12]}</span>
                                                </td>
                                                <td className="rec-cell abs bg-sky-50">
                                                    <span className="val text-sky-700">{officialData.records.maxRain?.vals[12]}</span>
                                                    <span className="date text-sky-600">{officialData.records.maxRain?.dates[12]}</span>
                                                </td>
                                                <td className="rec-cell abs bg-amber-50">
                                                    <span className="val text-amber-700">{officialData.records.maxWind?.vals[12] || '--'}</span>
                                                    <span className="date text-amber-600">{officialData.records.maxWind?.dates[12] || '--'}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <div className="mt-8 p-8 bg-slate-900 text-white rounded-[2rem] overflow-hidden relative shadow-2xl border border-slate-800">
                                <div className="relative z-10">
                                    <h4 className="flex items-center gap-2 text-blue-400 font-black text-xl mb-3 uppercase tracking-tight"><Zap size={22} /> Profondeur Historique Certifiée</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed max-w-[850px] font-medium opacity-90">
                                        Les records de <strong>{selectedStation.name}</strong> sont validés sur une période s'étendant de <strong>{officialData.records.maxT?.period ? officialData.records.maxT.period[0].split('-')[2] : 'N/A'}</strong> à aujourd'hui.
                                        Ces données proviennent directement de la base climatologique d'état et sont mises à jour mensuellement selon les normales 1991-2020.
                                    </p>
                                    <div className="mt-6 flex gap-3">
                                        <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] uppercase font-bold text-blue-400">Normales 1991-2020</div>
                                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] uppercase font-bold text-emerald-400">Source Publique Officielle</div>
                                    </div>
                                </div>
                                <Activity size={240} className="absolute -right-16 -bottom-16 opacity-5 text-white" strokeWidth={1} />
                            </div>
                        </div>
                    )}

                    <div className="report-footer">
                        <p>Source des données : Météo-France (Normales officielles 1991-2020) • Données .data synchronisées depuis data.gouv.fr</p>
                    </div>
                </main>
            )}
        </div>
    );
}
