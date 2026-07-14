import React, { useState, useEffect } from 'react';
import { MapPin, Activity, Wind, Droplets, Thermometer, Download, Play, Pause, TrendingUp, Cloud, Eye } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { meteoCollector } from '../../services/meteoFranceCollector';
import './MeteoNational.css';

// Liste des départements français
const DEPARTMENTS = [
    { code: '01', name: 'Ain' },
    { code: '02', name: 'Aisne' },
    { code: '03', name: 'Allier' },
    { code: '04', name: 'Alpes-de-Haute-Provence' },
    { code: '05', name: 'Hautes-Alpes' },
    { code: '06', name: 'Alpes-Maritimes' },
    { code: '07', name: 'Ardèche' },
    { code: '08', name: 'Ardennes' },
    { code: '09', name: 'Ariège' },
    { code: '10', name: 'Aube' },
    { code: '11', name: 'Aude' },
    { code: '12', name: 'Aveyron' },
    { code: '13', name: 'Bouches-du-Rhône' },
    { code: '14', name: 'Calvados' },
    { code: '15', name: 'Cantal' },
    { code: '16', name: 'Charente' },
    { code: '17', name: 'Charente-Maritime' },
    { code: '18', name: 'Cher' },
    { code: '19', name: 'Corrèze' },
    { code: '21', name: 'Côte-d\'Or' },
    { code: '22', name: 'Côtes-d\'Armor' },
    { code: '23', name: 'Creuse' },
    { code: '24', name: 'Dordogne' },
    { code: '25', name: 'Doubs' },
    { code: '26', name: 'Drôme' },
    { code: '27', name: 'Eure' },
    { code: '28', name: 'Eure-et-Loir' },
    { code: '29', name: 'Finistère' },
    { code: '2A', name: 'Corse-du-Sud' },
    { code: '2B', name: 'Haute-Corse' },
    { code: '30', name: 'Gard' },
    { code: '31', name: 'Haute-Garonne' },
    { code: '32', name: 'Gers' },
    { code: '33', name: 'Gironde' },
    { code: '34', name: 'Hérault' },
    { code: '35', name: 'Ille-et-Vilaine' },
    { code: '36', name: 'Indre' },
    { code: '37', name: 'Indre-et-Loire' },
    { code: '38', name: 'Isère' },
    { code: '39', name: 'Jura' },
    { code: '40', name: 'Landes' },
    { code: '41', name: 'Loir-et-Cher' },
    { code: '42', name: 'Loire' },
    { code: '43', name: 'Haute-Loire' },
    { code: '44', name: 'Loire-Atlantique' },
    { code: '45', name: 'Loiret' },
    { code: '46', name: 'Lot' },
    { code: '47', name: 'Lot-et-Garonne' },
    { code: '48', name: 'Lozère' },
    { code: '49', name: 'Maine-et-Loire' },
    { code: '50', name: 'Manche' },
    { code: '51', name: 'Marne' },
    { code: '52', name: 'Haute-Marne' },
    { code: '53', name: 'Mayenne' },
    { code: '54', name: 'Meurthe-et-Moselle' },
    { code: '55', name: 'Meuse' },
    { code: '56', name: 'Morbihan' },
    { code: '57', name: 'Moselle' },
    { code: '58', name: 'Nièvre' },
    { code: '59', name: 'Nord' },
    { code: '60', name: 'Oise' },
    { code: '61', name: 'Orne' },
    { code: '62', name: 'Pas-de-Calais' },
    { code: '63', name: 'Puy-de-Dôme' },
    { code: '64', name: 'Pyrénées-Atlantiques' },
    { code: '65', name: 'Hautes-Pyrénées' },
    { code: '66', name: 'Pyrénées-Orientales' },
    { code: '67', name: 'Bas-Rhin' },
    { code: '68', name: 'Haut-Rhin' },
    { code: '69', name: 'Rhône' },
    { code: '70', name: 'Haute-Saône' },
    { code: '71', name: 'Saône-et-Loire' },
    { code: '72', name: 'Sarthe' },
    { code: '73', name: 'Savoie' },
    { code: '74', name: 'Haute-Savoie' },
    { code: '75', name: 'Paris' },
    { code: '76', name: 'Seine-Maritime' },
    { code: '77', name: 'Seine-et-Marne' },
    { code: '78', name: 'Yvelines' },
    { code: '79', name: 'Deux-Sèvres' },
    { code: '80', name: 'Somme' },
    { code: '81', name: 'Tarn' },
    { code: '82', name: 'Tarn-et-Garonne' },
    { code: '83', name: 'Var' },
    { code: '84', name: 'Vaucluse' },
    { code: '85', name: 'Vendée' },
    { code: '86', name: 'Vienne' },
    { code: '87', name: 'Haute-Vienne' },
    { code: '88', name: 'Vosges' },
    { code: '89', name: 'Yonne' },
    { code: '90', name: 'Territoire de Belfort' },
    { code: '91', name: 'Essonne' },
    { code: '92', name: 'Hauts-de-Seine' },
    { code: '93', name: 'Seine-Saint-Denis' },
    { code: '94', name: 'Val-de-Marne' },
    { code: '95', name: 'Val-d\'Oise' },
];

export default function MeteoNational() {
    const [isCollecting, setIsCollecting] = useState(false);
    const [latestData, setLatestData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('59'); // Nord par défaut
    const [departmentStations, setDepartmentStations] = useState([]);
    const [showGraphs, setShowGraphs] = useState(true);

    useEffect(() => {
        meteoCollector.loadFromLocalStorage();
        updateDisplay();

        const interval = setInterval(updateDisplay, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (latestData && selectedDepartment) {
            filterStationsByDepartment();
        }
    }, [latestData, selectedDepartment]);

    const updateDisplay = () => {
        setLatestData(meteoCollector.latestData);
        setStatistics(meteoCollector.getStatistics());
    };

    const filterStationsByDepartment = () => {
        if (!latestData) return;

        const filtered = latestData.filter(station =>
            station.geo_id_insee && station.geo_id_insee.startsWith(selectedDepartment)
        );

        setDepartmentStations(filtered);
    };

    const handleStartCollection = () => {
        meteoCollector.startAutoCollection();
        setIsCollecting(true);
    };

    const handleStopCollection = () => {
        meteoCollector.stopAutoCollection();
        setIsCollecting(false);
    };

    const handleExport = () => {
        meteoCollector.exportToJSON();
    };

    // Préparer les données pour les graphiques
    const prepareGraphData = () => {
        if (!departmentStations.length) return null;

        // Données de température
        const tempData = departmentStations
            .filter(s => s.temp_celsius !== null)
            .map((s, i) => ({
                name: `S${i + 1}`,
                station: s.geo_id_insee,
                température: s.temp_celsius,
                rosée: s.dewpoint_celsius
            }));

        // Données de vent
        const windData = departmentStations
            .filter(s => s.wind_kmh !== null)
            .map((s, i) => ({
                name: `S${i + 1}`,
                station: s.geo_id_insee,
                vent: s.wind_kmh,
                rafales: s.gust_kmh
            }));

        // Données d'humidité et pluie
        const humidityData = departmentStations
            .filter(s => s.u !== null || s.rr_per !== null)
            .map((s, i) => ({
                name: `S${i + 1}`,
                station: s.geo_id_insee,
                humidité: s.u,
                pluie: s.rr_per
            }));

        return { tempData, windData, humidityData };
    };

    const graphData = prepareGraphData();

    const getDepartmentStats = () => {
        if (!departmentStations.length) return null;

        const withTemp = departmentStations.filter(s => s.temp_celsius !== null);
        const withWind = departmentStations.filter(s => s.wind_kmh !== null);
        const withRain = departmentStations.filter(s => s.rr_per !== null && s.rr_per > 0);

        const temps = withTemp.map(s => s.temp_celsius);
        const winds = withWind.map(s => s.wind_kmh);

        return {
            total: departmentStations.length,
            tempMin: temps.length ? Math.min(...temps) : null,
            tempMax: temps.length ? Math.max(...temps) : null,
            tempAvg: temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : null,
            windMax: winds.length ? Math.max(...winds) : null,
            rainStations: withRain.length
        };
    };

    const deptStats = getDepartmentStats();

    if (!latestData) {
        return (
            <div className="meteo-national">
                <div className="loading-state">
                    <Activity className="spin" size={48} />
                    <h2>Chargement des données météo...</h2>
                    <button onClick={handleStartCollection} className="btn-primary">
                        <Play size={20} />
                        Démarrer la collecte
                    </button>
                </div>
            </div>
        );
    }

    const selectedDept = DEPARTMENTS.find(d => d.code === selectedDepartment);

    return (
        <div className="meteo-national">
            {/* Header */}
            <div className="meteo-header">
                <div className="header-title">
                    <Activity size={32} />
                    <div>
                        <h1>Météo France - Réseau National</h1>
                        <p className="subtitle">
                            {statistics?.totalStations || 0} stations • Mise à jour toutes les 6 minutes
                        </p>
                    </div>
                </div>

                <div className="header-controls">
                    {isCollecting ? (
                        <button onClick={handleStopCollection} className="btn-danger">
                            <Pause size={20} />
                            Arrêter
                        </button>
                    ) : (
                        <button onClick={handleStartCollection} className="btn-success">
                            <Play size={20} />
                            Démarrer
                        </button>
                    )}

                    <button onClick={handleExport} className="btn-secondary">
                        <Download size={20} />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Sélecteur de département */}
            <div className="department-selector">
                <h2>
                    <MapPin size={24} />
                    Sélectionnez un département
                </h2>
                <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="dept-select"
                >
                    {DEPARTMENTS.map(dept => (
                        <option key={dept.code} value={dept.code}>
                            {dept.code} - {dept.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Statistiques du département */}
            {deptStats && (
                <div className="dept-stats">
                    <h3>{selectedDept?.name} ({selectedDept?.code})</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <MapPin className="stat-icon" />
                            <div className="stat-content">
                                <div className="stat-value">{deptStats.total}</div>
                                <div className="stat-label">Stations</div>
                            </div>
                        </div>

                        {deptStats.tempMin !== null && (
                            <div className="stat-card">
                                <Thermometer className="stat-icon temp" />
                                <div className="stat-content">
                                    <div className="stat-value">
                                        {deptStats.tempMin}° / {deptStats.tempMax}°
                                    </div>
                                    <div className="stat-label">Min / Max</div>
                                </div>
                            </div>
                        )}

                        {deptStats.tempAvg !== null && (
                            <div className="stat-card">
                                <TrendingUp className="stat-icon" />
                                <div className="stat-content">
                                    <div className="stat-value">{deptStats.tempAvg}°C</div>
                                    <div className="stat-label">Moyenne</div>
                                </div>
                            </div>
                        )}

                        {deptStats.windMax !== null && (
                            <div className="stat-card">
                                <Wind className="stat-icon wind" />
                                <div className="stat-content">
                                    <div className="stat-value">{deptStats.windMax} km/h</div>
                                    <div className="stat-label">Vent max</div>
                                </div>
                            </div>
                        )}

                        {deptStats.rainStations > 0 && (
                            <div className="stat-card">
                                <Cloud className="stat-icon rain" />
                                <div className="stat-content">
                                    <div className="stat-value">{deptStats.rainStations}</div>
                                    <div className="stat-label">Stations avec pluie</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toggle graphiques */}
            <div className="graph-toggle">
                <button
                    onClick={() => setShowGraphs(!showGraphs)}
                    className="btn-toggle"
                >
                    {showGraphs ? '📊 Masquer les graphiques' : '📈 Afficher les graphiques'}
                </button>
            </div>

            {/* Graphiques */}
            {showGraphs && graphData && (
                <div className="graphs-section">
                    {/* Graphique Température */}
                    {graphData.tempData.length > 0 && (
                        <div className="graph-card">
                            <h3><Thermometer size={20} /> Températures par station</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={graphData.tempData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="température" stroke="#ef4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="rosée" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Graphique Vent */}
                    {graphData.windData.length > 0 && (
                        <div className="graph-card">
                            <h3><Wind size={20} /> Vent et rafales par station</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={graphData.windData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="vent" fill="#10b981" />
                                    <Bar dataKey="rafales" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Graphique Humidité/Pluie */}
                    {graphData.humidityData.length > 0 && (
                        <div className="graph-card">
                            <h3><Droplets size={20} /> Humidité et précipitations</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={graphData.humidityData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="humidité" stroke="#3b82f6" strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="pluie" stroke="#06b6d4" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Liste des stations */}
            <div className="stations-section">
                <h3>
                    <MapPin size={20} />
                    Stations du département ({departmentStations.length})
                </h3>

                <div className="stations-grid">
                    {departmentStations.map((station, index) => (
                        <div
                            key={station.geo_id_insee || index}
                            className="station-card"
                        >
                            <div className="station-header">
                                <MapPin size={16} />
                                <span className="station-id">{station.geo_id_insee}</span>
                            </div>

                            <div className="station-data">
                                {station.temp_celsius !== null && (
                                    <div className="data-row">
                                        <Thermometer size={16} />
                                        <span className="data-label">Temp:</span>
                                        <span className="data-value temp">{station.temp_celsius}°C</span>
                                    </div>
                                )}

                                {station.dewpoint_celsius !== null && (
                                    <div className="data-row">
                                        <Droplets size={16} />
                                        <span className="data-label">Rosée:</span>
                                        <span className="data-value">{station.dewpoint_celsius}°C</span>
                                    </div>
                                )}

                                {station.u !== null && (
                                    <div className="data-row">
                                        <Droplets size={16} />
                                        <span className="data-label">Humidité:</span>
                                        <span className="data-value">{station.u}%</span>
                                    </div>
                                )}

                                {station.wind_kmh !== null && (
                                    <div className="data-row">
                                        <Wind size={16} />
                                        <span className="data-label">Vent:</span>
                                        <span className="data-value">{station.wind_kmh} km/h</span>
                                    </div>
                                )}

                                {station.gust_kmh !== null && (
                                    <div className="data-row">
                                        <Wind size={16} />
                                        <span className="data-label">Rafales:</span>
                                        <span className="data-value">{station.gust_kmh} km/h</span>
                                    </div>
                                )}

                                {station.dd !== null && (
                                    <div className="data-row">
                                        <Wind size={16} />
                                        <span className="data-label">Direction:</span>
                                        <span className="data-value">{station.dd}°</span>
                                    </div>
                                )}

                                {station.rr_per !== null && station.rr_per > 0 && (
                                    <div className="data-row rain">
                                        <Cloud size={16} />
                                        <span className="data-label">Pluie:</span>
                                        <span className="data-value">{station.rr_per} mm</span>
                                    </div>
                                )}

                                {station.vv !== null && station.vv !== undefined && (
                                    <div className="data-row">
                                        <Eye size={16} />
                                        <span className="data-label">Visibilité:</span>
                                        <span className="data-value">{station.vv ? (station.vv / 1000).toFixed(1) : 'N/A'} km</span>
                                    </div>
                                )}
                            </div>

                            <div className="station-coords">
                                {station.lat.toFixed(3)}°N, {station.lon.toFixed(3)}°E
                            </div>
                        </div>
                    ))}
                </div>

                {departmentStations.length === 0 && (
                    <div className="no-stations">
                        <MapPin size={48} />
                        <p>Aucune station trouvée pour ce département</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="meteo-footer">
                <div className="update-info">
                    <Activity size={16} className={isCollecting ? 'pulse' : ''} />
                    <span>
                        Dernière mise à jour : {statistics?.lastUpdate ? new Date(statistics.lastUpdate).toLocaleString('fr-FR') : 'En attente...'}
                    </span>
                </div>
                <div className="collection-status">
                    {isCollecting ? (
                        <span className="status-active">🟢 Collecte active (6 min)</span>
                    ) : (
                        <span className="status-paused">⏸️ Collecte en pause</span>
                    )}
                </div>
            </div>
        </div>
    );
}
