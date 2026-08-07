import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Droplets, Thermometer, Navigation, RefreshCw } from 'lucide-react';
import { weatherAPI } from '../../services/api';
import clsx from 'clsx';
import './StationsList.css';

// Coordinates and IDs for official Météo France stations
const STATIONS_DB = [
    { id: '59178001', name: 'DOUAI-FERIN', dist: 5, lat: 50.320, lon: 3.067 },
    { id: '59350005', name: 'LILLE-LESQUIN', dist: 25, lat: 50.5619, lon: 3.0894 },
    { id: '62298001', name: 'CAMBRAI-EPINOY', dist: 22, lat: 50.222, lon: 3.155 },
    { id: '62747001', name: 'ARRAS', dist: 24, lat: 50.291, lon: 2.777 },
    { id: '59306001', name: 'VALENCIENNES', dist: 30, lat: 50.35, lon: 3.533 },
    { id: '59273001', name: 'DUNKERQUE', dist: 85, lat: 51.05, lon: 2.366 }
];

export default function StationsList() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [maxDist, setMaxDist] = useState(100);

    // Load real data for each station
    const loadStations = async () => {
        setLoading(true);
        const promises = STATIONS_DB.map(async (station) => {
            // Priority to Météo France observations
            let obs = await weatherAPI.getMeteoFranceObservations(station.id);

            // Fallback to Open-Meteo if MF fails or no data
            if (!obs) {
                obs = await weatherAPI.getRealTimeObservations(station.lat, station.lon);
            }

            return { ...station, obs };
        });

        const results = await Promise.all(promises);
        setStations(results);
        setLoading(false);
    };

    useEffect(() => {
        loadStations();
        const interval = setInterval(loadStations, 600000); // Auto-refresh 10 mins
        return () => clearInterval(interval);
    }, []);

    const filteredStations = stations.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDist = s.dist <= maxDist;
        return matchesSearch && matchesDist;
    });

    return (
        <div className="stations-container">
            <div className="stations-header card">
                <div>
                    <h2>Relevés Temps Réel Officiels</h2>
                    <p className="text-muted">Source: Météo-France (API Climatologique)</p>
                </div>
                <button className="btn-refresh" onClick={loadStations} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    Actualiser
                </button>
            </div>

            <div className="filters-bar card">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une ville..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="dist-filter">
                    <label>Rayon: {maxDist} km</label>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        step="10"
                        value={maxDist}
                        onChange={(e) => setMaxDist(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="stations-grid">
                {loading && stations.length === 0 ? (
                    <div className="loading-card">Chargement des relevés...</div>
                ) : (
                    filteredStations.map(station => (
                        <div key={station.id} className="station-card card">
                            <div className="station-header">
                                <h3>{station.name}</h3>
                                <span className="dist-badge">{station.dist} km</span>
                            </div>

                            {station.obs ? (
                                <div className="metrics-grid">
                                    <div className="metric">
                                        <Thermometer className="icon text-danger" size={20} />
                                        <div className="metric-val">{station.obs.temp}°C</div>
                                        <div className="metric-label">Température</div>
                                    </div>
                                    <div className="metric">
                                        <Droplets className="icon text-primary" size={20} />
                                        <div className="metric-val">{station.obs.rain ?? 0} mm</div>
                                        <div className="metric-label">Pluie 1h</div>
                                    </div>
                                    <div className="metric">
                                        <Wind className="icon text-muted" size={20} />
                                        <div className="metric-val">{station.obs.wind} km/h</div>
                                        <div className="metric-label">Vent ({station.obs.gust} raf.)</div>
                                    </div>
                                    <div className="metric">
                                        <Navigation className="icon" size={20} style={{ transform: `rotate(${station.obs.dir}deg)` }} />
                                        <div className="metric-val">{station.obs.pressure} hPa</div>
                                        <div className="metric-label">Pression</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="error-text">Données indisponibles</div>
                            )}

                            <div className="station-footer">
                                <small>Mis à jour: {station.obs ? station.obs.time.toLocaleTimeString() : '--:--'}</small>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
