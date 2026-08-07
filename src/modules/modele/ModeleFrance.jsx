import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Play, Square, ChevronLeft, ChevronRight, Download, Printer,
    RefreshCw, Clock, Info, Globe, Map as MapIcon,
    LineChart, Radio, Scissors
} from 'lucide-react';
import './ModeleFrance.css';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const SUPABASE_URL   = import.meta.env.VITE_SUPABASE_URL;
const isDev          = import.meta.env.DEV;
const STORAGE_BASE   = isDev
    ? '/local-meteo-models'
    : `${SUPABASE_URL}/storage/v1/object/public/meteo-models`;
const METADATA_URL   = isDev
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/meteo-models/metadata.json`
    : `${STORAGE_BASE}/metadata.json`;

const MODELS = {
    'icon-eu': { 
        name: 'ICON-EU (DWD)',       
        short: 'ICON-EU', 
        resolution: '6.5 km', 
        color: '#16a34a', 
        maxStep: 180,
        desc: 'Modèle régional à haute résolution (6.5 km) du service météorologique allemand (DWD). Fournit des prévisions extrêmement fines à courte et moyenne échéance sur la France et ses régions.'
    },
    'ecmwf': { 
        name: 'ECMWF IFS',         
        short: 'ECMWF',   
        resolution: '~28 km', 
        color: '#2563eb', 
        maxStep: 240,
        desc: 'Modèle global de référence IFS du Centre européen (CEPMMT). Réputé pour sa précision à moyen terme sur l\'ensemble du continent européen à une maille d\'environ 28 km.'
    },
    'arome': { 
        name: 'AROME (Météo-France)',          
        short: 'AROME',   
        resolution: '1.3 km', 
        color: '#dc2626', 
        maxStep: 51,
        desc: 'Modèle à maille ultra-fine (1.3 km) développé par Météo-France. Idéal pour l\'analyse détaillée des phénomènes convectifs violents, des orages et des variations thermiques locales.'
    },
    'arpege': { 
        name: 'ARPÈGE (Météo-France)',         
        short: 'ARPÈGE',  
        resolution: '~10 km', 
        color: '#9333ea', 
        maxStep: 114,
        desc: 'Modèle global de Météo-France, avec une maille resserrée à environ 10 km sur l\'Europe. Couvre des échéances allant jusqu\'à 4 jours et sert de référence pour la prévision synoptique.'
    },
};

const ZONES = {
    france:            { name: 'France',          center: [46.5, 2.5],  zoom: 5,  bounds: [[41, -6],    [52.5, 11]]   },
    'hauts-de-france': { name: 'Hauts-de-France', center: [49.85, 2.6], zoom: 8,  bounds: [[48.2, 0.0], [51.5, 5.2]]  },
};

// ─── GRILLE DES PARAMÈTRES (STYLE CLASSIQUE PROFESSIONNEL) ────────────────────
const PARAMETER_COLUMNS = [
    {
        title: 'TEMPÉRATURE',
        params: [
            { id: 'temperature', label: 'Température à 2m', active: true },
            { id: 'temp_max', label: 'Température maximale à 2m 12h', active: false },
            { id: 'temp_min', label: 'Température minimale à 2m 12h', active: false },
            { id: 'humidex', label: 'Humidex', active: false },
            { id: 'wind_chill', label: 'Refroidissement éolien', active: false },
            { id: 'temp_850', label: 'Température à 850 hPa', active: false },
            { id: 'temp_500', label: 'Température à 500 hPa', active: false },
        ]
    },
    {
        title: 'PRÉCIPITATIONS',
        params: [
            { id: 'precipitation', label: 'Précipitations totales', active: true },
            { id: 'precip_1h', label: 'Précipitations sur 1h', active: false },
            { id: 'snow', label: 'Accumulation de neige', active: true },
            { id: 'severe_precip', label: 'Type de précip. sévère', active: false },
            { id: 'precip_water', label: 'Eau précipitable', active: false },
        ]
    },
    {
        title: 'VENT',
        params: [
            { id: 'wind_speed', label: 'Vent moyen à 10m', active: true },
            { id: 'wind_gusts', label: 'Rafales à 10m', active: true },
            { id: 'wind_gusts_max', label: 'Rafales max. à 10m', active: false },
            { id: 'wind_850', label: 'Vent à 850 hPa', active: false },
            { id: 'wind_500', label: 'Vent à 500 hPa', active: false },
            { id: 'wind_300', label: 'Vent à 300 hPa (jet stream)', active: false },
        ]
    },
    {
        title: 'NUAGES & HUMIDITÉ',
        params: [
            { id: 'cloud_low', label: 'Couverture nuageuse basse', active: false },
            { id: 'cloud_med', label: 'Couverture nuageuse moyenne', active: false },
            { id: 'cloud_high', label: 'Couverture nuageuse haute', active: false },
            { id: 'clouds', label: 'Nébulosité (composition)', active: true },
            { id: 'humidity', label: 'Humidité relative', active: true },
            { id: 'visibility', label: 'Visibilité minimale', active: false },
        ]
    },
    {
        title: 'INSTABILITÉ',
        params: [
            { id: 'cape', label: 'SBCAPE', active: true },
            { id: 'cin', label: 'CIN', active: false },
            { id: 'lightning', label: 'Densité de foudre', active: false },
        ]
    },
    {
        title: 'PRESSION & GÉOPOTENTIEL',
        params: [
            { id: 'pressure', label: 'Géopotentiel 500 hPa et pression mer', active: true },
            { id: 'iso_0', label: 'ISO 0°C', active: false },
            { id: 'cla', label: 'Hauteur de la CLA', active: false },
        ]
    },
    {
        title: 'DYNAMIQUE',
        params: [
            { id: 'vertical_vel', label: 'Vitesse verticale', active: false },
        ]
    }
];

// Mapping des IDs de boutons réels vers les paramètres de notre API de données
const API_PARAM_MAP = {
    'temperature': 'temperature',
    'precipitation': 'precipitation',
    'snow': 'snow',
    'wind_speed': 'wind_speed',
    'wind_gusts': 'wind_gusts',
    'clouds': 'clouds',
    'humidity': 'humidity',
    'cape': 'cape',
    'pressure': 'geopotential' // mapped to geopotential for 500hPa & pressure
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const getMapUrl = (model, zone, param, runDate, runHour, step) => {
    return `${STORAGE_BASE}/${model}/${zone}/${param}/${runDate}_${String(runHour).padStart(2,'0')}h/H+${String(step).padStart(3,'0')}_static.png`;
};

const fmtRun = (date, hour) => {
    if (!date) return '—';
    const d = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
    return `${new Date(d).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit',year:'2-digit'})} ${String(hour).padStart(2,'0')}h UTC`;
};

const fmtValidTime = (date, hour, step) => {
    if (!date) return '';
    const dt = new Date(`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}T${String(hour).padStart(2,'0')}:00:00Z`);
    dt.setHours(dt.getHours() + step);
    return dt.toLocaleString('fr-FR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', timeZone:'UTC' }) + ' UTC';
};

const preloadImage = url => new Promise(resolve => {
    const img = new window.Image();
    img.onload = img.onerror = () => resolve(url);
    img.src = url;
});

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
const ModeleFrance = () => {
    // État principal
    const [metadata,    setMetadata]    = useState(null);
    const [metaError,   setMetaError]   = useState(false);
    const [model,       setModel]       = useState('icon-eu');
    const [zone,        setZone]        = useState('france');
    const [param,       setParam]       = useState('temperature');
    const [run,         setRun]         = useState(null);  // { date, hour, steps }
    const [stepIdx,     setStepIdx]     = useState(0);
    const [isPlaying,   setIsPlaying]   = useState(false);
    const [speed,       setSpeed]       = useState(600);
    const [mapUrl,      setMapUrl]      = useState('');
    const [loading,     setLoading]     = useState(true);
    const [preloading,  setPreloading]  = useState(false);
    const [preloadPct,  setPreloadPct]  = useState(0);
    const [showInfo,    setShowInfo]    = useState(false);

    const timerRef   = useRef(null);
    const stepsRef   = useRef([]);

    // ── Chargement metadata ────────────────────────────────────────────────────
    const loadMetadata = useCallback(async () => {
        setLoading(true);
        setMetaError(false);
        try {
            const r    = await fetch(`${METADATA_URL}?t=${Date.now()}`);
            const meta = await r.json();
            setMetadata(meta);
            // Sélectionne le dernier run du modèle actuel
            const runs = meta?.models?.[model]?.runs || [];
            if (runs.length > 0) {
                const last = runs[0];
                setRun(last);
                setStepIdx(0);
            }
        } catch {
            setMetaError(true);
        } finally {
            setLoading(false);
        }
    }, [model]);

    useEffect(() => { loadMetadata(); }, [loadMetadata]);

    // ── Quand run/param/zone/stepIdx changent → met à jour l'URL de la carte ──
    useEffect(() => {
        if (!run) return;
        const steps = run.steps || [];
        stepsRef.current = steps;
        const step = steps[stepIdx] ?? 0;
        const url = getMapUrl(model, zone, param, run.date, run.hour, step);
        setMapUrl(url);
    }, [model, zone, param, run, stepIdx]);

    // ── Animation ─────────────────────────────────────────────────────────────
    useEffect(() => {
        clearInterval(timerRef.current);
        if (!isPlaying || !run?.steps?.length) return;
        timerRef.current = setInterval(() => {
            setStepIdx(i => {
                const next = (i + 1) % stepsRef.current.length;
                return next;
            });
        }, speed);
        return () => clearInterval(timerRef.current);
    }, [isPlaying, run, model, zone, param, speed]);

    // ── Préchargement de toutes les frames ────────────────────────────────────
    const preloadAll = useCallback(async () => {
        if (!run?.steps?.length) return;
        setPreloading(true);
        setPreloadPct(0);
        const steps = run.steps;
        for (let i = 0; i < steps.length; i++) {
            const url = getMapUrl(model, zone, param, run.date, run.hour, steps[i]);
            await preloadImage(url);
            setPreloadPct(Math.round(((i + 1) / steps.length) * 100));
        }
        setPreloading(false);
        setIsPlaying(true);
    }, [model, zone, param, run]);

    // ── Navigation manuelle ───────────────────────────────────────────────────
    const goTo = idx => {
        if (!run?.steps) return;
        const i   = Math.max(0, Math.min(idx, run.steps.length - 1));
        setStepIdx(i);
    };

    // ── Téléchargement de la carte courante ──────────────────────────────────
    const downloadCurrent = () => {
        if (!mapUrl) return;
        const a    = document.createElement('a');
        a.href     = mapUrl;
        const step = run?.steps?.[stepIdx] ?? 0;
        a.download = `${model}_${zone}_${param}_${run?.date}_${String(run?.hour||0).padStart(2,'0')}h_H+${String(step).padStart(3,'0')}.png`;
        a.target   = '_blank';
        a.click();
    };

    const handleParamClick = (pId, pActive) => {
        if (!pActive) return;
        const mappedId = API_PARAM_MAP[pId];
        if (mappedId) {
            setParam(mappedId);
            setStepIdx(0);
            setIsPlaying(false);
        }
    };

    const runs = metadata?.models?.[model]?.runs || [];
    const currentStep = run?.steps?.[stepIdx] ?? 0;
    const zoneConfig  = ZONES[zone];

    return (
        <div className="modele-pro-wrapper">
            
            {/* ── BARRE DE SÉLECTION DU MODÈLE SUPÉRIEURE ── */}
            <div className="modele-top-bar-pro">
                <div className="top-bar-title">Modèles Numériques de Prévision</div>
                <div className="model-tabs-pro">
                    {Object.entries(MODELS).map(([key, m]) => (
                        <button key={key}
                            className={`model-tab-pro ${model === key ? 'active' : ''}`}
                            style={{ '--model-color': m.color }}
                            onClick={() => { setModel(key); setStepIdx(0); setIsPlaying(false); }}>
                            <span className="tab-name">{m.name}</span>
                            <span className="tab-res-pro">({m.resolution})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── GRILLE COMPLÈTE DES PARAMÈTRES (TABLE METEOCIEL-STYLE) ── */}
            <div className="params-table-container">
                <table className="params-table">
                    <thead>
                        <tr>
                            {PARAMETER_COLUMNS.map((col, idx) => (
                                <th key={idx}>{col.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {PARAMETER_COLUMNS.map((col, idx) => (
                                <td key={idx} className="params-column-td">
                                    {col.params.map(p => {
                                        const isSelected = API_PARAM_MAP[p.id] === param;
                                        return (
                                            <button
                                                key={p.id}
                                                className={`param-button-pro ${p.active ? 'active-param' : 'disabled-param'} ${isSelected ? 'selected-param' : ''}`}
                                                onClick={() => handleParamClick(p.id, p.active)}
                                                disabled={!p.active}
                                                title={p.active ? `Afficher ${p.label}` : 'Non disponible sur ce modèle'}
                                            >
                                                <span className="param-bullet" />
                                                {p.label}
                                            </button>
                                        );
                                    })}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ── BARRE DE SOUS-NAVIGATION COMPACTE ── */}
            <div className="sub-nav-bar-pro">
                <div className="sub-nav-left">
                    <button className="sub-nav-shortcut-btn disabled" disabled>📊 Diagramme</button>
                    <button className="sub-nav-shortcut-btn disabled" disabled>📍 Radiosondage</button>
                    <button className="sub-nav-shortcut-btn disabled" disabled>✂️ Coupes</button>
                    <button 
                        className="sub-nav-shortcut-btn download-direct-btn" 
                        onClick={downloadCurrent}
                        title="Télécharger l'image de la carte actuelle"
                        style={{
                            borderColor: '#2563eb',
                            color: '#2563eb',
                            background: '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: '800'
                        }}
                    >
                        <Download size={12} />
                        Télécharger la carte
                    </button>
                </div>

                <div className="sub-nav-right">
                    {/* Sélecteur de Zone */}
                    <div className="select-wrapper-pro">
                        <select value={zone} onChange={e => setZone(e.target.value)} className="select-compact-pro">
                            {Object.entries(ZONES).map(([key, z]) => (
                                <option key={key} value={key}>{z.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sélecteur de Run */}
                    <div className="select-wrapper-pro">
                        <Clock size={12} className="select-clock-icon" />
                        <select value={run ? `${run.date}_${run.hour}` : ''}
                            onChange={e => {
                                const [d, h] = e.target.value.split('_');
                                const r = runs.find(r => r.date === d && r.hour === +h);
                                if (r) { setRun(r); setStepIdx(0); setIsPlaying(false); }
                            }}
                            className="select-compact-pro font-bold">
                            {runs.map(r => (
                                <option key={`${r.date}_${r.hour}`} value={`${r.date}_${r.hour}`}>
                                    Run {fmtRun(r.date, r.hour)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button className="sub-nav-icon-btn" onClick={loadMetadata} title="Actualiser les données">
                        <RefreshCw size={13} />
                    </button>
                </div>
            </div>

            {/* ── ESPACE DE TRAVAIL PRINCIPAL AVEC SIDEBAR COMPACTE ── */}
            <div className="modele-main-workspace">
                
                {/* SIDEBAR DE SÉLECTION DES ÉCHÉANCES A GAUCHE */}
                {run?.steps && (
                    <div className="echeances-sidebar-pro">
                        <div className="echeances-header-pro">Échéances</div>
                        <div className="echeances-list-pro">
                            {run.steps.map((step, idx) => (
                                <button
                                    key={step}
                                    className={`echeance-pill-pro ${stepIdx === idx ? 'active' : ''}`}
                                    onClick={() => { setIsPlaying(false); setStepIdx(idx); }}
                                >
                                    <span className="echeance-dot-pro" />
                                    +{step}h
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ZONE D'AFFICHAGE DE LA CARTE */}
                <div className="map-display-area-pro">
                    {loading && (
                        <div className="loader-pro-overlay">
                            <div className="spinner-pro" />
                            <p>Chargement des cartes du run...</p>
                        </div>
                    )}

                    {metaError && (
                        <div className="error-pro-overlay">
                            <p>⚠️ Aucune donnée disponible pour ce modèle</p>
                            <span>Veuillez lancer la génération du run depuis l'orchestrateur.</span>
                        </div>
                    )}

                    {!loading && !metaError && (
                        <div className="classic-map-viewport">
                            {mapUrl && (
                                <img
                                    className="classic-map-img"
                                    src={mapUrl}
                                    alt={`${MODELS[model]?.name} - ${zoneConfig.name} - ${param}`}
                                    key={mapUrl}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── TIMELINE SLIDER (BARRE DES DATES ET MINUTES SOUS LA CARTE) ── */}
            {run && (
                <div className="timeline-slider-bar-pro">
                    <div className="timeline-badge-step">+{currentStep}h</div>
                    <div className="timeline-slider-wrapper">
                        <input
                            type="range"
                            min={0}
                            max={(run.steps?.length || 1) - 1}
                            value={stepIdx}
                            onChange={e => { setIsPlaying(false); setStepIdx(+e.target.value); }}
                            className="timeline-slider-pro"
                        />
                        <div className="timeline-dates-labels">
                            {(run.steps || []).filter((_, i, a) => i % Math.max(1, Math.floor(a.length/10)) === 0).map((s, i) => (
                                <span key={i} style={{ left: `${(run.steps.indexOf(s) / (run.steps.length-1)) * 100}%` }}>
                                    H+{s}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="timeline-valid-date">{fmtValidTime(run.date, run.hour, currentStep)}</div>
                </div>
            )}

            {/* ── CONTRÔLES D'ANIMATION ET MÉDIAS ── */}
            <div className="media-controls-bar-pro">
                <div className="media-buttons-group">
                    <button className="media-ctrl-btn-pro" onClick={() => { setIsPlaying(false); goTo(0); }} title="Début">|◄</button>
                    <button className="media-ctrl-btn-pro" onClick={() => { setIsPlaying(false); goTo(stepIdx - 1); }} title="Précédent">◄</button>
                    <button className="media-ctrl-btn-pro play-pause" onClick={() => setIsPlaying(p => !p)}>
                        {isPlaying ? '⏸ Pause' : '▶ Jouer'}
                    </button>
                    <button className="media-ctrl-btn-pro" onClick={() => { setIsPlaying(false); goTo(stepIdx + 1); }} title="Suivant">►</button>
                    <button className="media-ctrl-btn-pro" onClick={() => { setIsPlaying(false); goTo((run?.steps?.length || 1) - 1); }} title="Fin">►|</button>
                </div>

                <div className="media-speed-group">
                    <span className="speed-label-pro">Vitesse:</span>
                    <select value={speed} onChange={e => setSpeed(+e.target.value)} className="speed-dropdown-pro">
                        <option value={1500}>Lente</option>
                        <option value={800}>Normale</option>
                        <option value={400}>Rapide</option>
                        <option value={200}>Très rapide</option>
                    </select>
                </div>

                <div className="media-step-badge">+{currentStep}h</div>

                <div className="media-downloads-group">
                    <button className="media-action-btn-pro preload" onClick={preloadAll} disabled={preloading}>
                        {preloading ? `Préchargement ${preloadPct}%` : '⚡ Précharger'}
                    </button>
                    <button className="media-action-btn-pro download" onClick={downloadCurrent}>
                        <Download size={12} /> Télécharger
                    </button>
                    <button className="media-action-btn-pro print" onClick={() => window.print()}>
                        <Printer size={12} /> Imprimer
                    </button>
                </div>
            </div>

            {/* ── DESCRIPTIF TECHNIQUE DU MODÈLE SÉLECTIONNÉ ── */}
            <div className="model-description-box-pro">
                <div className="description-header-pro">MODÈLE</div>
                <div className="description-content-pro">
                    <strong>{MODELS[model]?.name} ({MODELS[model]?.resolution})</strong>
                    <p>{MODELS[model]?.desc}</p>
                </div>
            </div>

            {/* ── FOOTER DE BRINDING ── */}
            <div className="modele-footer-pro">
                <span>Sources : Météo-France • Deutsche Wetterdienst (DWD) • ECMWF OpenData</span>
                <span>Copyright © Météo Climat Pro — Tous droits réservés</span>
            </div>

        </div>
    );
};

export default ModeleFrance;
