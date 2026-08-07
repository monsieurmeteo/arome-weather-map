import React, { useEffect, useState } from 'react';
import { weatherAPI } from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, ArrowUpRight, CloudLightning, CloudSnow } from 'lucide-react';
import clsx from 'clsx';
import './Forecast.css';

const getWeatherIcon = (code) => {
    if (code >= 95) return <CloudLightning size={24} className="text-danger" />;
    if (code >= 71 && code <= 86) return <CloudSnow size={24} className="text-info" />; // Snow
    if (code >= 51) return <CloudRain size={24} className="text-primary" />;
    if (code === 45 || code === 48) return <Cloud size={24} className="text-muted" />; // Fog
    if (code <= 3 && code > 0) return <Cloud size={24} className="text-secondary" />;
    return <Sun size={24} className="text-warning" />;
};

import { useLocation } from '../../contexts/LocationContext';

export default function ForecastJ9() {
    const { location } = useLocation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const forecast = await weatherAPI.getDailyForecast(location.lat, location.lon);
            setData(forecast);
            setLoading(false);
        }
        loadData();
    }, [location]);

    if (loading) return <div className="card p-4">Chargement des prévisions...</div>;

    return (
        <div className="forecast-container">
            <div className="card forecast-card">
                <div className="forecast-header">
                    <h2>Prévisions à 10 Jours</h2>
                    <span className="source-badge">Modèle ECMWF / Open-Meteo</span>
                </div>

                <div className="table-scroll-wrapper">
                    <table className="forecast-table">
                        <thead>
                            <tr>
                                <th className="sticky-col">Date</th>
                                {data.map((day, i) => {
                                    const dateObj = new Date(day.date);
                                    return (
                                        <th key={i}>
                                            <div className="time-cell">
                                                <span>{format(dateObj, 'EEE', { locale: fr })}</span>
                                                <small>{format(dateObj, 'dd/MM')}</small>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Temps sensible */}
                            <tr>
                                <td className="sticky-col">Ciel</td>
                                {data.map((h, i) => (
                                    <td key={i}>{getWeatherIcon(h.code)}</td>
                                ))}
                            </tr>

                            {/* Temp Max */}
                            <tr className="row-temp">
                                <td className="sticky-col">Max (°C)</td>
                                {data.map((h, i) => (
                                    <td key={i} className={clsx("val-temp", { "text-danger": h.max > 30 })}>
                                        {Math.round(h.max)}°
                                    </td>
                                ))}
                            </tr>

                            {/* Temp Min */}
                            <tr className="row-sub">
                                <td className="sticky-col">Min (°C)</td>
                                {data.map((h, i) => (
                                    <td key={i} className={clsx("val-sub", { "text-primary": h.min < 0 })}>
                                        {Math.round(h.min)}°
                                    </td>
                                ))}
                            </tr>

                            {/* Pluie */}
                            <tr className="row-rain">
                                <td className="sticky-col">Pluie (mm)</td>
                                {data.map((h, i) => (
                                    <td key={i} className={clsx("val-rain", { "has-rain": h.rain > 0 })}>
                                        {h.rain > 0 ? h.rain : '-'}
                                    </td>
                                ))}
                            </tr>

                            {/* Vent */}
                            <tr className="row-wind">
                                <td className="sticky-col">Vent (km/h)</td>
                                {data.map((h, i) => (
                                    <td key={i}>
                                        <div className="wind-cell">
                                            <Wind size={14} className="text-muted" />
                                            {h.wind}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Rafales */}
                            <tr className="row-gust">
                                <td className="sticky-col">Rafales</td>
                                {data.map((h, i) => (
                                    <td key={i} className={clsx({ "high-wind": h.gust > 60 })}>
                                        {h.gust}
                                    </td>
                                ))}
                            </tr>

                            {/* ETP */}
                            <tr className="row-etp">
                                <td className="sticky-col">ETP (mm)</td>
                                {data.map((h, i) => (
                                    <td key={i}>{h.etp > 0 ? h.etp : '-'}</td>
                                ))}
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
