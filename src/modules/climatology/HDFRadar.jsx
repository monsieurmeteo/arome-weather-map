import React, { useState, useMemo } from 'react';
import {
    Zap, Calendar, Download, MapPin,
    TrendingUp, Loader2, Thermometer,
    CloudRain, Wind, Search, Trophy
} from 'lucide-react';
import { fetchMeteocielArchives } from '../../services/meteocielService';
import globalRecords from '../../data/global_daily_records.json';
import stationsIndex from '../../data/stations_index.json';
import './HDFRadar.css';

export default function HDFRadar() {
    const today = new Date().toISOString().split('T')[0];
    const [targetDate, setTargetDate] = useState(today);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [sessionOverrides, setSessionOverrides] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleScan = async () => {
        setLoading(true);
        setError(null);
        try {
            const modes = [
                { key: 'tx', id: '25' },
                { key: 'tn', id: '26' },
                { key: 'rr', id: '28' }
            ];

            const allObs = {};

            for (const mode of modes) {
                const data = await fetchMeteocielArchives(targetDate, mode.id);
                data.forEach(obs => {
                    // Attempt to match by name or ID if available
                    // Simple matching for now based on station name (normalized)
                    const stationKey = obs.station.toUpperCase();
                    if (!allObs[stationKey]) {
                        allObs[stationKey] = { tx: null, tn: null, rr: null, dept: obs.dept };
                    }
                    allObs[stationKey][mode.key] = obs.value;
                });
                await new Promise(r => setTimeout(r, 200));
            }

            const mm_dd = targetDate.split('-').slice(1).join('-');
            const dailyRecords = { ...(globalRecords[mm_dd] || {}), ...(sessionOverrides[mm_dd] || {}) };

            const scanResults = stationsIndex.map(s => {
                // Find observation for this station
                // In the index, names are uppercase
                const obs = allObs[s.name.toUpperCase()];
                const rec = dailyRecords[s.id] || { tx: null, tn: null, rr: null };

                let risk = 'none';
                let details = [];
                let updatedRec = { ...rec };

                if (obs) {
                    if (obs.tx !== null && rec.tx) {
                        if (obs.tx > rec.tx.val) {
                            risk = 'critical';
                            details.push(`TX Record: ${obs.tx}° (Ancien: ${rec.tx.val}°)`);
                            updatedRec.tx = { val: obs.tx, year: new Date().getFullYear() };
                        } else if (obs.tx >= rec.tx.val - 2) {
                            if (risk !== 'critical') risk = 'warning';
                            details.push(`TX Proche: ${obs.tx}° (Rec: ${rec.tx.val}°)`);
                        }
                    }
                    if (obs.tn !== null && rec.tn) {
                        if (obs.tn < rec.tn.val) {
                            risk = 'critical';
                            details.push(`TN Record: ${obs.tn}° (Ancien: ${rec.tn.val}°)`);
                            updatedRec.tn = { val: obs.tn, year: new Date().getFullYear() };
                        } else if (obs.tn <= rec.tn.val + 2) {
                            if (risk !== 'critical') risk = 'warning';
                            details.push(`TN Proche: ${obs.tn}° (Rec: ${rec.tn.val}°)`);
                        }
                    }
                    if (obs.rr !== null && rec.rr) {
                        if (obs.rr > rec.rr.val) {
                            risk = 'critical';
                            details.push(`RR Record: ${obs.rr}mm (Ancien: ${rec.rr.val}mm)`);
                            updatedRec.rr = { val: obs.rr, year: new Date().getFullYear() };
                        } else if (obs.rr >= rec.rr.val * 0.9) {
                            if (risk !== 'critical') risk = 'warning';
                            details.push(`RR Proche: ${obs.rr}mm (Rec: ${rec.rr.val}mm)`);
                        }
                    }
                }

                const isNew = risk === 'critical';
                if (isNew) {
                    setSessionOverrides(prev => ({
                        ...prev,
                        [mm_dd]: { ...(prev[mm_dd] || {}), [s.id]: updatedRec }
                    }));
                }

                return { ...s, obs, rec: updatedRec, risk, details, isNew };
            }).sort((a, b) => {
                if (a.risk === 'critical' && b.risk !== 'critical') return -1;
                if (b.risk === 'critical' && a.risk !== 'critical') return 1;
                return a.name.localeCompare(b.name);
            });

            setResults(scanResults);
        } catch (e) {
            setError("Erreur scan: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dept.includes(searchTerm)
    );

    return (
        <div className="hdf-radar-module">
            <header className="module-header">
                <div className="header-title">
                    <Zap size={24} className="icon-pulse" />
                    <div>
                        <h1>Radar Records HDF</h1>
                        <p>Détection automatique des records journaliers (Hauts-de-France)</p>
                    </div>
                </div>

                <div className="header-controls">
                    <div className="date-picker-wrap">
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                        />
                    </div>
                    <button className="scan-btn" onClick={handleScan} disabled={loading}>
                        {loading ? <Loader2 size={18} className="spin" /> : 'Lancer le Scan Régional'}
                    </button>
                </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <div className="stats-row">
                <div className="stat-card">
                    <MapPin size={20} />
                    <span>{stationsIndex.length} Stations Indexed</span>
                </div>
                {results.length > 0 && (
                    <>
                        <div className="stat-card broken">
                            <Trophy size={20} />
                            <span>{results.filter(r => r.risk === 'critical').length} Records Battus</span>
                        </div>
                        <div className="stat-card warning">
                            <TrendingUp size={20} />
                            <span>{results.filter(r => r.risk === 'warning').length} Records Menacés</span>
                        </div>
                    </>
                )}
            </div>

            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Filtrer par ville ou département (59, 62, 02...)"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="results-container">
                {results.length === 0 ? (
                    <div className="empty-state">
                        <Zap size={64} />
                        <h2>Prêt pour l'analyse</h2>
                        <p>Sélectionnez une date et lancez le scan pour comparer les observations aux records historiques.</p>
                    </div>
                ) : (
                    <table className="radar-table">
                        <thead>
                            <tr>
                                <th>Station</th>
                                <th>Status</th>
                                <th>Observation</th>
                                <th>Record ({targetDate.split('-').slice(1).reverse().join('/')})</th>
                                <th>Analyse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map(r => (
                                <tr key={r.id} className={r.risk}>
                                    <td className="station-cell">
                                        <strong>{r.name}</strong>
                                        <span>{r.id} • Dept {r.dept}</span>
                                    </td>
                                    <td className="status-cell">
                                        <span className={`badge ${r.risk}`}>
                                            {r.isNew ? 'NOUVEAU RECORD' : r.risk.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="obs-cell">
                                        {r.obs ? (
                                            <div>
                                                <strong>{r.obs.tx ?? '--'}°</strong> / {r.obs.tn ?? '--'}°
                                                <small>{r.obs.rr ?? 0} mm</small>
                                            </div>
                                        ) : '---'}
                                    </td>
                                    <td className="rec-cell">
                                        <div>
                                            <strong>{r.rec.tx?.val ?? '--'}°</strong> / {r.rec.tn?.val ?? '--'}°
                                            <small>{r.rec.rr?.val ?? '--'} mm</small>
                                        </div>
                                    </td>
                                    <td className="details-cell">
                                        {r.details.length > 0 ? r.details.join(' | ') : 'Conditions normales'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {Object.keys(sessionOverrides).length > 0 && (
                <div className="save-footer">
                    <p>Des nouveaux records ont été détectés durant cette session.</p>
                    <button onClick={() => {
                        const blob = new Blob([JSON.stringify({ ...globalRecords, ...sessionOverrides }, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `records_updated_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                    }}>
                        <Download size={16} /> Exporter les Records Mis à Jour
                    </button>
                </div>
            )}
        </div>
    );
}
