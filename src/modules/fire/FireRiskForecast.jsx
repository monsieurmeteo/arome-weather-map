import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Search, MapPin, Thermometer, Droplets, Wind, Info, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Liste des grands massifs forestiers français pour détection de proximité
const FOREST_MASSIFS = [
    { name: "Massif des Landes de Gascogne", lat: 44.5, lon: -0.8, radiusKm: 70 },
    { name: "Massif des Maures (Var)", lat: 43.25, lon: 6.35, radiusKm: 25 },
    { name: "Massif de l'Esterel (Var)", lat: 43.48, lon: 6.82, radiusKm: 15 },
    { name: "Forêt de Fontainebleau", lat: 48.40, lon: 2.70, radiusKm: 15 },
    { name: "Massif Vosgien", lat: 48.20, lon: 7.00, radiusKm: 40 },
    { name: "Forêt d'Orléans", lat: 47.98, lon: 2.22, radiusKm: 20 },
    { name: "Massif de la Double (Périgord)", lat: 45.12, lon: 0.22, radiusKm: 20 },
    { name: "Massif de la Clape (Aude)", lat: 43.13, lon: 3.12, radiusKm: 15 },
    { name: "Forêt de Compiègne", lat: 49.38, lon: 2.92, radiusKm: 15 },
    { name: "Forêt de Brocéliande (Paimpont)", lat: 48.02, lon: -2.17, radiusKm: 15 }
];

const RISK_LEVELS = {
    low: { 
        id: 'low', 
        label: 'Risque Faible', 
        color: '#10b981', 
        bg: 'rgba(16, 185, 129, 0.1)', 
        border: 'rgba(16, 185, 129, 0.2)',
        text: '#34d399', 
        gradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
        emoji: '🟢' 
    },
    sensible: { 
        id: 'sensible', 
        label: 'À surveiller', 
        color: '#059669', 
        bg: 'rgba(5, 150, 105, 0.15)', 
        border: 'rgba(5, 150, 105, 0.3)',
        text: '#6ee7b7', 
        gradient: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)',
        emoji: '🟢' 
    },
    warning: { 
        id: 'warning', 
        label: 'Vigilance', 
        color: '#d97706', 
        bg: 'rgba(217, 119, 6, 0.15)', 
        border: 'rgba(217, 119, 6, 0.3)',
        text: '#fbbf24', 
        gradient: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
        emoji: '🟡' 
    },
    high: { 
        id: 'high', 
        label: 'Danger Élevé', 
        color: '#ea580c', 
        bg: 'rgba(234, 88, 12, 0.2)', 
        border: 'rgba(234, 88, 12, 0.4)',
        text: '#ff9d5c', 
        gradient: 'linear-gradient(135deg, #9a3412 0%, #431407 100%)',
        emoji: '🟠' 
    },
    critical: { 
        id: 'critical', 
        label: 'Très Élevé', 
        color: '#ef4444', 
        bg: 'rgba(239, 68, 68, 0.25)', 
        border: 'rgba(239, 68, 68, 0.6)',
        text: '#fca5a5', 
        gradient: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
        emoji: '🔴' 
    }
};

// Algorithme 3×30 harmonisé
function computeRisk(temp, hum, wind) {
    if (temp == null || hum == null) return 'low';
    const w = wind || 0;

    let tempScore = 0;
    if (temp >= 35)      tempScore = 3;
    else if (temp >= 30) tempScore = 2;
    else if (temp >= 27) tempScore = 1;

    let humScore = 0;
    if (hum <= 25)      humScore = 3;
    else if (hum <= 30) humScore = 2;
    else if (hum <= 40) humScore = 1;

    let windScore = 0;
    if (w >= 40)      windScore = 3;
    else if (w >= 30) windScore = 2;
    else if (w >= 20) windScore = 1;

    // T < 30 °C
    if (tempScore < 2) {
        if (hum <= 30 && w >= 30) return 'warning';
        if (tempScore === 1) return 'sensible';
        return 'low';
    }

    // T ≥ 30 °C
    if (humScore >= 2 && windScore >= 2) return 'critical';
    if (tempScore === 3 && (humScore >= 2 || windScore >= 2)) return 'critical';

    if (humScore >= 1 && windScore >= 1) return 'high';
    if (humScore >= 2 || windScore >= 2) return 'high';

    return 'warning';
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function FireRiskForecast() {
    const [searchQuery, setSearchQuery] = useState('Douai');
    const [commune, setCommune] = useState({ name: 'Douai', lat: 50.37, lon: 3.08, dept: '59' });
    const [forecastDays, setForecastDays] = useState([]);
    const [selectedDayIdx, setSelectedDayIdx] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Recherche intelligente / Autocompletion
    useEffect(() => {
        if (searchQuery.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            try {
                const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&type=municipality&limit=5`;
                const res = await fetch(url);
                if (res.ok) {
                    const json = await res.json();
                    if (json.features) {
                        setSuggestions(json.features.map(f => ({
                            label: f.properties.label,
                            postcode: f.properties.postcode,
                            dept: f.properties.departement || f.properties.postcode.substring(0, 2),
                            coordinates: f.geometry.coordinates
                        })));
                    }
                }
            } catch (err) {
                console.error('Error fetching autocomplete suggestions:', err);
            }
        }, 200);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handleSelectSuggestion = (s) => {
        const [lon, lat] = s.coordinates;
        const nextCommune = {
            name: s.label,
            lat,
            lon,
            dept: s.dept
        };
        setCommune(nextCommune);
        setSearchQuery(s.label);
        setSuggestions([]);
        setShowSuggestions(false);
        fetchForecast(lat, lon);
    };

    const nearbyForest = useMemo(() => {
        if (!commune) return null;
        let nearest = null;
        let minDist = Infinity;
        FOREST_MASSIFS.forEach(m => {
            const dist = haversine(commune.lat, commune.lon, m.lat, m.lon);
            if (dist < minDist && dist <= m.radiusKm + 15) {
                minDist = dist;
                nearest = { ...m, distance: Math.round(dist) };
            }
        });
        return nearest;
    }, [commune]);

    const fetchForecast = async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m&timezone=Europe/Paris`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Erreur de chargement des prévisions Open-Meteo');
            const data = await res.json();

            const days = [];
            const riskOrder = { low: 0, sensible: 1, warning: 2, high: 3, critical: 4 };

            for (let d = 0; d < 7; d++) {
                const startHour = d * 24;
                const hours = [];
                let maxT = -Infinity;
                let minU = Infinity;
                let maxW = -Infinity;
                let maxG = -Infinity;
                let worstRisk = 'low';

                for (let h = 0; h < 24; h++) {
                    const idx = startHour + h;
                    const temp = data.hourly.temperature_2m[idx];
                    const hum = data.hourly.relative_humidity_2m[idx];
                    const wind = data.hourly.wind_speed_10m[idx];
                    const gust = data.hourly.wind_gusts_10m[idx];
                    const time = data.hourly.time[idx];

                    const risk = computeRisk(temp, hum, wind);
                    if (temp > maxT) maxT = temp;
                    if (hum < minU) minU = hum;
                    if (wind > maxW) maxW = wind;
                    if (gust > maxG) maxG = gust;

                    if (riskOrder[risk] > riskOrder[worstRisk]) {
                        worstRisk = risk;
                    }

                    hours.push({
                        time: new Date(time),
                        temp,
                        hum,
                        wind,
                        gust,
                        risk
                    });
                }

                days.push({
                    date: addDays(new Date(), d),
                    tempMax: maxT,
                    humMin: minU,
                    windMax: maxW,
                    gustMax: maxG,
                    risk: worstRisk,
                    hours
                });
            }

            setForecastDays(days);
            setSelectedDayIdx(0);
        } catch (e) {
            console.error(e);
            setError('Impossible de charger les prévisions météorologiques.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setError(null);
        setSuggestions([]);
        setShowSuggestions(false);
        try {
            const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&limit=1`);
            const json = await res.json();
            if (!json.features || json.features.length === 0) {
                setError('Commune introuvable. Veuillez préciser le nom ou le code postal.');
                return;
            }
            const f = json.features[0];
            const [lon, lat] = f.geometry.coordinates;
            const nextCommune = {
                name: f.properties.label,
                lat,
                lon,
                dept: f.properties.departement || f.properties.postcode.substring(0, 2)
            };
            setCommune(nextCommune);
            fetchForecast(lat, lon);
        } catch (err) {
            setError('Erreur réseau lors de la recherche.');
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        fetchForecast(commune.lat, commune.lon);
    }, []);

    const activeDay = forecastDays[selectedDayIdx];

    return (
        <div style={{ background: '#090d16', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'Outfit', 'Inter', sans-serif", padding: '28px' }}>
            
            {/* Header Dashboard Premium */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
                    }}>
                        <Flame size={26} style={{ color: '#fff' }} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Prévisions Incendie 7 Jours</h1>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>Modélisation préventive par commune • Règle des 3×30</p>
                    </div>
                </div>

                {/* Recherche & Suggestions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', width: '100%' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Rechercher une ville, code postal..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    padding: '10px 14px 10px 38px',
                                    color: '#fff',
                                    fontSize: '0.88rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s'
                                }}
                            />
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />

                            {/* Dropdown Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul style={{
                                    position: 'absolute',
                                    top: '46px',
                                    left: 0,
                                    right: 0,
                                    background: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    zIndex: 100,
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                                    maxHeight: '220px',
                                    overflowY: 'auto',
                                    listStyle: 'none',
                                    margin: 0,
                                    padding: '4px 0',
                                    boxSizing: 'border-box'
                                }}>
                                    {suggestions.map((s, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => handleSelectSuggestion(s)}
                                            style={{
                                                padding: '10px 14px',
                                                fontSize: '0.82rem',
                                                cursor: 'pointer',
                                                color: '#e2e8f0',
                                                transition: 'background 0.15s',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.color = '#ef4444';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#e2e8f0';
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{s.label}</span>
                                            <span style={{ fontSize: '0.68rem', background: '#0f172a', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8', fontWeight: 700 }}>
                                                {s.postcode}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button type="submit" disabled={searchLoading} style={{
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 18px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            transition: 'all 0.15s',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                        onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                        >
                            {searchLoading ? '...' : 'Rechercher'}
                        </button>
                    </form>

                    {/* Chips de suggestions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {[
                            { label: '🏙️ Marseille', query: 'Marseille' },
                            { label: '🌲 Hostens', query: 'Hostens' },
                            { label: '🌲 Fontainebleau', query: 'Fontainebleau' }
                        ].map(c => (
                            <button
                                key={c.query}
                                type="button"
                                onClick={() => {
                                    setSearchQuery(c.query);
                                    setTimeout(() => {
                                        const btn = document.querySelector('form button[type="submit"]');
                                        if (btn) btn.click();
                                    }, 50);
                                }}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    color: '#94a3b8',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            >
                                {c.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                if (!navigator.geolocation) return;
                                navigator.geolocation.getCurrentPosition(async pos => {
                                    const { latitude, longitude } = pos.coords;
                                    try {
                                        const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`);
                                        const json = await res.json();
                                        if (json.features?.[0]) {
                                            const name = json.features[0].properties.label;
                                            setSearchQuery(name);
                                            setTimeout(() => {
                                                const btn = document.querySelector('form button[type="submit"]');
                                                if (btn) btn.click();
                                            }, 50);
                                        }
                                    } catch(e) {}
                                }, () => alert('Géolocalisation refusée ou indisponible.'));
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                color: '#94a3b8',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        >
                            📍 Ma position
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ background: '#450a0a', border: '1px solid #ef4444', borderRadius: '12px', padding: '12px 16px', color: '#fca5a5', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertTriangle size={20} />
                    <span style={{ fontSize: '0.85rem' }}>{error}</span>
                </div>
            )}

            {/* Alerte massif forestier */}
            {nearbyForest && (
                <div style={{
                    background: 'linear-gradient(135deg, #7c2d12 0%, #431407 100%)',
                    border: '1px solid rgba(234, 88, 12, 0.4)',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    color: '#ffedd5',
                    marginBottom: '24px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                }}>
                    <ShieldAlert size={26} style={{ color: '#ea580c', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fdba74', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>⚠️ Zone sous vigilance massifs forestiers</span>
                        </div>
                        <div style={{ fontSize: '0.84rem', marginTop: '6px', lineHeight: 1.5, color: '#fed7aa' }}>
                            La commune de <strong>{commune.name}</strong> se situe dans un rayon critique (<strong>{nearbyForest.distance} km</strong>) du <strong>{nearbyForest.name}</strong>. 
                            La présence de végétation forestière dense démultiplie la vitesse de propagation en cas de feu. Observez la plus grande prudence.
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b' }}>
                    <Flame size={48} style={{ animation: 'spin 1.5s linear infinite', color: '#ef4444', margin: '0 auto 20px', display: 'block' }} />
                    <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>Modélisation horaire en cours...</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px' }}>Analyse des profils de température, humidité et vent sur 168 heures</div>
                </div>
            ) : (
                <>
                    {/* Localisation active */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', paddingLeft: '4px' }}>
                        <MapPin size={18} style={{ color: '#ef4444' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{commune.name} <span style={{ color: '#64748b', fontWeight: 600 }}>(Dept {commune.dept})</span></span>
                    </div>

                    {/* Grille 7 Jours */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                        {forecastDays.map((d, idx) => {
                            const isSelected = selectedDayIdx === idx;
                            const lvl = RISK_LEVELS[d.risk];
                            const isCritical = d.risk === 'critical';
                            const isHigh = d.risk === 'high';

                            // Configuration esthétique dynamique
                            let cardAnimation = 'none';
                            let borderStyle = `1px solid ${isSelected ? lvl.color : 'rgba(255,255,255,0.06)'}`;
                            let glowStyle = isSelected ? `0 0 16px ${lvl.color}33` : 'none';
                            let cardBackground = isSelected ? lvl.gradient : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';

                            if (isCritical) {
                                cardAnimation = 'blink-red-border 2s infinite ease-in-out';
                                borderStyle = '1px solid #ef4444';
                                glowStyle = isSelected ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 10px rgba(239, 68, 68, 0.2)';
                            } else if (isHigh && isSelected) {
                                glowStyle = '0 0 20px rgba(234, 88, 12, 0.4)';
                            }

                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedDayIdx(idx)}
                                    style={{
                                        background: cardBackground,
                                        border: borderStyle,
                                        borderRadius: '16px',
                                        padding: '18px 16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: glowStyle,
                                        transform: isSelected ? 'translateY(-4px)' : 'none',
                                        animation: cardAnimation
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected && !isCritical) {
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected && !isCritical) {
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.transform = 'none';
                                        }
                                    }}
                                >
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isSelected ? '#fff' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {format(d.date, 'EEEE d MMM', { locale: fr })}
                                    </div>
                                    <div style={{ margin: '12px 0 14px' }}>
                                        <span style={{
                                            fontSize: '0.74rem',
                                            background: lvl.bg,
                                            color: lvl.text,
                                            border: `1px solid ${lvl.border}`,
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontWeight: 800,
                                            letterSpacing: '0.02em',
                                            textTransform: 'uppercase'
                                        }}>
                                            {lvl.emoji} {lvl.label}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: isSelected ? '#e2e8f0' : '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Thermometer size={14} style={{ color: d.tempMax >= 30 ? '#ef4444' : '#64748b' }} />
                                            <span style={{ fontWeight: 600 }}>T Max : <span style={{ color: '#fff' }}>{d.tempMax.toFixed(0)}°C</span></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Droplets size={14} style={{ color: d.humMin <= 30 ? '#38bdf8' : '#64748b' }} />
                                            <span style={{ fontWeight: 600 }}>HR Min : <span style={{ color: '#fff' }}>{d.humMin.toFixed(0)}%</span></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Wind size={14} style={{ color: d.windMax >= 30 ? '#f59e0b' : '#64748b' }} />
                                            <span style={{ fontWeight: 600 }}>Vent : <span style={{ color: '#fff' }} title="Vent moyen / Rafales">{d.windMax.toFixed(0)}/{d.gustMax.toFixed(0)} <span style={{ fontSize: '0.68rem', color: '#64748b' }}>km/h</span></span></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Timeline Horaire */}
                    {activeDay && (
                        <div style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            borderRadius: '20px',
                            padding: '24px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                                <Clock size={20} style={{ color: '#ef4444' }} />
                                <span style={{ fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff' }}>
                                    ⌛ Évolution horaire • {format(activeDay.date, 'EEEE d MMMM yyyy', { locale: fr })}
                                </span>
                            </div>

                            <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Première ligne : 00h - 07h */}
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                                    {activeDay.hours.slice(0, 8).map((h, i) => {
                                        const lvl = RISK_LEVELS[h.risk];
                                        const isPeak = h.risk === 'critical' || h.risk === 'high';
                                        return (
                                            <div
                                                key={i}
                                                className="timeline-item"
                                                style={{
                                                    flex: '1 1 0px',
                                                    minWidth: '70px',
                                                    background: isPeak ? lvl.gradient : 'rgba(15, 23, 42, 0.4)',
                                                    border: `1px solid ${isPeak ? lvl.color : 'rgba(255,255,255,0.04)'}`,
                                                    borderRadius: '12px',
                                                    padding: '16px 8px',
                                                    textAlign: 'center',
                                                    borderBottom: `5px solid ${lvl.color}`,
                                                    boxShadow: h.risk === 'critical' ? '0 4px 12px rgba(239,68,68,0.2)' : 'none',
                                                    transition: 'transform 0.15s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                            >
                                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isPeak ? '#fff' : '#64748b', marginBottom: '8px' }}>
                                                    {format(h.time, 'HH')}h
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }} title="Température">
                                                        {h.temp.toFixed(0)}°C
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isPeak ? '#fff' : '#38bdf8' }} title="Humidité relative">
                                                        💧{h.hum.toFixed(0)}%
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isPeak ? '#fff' : '#f59e0b' }} title="Vent moyen / Rafales">
                                                        💨{h.wind.toFixed(0)}/{h.gust.toFixed(0)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Deuxième ligne : 08h - 15h */}
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                                    {activeDay.hours.slice(8, 16).map((h, i) => {
                                        const lvl = RISK_LEVELS[h.risk];
                                        const isPeak = h.risk === 'critical' || h.risk === 'high';
                                        return (
                                            <div
                                                key={i}
                                                className="timeline-item"
                                                style={{
                                                    flex: '1 1 0px',
                                                    minWidth: '70px',
                                                    background: isPeak ? lvl.gradient : 'rgba(15, 23, 42, 0.4)',
                                                    border: `1px solid ${isPeak ? lvl.color : 'rgba(255,255,255,0.04)'}`,
                                                    borderRadius: '12px',
                                                    padding: '16px 8px',
                                                    textAlign: 'center',
                                                    borderBottom: `5px solid ${lvl.color}`,
                                                    boxShadow: h.risk === 'critical' ? '0 4px 12px rgba(239,68,68,0.2)' : 'none',
                                                    transition: 'transform 0.15s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                            >
                                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isPeak ? '#fff' : '#64748b', marginBottom: '8px' }}>
                                                    {format(h.time, 'HH')}h
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }} title="Température">
                                                        {h.temp.toFixed(0)}°C
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isPeak ? '#fff' : '#38bdf8' }} title="Humidité relative">
                                                        💧{h.hum.toFixed(0)}%
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isPeak ? '#fff' : '#f59e0b' }} title="Vent moyen / Rafales">
                                                        💨{h.wind.toFixed(0)}/{h.gust.toFixed(0)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Troisième ligne : 16h - 23h */}
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                                    {activeDay.hours.slice(16, 24).map((h, i) => {
                                        const lvl = RISK_LEVELS[h.risk];
                                        const isPeak = h.risk === 'critical' || h.risk === 'high';
                                        return (
                                            <div
                                                key={i}
                                                className="timeline-item"
                                                style={{
                                                    flex: '1 1 0px',
                                                    minWidth: '70px',
                                                    background: isPeak ? lvl.gradient : 'rgba(15, 23, 42, 0.4)',
                                                    border: `1px solid ${isPeak ? lvl.color : 'rgba(255,255,255,0.04)'}`,
                                                    borderRadius: '12px',
                                                    padding: '16px 8px',
                                                    textAlign: 'center',
                                                    borderBottom: `5px solid ${lvl.color}`,
                                                    boxShadow: h.risk === 'critical' ? '0 4px 12px rgba(239,68,68,0.2)' : 'none',
                                                    transition: 'transform 0.15s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                            >
                                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isPeak ? '#fff' : '#64748b', marginBottom: '8px' }}>
                                                    {format(h.time, 'HH')}h
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }} title="Température">
                                                        {h.temp.toFixed(0)}°C
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isPeak ? '#fff' : '#38bdf8' }} title="Humidité relative">
                                                        💧{h.hum.toFixed(0)}%
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isPeak ? '#fff' : '#f59e0b' }} title="Vent moyen / Rafales">
                                                        💨{h.wind.toFixed(0)}/{h.gust.toFixed(0)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '12px 16px', marginTop: '20px', fontSize: '0.78rem', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <Info size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                                <span>Le risque journalier affiché sur les cartes ci-dessus correspond au niveau le plus sévère atteint au cours de la journée (généralement en après-midi).</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes blink-red-border {
                    0% { border-color: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }
                    50% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 4px rgba(239, 68, 68, 0.1); }
                    100% { border-color: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }
                }
            `}</style>
        </div>
    );
}
