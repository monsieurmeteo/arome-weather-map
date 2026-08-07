import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Calendar, Thermometer, CloudRain, Sun, Download, Activity, AlertTriangle } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, ComposedChart, Line
} from 'recharts';
import './MonthlyClimateTable.css';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function MonthlyClimateTable({ stationId, stationName }) {
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [aggMode, setAggMode] = useState('civil'); // 'civil' (0-23h) or 'omm' (06-06h)
    const [monthlyData, setMonthlyData] = useState([]);
    const [stats, setStats] = useState(null);
    const [normals, setNormals] = useState(null);

    useEffect(() => {
        if (stationId) {
            fetchMonthlyData();
            fetchNormals();
        }
    }, [stationId, selectedMonth, selectedYear, aggMode]);

    const fetchNormals = async () => {
        try {
            const { data } = await supabase.from('station_climatology').select('data').eq('station_id', stationId).single();
            if (data?.data) {
                setNormals(data.data.normals);
            }
        } catch (e) {
            console.warn("Normals not found in DB");
        }
    };

    const fetchMonthlyData = async () => {
        setLoading(true);
        try {
            const startDate = new Date(Date.UTC(selectedYear, selectedMonth, 1));
            const endDate = new Date(Date.UTC(selectedYear, selectedMonth + 1, 0, 23, 59, 59));

            // Marge de 3 jours pour les fenêtres OMM (Tn J-1, Tx J+1)
            const fetchStart = new Date(startDate); fetchStart.setDate(fetchStart.getDate() - 3);
            const fetchEnd = new Date(endDate); fetchEnd.setDate(fetchEnd.getDate() + 3);

            // Pagination pour récupérer toutes les données 6mn (beaucoup plus volumineuses)
            let allData = [];
            let from = 0;
            const batchSize = 1000; // Supabase plafonne à 1000 lignes par défaut

            while (true) {
                const { data, error } = await supabase
                    .from('observations_6mn')
                    .select('station_id, timestamp, t, rr_per, fxi, ff')
                    .eq('station_id', stationId)
                    .gte('timestamp', fetchStart.toISOString())
                    .lte('timestamp', fetchEnd.toISOString())
                    .order('timestamp')
                    .range(from, from + batchSize - 1);

                if (error) throw error;
                if (!data || data.length === 0) break;

                allData = allData.concat(data);
                if (data.length < batchSize) break;
                from += batchSize;
                if (from > 50000) break; // Sécurité
            }

            console.log(`[Climato] ${allData.length} obs 6mn récupérées pour ${selectedMonth + 1}/${selectedYear}`);

            // DÉDOUBLONNAGE
            const uniqueDataMap = new Map();
            allData.forEach(obs => uniqueDataMap.set(obs.timestamp, obs));
            const cleanData = Array.from(uniqueDataMap.values());

            const dailyData = aggMode === 'omm' ? aggregateOMM(cleanData) : aggregateCivil(cleanData);
            setMonthlyData(dailyData);
            setStats(calculateMonthStats(dailyData));
        } catch (e) {
            console.error('Erreur Climatologie:', e);
        }
        setLoading(false);
    };

    const aggregateCivil = (obs) => {
        if (!obs) return [];
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const results = [];

        for (let d = 1; d <= daysInMonth; d++) {
            // FENETRE CIVILE (Locale) : 00h00 à 23h59
            const startOfDay = new Date(selectedYear, selectedMonth, d, 0, 0, 0);
            const endOfDay = new Date(selectedYear, selectedMonth, d, 23, 59, 59);

            const dayObs = obs.filter(o => {
                const t = new Date(o.timestamp).getTime();
                return t >= startOfDay.getTime() && t <= endOfDay.getTime();
            });

            let tx = null, tn = null, rr = 0, fxi = null, ff = null;

            const tvs = dayObs.map(o => o.t).filter(v => v != null);
            if (tvs.length > 0) {
                tx = Math.max(...tvs);
                tn = Math.min(...tvs);
            }

            // RR : Somme des rr_per (cumul 6mn) sur la journée civile
            rr = dayObs.reduce((sum, o) => sum + (o.rr_per > 0 ? o.rr_per : 0), 0);

            // Vent
            const fxiVals = dayObs.map(o => o.fxi).filter(v => v != null);
            if (fxiVals.length > 0) fxi = Math.max(...fxiVals);

            const ffVals = dayObs.map(o => o.ff).filter(v => v != null);
            if (ffVals.length > 0) ff = ffVals.reduce((a, b) => a + b, 0) / ffVals.length;

            const isValid = dayObs.length >= 100; // ~10 obs/h * 24h ≈ 240, on valide dès 100
            results.push({ day: d, tx, tn, rr, sun: 0, fxi, ff, isValid });
        }
        return results;
    };

    const aggregateOMM = (obs) => {
        if (!obs) return [];
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const results = [];

        for (let d = 1; d <= daysInMonth; d++) {
            // FENETRES OMM STRICTES (UTC)
            const txStart = Date.UTC(selectedYear, selectedMonth, d, 6, 0, 0);
            const txEnd = Date.UTC(selectedYear, selectedMonth, d + 1, 6, 0, 0);

            const tnStart = Date.UTC(selectedYear, selectedMonth, d - 1, 18, 0, 0);
            const tnEnd = Date.UTC(selectedYear, selectedMonth, d, 18, 0, 0);



            const obsTx = obs.filter(o => {
                const t = new Date(o.timestamp).getTime();
                return t > txStart && t <= txEnd;
            });

            const obsTn = obs.filter(o => {
                const t = new Date(o.timestamp).getTime();
                return t > tnStart && t <= tnEnd;
            });



            let tx = null, tn = null, rr = 0, fxi = null, ff = null;

            // Données 6mn : on utilise directement t
            const txVals = obsTx.map(o => o.t).filter(v => v != null);
            tx = txVals.length > 0 ? Math.max(...txVals) : null;

            const tnVals = obsTn.map(o => o.t).filter(v => v != null);
            tn = tnVals.length > 0 ? Math.min(...tnVals) : null;

            const isValid = tx !== null && tn !== null;

            if (isValid) {
                rr = obsTx.reduce((sum, o) => sum + (o.rr_per > 0 ? o.rr_per : 0), 0);
                
                const fxiVals = obsTx.map(o => o.fxi).filter(v => v != null);
                if (fxiVals.length > 0) fxi = Math.max(...fxiVals);

                const ffVals = obsTx.map(o => o.ff).filter(v => v != null);
                if (ffVals.length > 0) ff = ffVals.reduce((a, b) => a + b, 0) / ffVals.length;
            } else if (obsTx.length >= 100) {
                rr = obsTx.reduce((sum, o) => sum + (o.rr_per > 0 ? o.rr_per : 0), 0);
            }

            results.push({ day: d, tx, tn, rr, sun: 0, fxi, ff, isValid });
        }
        return results;
    };

    const calculateMonthStats = (daily) => {
        const valids = daily.filter(d => d.isValid || (d.tx !== null && d.tn !== null));
        if (daily.filter(d => d.tx !== null || d.tn !== null).length === 0) return null;

        const txs = daily.map(d => d.tx).filter(v => v != null);
        const tns = daily.map(d => d.tn).filter(v => v != null);
        const rrs = daily.map(d => d.rr).filter(v => v != null);
        const suns = daily.map(d => d.sun).filter(v => v != null);

        const fxis = daily.map(d => d.fxi).filter(v => v != null);

        return {
            isFull: valids.length >= 20,
            count: valids.length,
            meanTx: txs.length ? txs.reduce((a, b) => a + b, 0) / txs.length : null,
            meanTn: tns.length ? tns.reduce((a, b) => a + b, 0) / tns.length : null,
            totalRr: rrs.reduce((a, b) => a + b, 0),
            totalSun: suns.reduce((a, b) => a + b, 0),
            maxGust: fxis.length ? Math.max(...fxis) : null,
            rainDays: daily.filter(d => d.rr >= 1).length
        };
    };

    const exportCSV = () => {
        const headers = ["Jour;Tx;Tn;RR;Soleil"];
        const rows = monthlyData.map(d => `${d.day};${d.tx ?? '-'};${d.tn ?? '-'};${d.rr?.toFixed(1) ?? '-'};${d.sun?.toFixed(1) ?? '-'}`);
        const blob = new Blob(["\ufeff" + [headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${aggMode.toUpperCase()}_${stationId}_${selectedYear}_${selectedMonth + 1}.csv`;
        link.click();
    };

    if (loading) return <div className="monthly-loading">Chargement de la climatologie...</div>;

    return (
        <div className="monthly-climate-table">
            <div className="monthly-header">
                <div className="monthly-title">
                    <span className="station-label">RELEVÉS CLIMATOLOGIQUES {aggMode.toUpperCase()}</span>
                    <h2>{MONTHS[selectedMonth]} {selectedYear}</h2>
                    <p className="station-meta">{stationName} ({stationId})</p>
                </div>

                <div className="monthly-controls">
                    <div className="mode-toggle" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginRight: '10px' }}>
                        <button
                            className={`toggle-btn ${aggMode === 'civil' ? 'active' : ''}`}
                            onClick={() => setAggMode('civil')}
                            style={{
                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                                background: aggMode === 'civil' ? 'white' : 'transparent', color: aggMode === 'civil' ? '#2563eb' : '#64748b',
                                boxShadow: aggMode === 'civil' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            0-23h (Civil)
                        </button>
                        <button
                            className={`toggle-btn ${aggMode === 'omm' ? 'active' : ''}`}
                            onClick={() => setAggMode('omm')}
                            style={{
                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                                background: aggMode === 'omm' ? 'white' : 'transparent', color: aggMode === 'omm' ? '#2563eb' : '#64748b',
                                boxShadow: aggMode === 'omm' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            OMM (Strict)
                        </button>
                    </div>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <button className="export-btn" onClick={exportCSV}><Download size={18} /> CSV</button>
                </div>
            </div>

            {stats && (
                <div className="monthly-chart-section card animate-fade-in" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white' }}>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Comparaison Températures vs Normales
                    </h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="day"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <YAxis
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    unit="°"
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value, name) => {
                                        if (name === 'Normale Tx' || name === 'Normale Tn') return [`${value.toFixed(1)}°C`];
                                        return [`${value.toFixed(1)}°C`];
                                    }}
                                />
                                {/* Zone Tx/Tn */}
                                <Area type="monotone" dataKey="tx" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="Tx (Max)" connectNulls />
                                <Area type="monotone" dataKey="tn" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} name="Tn (Min)" connectNulls />

                                {/* Lignes des Normales (Statiques sur le mois) */}
                                {normals && normals.tx && normals.tx[selectedMonth] !== undefined && (
                                    <Line type="monotone" dataKey={() => normals.tx[selectedMonth]} stroke="#fca5a5" strokeDasharray="5 5" dot={false} strokeWidth={1} name="Normale Tx" />
                                )}
                                {normals && normals.tn && normals.tn[selectedMonth] !== undefined && (
                                    <Line type="monotone" dataKey={() => normals.tn[selectedMonth]} stroke="#93c5fd" strokeDasharray="5 5" dot={false} strokeWidth={1} name="Normale Tn" />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {!stats?.isFull && (
                <div className="incomplete-banner">
                    <AlertTriangle size={18} />
                    <span>Statistiques basées sur {stats?.count || 0}/25 jours minima requis.</span>
                </div>
            )}

            <div className="monthly-table-wrapper">
                <table className="monthly-table omm-strict-style">
                    <thead>
                        <tr>
                            <th>Jour</th>
                            <th>{aggMode === 'omm' ? 'Tx (06-06 TU)' : 'Tx (0-24h)'}</th>
                            <th>{aggMode === 'omm' ? 'Tn (18-18 TU)' : 'Tn (0-24h)'}</th>
                            <th>{aggMode === 'omm' ? 'RR (06-06 TU)' : 'RR (0-24h)'}</th>
                            <th>Rafale (km/h)</th>
                            <th>Vent moy.</th>
                            <th>Soleil (h)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map(d => (
                            <tr key={d.day} className={!d.isValid ? 'invalid-row' : ''}>
                                <td className="day-col">{d.day}</td>
                                <td className={`tx-col ${d.tx >= 25 ? 'is-hot' : ''}`}>{d.tx !== null ? d.tx.toFixed(1) + '°' : '-'}</td>
                                <td className={`tn-col ${d.tn <= 0 ? 'is-frost' : ''}`}>{d.tn !== null ? d.tn.toFixed(1) + '°' : '-'}</td>
                                <td className="rr-col">{d.rr > 0 ? d.rr.toFixed(1) + ' mm' : (d.tx !== null ? '0.0 mm' : '-')}</td>
                                <td className="wind-col" style={{ fontWeight: d.fxi >= 60 ? 'bold' : 'normal', color: d.fxi >= 100 ? '#ef4444' : 'inherit' }}>{d.fxi !== null ? Math.round(d.fxi) : '-'}</td>
                                <td className="wind-col">{d.ff !== null ? Math.round(d.ff) : '-'}</td>
                                <td className="sun-col">{d.tx !== null ? d.sun.toFixed(1) + ' h' : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                    {stats?.isFull && (
                        <tfoot>
                            <tr className="monthly-summary">
                                <td>MOYENNES/TOT</td>
                                <td>{stats.meanTx?.toFixed(1)}°</td>
                                <td>{stats.meanTn?.toFixed(1)}°</td>
                                <td>{stats.totalRr?.toFixed(1)} mm</td>
                                <td>{stats.maxGust ? stats.maxGust + ' km/h' : '-'}</td>
                                <td>-</td>
                                <td>{stats.totalSun?.toFixed(1)} h</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
