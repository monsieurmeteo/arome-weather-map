import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
    MapPin, Search, Bell, Wind, Thermometer, Droplets, Zap,
    Trash2, Plus, Home, ShieldCheck, RefreshCw, Radio, UserPlus, LogIn, Check, FolderOpen
} from 'lucide-react';
import './MyStation.css';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const MyStation = () => {
    const [ntfyTopic, setNtfyTopic] = useState(localStorage.getItem('my_ntfy_topic') || 'client_demo');
    const [configs, setConfigs] = useState([]);
    const [liveData, setLiveData] = useState({}); // { station_id: { t, ff, rr_per, ts } }
    const [allClients, setAllClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showClientList, setShowClientList] = useState(false);

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        localStorage.setItem('my_ntfy_topic', ntfyTopic);
        fetchConfigs();
        fetchAllClients();
    }, [ntfyTopic]);

    // Rafraîchissement automatique des données LIVE toutes les 2 minutes
    useEffect(() => {
        if (configs.length > 0) {
            fetchLiveMeasurements();
            const interval = setInterval(fetchLiveMeasurements, 2 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [configs]);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('user_station_configs').select('*').eq('ntfy_topic', ntfyTopic).order('created_at', { ascending: false });
            setConfigs(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchLiveMeasurements = async () => {
        const stationIds = configs.map(c => c.nearest_station_id).filter(Boolean);
        if (stationIds.length === 0) return;

        try {
            // Récupérer le relevé le plus récent pour chaque station
            const { data, error } = await supabase
                .from('observations_6mn')
                .select('station_id, t, ff, fxi, rr_per, timestamp')
                .in('station_id', stationIds)
                .order('timestamp', { ascending: false })
                .limit(stationIds.length * 5); // Un peu plus pour être sûr d'avoir les dernières de chaque

            if (data) {
                const latestMap = {};
                data.forEach(obs => {
                    if (!latestMap[obs.station_id]) latestMap[obs.station_id] = obs;
                });
                setLiveData(latestMap);
            }
        } catch (e) { console.error("Live fetch error", e); }
    };

    const fetchAllClients = async () => {
        try {
            const { data } = await supabase.from('user_station_configs').select('ntfy_topic');
            if (data) {
                const grouped = data.reduce((acc, curr) => {
                    if (!acc[curr.ntfy_topic]) acc[curr.ntfy_topic] = { topic: curr.ntfy_topic, count: 0 };
                    acc[curr.ntfy_topic].count++;
                    return acc;
                }, {});
                setAllClients(Object.values(grouped));
            }
        } catch (e) { console.error(e); }
    };

    const handleNewClient = () => {
        const name = prompt("Nom du nouveau dossier client ?");
        if (name) {
            setNtfyTopic(name.toLowerCase().replace(/\s+/g, '_'));
            setConfigs([]);
        }
    };

    const handleAddCity = async (feature) => {
        setSuggestions([]);
        setQuery('');
        setLoading(true);
        const [lon, lat] = feature.geometry.coordinates;
        try {
            const { data: stData } = await supabase.rpc('find_nearest_stations', { lat_input: lat, lon_input: lon, limit_count: 1 });
            const newConfig = {
                ntfy_topic: ntfyTopic,
                city_name: feature.properties.city || feature.properties.name,
                lat, lon, zip_code: feature.properties.postcode,
                nearest_station_id: stData?.[0]?.id || null,
                nearest_station_name: stData?.[0]?.name || "Station Inconnue",
                alert_foudre_enabled: true, alert_vigilance_enabled: true,
                alert_wind_enabled: false, alert_rain_enabled: false,
                alert_tmin_enabled: false, alert_tmax_enabled: false,
                alert_wind_threshold: 80, alert_rain_threshold: 10,
                alert_tmin_threshold: 0, alert_tmax_threshold: 35, alert_foudre_radius: 10
            };
            await supabase.from('user_station_configs').insert([newConfig]);
            fetchConfigs();
            fetchAllClients();
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateConfig = async (configId, updates) => {
        setConfigs(prev => prev.map(c => c.id === configId ? { ...c, ...updates } : c));
        await supabase.from('user_station_configs').update(updates).eq('id', configId);
    };

    const deleteConfig = async (id) => {
        if (!confirm("Supprimer cette ville ?")) return;
        await supabase.from('user_station_configs').delete().eq('id', id);
        fetchConfigs();
        fetchAllClients();
    };

    const deleteDossier = async (topic) => {
        if (!confirm(`⚠️ SUPPRESSION TOTALE : dossier "${topic}" ?`)) return;
        await supabase.from('user_station_configs').delete().eq('ntfy_topic', topic);
        if (ntfyTopic === topic) setNtfyTopic('client_demo');
        fetchConfigs();
        fetchAllClients();
    };

    const testNotif = async (topic, cityName) => {
        try {
            await fetch(`https://ntfy.sh/${topic}`, {
                method: 'POST',
                body: `🔔 TEST OK pour ${cityName} !`,
                headers: { 'Title': 'Meteo Pro - Test', 'Priority': 'default', 'Tags': 'white_check_mark' }
            });
            alert(`Test envoyé sur : ${topic}`);
        } catch (e) { alert("Erreur."); }
    };

    return (
        <div className="my-station-container">
            <header className="station-header">
                <div className="hero-section">
                    <h1>Espace Clients & Alertes</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowClientList(!showClientList)} className="action-btn" style={{ background: '#f8fafc', color: '#1e293b', padding: '10px 15px', borderRadius: '10px', fontWeight: 700, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderOpen size={18} /> {allClients.length} DOSSIERS
                    </button>
                    <button onClick={handleNewClient} className="action-btn" style={{ background: '#3b82f6', color: 'white', padding: '10px 15px', borderRadius: '10px', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> NOUVEAU CLIENT
                    </button>
                </div>
            </header>

            {showClientList && (
                <div className="client-selector-grid" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    {allClients.map(c => (
                        <div key={c.topic} onClick={() => { setNtfyTopic(c.topic); setShowClientList(false); }} style={{ padding: '12px', borderRadius: '12px', border: ntfyTopic === c.topic ? '2px solid #3b82f6' : '1px solid #f1f5f9', background: ntfyTopic === c.topic ? '#eff6ff' : '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.topic}</div>
                            <Trash2 size={14} color="#cbd5e1" onClick={(e) => { e.stopPropagation(); deleteDossier(c.topic); }} />
                        </div>
                    ))}
                </div>
            )}

            <div className="client-auth-bar" style={{ background: '#1e293b' }}>
                <LogIn size={20} color="#fbbf24" />
                <div style={{ flex: 1 }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Dossier Client Actif</label>
                    <input type="text" value={ntfyTopic} onChange={(e) => setNtfyTopic(e.target.value)} className="client-id-input" />
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800 }}>{configs.length} VILLE(S)</div>
                    <button onClick={fetchLiveMeasurements} className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)' }} title="Rafraîchir les mesures"><RefreshCw size={16} color="white" /></button>
                </div>
            </div>

            <div className="search-section main-search-box">
                <div className="premium-search">
                    <Search size={18} color="#94a3b8" />
                    <input type="text" placeholder="Ajouter une ville..." value={query} onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length >= 2) {
                            fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(e.target.value)}&limit=5`)
                                .then(r => r.json()).then(d => setSuggestions(d.features || []));
                        } else setSuggestions([]);
                    }} />
                </div>
                {suggestions.length > 0 && (
                    <div className="search-results-floating">
                        {suggestions.map((s, i) => (
                            <div key={i} className="suggestion-row" onClick={() => handleAddCity(s)}>
                                <MapPin size={16} color="#2563eb" />
                                <div style={{ flex: 1, fontSize: '0.85rem' }}><strong>{s.properties.city || s.properties.name}</strong> ({s.properties.postcode})</div>
                                <div className="add-badge">AJOUTER</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="dashboard-grid">
                {configs.map(config => {
                    const live = liveData[config.nearest_station_id];
                    return (
                        <div key={config.id} className="compact-station-row">
                            <div className="row-identity">
                                <span className="row-city-name">{config.city_name}</span>
                                <div className="live-mini-obs" style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                    {live ? (
                                        <>
                                            <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem' }}>{live.t}°C</span>
                                            <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.85rem' }}>{live.ff} km/h</span>
                                            <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>({new Date(live.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})</span>
                                        </>
                                    ) : <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>En attente...</span>}
                                </div>
                            </div>

                            <div className="security-group">
                                <MiniToggle icon={Zap} label="Foudre" enabled={config.alert_foudre_enabled} onToggle={(v) => updateConfig(config.id, { alert_foudre_enabled: v })}>
                                    <input type="number" className="mini-num-input" value={config.alert_foudre_radius} onChange={(e) => updateConfig(config.id, { alert_foudre_radius: e.target.value })} />km
                                </MiniToggle>
                                <MiniToggle icon={ShieldCheck} label="Vigilance" enabled={config.alert_vigilance_enabled} onToggle={(v) => updateConfig(config.id, { alert_vigilance_enabled: v })} />
                            </div>

                            <div className="weather-config-grid">
                                <MiniWeatherItem icon={Droplets} label="Pluie" enabled={config.alert_rain_enabled} onToggle={(v) => updateConfig(config.id, { alert_rain_enabled: v })} value={config.alert_rain_threshold} onValue={(v) => updateConfig(config.id, { alert_rain_threshold: v })} unit="mm/h" prefix=">" />
                                <MiniWeatherItem icon={Wind} label="Vent" enabled={config.alert_wind_enabled} onToggle={(v) => updateConfig(config.id, { alert_wind_enabled: v })} value={config.alert_wind_threshold} onValue={(v) => updateConfig(config.id, { alert_wind_threshold: v })} unit="km/h" prefix=">" />
                                <MiniWeatherItem icon={Thermometer} label="Gel" enabled={config.alert_tmin_enabled} onToggle={(v) => updateConfig(config.id, { alert_tmin_enabled: v })} value={config.alert_tmin_threshold} onValue={(v) => updateConfig(config.id, { alert_tmin_threshold: v })} unit="°C" prefix="<" color="#0ea5e9" />
                                <MiniWeatherItem icon={Thermometer} label="Chaleur" enabled={config.alert_tmax_enabled} onToggle={(v) => updateConfig(config.id, { alert_tmax_enabled: v })} value={config.alert_tmax_threshold} onValue={(v) => updateConfig(config.id, { alert_tmax_threshold: v })} unit="°C" prefix=">" color="#f97316" />
                            </div>

                            <div className="row-actions">
                                <button className="btn-icon btn-test" onClick={() => testNotif(config.ntfy_topic, config.city_name)}><Bell size={14} /></button>
                                <button className="btn-icon btn-del" onClick={() => deleteConfig(config.id)}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && configs.length === 0 && <div style={{ textAlign: 'center', padding: '20px' }}><RefreshCw className="animate-spin" size={24} color="#3b82f6" /></div>}
        </div>
    );
};

const MiniToggle = ({ icon: Icon, label, enabled, onToggle, children }) => (
    <div className="mini-alert-item" style={{ cursor: 'pointer' }} onClick={() => onToggle(!enabled)}>
        <div>
            <div className="mini-label"><Icon size={14} color={enabled ? "#2563eb" : "#94a3b8"} /> {label}</div>
            {children && <div className="mini-input-group" onClick={(e) => e.stopPropagation()}>{children}</div>}
        </div>
        <label className="switch-tiny"><input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} /><span className="slider-tiny"></span></label>
    </div>
);

const MiniWeatherItem = ({ icon: Icon, label, enabled, onToggle, value, onValue, unit, prefix, color }) => (
    <div className="mini-alert-item" style={{ cursor: 'pointer' }} onClick={() => onToggle(!enabled)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="switch-tiny"><input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} /><span className="slider-tiny"></span></label>
            <div className="mini-label" style={{ color: enabled ? (color || "#1e293b") : "#94a3b8" }}><Icon size={12} /> {label}</div>
        </div>
        <div className="mini-input-group" onClick={(e) => e.stopPropagation()}>
            {prefix} <input type="number" className="mini-num-input" value={value} onChange={(e) => onValue(e.target.value)} />{unit}
        </div>
    </div>
);

export default MyStation;
