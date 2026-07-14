import React, { useState } from 'react';
import { Calculator, BarChart2, AlertCircle } from 'lucide-react';
import { weatherAPI } from '../../services/api';
import './Stats.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DJUCalculator() {
    const [baseRef, setBaseRef] = useState(18);
    const [startDate, setStartDate] = useState('2023-10-01');
    const [endDate, setEndDate] = useState('2024-05-01');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateDJU = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await weatherAPI.getHistoricalData(startDate, endDate);

            if (!data || data.length === 0) {
                setError("Aucune donnée disponible pour cette période ou erreur API.");
                setLoading(false);
                return;
            }

            let totalDJU = 0;
            const monthlyData = {};

            data.forEach(day => {
                // DJU Formula (Method "Méteo"):
                // S = (Min + Max) / 2
                // if S < Base => DJU = Base - S
                // else DJU = 0

                // Simple heating degree day calculation
                const mean = (day.min + day.max) / 2;
                let djuDay = 0;

                if (mean < baseRef) {
                    djuDay = baseRef - mean;
                }

                totalDJU += djuDay;

                // Aggregating by month
                const monthKey = day.date.substring(0, 7); // YYYY-MM
                if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
                monthlyData[monthKey] += djuDay;
            });

            // Format chart data
            const chartData = Object.keys(monthlyData).sort().map(key => ({
                month: key,
                dju: Math.round(monthlyData[key] * 10) / 10
            }));

            setResult({
                total: Math.round(totalDJU * 10) / 10,
                chartData
            });

        } catch (err) {
            console.error(err);
            setError("Erreur lors du calcul.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stats-container">
            <div className="card stats-header">
                <h2>Calcul des DJU (Degrés Jour Unifiés)</h2>
                <p>Outil pour chauffagistes et gestionnaires de bâtiments (Base 18°C par défaut)</p>
            </div>

            <div className="card calculator-card">
                <div className="form-grid">
                    <div className="input-group">
                        <label>T° Référence (°C)</label>
                        <input
                            type="number"
                            value={baseRef}
                            onChange={(e) => setBaseRef(Number(e.target.value))}
                        />
                    </div>
                    <div className="input-group">
                        <label>Date Début</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Date Fin</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button className="btn-calc" onClick={calculateDJU} disabled={loading}>
                        <Calculator size={18} className={loading ? 'spin' : ''} />
                        {loading ? 'Calcul...' : 'Calculer'}
                    </button>
                </div>

                {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}

                {result && (
                    <div className="result-display">
                        <span className="label">Total DJU Chauffage</span>
                        <span className="value">{result.total}</span>
                        <span className="unit">°C.j</span>
                    </div>
                )}
            </div>

            {result && (
                <div className="card chart-card">
                    <h3>Évolution mensuelle</h3>
                    <div className="chart-wrapper" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} DJU`, 'Chauffage']} />
                                <Bar dataKey="dju" fill="#fd7e14" radius={[4, 4, 0, 0]} name="DJU" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
