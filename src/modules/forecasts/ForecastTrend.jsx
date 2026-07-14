import React, { useEffect, useState } from 'react';
import { TrendingUp, Compass, AlertCircle } from 'lucide-react';
import './Forecast.css';

export default function ForecastTrend() {
    const [trend, setTrend] = useState(null);

    useEffect(() => {
        const loadTrend = () => {
            try {
                const saved = localStorage.getItem('daily_bulletin');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Extract "Situation générale" if possible, or just use the whole content
                    // For now, let's try to parse if structure exists, else use full text
                    setTrend(parsed);
                }
            } catch (e) { }
        };
        loadTrend();
    }, []);

    if (!trend) return (
        <div className="forecast-container">
            <div className="card trend-card">
                <div className="text-center p-5">
                    <AlertCircle size={48} className="text-muted mb-3" />
                    <p>Aucune tendance publiée pour le moment.</p>
                    <small>Consultez la section Bulletins ou attendez la mise à jour.</small>
                </div>
            </div>
        </div>
    );

    return (
        <div className="forecast-container">
            <div className="card trend-card">
                <div className="forecast-header">
                    <h2>Tendance et Analyse Synoptique</h2>
                    <span className="source-badge">Prévisionniste</span>
                </div>

                <div className="trend-content">
                    <div className="synoptic-block">
                        <h3><Compass size={20} /> Situation Générale</h3>
                        <p className="whitespace-pre-wrap">{trend.content}</p>
                    </div>

                    <div className="trend-details">
                        <TrendingUp size={24} className="text-primary" style={{ marginTop: '4px' }} />
                        <div>
                            <h3>Note de fiabilité</h3>
                            <p>
                                Ce bulletin a été rédigé le <strong>{new Date(trend.date).toLocaleDateString('fr-FR')}</strong>.
                                Les conditions peuvent évoluer rapidement.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
