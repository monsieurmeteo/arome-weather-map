import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
    Search, RefreshCw, Filter, ArrowLeft, Navigation, FileText
} from 'lucide-react';
import { meteoCollector } from '../../services/meteoFranceCollector';
import { geoService } from '../../services/geoService';
import { weatherAPI } from '../../services/api';
import { DEPARTMENTS } from '../../data/departments';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import './StationsTable.css';

export default function StationsTable() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('');

    // État pour le mode Détail
    const [selectedStation, setSelectedStation] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [errorHistory, setErrorHistory] = useState(null);

    const [stationNames, setStationNames] = useState({});

    // Charger la liste des stations (Source Unique: meteoCollector)
    useEffect(() => {
        const loadStations = () => {
            setLoading(true);
            const data = meteoCollector.getLatestData();
            if (data && data.length > 0) {
                setStations(data);
                // Résolution noms (optimisé)
                data.forEach(station => {
                    const id = station.geo_id_insee || station.id;
                    if (id && id.length >= 5 && !stationNames[id]) {
                        geoService.getCommuneName(id.substring(0, 5), id).then(name => {
                            setStationNames(prev => ({ ...prev, [id]: name }));
                        });
                    }
                });
            } else {
                // Si vide, on tente de charger du cache
                meteoCollector.loadHistoryFromStorage();
                const cached = meteoCollector.getLatestData();
                if (cached.length > 0) setStations(cached);
                // Si toujours vide, la carte le lancera via le collector global
            }
            setLoading(false);
        };

        loadStations();
        // S'abonner aux mises à jour (Polling rapide sur le collector local)
        const interval = setInterval(loadStations, 5000);
        return () => clearInterval(interval);
    }, []);

    // Charger l'historique
    useEffect(() => {
        if (!selectedStation) {
            setHistoryData([]);
            return;
        }

        const fetchHistory = async () => {
            setLoadingHistory(true);
            setErrorHistory(null);
            try {
                const id = selectedStation.geo_id_insee || selectedStation.id;

                // 1. Récupérer le cache LOCAL (Données fraîches)
                const localHist = meteoCollector.getStationHistory(id) || [];
                const localFormatted = localHist.map(h => ({
                    time: new Date(h.receivedAt || h.validity_time || Date.now()),
                    temp: h.t,
                    dewpoint: h.td,
                    hum: h.u,
                    wind: h.ff,
                    gust: h.gust_kmh,
                    dir: h.dd,
                    rain: h.rr_per,
                    pressure: h.pres
                }));

                // 2. Récupérer l'historique SUPABASE (Données archivées : 6mn ET Horaire) via l'API unifiée
                let dbFormatted = [];
                try {
                    const [res6mn, resHoraire] = await Promise.all([
                        weatherAPI.getStation6mnHistory(id),
                        weatherAPI.getStationHourlyHistory(id)
                    ]);

                    // Note: Nos fonctions API renvoient déjà les données formatées et triées chronologiquement (asc)
                    // Mais le tableau attend un ordre décroissant (plus récent en haut)
                    dbFormatted = [
                        ...res6mn.map(h => ({ 
                            ...h, 
                            rain: h.rain_1h || h.rain,
                            // Adaptation du format attendu par le tableau
                            timestamp: h.time.toISOString()
                        })),
                        ...resHoraire.map(h => ({
                            ...h,
                            timestamp: h.time.toISOString()
                        }))
                    ];
                } catch (e) {
                    console.warn("Erreur lecture Supabase", e);
                }

                // 3. Fusionner (Priorité au Local pour les données très récentes)
                const mergedMap = new Map();

                // D'abord Supabase
                dbFormatted.forEach(item => mergedMap.set(item.time.getTime(), item));
                // Ensuite Local (écrase si doublon)
                localFormatted.forEach(item => mergedMap.set(item.time.getTime(), item));

                const mergedData = Array.from(mergedMap.values())
                    .sort((a, b) => b.time - a.time); // Tri décroissant

                if (mergedData.length > 0) {
                    setHistoryData(mergedData);
                } else {
                    // 4. Si RIEN, tenter l'API Météo France (Secours)
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), 4000)
                    );
                    const data = await Promise.race([
                        weatherAPI.getMeteoFranceObservations(id),
                        timeoutPromise
                    ]);
                    if (data && Array.isArray(data)) {
                        setHistoryData([...data].reverse());
                    } else {
                        throw new Error("Pas de données");
                    }
                }
            } catch (err) {
                console.warn("Erreur fetchHistory:", err);
                setErrorHistory("Données historiques indisponibles pour le moment.");
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [selectedStation]);

    // Filtrage liste
    const filteredStations = useMemo(() => {
        return stations.filter(s => {
            const id = s.geo_id_insee || s.id;
            if (!id) return false;
            const name = stationNames[id] || '';
            const dep = id.substring(0, 2);

            const matchSearch = searchTerm === '' ||
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                id.includes(searchTerm);
            const matchDept = selectedDept === '' || dep === selectedDept;
            return matchSearch && matchDept;
        });
    }, [stations, searchTerm, selectedDept, stationNames]);


    // --- RENDU DÉTAIL ---
    if (selectedStation) {
        const id = selectedStation.geo_id_insee || selectedStation.id || 'Unknown';
        const name = stationNames[id] || `Station ${id}`;
        const codeInsee = id.length >= 5 ? id.substring(0, 5) : '00000';
        const deptCode = codeInsee.substring(0, 2);
        const deptName = DEPARTMENTS[deptCode] || deptCode;

        // --- BLINDAGE DES DONNÉES ---
        const validData = historyData.filter(d => d && d.time instanceof Date && !isNaN(d.time.getTime()));

        // Prépa graphiques (chronologique)
        const chartData = [...validData].reverse().map(d => ({
            ...d,
            timeStr: d.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temp: d.temp ?? undefined,
            wind: d.wind ?? undefined,
            rain: d.rain ?? 0
        }));

        const temps = validData.map(d => d.temp).filter(t => t !== null && t !== undefined);
        const maxTemp = temps.length ? Math.max(...temps) : null;
        const minTemp = temps.length ? Math.min(...temps) : null;

        const gusts = validData.map(d => d.gust).filter(g => g !== null && g !== undefined);
        const maxGust = gusts.length ? Math.max(...gusts) : 0;

        const totalRain = validData.reduce((acc, d) => acc + (d.rain || 0), 0);

        return (
            <div className="stations-table-container">
                <button className="btn-back" onClick={() => setSelectedStation(null)}>
                    <ArrowLeft size={16} /> Retour à la liste
                </button>

                <div className="station-dashboard">
                    <div className="dashboard-header card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1>{name} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>({id})</span></h1>
                            <div className="station-meta">
                                {deptName} • Lat: {typeof selectedStation.lat === 'number' && !isNaN(selectedStation.lat) ? selectedStation.lat.toFixed(3) : '-'} Lon: {typeof selectedStation.lon === 'number' && !isNaN(selectedStation.lon) ? selectedStation.lon.toFixed(3) : '-'}
                            </div>
                        </div>
                        <a
                            href={`https://donneespubliques.meteofrance.fr/FichesClim/FICHECLIM_${id}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline"
                            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#1e293b', gap: '8px', fontSize: '0.85rem', fontWeight: '600' }}
                        >
                            <FileText size={16} />
                            Fiche Climatologique
                        </a>
                    </div>

                    <div className="summary-grid">
                        <div className="card summary-card">
                            <span className="summary-label">Max</span>
                            <span className="summary-value val-temp">{typeof maxTemp === 'number' && !isNaN(maxTemp) ? maxTemp.toFixed(1) : '-'}°C</span>
                        </div>
                        <div className="card summary-card">
                            <span className="summary-label">Min</span>
                            <span className="summary-value" style={{ color: '#0ea5e9' }}>{typeof minTemp === 'number' && !isNaN(minTemp) ? minTemp.toFixed(1) : '-'}°C</span>
                        </div>
                        <div className="card summary-card">
                            <span className="summary-label">Vent Max</span>
                            <span className="summary-value val-wind">{maxGust} <small>km/h</small></span>
                        </div>
                        <div className="card summary-card">
                            <span className="summary-label">Pluie 24h</span>
                            <span className="summary-value val-rain">{typeof totalRain === 'number' && !isNaN(totalRain) ? totalRain.toFixed(1) : '0.0'} <small>mm</small></span>
                        </div>
                    </div>

                    <div className="dashboard-content">
                        {/* TABLEAU GAUCHE */}
                        <div className="detailed-table-section card">
                            <div className="section-title">Relevés détaillés</div>
                            <div className="scrollable-table-wrapper">
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Heure</th>
                                            <th>Temp.</th>
                                            <th>Pt. Rosée</th> {/* Colonne ajoutée */}
                                            <th>Hum.</th>
                                            <th>Vent (Raf.)</th>
                                            <th>Pluie</th>
                                            <th>Press.</th>
                                            <th>Vis.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingHistory && <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</td></tr>}
                                        {errorHistory && !loadingHistory && <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{errorHistory}</td></tr>}
                                        {!loadingHistory && validData.length === 0 && !errorHistory && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Aucune donnée valide.</td></tr>}

                                        {!loadingHistory && validData.map((d, i) => (
                                            <tr key={i}>
                                                <td>{d.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="val-temp">{typeof d.temp === 'number' && !isNaN(d.temp) ? d.temp.toFixed(1) : '-'} °C</td>
                                                <td style={{ color: '#2563eb', fontWeight: '500' }}>{typeof d.dewpoint === 'number' && !isNaN(d.dewpoint) ? d.dewpoint.toFixed(1) : '-'} °C</td> {/* Point de rosée */}
                                                <td className="val-hum">{d.hum ?? '-'} %</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                        {d.wind ?? '-'} km/h
                                                        <small className="val-wind">({d.gust ?? '-'})</small>
                                                        {d.dir !== null && d.dir !== undefined && (
                                                            <Navigation
                                                                size={14}
                                                                style={{ transform: `rotate(${d.dir}deg)`, color: '#64748b' }}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={d.rain > 0 ? "val-rain" : ""}>{d.rain ?? 0} mm</td>
                                                <td style={{ color: '#2563eb', fontWeight: '600' }}>
                                                    {typeof d.pressure === 'number' && !isNaN(d.pressure) ? (d.pressure / 100).toFixed(1) : '-'} hPa
                                                </td>
                                                <td style={{ color: '#6366f1', fontWeight: '500' }}>
                                                    {d.vv !== null && d.vv !== undefined ? (d.vv / 1000).toFixed(1) + ' km' : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* GRAPHIQUES DROITE */}
                        <div className="charts-stack">
                            <div className="card chart-box">
                                <div className="chart-header">Température</div>
                                <div style={{ height: 200 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="timeStr" tick={{ fontSize: 10 }} interval={20} />
                                            <YAxis domain={['auto', 'auto']} />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="temp" stroke="#e11d48" dot={false} strokeWidth={2} name="Temp" />
                                            <Line type="monotone" dataKey="dewpoint" stroke="#2563eb" dot={false} strokeWidth={1} strokeDasharray="5 5" name="Pt. Rosée" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card chart-box">
                                <div className="chart-header">Vent</div>
                                <div style={{ height: 200 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="timeStr" tick={{ fontSize: 10 }} interval={20} />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="wind" stroke="#64748b" dot={false} strokeWidth={2} />
                                            <Line type="monotone" dataKey="gust" stroke="#ef4444" dot={false} strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card chart-box">
                                <div className="chart-header">Pluie</div>
                                <div style={{ height: 150 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="timeStr" tick={{ fontSize: 10 }} interval={20} />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Bar dataKey="rain" fill="#0ea5e9" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDU LISTE ---
    return (
        <div className="stations-table-container">
            <div className="card">
                <div className="controls-bar">
                    <div className="filters">
                        <div className="search-group">
                            <Search size={18} color="#94a3b8" />
                            <input type="text" placeholder="Ville, ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="dept-select">
                            <Filter size={18} color="#94a3b8" />
                            <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                                <option value="">Départements</option>
                                {Object.entries(DEPARTMENTS).map(([c, n]) => (
                                    <option key={c} value={c}>{c} - {n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {filteredStations.length} stations
                    </div>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Station</th>
                                <th>Dép.</th>
                                <th>Temp.</th>
                                <th>Vent</th>
                                <th>Vis.</th>
                                <th>Pluie 1h</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && filteredStations.map(s => {
                                const id = s.geo_id_insee || s.id;
                                const name = stationNames[id] || `Station ${id}`;
                                return (
                                    <tr key={id} onClick={() => setSelectedStation(s)} className="clickable-row">
                                        <td><strong>{name}</strong><br /><small>{id}</small></td>
                                        <td>{id.substring(0, 2)}</td>
                                        <td><span className="val-temp">{s.temp_celsius}°C</span></td>
                                        <td>{s.wind_kmh} km/h</td>
                                        <td>{s.vv !== null && s.vv !== undefined ? (s.vv / 1000).toFixed(1) + ' km' : '-'}</td>
                                        <td>{s.rr_per ?? 0} mm</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
