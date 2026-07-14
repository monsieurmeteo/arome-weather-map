import React, { useState, useEffect } from 'react';
import { Calendar, Search, Download, Wind, Droplets, Thermometer, Info, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { fetchStationHistory } from '../../services/meteocielService';
import stationNames from '../../data/stationNames.json';
import './MeteocielArchives.css';

const StationArchives = () => {
    const today = new Date().toISOString().split('T')[0];
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    const startDateDefault = defaultStart.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(startDateDefault);
    const [endDate, setEndDate] = useState(today);
    const [selectedStation, setSelectedStation] = useState("35281001"); // Par défaut Rennes
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetch = async () => {
        if (!startDate || !endDate || !selectedStation) return;

        setLoading(true);
        setError(null);
        try {
            const results = await fetchStationHistory(selectedStation, startDate, endDate);
            setData(results);
        } catch (err) {
            setError("Impossible de récupérer les données historiques du poste. Vérifiez le proxy ou la connexion.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!data.length) return;

        const stationName = stationNames[selectedStation] || selectedStation;
        const headers = ["Station", "Date", "TX (°C)", "TN (°C)", "RR (mm)", "FXI (km/h)"].join(";");
        const rows = data.map(item => `${stationName};${item.date};${item.tx ?? ''};${item.tn ?? ''};${item.rr ?? ''};${item.fxi ?? ''}`).join("\n");
        const csvContent = "\uFEFF" + headers + "\n" + rows;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `archives_${stationName}_${startDate}_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportFormatLogiciel = () => {
        if (!data.length) return;

        // Ordre voulu par la requête PowerQuery : POSTE, DATE, RR, TN, TX, FXI, HXI
        const headers = ["POSTE", "DATE", "RR", "TN", "TX", "FXI", "HXI"].join(";");

        const rows = data.map(item => {
            const dateFormatted = item.date.replace(/-/g, ''); // "2026-01-13" -> "20260113"
            const fxiMS = item.fxi !== undefined ? (item.fxi * 0.27778).toFixed(1).replace('.', ',') : '';
            const tx = item.tx !== undefined ? item.tx.toString().replace('.', ',') : '';
            const tn = item.tn !== undefined ? item.tn.toString().replace('.', ',') : '';
            const rr = item.rr !== undefined ? item.rr.toString().replace('.', ',') : '';

            return `${selectedStation};${dateFormatted};${rr};${tn};${tx};${fxiMS};1212`;
        }).join("\n");

        const csvContent = "\uFEFF" + headers + "\n" + rows;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `import_meteociel_${selectedStation}_${startDate}_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const sortedStationIds = Object.keys(stationNames).sort((a, b) => stationNames[a].localeCompare(stationNames[b]));

    return (
        <div className="archives-page">
            <header className="archives-hero">
                <h1>Archives par Station</h1>
                <p>Historique quotidien complet (TX, TN, RR, Rafales)</p>
            </header>

            <div className="archives-controls">
                <div className="control-group">
                    <label><MapPin size={18} /> Poste Météo :</label>
                    <select
                        value={selectedStation}
                        onChange={(e) => setSelectedStation(e.target.value)}
                        className="station-select"
                    >
                        {sortedStationIds.map(id => (
                            <option key={id} value={id}>{stationNames[id]} ({id})</option>
                        ))}
                    </select>
                </div>

                <div className="control-group" style={{ flex: 1.5 }}>
                    <label><Calendar size={18} /> Période :</label>
                    <div className="date-input-wrapper">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="archive-date-input"
                        />
                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 5px' }}>au</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="archive-date-input"
                        />
                    </div>
                </div>

                <div className="control-actions">
                    <button onClick={handleFetch} className="fetch-btn" disabled={loading}>
                        {loading ? "Calcul..." : <><Search size={18} /> Interroger</>}
                    </button>
                    <button onClick={exportToCSV} className="export-btn" disabled={!data.length}>
                        <Download size={18} /> CSV Standard
                    </button>
                    <button onClick={exportFormatLogiciel} className="export-btn" disabled={!data.length} style={{ background: '#8b5cf6' }}>
                        <Download size={18} /> Format Logiciel (m/s)
                    </button>
                </div>
            </div>

            {error && <div className="archive-error">{error}</div>}

            <section className="archive-results-section">
                <div className="ranking-table-container">
                    <div className="ranking-table-header" style={{ borderLeftColor: '#60a5fa' }}>
                        <Thermometer size={20} />
                        <h3>{stationNames[selectedStation]} ({selectedStation})</h3>
                        <span className="results-count">{data.length} jours récupérés</span>
                    </div>

                    <div className="ranking-table-wrapper">
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th className="rank-col">Date</th>
                                    <th className="value-col">TN (°C)</th>
                                    <th className="value-col">TX (°C)</th>
                                    <th className="value-col">Précip. (mm)</th>
                                    <th className="value-col">Vent (km/h)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="loading-row">⏳ Récupération de l'historique sur Meteociel... cela peut prendre quelques secondes.</td></tr>
                                ) : data.length > 0 ? (
                                    data.sort((a, b) => b.date.localeCompare(a.date)).map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="rank-col" style={{ width: '120px' }}>
                                                {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="value-col" style={{ color: '#60a5fa' }}>
                                                {item.tn !== undefined ? <strong>{item.tn.toFixed(1)}</strong> : '-'}
                                            </td>
                                            <td className="value-col" style={{ color: '#f87171' }}>
                                                {item.tx !== undefined ? <strong>{item.tx.toFixed(1)}</strong> : '-'}
                                            </td>
                                            <td className="value-col" style={{ color: '#60a5fa' }}>
                                                {item.rr !== undefined ? <>{item.rr.toFixed(1)}</> : '0.0'}
                                            </td>
                                            <td className="value-col" style={{ color: '#f59e0b' }}>
                                                {item.fxi !== undefined ? <strong>{Math.round(item.fxi)}</strong> : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="no-data">Lancez une recherche pour voir les données</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StationArchives;
