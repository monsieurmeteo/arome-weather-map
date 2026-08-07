import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import stationNames from '../../data/stationNames.json';
import {
    Zap, Thermometer, CloudRain, Wind, Search,
    AlertTriangle, MapPin, Clock, RefreshCw,
    Radio, List, ExternalLink, Download, Trophy, CheckCircle2,
    ArrowUpDown, Table, X, ChevronLeft, ChevronRight, Droplets
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NationalRecordsMonitor.css';

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function NationalRecordsMonitor() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [allLatestObs, setAllLatestObs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeZone, setActiveZone] = useState('metropole');
    const [sortConfig, setSortConfig] = useState({ key: 'dept', direction: 'asc' });
    const [showOnlyBroken, setShowOnlyBroken] = useState(false);
    const [lastSync, setLastSync] = useState(null);

    const currentMonthIdx = new Date().getMonth();

    const fetchGlobalLatest = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            console.log("📊 Chargement complet de la supervision...");
            let dbRows = [];
            let from = 0;
            const batch = 1000;

            while (true) {
                const { data, error } = await supabase
                    .rpc('get_supervision_records')
                    .range(from, from + batch - 1);

                if (error) throw error;
                if (!data || data.length === 0) break;

                dbRows.push(...data);
                if (data.length < batch) break;
                from += batch;
                if (from > 10000) break;
            }

            const merged = dbRows.map(row => {
                const sid = row.id;
                const rec = row.clim;

                const name = stationNames[sid] || row.name || `Station ${sid}`;
                const dept = row.dept;

                const txNorm = rec?.tx?.[currentMonthIdx] || null;
                const tnNorm = rec?.tn?.[currentMonthIdx] || null;
                const meanNorm = (txNorm !== null && tnNorm !== null) ? (txNorm + tnNorm) / 2 : null;

                const txDay = row.tx_day ?? row.temp;
                const tnDay = row.tn_day ?? row.temp;
                const windDay = row.gust_day ?? 0;
                const rainDay = row.rain_day ?? 0;
                const sunDay = (row.sun_day ?? 0) / 60; // Convert minutes to hours if needed, or use as is

                const anoTx = (txDay !== null && txNorm !== null) ? txDay - txNorm : null;
                const anoTn = (tnDay !== null && tnNorm !== null) ? tnDay - tnNorm : null;
                const currentAno = (row.temp !== null && meanNorm !== null) ? (row.temp - meanNorm) : null;

                // Records Comparison
                const recTx = rec?.records?.maxT?.vals?.[currentMonthIdx] || null;
                const recTn = rec?.records?.minT?.vals?.[currentMonthIdx] || null;
                const recRain = rec?.records?.maxRain?.vals?.[currentMonthIdx] || null;
                const recWind = rec?.records?.maxWind?.vals?.[currentMonthIdx] || null;

                const isBrokenMax = recTx !== null && txDay !== null && txDay >= recTx && txDay > -50;
                const isBrokenMin = recTn !== null && tnDay !== null && tnDay <= recTn && tnDay < 50;
                const isBrokenWind = recWind !== null && windDay !== null && windDay >= recWind && windDay > 40;
                const isBrokenRain = recRain !== null && rainDay !== null && rainDay > 0 && rainDay >= recRain;

                const isBroken = isBrokenMax || isBrokenMin || isBrokenWind || isBrokenRain;

                return {
                    id: sid,
                    name,
                    dept,
                    temp: row.temp,
                    txDay, tnDay, txNorm, tnNorm,
                    anoTx, anoTn, currentAno,
                    recTx, recTn, recWind, recRain,
                    windDay, rainDay, sunDay,
                    isBroken,
                    brokenType: {
                        tx: isBrokenMax,
                        tn: isBrokenMin,
                        wind: isBrokenWind,
                        rain: isBrokenRain
                    },
                    time: new Date(row.last_obs)
                };
            }).filter(x => x.id);

            setAllLatestObs(merged);
            setLastSync(new Date());
        } catch (e) {
            console.error("Sync partial error", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentMonthIdx]);

    useEffect(() => {
        fetchGlobalLatest();
        const interval = setInterval(() => fetchGlobalLatest(true), 300000);
        return () => clearInterval(interval);
    }, [fetchGlobalLatest]);

    const stats = useMemo(() => {
        const list = allLatestObs.filter(s => {
            const d = s.id.substring(0, 2);
            const isMet = (d >= '01' && d <= '95') || d === '2A' || d === '2B' || d === '20';
            return (activeZone === 'metropole' ? isMet : !isMet);
        });
        return {
            total: list.length,
            hot: list.filter(s => s.currentAno !== null && s.currentAno > 2).length,
            cold: list.filter(s => s.currentAno !== null && s.currentAno < -2).length,
            broken: list.filter(s => s.isBroken).length
        };
    }, [allLatestObs, activeZone]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredData = useMemo(() => {
        let list = allLatestObs.filter(s => {
            const d = s.id.substring(0, 2);
            const isMet = (d >= '01' && d <= '95') || d === '2A' || d === '2B' || d === '20';

            if (showOnlyBroken) return s.isBroken;

            const matchesZone = activeZone === 'metropole' ? isMet : !isMet;
            return matchesZone;
        });

        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            list = list.filter(item => item.name.toLowerCase().includes(s) || item.dept.toLowerCase().includes(s));
        }

        return list.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (valA === null || valA === undefined) valA = sortConfig.direction === 'asc' ? 999 : -999;
            if (valB === null || valB === undefined) valB = sortConfig.direction === 'asc' ? 999 : -999;
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [allLatestObs, searchTerm, activeZone, sortConfig, showOnlyBroken]);

    const SortIcon = ({ colKey }) => (
        <span className="sort-icon-pro">
            {sortConfig.key === colKey ? (sortConfig.direction === 'asc' ? '▲' : '▼') : <ArrowUpDown size={12} />}
        </span>
    );

    const getTnClass = (val) => {
        if (val === null || val === undefined) return '';
        if (val < 0) return 'very-cold';
        if (val < 7) return 'cold';
        if (val < 15) return 'cool';
        return 'mild';
    };

    const getTxClass = (val) => {
        if (val === null || val === undefined) return '';
        if (val < 15) return 'mild';
        if (val < 25) return 'warm';
        if (val < 32) return 'hot';
        return 'very-hot';
    };

    const getRainClass = (val) => {
        if (val === null || val === undefined || val === 0) return 'none';
        if (val > 10) return 'heavy';
        return '';
    };

    const getWindClass = (val) => {
        if (val === null || val === undefined) return '';
        if (val > 100) return 'storm';
        if (val > 70) return 'gale';
        if (val > 40) return 'strong';
        return '';
    };

    const Missing = () => <span className="missing-line"></span>;

    const renderCell = (val, fixed = 1, unit = '', className = '') => {
        if (val === null || val === undefined || isNaN(val)) return <Missing />;
        return <span className={className}>{val.toFixed(fixed)}<small className="unit">{unit}</small></span>;
    };

    return (
        <div className="extremes-page">
            <header className="extremes-header">
                <div className="header-title">
                    <Radio size={32} color="#ef4444" className={refreshing ? 'spin' : ''} />
                    <div>
                        <h1>Supervision Nationale</h1>
                        <p>Analyse de <strong>{allLatestObs.length}</strong> stations • Mis à jour {lastSync?.toLocaleTimeString()}</p>
                    </div>
                </div>

                <div className="tabs-container">
                    <button className={`tab-btn ${activeZone === 'metropole' && !showOnlyBroken ? 'active' : ''}`} onClick={() => { setActiveZone('metropole'); setShowOnlyBroken(false); }}>
                        <MapPin size={16} /> Métropole
                    </button>
                    <button className={`tab-btn ${showOnlyBroken ? 'active broken-tab' : ''}`} onClick={() => setShowOnlyBroken(true)}>
                        <Trophy size={16} /> Records ({stats.broken})
                    </button>
                </div>

                <div className="header-actions">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Ville, département..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button onClick={() => fetchGlobalLatest(true)} className="icon-btn">
                        <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="loading-state">
                    <div className="loader-icon"><RefreshCw size={32} className="spin" /></div>
                    <p>Analyse des données nationales...</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="extremes-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('dept')}>Dpt <SortIcon colKey="dept" /></th>
                                <th onClick={() => handleSort('name')} style={{ textAlign: 'left' }}>Station <SortIcon colKey="name" /></th>
                                <th onClick={() => handleSort('temp')} className="right">Direct <SortIcon colKey="temp" /></th>
                                <th onClick={() => handleSort('txDay')} className="right">Max (Tx) <SortIcon colKey="txDay" /></th>
                                <th onClick={() => handleSort('tnDay')} className="right">Min (Tn) <SortIcon colKey="tnDay" /></th>
                                <th onClick={() => handleSort('windDay')} className="right">Rafale <SortIcon colKey="windDay" /></th>
                                <th onClick={() => handleSort('rainDay')} className="right">Pluie 24h <SortIcon colKey="rainDay" /></th>
                                <th onClick={() => handleSort('sunDay')} className="right">Soleil <SortIcon colKey="sunDay" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(s => (
                                <tr key={s.id} onClick={() => navigate(`/observations/station/${s.id}`)} style={{ cursor: 'pointer' }}>
                                    <td className="station-id-cell">{s.dept}</td>
                                    <td className="station-name-cell" style={{ minWidth: '180px' }}>
                                        <div className="flex items-center gap-2">
                                            <span>{s.name.replace(/\s\(\d+\)$/, '')}</span>
                                            {s.isBroken && (
                                                <div className="record-badge-mini">
                                                    <Trophy size={10} fill="currentColor" /> <span>REC.</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-slate-800">{s.temp !== null ? s.temp.toFixed(1) : '--'}°</span>
                                            {s.currentAno !== null && (
                                                <small className={`text-[10px] font-bold ${s.currentAno > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {s.currentAno > 0 ? '+' : ''}{s.currentAno.toFixed(1)}°
                                                </small>
                                            )}
                                        </div>
                                    </td>

                                    <td className="right">
                                        <div className="flex flex-col items-end">
                                            {renderCell(s.txDay, 1, '°', `val-tx ${getTxClass(s.txDay)} ${s.brokenType.tx ? 'broken-val' : ''}`)}
                                            {s.recTx && <small className="text-[10px] opacity-50">Rec: {s.recTx.toFixed(1)}</small>}
                                        </div>
                                    </td>

                                    <td className="right">
                                        <div className="flex flex-col items-end">
                                            {renderCell(s.tnDay, 1, '°', `val-tn ${getTnClass(s.tnDay)} ${s.brokenType.tn ? 'broken-val' : ''}`)}
                                            {s.recTn && <small className="text-[10px] opacity-50">Rec: {s.recTn.toFixed(1)}</small>}
                                        </div>
                                    </td>

                                    <td className="right">
                                        <div className="flex flex-col items-end">
                                            {renderCell(s.windDay, 0, ' km/h', `val-wind ${getWindClass(s.windDay)} ${s.brokenType.wind ? 'broken-val' : ''}`)}
                                            {s.recWind && <small className="text-[10px] opacity-50">Rec: {Math.round(s.recWind)}</small>}
                                        </div>
                                    </td>

                                    <td className="right">
                                        <div className="flex flex-col items-end">
                                            {renderCell(s.rainDay, 1, ' mm', `val-rain ${getRainClass(s.rainDay)} ${s.brokenType.rain ? 'broken-val' : ''}`)}
                                            {s.recRain && <small className="text-[10px] opacity-50">Rec: {s.recRain}</small>}
                                        </div>
                                    </td>
                                    <td className="right">
                                        <div className="flex flex-col items-end">
                                            {renderCell(s.sunDay, 1, ' h', 'val-sun')}
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
