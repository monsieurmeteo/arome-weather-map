import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { weatherAPI } from '../../services/api';
import { useLocation } from '../../contexts/LocationContext';
import clsx from 'clsx';
import './ModelComparison.css';

const MODELS_CONFIG = {
    'arome_france': { name: 'AROME (FR)', color: '#0056b3' },
    'meteofrance_arpege_europe': { name: 'ARPEGE (EU)', color: '#17a2b8' },
    'icon_eu': { name: 'ICON (EU)', color: '#fd7e14' },
    'ecmwf_ifs025': { name: 'ECMWF (EU)', color: '#0d6efd' },
    'gfs_global': { name: 'GFS (US)', color: '#28a745' },
    'gem_global': { name: 'GEM (CA)', color: '#6f42c1' }
};

export default function ModelComparison() {
    const { location } = useLocation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            // Pass location to API
            const res = await weatherAPI.getMultiModelForecast(location.lat, location.lon);
            setData(res);
            setLoading(false);
        }
        load();
    }, [location]);

    if (loading) return <div className="card p-4">Chargement des modèles...</div>;

    if (!data || data.error) {
        return (
            <div className="card p-4 text-danger">
                <h3>Erreur de chargement</h3>
                <p>{data?.reason || "Erreur inconnue API"}</p>
                <small>Vérifiez la console pour plus de détails.</small>
            </div>
        );
    }

    // Safety check
    if (!data || Object.keys(data).length === 0) {
        return <div className="card p-4 text-warning">Aucune donnée disponible pour les modèles sélectionnés.</div>;
    }

    // Prepare chart data: Need a single array with keys for each model
    const firstModelKey = Object.keys(data)[0];
    const refData = data[firstModelKey];

    if (!refData || refData.length === 0) {
        return (
            <div className="card p-4 text-warning">
                Données incomplètes.
                <pre>{JSON.stringify(Object.keys(data), null, 2)}</pre>
            </div>
        );
    }

    const chartData = refData.map((_, i) => {
        const point = { time: refData[i].displayTime };
        Object.keys(data).forEach(key => {
            if (data[key] && data[key][i]) {
                point[`${key}_temp`] = data[key][i].temp;
                point[`${key}_rain`] = data[key][i].rain;
                point[`${key}_wind`] = data[key][i].wind;
                point[`${key}_gust`] = data[key][i].gust;
            }
        });
        return point;
    });

    // DEBUG: check if chartData has values
    const sample = chartData[0];
    const values = Object.keys(sample).filter(k => k.includes('_temp')).map(k => sample[k]);
    const actuallyHasData = values.some(v => v !== null && v !== undefined);

    if (!actuallyHasData) {
        return (
            <div className="card p-4 text-warning">
                Structure de données reçue mais valeurs vides.
                <pre>{JSON.stringify(sample, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div className="comparison-container">
            <div className="card header-card">
                <h2>Comparaison des Modèles</h2>
                <p className="subtitle">Analyse croisée AROME, GFS, ICON, GEM sur 10 jours</p>
            </div>

            <div className="card chart-card">
                <h3>Températures (°C)</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Legend />
                            {Object.keys(MODELS_CONFIG).map(key => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={`${key}_temp`}
                                    name={MODELS_CONFIG[key].name}
                                    stroke={MODELS_CONFIG[key].color}
                                    dot={false}
                                    strokeWidth={2}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card chart-card">
                <h3>Précipitations (mm)</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.keys(MODELS_CONFIG).map(key => (
                                <Bar
                                    key={key}
                                    dataKey={`${key}_rain`}
                                    name={MODELS_CONFIG[key].name}
                                    fill={MODELS_CONFIG[key].color}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card chart-card">
                <h3>Vents Moyens (km/h)</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.keys(MODELS_CONFIG).map(key => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={`${key}_wind`}
                                    name={MODELS_CONFIG[key].name}
                                    stroke={MODELS_CONFIG[key].color}
                                    dot={false}
                                    strokeWidth={2}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card chart-card">
                <h3>Rafales de Vent (km/h)</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.keys(MODELS_CONFIG).map(key => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={`${key}_gust`}
                                    name={MODELS_CONFIG[key].name}
                                    stroke={MODELS_CONFIG[key].color}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    strokeWidth={2}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card table-card">
                <h3>Tableau Comparatif Détaillé</h3>
                <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '600px', borderRadius: '8px' }}>
                    <table className="table-comparison">
                        <thead>
                            <tr>
                                <th className="sticky-col-header">Heure</th>
                                {Object.keys(MODELS_CONFIG).map(key => (
                                    <th key={key} colSpan={4} style={{ borderBottom: `4px solid ${MODELS_CONFIG[key].color}` }}>
                                        {MODELS_CONFIG[key].name}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="sticky-col-header"></th>
                                {Object.keys(MODELS_CONFIG).map(key => (
                                    <React.Fragment key={key}>
                                        <th className="param-sub-header">T°</th>
                                        <th className="param-sub-header">mm</th>
                                        <th className="param-sub-header">Vn</th>
                                        <th className="param-sub-header">Rf</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((row, i) => (
                                <tr key={i}>
                                    <td className="sticky-col-cell">{row.time}</td>
                                    {Object.keys(MODELS_CONFIG).map(key => {
                                        const temp = row[`${key}_temp`];
                                        const rain = row[`${key}_rain`];
                                        const wind = row[`${key}_wind`];
                                        const gust = row[`${key}_gust`];

                                        // Temp coloring
                                        let tempClass = "val-temp-cell";
                                        if (temp >= 30) tempClass += " temp-hot";
                                        else if (temp >= 20) tempClass += " temp-warm";
                                        else if (temp <= 5) tempClass += " temp-cold";

                                        // Gust coloring
                                        let gustClass = "val-gust-cell";
                                        if (gust >= 75) gustClass += " gust-danger";
                                        else if (gust >= 50) gustClass += " gust-warning";

                                        return (
                                            <React.Fragment key={key}>
                                                <td className={tempClass}>{temp}°</td>
                                                <td className={clsx("val-rain-cell", { "rain-none": !rain || rain === 0 })}>
                                                    {rain > 0 ? rain.toFixed(1) : '-'}
                                                </td>
                                                <td className="val-wind-cell text-gray-600">{Math.round(wind)}</td>
                                                <td className={gustClass}>{Math.round(gust)}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card analysis-card">
                <h3>Analyse des Divergences</h3>
                <p>
                    Les modèles sont globalement en accord. Surveiller les divergences de précipitations en soirée.
                    L'AROME (Maille fine) est à privilégier pour les épisodes orageux locaux.
                </p>
            </div>
        </div>
    );
}
