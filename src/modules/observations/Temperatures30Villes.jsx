
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Loader, Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react';
import './Temperatures30Villes.css';

const CITIES = [
    { name: "Lille", id: "59343001" },
    { name: "Laon", id: "02037002" },
    { name: "Rouen", id: "76116001" },
    { name: "Caen", id: "14137001" },
    { name: "Brest", id: "29075001" },
    { name: "Rennes", id: "35281001" },
    { name: "Nantes", id: "44020001" },
    { name: "Paris", id: "75114001" },
    { name: "Tours", id: "37179001" },
    { name: "Poitiers", id: "86027001" },
    { name: "La Rochelle", id: "17300009" },
    { name: "Bordeaux", id: "33281001" },
    { name: "Biarritz", id: "64024001" },
    { name: "Toulouse", id: "31069001" },
    { name: "Perpignan", id: "66136001" },
    { name: "Montpellier", id: "34154001" },
    { name: "Marseille", id: "13054001" },
    { name: "Nice", id: "06088001" },
    { name: "Bastia", id: "20148001" },
    { name: "Ajaccio", id: "20004002" },
    { name: "Metz", id: "57039001" },
    { name: "Strasbourg", id: "67124001" },
    { name: "Besançon", id: "25056001" },
    { name: "Dijon", id: "21473001" },
    { name: "Lyon", id: "69029001" },
    { name: "Grenoble", id: "38384001" },
    { name: "Limoges", id: "87085006" },
    { name: "Aurillac", id: "15014004" },
    { name: "Clermont-Ferrand", id: "63113001" },
    { name: "Bourges", id: "18033001" }
];

export default function Temperatures30Villes() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [viewMode, setViewMode] = useState('temp_min'); // 'temp_min', 'rain', 'wind'
    const [useYesterday, setUseYesterday] = useState(false);

    const fetchData = async (mode = viewMode, yesterday = useYesterday) => {
        setLoading(true);
        try {
            console.log(`Chargement mode ${mode} (Hier: ${yesterday})...`);
            const cityIds = CITIES.map(c => c.id);
            let resultData = [];

            const d = new Date();
            // If checking yesterday, subtract 1 day
            if (yesterday) {
                d.setDate(d.getDate() - 1);
            }
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            // Use France Winter Offset (+01:00) to ensure we get 00h-01h Local (which is 23h-00h UTC previous day)
            const startTs = `${dateStr}T00:00:00+01:00`;
            const endTs = `${dateStr}T23:59:59+01:00`;

            // Helper to fetch raw data with optimizations (batching by city)
            const fetchRaw = async () => {
                let allRows = [];
                const chunkSize = 4; // Smaller chunks for safety

                // Process cities in chunks to avoid huge queries/timeouts
                for (let i = 0; i < cityIds.length; i += chunkSize) {
                    const chunkIds = cityIds.slice(i, i + chunkSize);
                    let from = 0;
                    const batchSize = 2500;

                    while (true) {
                        const { data, error } = await supabase
                            .from('observations_6mn')
                            .select('station_id, t, fxi, rr_per, timestamp')
                            .in('station_id', chunkIds)
                            .gte('timestamp', startTs)
                            .lte('timestamp', endTs)
                            .order('timestamp', { ascending: true })
                            .order('station_id', { ascending: true }) // Deterministic sort
                            .range(from, from + batchSize - 1);

                        if (error) {
                            console.error(`Error fetching chunk ${i}:`, error);
                            break;
                        }
                        if (!data || data.length === 0) break;

                        allRows = allRows.concat(data);
                        if (data.length < batchSize) break;
                        from += batchSize;

                        // Increase safety limit strictly for massive duplicates cases
                        if (from > 100000) {
                            console.warn("Hit safety limit in fetchRaw");
                            break;
                        }
                    }
                }
                return allRows;
            };

            const rawData = await fetchRaw();
            console.log(`Reçu ${rawData.length} observations brutes`);

            // Aggregate client-side
            const grouped = {};
            rawData.forEach(obs => {
                if (!grouped[obs.station_id]) {
                    grouped[obs.station_id] = { t_min: null, t_max: null, fxi_max: 0, rr_sum: 0 };
                }
                const g = grouped[obs.station_id];

                // Temp
                if (obs.t !== null) {
                    if (g.t_min === null || obs.t < g.t_min) g.t_min = obs.t;
                    if (g.t_max === null || obs.t > g.t_max) g.t_max = obs.t;
                }

                // Gust (fxi is already km/h in DB)
                if (obs.fxi !== null) {
                    if (obs.fxi > g.fxi_max) g.fxi_max = obs.fxi;
                }

                // Rain
                if (obs.rr_per !== null) {
                    g.rr_sum += obs.rr_per;
                }
            });

            if (mode === 'temp_min') {
                resultData = Object.keys(grouped).map(sid => ({
                    station_id: sid,
                    value: grouped[sid].t_min,
                    unit: '°C'
                }));
            } else if (mode === 'rain') {
                resultData = Object.keys(grouped).map(sid => ({
                    station_id: sid,
                    value: grouped[sid].rr_sum,
                    unit: 'mm'
                }));
            } else if (mode === 'wind') {
                resultData = Object.keys(grouped).map(sid => ({
                    station_id: sid,
                    value: grouped[sid].fxi_max,
                    unit: 'km/h'
                }));
            }

            // Map data to CITIES
            const mappedData = CITIES.map(city => {
                const found = resultData.find(f => f.station_id === city.id);
                return {
                    ...city,
                    dept: city.id.substring(0, 2),
                    value: found && found.value !== null ? found.value : null
                };
            });

            setData(mappedData);
            setLastUpdate(new Date());

        } catch (e) {
            console.error("Erreur chargement:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(viewMode, useYesterday);
    }, [viewMode, useYesterday]);

    const handleModeChange = (mode) => {
        setViewMode(mode);
    };

    const toggleYesterday = () => {
        setUseYesterday(!useYesterday);
    };

    const getValueClass = (val) => {
        if (val === null || val === undefined) return '';
        if (viewMode === 'temp_min') {
            if (val < 0) return 'temp-very-cold';
            if (val < 10) return 'temp-cold';
            if (val < 20) return 'temp-mild';
            return 'temp-warm';
        }
        if (viewMode === 'rain') {
            if (val > 10) return 'heavy-rain';
            if (val > 0) return 'rain';
            return 'no-rain';
        }
        if (viewMode === 'wind') {
            if (val > 80) return 'storm';
            if (val > 50) return 'windy';
            return 'calm';
        }
        return '';
    };

    const getUnit = () => {
        switch (viewMode) {
            case 'temp_min': return '°C';
            case 'rain': return 'mm';
            case 'wind': return 'km/h';
            default: return '';
        }
    };

    const getSubTitle = () => {
        const timeLabel = useYesterday ? "sur la journée d'hier (J-1)" : "ce jour (depuis 00h UTC)";
        switch (viewMode) {
            case 'temp_min': return `Minimales relevées ${timeLabel}`;
            case 'rain': return `Cumuls relevés ${timeLabel}`;
            case 'wind': return `Rafales maximales relevées ${timeLabel}`;
            default: return '';
        }
    };

    return (
        <div className="live-container">
            <header className="live-header">
                <div className="title-section">
                    <h1 style={{ display: 'flex', alignItems: 'center' }}>
                        {viewMode === 'temp_min' && <Thermometer size={24} className="icon-pulse text-blue-500" style={{ color: '#3b82f6', marginRight: '8px' }} />}
                        {viewMode === 'rain' && <Droplets size={24} className="icon-pulse text-blue-400" style={{ color: '#60a5fa', marginRight: '8px' }} />}
                        {viewMode === 'wind' && <Wind size={24} className="icon-pulse text-gray-500" style={{ color: '#64748b', marginRight: '8px' }} />}

                        <span>
                            {viewMode === 'temp_min' && 'Températures Minimales (30 Villes)'}
                            {viewMode === 'rain' && 'Précipitations 24h (30 Villes)'}
                            {viewMode === 'wind' && 'Rafales Max 24h (30 Villes)'}
                        </span>
                    </h1>
                    <p className="subtitle">
                        {getSubTitle()}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        className={`refresh-btn ${useYesterday ? 'active-j1' : ''}`}
                        onClick={toggleYesterday}
                        style={{ background: useYesterday ? '#f59e0b' : '#334155' }}
                    >
                        {useYesterday ? 'Voir Aujourd\'hui' : 'Voir Hier (J-1)'}
                    </button>

                    <button className="refresh-btn" onClick={() => fetchData(viewMode, useYesterday)} disabled={loading}>
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Actualiser
                    </button>
                    {lastUpdate && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>MàJ : {lastUpdate.toLocaleTimeString()}</span>}
                </div>
            </header>

            <div className="view-selector">
                <button
                    className={`selector-btn ${viewMode === 'temp_min' ? 'active' : ''}`}
                    onClick={() => handleModeChange('temp_min')}
                >
                    <Thermometer size={18} /> Températures Min
                </button>
                <button
                    className={`selector-btn ${viewMode === 'rain' ? 'active' : ''}`}
                    onClick={() => handleModeChange('rain')}
                >
                    <Droplets size={18} /> Précipitations 24h
                </button>
                <button
                    className={`selector-btn ${viewMode === 'wind' ? 'active' : ''}`}
                    onClick={() => handleModeChange('wind')}
                >
                    <Wind size={18} /> Rafales Max
                </button>
            </div>

            <div className="table-wrapper">
                <table className="live-table simple-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60%' }}>Villes</th>
                            <th style={{ textAlign: 'center', width: '20%' }}>Départements</th>
                            <th style={{ textAlign: 'right', width: '20%' }}>Valeurs ({getUnit()})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && data.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <Loader className="animate-spin" /> Chargement...
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((city) => (
                                <tr key={city.id}>
                                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                                        {city.name}
                                    </td>
                                    <td style={{ textAlign: 'center', color: '#64748b' }}>
                                        ({city.dept})
                                    </td>
                                    <td className={`value-cell-simple ${getValueClass(city.value)}`}>
                                        {city.value !== null ? (viewMode === 'wind' ? Math.round(city.value) : city.value.toFixed(1)) : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

