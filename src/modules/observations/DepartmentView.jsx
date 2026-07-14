import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { weatherAPI } from '../../services/api';
import { geoService } from '../../services/geoService';
import { DEPARTMENTS } from '../../data/departments';
import {
    Thermometer, Wind, Droplets, MapPin,
    ArrowLeft, Activity, Info, ChevronRight,
    TrendingUp, CloudRain, Clock
} from 'lucide-react';
import './Observations.css';

export default function DepartmentView() {
    const { deptCode } = useParams();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stationNames, setStationNames] = useState({});
    const department = DEPARTMENTS.find(d => d.code === deptCode);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await weatherAPI.getDepartmentLatest(deptCode);
            setStations(data);
            setLoading(false);

            // Resolve names in background
            const names = { ...stationNames };
            for (const s of data) {
                const id = s.station_id;
                if (!names[id]) {
                    const name = await geoService.getCommuneName(id.substring(0, 5));
                    names[id] = name;
                }
            }
            setStationNames(names);
        }
        load();
        const interval = setInterval(load, 60000 * 6); // Refresh every 6 mins
        return () => clearInterval(interval);
    }, [deptCode]);

    if (loading) return (
        <div className="loading-container">
            <Activity className="spin" size={48} />
            <p>Chargement des stations du département {deptCode}...</p>
        </div>
    );

    const stats = {
        avgTemp: stations.length ? (stations.reduce((acc, s) => acc + (s.latest.t || 0), 0) / stations.filter(s => s.latest.t !== null).length).toFixed(1) : '--',
        maxWind: stations.length ? Math.max(...stations.map(s => s.latest.fxi || s.latest.ff || 0)) : '--',
        rainyStations: stations.filter(s => s.latest.rr_per > 0).length
    };

    return (
        <div className="observation-view animate-fade-in">
            <header className="view-header">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} />
                    <span>Retour</span>
                </Link>
                <div className="title-group">
                    <h1>{department?.name} ({deptCode})</h1>
                    <p className="subtitle">{stations.length} stations actives détectées</p>
                </div>
            </header>

            <div className="stats-row">
                <div className="stat-pill card">
                    <Thermometer size={20} className="text-danger" />
                    <div>
                        <span className="label">Moyenne Dept.</span>
                        <span className="value">{stats.avgTemp}°C</span>
                    </div>
                </div>
                <div className="stat-pill card">
                    <Wind size={20} className="text-primary" />
                    <div>
                        <span className="label">Rafale Max</span>
                        <span className="value">{stats.maxWind} km/h</span>
                    </div>
                </div>
                <div className="stat-pill card">
                    <CloudRain size={20} className="text-info" />
                    <div>
                        <span className="label">Stations sous pluie</span>
                        <span className="value">{stats.rainyStations} / {stations.length}</span>
                    </div>
                </div>
            </div>

            <div className="stations-grid">
                {stations.map(station => (
                    <div key={station.station_id} className="station-card-wrapper">
                        <div className="card station-node">
                            <Link to={`/observations/station/${station.station_id}`} className="node-link">
                                <div className="node-header">
                                    <div className="node-id-group">
                                        <div className="node-name">{stationNames[station.station_id] || 'Chargement...'}</div>
                                        <div className="node-id shadow-sm">
                                            <MapPin size={12} />
                                            <span>{station.station_id}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="arrow" />
                                </div>

                                <div className="node-main">
                                    <span className="temp">{station.latest.t !== null ? `${station.latest.t.toFixed(1)}°` : '--'}</span>
                                    <div className="secondary">
                                        <div className="item">
                                            <Wind size={14} />
                                            <span>{station.latest.ff !== null ? Math.round(station.latest.ff) : '--'} km/h</span>
                                        </div>
                                        <div className="item">
                                            <Droplets size={14} />
                                            <span>{station.latest.u || '--'}%</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <div className="mini-history">
                                <div className="history-header">
                                    <Clock size={12} />
                                    <span>Chronologie récente (6 min)</span>
                                </div>
                                <div className="history-table">
                                    {station.history.slice(1, 5).map((h, idx) => (
                                        <div key={idx} className="history-row">
                                            <span className="h-time">{new Date(h.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="h-temp">{(h.t ?? 0).toFixed(1)}°</span>
                                            <span className="h-wind">{(h.ff ?? 0).toFixed(0)} <small>km/h</small></span>
                                            {h.rr_per > 0 && <span className="h-rain">🌧️ {h.rr_per.toFixed(1)}mm</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="node-footer time">
                                <Activity size={12} />
                                <span>Dernière actualisation : {new Date(station.latest.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {stations.length === 0 && (
                <div className="empty-state card">
                    <Info size={48} />
                    <h3>Aucune donnée récente</h3>
                    <p>Météo-France n'a pas encore publié de relevés pour ce département dans les 30 dernières minutes.</p>
                </div>
            )}
        </div>
    );
}
