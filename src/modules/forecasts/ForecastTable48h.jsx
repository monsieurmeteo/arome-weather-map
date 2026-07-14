import React, { useEffect, useState } from 'react';
import { weatherAPI } from '../../services/api';
import { useLocation } from '../../contexts/LocationContext';
import { Cloud, CloudRain, Sun, Wind, Droplets, ArrowUpRight, CloudLightning } from 'lucide-react';
import clsx from 'clsx';
import './Forecast.css';

export default function ForecastTable48h() {
    const { location } = useLocation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await weatherAPI.getForecast48h(location.lat, location.lon);
            setData(res);
            setLoading(false);
        }
        load();
    }, [location]);

    if (loading) return <div className="card p-4">Chargement des prévisions pour {location.name}...</div>;

    // Helper for wind icon direction
    // const getWindDir = (deg) => { ... } // simplified using transform rotate

    return (
        <div className="forecast-container">
            <div className="card forecast-card">
                <div className="forecast-header">
                    <h2>Prévisions Détaillées 48h</h2>
                    <span className="source-badge">Modèle AROME / Open-Meteo</span>
                </div>

                <div className="table-scroll-wrapper">
                    <table className="forecast-table">
                        <thead>
                            <tr>
                                <th className="sticky-col">Heure</th>
                                {data.map((h, i) => (
                                    <th key={i} className={clsx({ "new-day": h.time === '00h' })}>
                                        <div className="time-cell">
                                            <span>{h.time}</span>
                                            {h.time === '00h' && <small>{h.day}</small>}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Temps sensible */}
                            <tr>
                                <td className="sticky-col">Temps</td>
                                {data.map((h, i) => (
                                    <td key={i}>
                                        {/* Simple icon logic based on code or rain */}
                                        {h.code >= 95 ? <CloudLightning size={24} className="text-danger" /> :
                                            (h.rain > 0 ? <CloudRain size={24} className="text-primary" /> :
                                                (h.code <= 2 ? <Sun size={24} className="text-warning" /> : <Cloud size={24} />))}
                                    </td>
                                ))}
                            </tr>

                            {/* Température */}
                            <tr className="row-temp">
                                <td className="sticky-col">Temp. (°C)</td>
                                {data.map((h, i) => {
                                    let tempClass = 'temp-mild';
                                    if (h.temp < 5) tempClass = 'temp-cold';
                                    else if (h.temp > 25) tempClass = 'temp-hot';
                                    else if (h.temp > 20) tempClass = 'temp-warm';

                                    return (
                                        <td key={i} className={clsx("val-temp", tempClass)}>
                                            {h.temp}°
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Ressentie */}
                            <tr className="row-sub">
                                <td className="sticky-col">Ressentie</td>
                                {data.map((h, i) => (
                                    <td key={i} className="val-sub">{h.feel}°</td>
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
                                            <ArrowUpRight size={14} style={{ transform: `rotate(${h.dir}deg)` }} />
                                            {h.wind}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Rafales */}
                            <tr className="row-gust">
                                <td className="sticky-col">Rafales</td>
                                {data.map((h, i) => (
                                    <td key={i} className={clsx({ "high-wind": h.gust > 40 })}>
                                        {h.gust}
                                    </td>
                                ))}
                            </tr>

                            {/* Humidité */}
                            <tr className="row-sub">
                                <td className="sticky-col">Humidité</td>
                                {data.map((h, i) => (
                                    <td key={i}>{h.hum}%</td>
                                ))}
                            </tr>

                            {/* CAPE */}
                            <tr className="row-etp">
                                <td className="sticky-col">CAPE (J/kg)</td>
                                {data.map((h, i) => (
                                    <td key={i} className={h.cape > 1000 ? 'text-danger font-weight-bold' : ''}>
                                        {h.cape > 0 ? h.cape : '-'}
                                    </td>
                                ))}
                            </tr>

                            {/* Lifted Index */}
                            <tr className="row-etp">
                                <td className="sticky-col">Lifted Index</td>
                                {data.map((h, i) => (
                                    <td key={i} className={h.li < -2 ? 'text-danger font-weight-bold' : ''}>
                                        {h.li !== null ? h.li : '-'}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
