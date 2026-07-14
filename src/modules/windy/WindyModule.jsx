import React, { useState } from 'react';
import { Wind, CloudRain, Thermometer, Cloud, Compass } from 'lucide-react';
import './WindyModule.css';

const FOCUS_POINTS = {
    FRANCE: { name: 'France entière', lat: 46.5, lon: 2.5, zoom: 6 },
    HDF: { name: 'Hauts-de-France', lat: 50.1, lon: 2.9, zoom: 8 },
    DOUAI: { name: 'Douai (Local)', lat: 50.37, lon: 3.08, zoom: 11 }
};

const OVERLAYS = [
    { id: 'wind', label: 'Vents', icon: Wind, color: '#10b981' },
    { id: 'rain', label: 'Pluie & Orages', icon: CloudRain, color: '#0ea5e9' },
    { id: 'temp', label: 'Températures', icon: Thermometer, color: '#ef4444' },
    { id: 'clouds', label: 'Nuages & Ciel', icon: Cloud, color: '#64748b' },
    { id: 'waves', label: 'Vagues & Houle', icon: Compass, color: '#2563eb' }
];

export default function WindyModule() {
    const [overlay, setOverlay] = useState('wind');
    const [focusKey, setFocusKey] = useState('FRANCE');

    const activeFocus = FOCUS_POINTS[focusKey];
    const iframeUrl = `https://embed.windy.com/embed2.html?lat=${activeFocus.lat}&lon=${activeFocus.lon}&zoom=${activeFocus.zoom}&level=surface&overlay=${overlay}&menu=&message=true&marker=&calendar=now&pressure=true&type=map&location=coordinates&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

    return (
        <div className="windy-container animate-fade-in">
            <header className="windy-header">
                <div className="title-section">
                    <h1><Wind size={24} className="icon-pulse text-emerald" /> Module Météo Windy</h1>
                    <p className="subtitle">Visualisation dynamique globale des flux et des perturbations</p>
                </div>
            </header>

            <div className="windy-layout-grid">
                {/* Options Panel */}
                <div className="windy-settings-card card-glass">
                    <h3>CALQUES MÉTÉO</h3>
                    <div className="overlay-buttons-list">
                        {OVERLAYS.map(ov => {
                            const Icon = ov.icon;
                            const isActive = overlay === ov.id;
                            return (
                                <button
                                    key={ov.id}
                                    className={`overlay-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => setOverlay(ov.id)}
                                    style={isActive ? { background: ov.color, color: 'white', borderColor: ov.color } : {}}
                                >
                                    <Icon size={16} />
                                    <span>{ov.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="settings-divider" />

                    <h3>FOCUS GÉOGRAPHIQUE</h3>
                    <div className="focus-buttons-list">
                        {Object.entries(FOCUS_POINTS).map(([key, point]) => (
                            <button
                                key={key}
                                className={`focus-btn ${focusKey === key ? 'active' : ''}`}
                                onClick={() => setFocusKey(key)}
                            >
                                <span>{point.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Map Frame Card */}
                <div className="windy-map-card card-glass">
                    <iframe
                        src={iframeUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        title="Windy Interactive Map"
                        className="windy-iframe"
                    />
                </div>
            </div>
        </div>
    );
}
