import React, { useEffect, useState } from 'react';
import { Droplets, Sun, Sprout } from 'lucide-react';
import { weatherAPI } from '../../services/api';
import clsx from 'clsx';
import './Surveillance.css'; // Shared styles

export default function ArrosageMonitor() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            // Get 48h hourly data to sum up ETP for today/tomorrow
            const res = await weatherAPI.getForecast48h();
            setData(res);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="card p-4">Calcul bilans hydriques...</div>;

    // Calculate daily sums for 24h/48h
    // Mock logic: ETP - Rain = Bilan
    const dailyETP = data.slice(0, 24).reduce((acc, curr) => acc + (curr.etp || 0), 0).toFixed(1);
    const dailyRain = data.slice(0, 24).reduce((acc, curr) => acc + (curr.rain || 0), 0).toFixed(1);
    const bilan = (dailyRain - dailyETP).toFixed(1);

    const getAdvice = (b) => {
        if (b > 0) return { text: "Pas d'arrosage nécessaire. Les précipitations couvrent les besoins.", color: "success" };
        if (b > -2) return { text: "Arrosage léger recommandé pour les semis sensibles.", color: "warning" };
        return { text: "Arrosage indispensable. Déficit hydrique marqué.", color: "danger" };
    };

    const advice = getAdvice(bilan);

    return (
        <div className="surveillance-container">
            <div className={clsx("card status-card", advice.color)}>
                <div className="status-icon">
                    <Droplets size={48} />
                </div>
                <div className="status-content">
                    <h2>Bilan Hydrique Journalier</h2>
                    <p className="status-message">{advice.text}</p>
                </div>
            </div>

            <div className="card table-card">
                <h3>Détails du jour (24h)</h3>
                <div className="water-balance-grid">
                    <div className="wb-item">
                        <Sun size={32} className="text-warning" />
                        <span className="wb-label">Évapotranspiration (ETP)</span>
                        <span className="wb-value">{dailyETP} mm</span>
                    </div>
                    <div className="wb-item">
                        <Droplets size={32} className="text-primary" />
                        <span className="wb-label">Précipitations</span>
                        <span className="wb-value">{dailyRain} mm</span>
                    </div>
                    <div className="wb-item result">
                        <Sprout size={32} className={bilan < 0 ? "text-danger" : "text-success"} />
                        <span className="wb-label">Bilan</span>
                        <span className={clsx("wb-value", bilan < 0 ? "text-danger" : "text-success")}>
                            {bilan > 0 ? '+' : ''}{bilan} mm
                        </span>
                    </div>
                </div>

                <h3 style={{ marginTop: '2rem' }}>Conseils par usage</h3>
                <table className="surveillance-table">
                    <thead>
                        <tr>
                            <th>Usage</th>
                            <th>Recommandation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Gazon / Pelouse</strong></td>
                            <td>{bilan < -3 ? "Arrosage copieux (5mm) en soirée." : "Aucune action nécessaire."}</td>
                        </tr>
                        <tr>
                            <td><strong>Terrains sportifs</strong></td>
                            <td>{bilan < -1 ? "Maintien humidité requis." : "Stand-by."}</td>
                        </tr>
                        <tr>
                            <td><strong>Massifs / Fleurs</strong></td>
                            <td>{bilan < -2 ? "Arrosage localisé au pied." : "Suffisant."}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
