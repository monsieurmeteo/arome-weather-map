import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, GeoJSON } from 'react-leaflet';
import { ComposableMap, Geographies, Geography, Marker as VectorMarker } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import 'leaflet/dist/leaflet.css';
import { weatherAPI, supabase } from '../../services/api';
import { DEPARTMENTS, REGIONS } from '../../data/departments.js';
import './ObservationsMap.css';
import { Wind, Thermometer, Droplets, Cloud, RefreshCw, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

// URL pour les contours des départements (TopoJSON)
const GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/france/fr-departments.json";

/* --- SUB-COMPONENTS --- */

const MapController = ({ viewState }) => {
    const map = useMap();
    useEffect(() => {
        if (!viewState) return;

        if (viewState.bounds) {
            map.flyToBounds(viewState.bounds, {
                padding: [50, 50],
                duration: 1.5
            });
        }
        else if (viewState.center && viewState.zoom) {
            map.flyTo(viewState.center, viewState.zoom, {
                duration: 1.5
            });
        }
    }, [viewState, map]);
    return null;
};

// LEGENDE COMPLETE
const MapLegend = ({ mode }) => {
    const getLegendItems = () => {
        switch (mode) {
            case 'temp_max':
            case 'temp_min':
                return [
                    { color: '#ef4444', label: '> 30°C (Très Chaud)' },
                    { color: '#f97316', label: '20 - 30°C (Chaud)' },
                    { color: '#facc15', label: '10 - 20°C (Tempéré)' },
                    { color: '#10b981', label: '0 - 10°C (Frais)' },
                    { color: '#3b82f6', label: '< 0°C (Gel / Froid)' }
                ];
            case 'wind_max':
                return [
                    { color: '#7f1d1d', label: '> 100 km/h (Violent)' },
                    { color: '#ef4444', label: '80 - 100 km/h (Tempête)' },
                    { color: '#f97316', label: '50 - 80 km/h (Fort)' },
                    { color: '#facc15', label: '20 - 50 km/h (Moyen)' },
                    { color: '#10b981', label: '< 20 km/h (Calme)' }
                ];
            case 'rain_total':
                return [
                    { color: '#1e3a8a', label: '> 50 mm (Extrême)' },
                    { color: '#2563eb', label: '20 - 50 mm (Fort)' },
                    { color: '#60a5fa', label: '5 - 20 mm (Modéré)' },
                    { color: '#93c5fd', label: '1 - 5 mm (Faible)' },
                    { color: '#d1d5db', label: '0 mm (Sec)' }
                ];
            default: return [];
        }
    };

    return (
        <div className="map-legend" onClick={(e) => e.stopPropagation()}>
            <h4>
                {mode === 'temp_max' && '🌡️ Temp Max'}
                {mode === 'temp_min' && '❄️ Temp Min'}
                {mode === 'wind_max' && '💨 Rafale Max'}
                {mode === 'rain_total' && '🌧️ Pluie 24h'}
            </h4>
            <div className="legend-items">
                {getLegendItems().map((item, idx) => (
                    <div key={idx} className="legend-item">
                        <div className="color-box" style={{ backgroundColor: item.color }}></div>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* --- MAIN COMPONENT --- */

const ObservationsMap = () => {
    const [stations, setStations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [displayMode, setDisplayMode] = useState('temp_max');

    const getLocalToday = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const [selectedDate, setSelectedDate] = useState(getLocalToday());

    const FRANCE_BOUNDS = [[41.3, -5.5], [51.2, 10.0]];
    const [viewState, setViewState] = useState({ bounds: FRANCE_BOUNDS });

    // Filters
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDept, setSelectedDept] = useState('');

    // Geometry for Contour (Region or Dept)
    const [contourData, setContourData] = useState(null);

    // Derived: available depts based on region
    const availableDepts = useMemo(() => {
        if (!selectedRegion) return DEPARTMENTS;
        const regionCodes = REGIONS[selectedRegion] || [];
        return DEPARTMENTS.filter(d => regionCodes.includes(d.code));
    }, [selectedRegion]);

    useEffect(() => { loadStations(); }, [selectedDate]);

    // Handle Region Change
    const handleRegionChange = async (e) => {
        const regionName = e.target.value;
        setSelectedRegion(regionName);
        setSelectedDept('');
        setContourData(null);

        if (!regionName) {
            setViewState({ bounds: FRANCE_BOUNDS });
            return;
        }

        try {
            const res = await fetch(`https://geo.api.gouv.fr/regions?nom=${encodeURIComponent(regionName)}&fields=nom,code,centre,contour`);
            if (res.ok) {
                const results = await res.json();
                const data = results[0];
                if (data) {
                    if (data.centre && data.centre.coordinates) {
                        const [lon, lat] = data.centre.coordinates;
                        setViewState({ center: [lat, lon], zoom: 7 });
                    }
                    if (data.contour) setContourData(data.contour);
                }
            }
        } catch (err) { console.error(err); }
    };

    // Handle Dept Change
    const handleDeptChange = async (e) => {
        const deptCode = e.target.value;
        setSelectedDept(deptCode);
        setContourData(null);

        if (!deptCode) {
            if (selectedRegion) {
                // Re-trigger region view logic manually
                const res = await fetch(`https://geo.api.gouv.fr/regions?nom=${encodeURIComponent(selectedRegion)}&fields=nom,code,centre,contour`);
                if (res.ok) {
                    const results = await res.json();
                    const data = results[0];
                    if (data) {
                        if (data.centre) setViewState({ center: [data.centre.coordinates[1], data.centre.coordinates[0]], zoom: 7 });
                        if (data.contour) setContourData(data.contour);
                    }
                }
            } else {
                setViewState({ bounds: FRANCE_BOUNDS });
            }
            return;
        }

        try {
            const res = await fetch(`https://geo.api.gouv.fr/departements/${deptCode}?fields=centre,nom,contour`);
            if (res.ok) {
                const data = await res.json();
                if (data.centre && data.centre.coordinates) {
                    const [lon, lat] = data.centre.coordinates;
                    setViewState({ center: [lat, lon], zoom: 9 });
                }
                if (data.contour) setContourData(data.contour);
            }
        } catch (err) { }
    };

    const loadStations = async () => {
        setIsLoading(true);
        setStations([]);
        try {
            console.log(`📊 Chargement paginé (ObservationsMap) pour ${selectedDate}...`);
            let allData = [];
            let from = 0;
            const batch = 1000;

            while (true) {
                const { data, error } = await supabase
                    .rpc('get_daily_extremes_full', { target_date: selectedDate })
                    .range(from, from + batch - 1);

                if (error) throw error;
                if (!data || data.length === 0) break;
                allData.push(...data);
                if (data.length < batch) break;
                from += batch;
                if (from > 10000) break;
            }
            const extremes = allData;
            console.log(`✅ ObservationsMap loaded: ${extremes.length} stations`);
            if (!extremes || extremes.length === 0) {
                setIsLoading(false);
                return;
            }

            const deptsInUse = [...new Set(extremes.map(s => s.station_id.substring(0, 2)))];
            const CHUNK = 8;
            let enrichedAll = [];

            const fetchCoordsForDepts = async (deptList) => {
                const map = new Map();
                await Promise.all(deptList.map(async (d) => {
                    try {
                        const res = await fetch(`https://geo.api.gouv.fr/departements/${d}/communes?fields=code,centre,nom`);
                        if (res.ok) {
                            const communes = await res.json();
                            communes.forEach(c => {
                                if (c.centre && c.centre.coordinates) {
                                    map.set(c.code, { lat: c.centre.coordinates[1], lon: c.centre.coordinates[0], nom: c.nom });
                                }
                            });
                        }
                    } catch (e) { }
                }));
                return map;
            };

            const firstChunk = deptsInUse.slice(0, CHUNK);
            const firstMap = await fetchCoordsForDepts(firstChunk);

            const processStations = (sourceList, coordsMap) => {
                return sourceList
                    .filter(s => coordsMap.has(s.station_id.substring(0, 5)))
                    .map(s => {
                        const c = coordsMap.get(s.station_id.substring(0, 5));
                        return {
                            id: s.station_id,
                            name: c.nom || s.station_id,
                            lat: c.lat,
                            lon: c.lon,
                            temp_max: s.temp_max,
                            temp_min: s.temp_min,
                            wind_max: s.wind_gust_max,
                            rain_total: s.rain_total
                        };
                    });
            };

            const firstBatch = processStations(extremes, firstMap);
            enrichedAll = [...firstBatch];
            setStations(enrichedAll);
            setIsLoading(false);

            const restDepts = deptsInUse.slice(CHUNK);
            for (let i = 0; i < restDepts.length; i += CHUNK) {
                const chunk = restDepts.slice(i, i + CHUNK);
                const map = await fetchCoordsForDepts(chunk);
                const batch = processStations(extremes, map);
                if (batch.length > 0) {
                    enrichedAll = [...enrichedAll, ...batch];
                    setStations(enrichedAll);
                }
                await new Promise(r => setTimeout(r, 100));
            }

        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const getMarkerColor = (station) => {
        const mode = displayMode;
        if (mode === 'temp_max' || mode === 'temp_min') {
            const val = mode === 'temp_max' ? station.temp_max : station.temp_min;
            if (val === null || val === undefined) return '#9ca3af';
            if (val < 0) return '#3b82f6';
            if (val < 10) return '#10b981';
            if (val < 20) return '#facc15';
            if (val < 30) return '#f97316';
            return '#ef4444';
        }
        if (mode === 'wind_max') {
            const val = station.wind_max;
            if (val === null || val === undefined) return '#9ca3af';
            if (val < 20) return '#10b981';
            if (val < 50) return '#facc15';
            if (val < 80) return '#f97316';
            if (val < 100) return '#ef4444';
            return '#7f1d1d';
        }
        if (mode === 'rain_total') {
            const val = station.rain_total;
            if (!val || val === 0) return '#d1d5db';
            if (val < 5) return '#93c5fd';
            if (val < 20) return '#60a5fa';
            if (val < 50) return '#2563eb';
            return '#1e3a8a';
        }
        return '#3b82f6';
    };

    const visibleStations = React.useMemo(() => {
        let filtered = stations;
        if (selectedDept) {
            const filterCode = (selectedDept === '2A' || selectedDept === '2B') ? '20' : selectedDept;
            filtered = filtered.filter(s => s.id.startsWith(filterCode));
        } else if (selectedRegion) {
            const allowedDepts = REGIONS[selectedRegion] || [];
            filtered = filtered.filter(s => {
                let sDept = s.id.substring(0, 2);
                if (sDept === '20') {
                    return selectedRegion === 'Corse';
                }
                return allowedDepts.includes(sDept);
            });
        }
        return filtered;
    }, [stations, selectedRegion, selectedDept]);

    const isCleanMode = !!(selectedRegion || selectedDept);

    return (
        <div className="observations-map-page">
            <header className="map-header-controls card">
                <div className="title-section">
                    <h1>Générateur Cartes</h1>
                    <span className="subtitle">
                        {visibleStations.length} stations • Données quotidiennes
                    </span>
                </div>

                <div className="actions-right">
                    <div className="map-date-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', borderRadius: '8px', padding: '4px', border: '1px solid #e2e8f0' }}>
                        <button className="icon-btn" style={{ color: '#1e293b', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() - 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }}><ChevronLeft size={20} /></button>

                        <input
                            type="date"
                            value={selectedDate}
                            max={getLocalToday()}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="date-input"
                            style={{
                                color: '#1e293b',
                                background: 'transparent',
                                border: 'none',
                                fontWeight: '500',
                                fontFamily: 'inherit'
                            }}
                        />

                        <button className="icon-btn" style={{ color: '#1e293b', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + 1);
                            const today = getLocalToday();
                            if (d.toISOString().split('T')[0] <= today) {
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }
                        }}><ChevronRight size={20} /></button>
                    </div>

                    <select className="dept-select" value={selectedRegion} onChange={handleRegionChange}>
                        <option value="">🗺️ France entière</option>
                        {Object.keys(REGIONS).sort().map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>

                    <select className="dept-select" value={selectedDept} onChange={handleDeptChange}>
                        <option value="">Tous départements</option>
                        {availableDepts.map(d => (
                            <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                        ))}
                    </select>

                    <button className="refresh-btn" onClick={loadStations} disabled={isLoading} title="Actualiser">
                        <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
                    </button>
                </div>

                <div className="mode-controls">
                    <button className={displayMode === 'temp_min' ? 'active' : ''} onClick={() => setDisplayMode('temp_min')}><Thermometer size={16} /> Min</button>
                    <button className={displayMode === 'temp_max' ? 'active' : ''} onClick={() => setDisplayMode('temp_max')}><Thermometer size={16} /> Max</button>
                    <button className={displayMode === 'rain_total' ? 'active' : ''} onClick={() => setDisplayMode('rain_total')}><Cloud size={16} /> Pluie 24h</button>
                    <button className={displayMode === 'wind_max' ? 'active' : ''} onClick={() => setDisplayMode('wind_max')}><Wind size={16} /> Rafale</button>
                </div>
            </header>

            <MapLegend mode={displayMode} />

            <div className={`map-container ${isCleanMode ? 'map-clean-mode' : ''}`}>
                {isLoading && stations.length === 0 ? (
                    <div className="map-loading"><Activity className="spin" size={32} /> Chargement des données...</div>
                ) : (
                    <MapContainer
                        center={[46.6, 2.2]}
                        zoom={6}
                        style={{ height: '100%', width: '100%', background: isCleanMode ? '#fff' : '#ddd' }}
                    >
                        <MapController viewState={viewState} />

                        {!isCleanMode && (
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap'
                            />
                        )}

                        {contourData && (
                            <GeoJSON
                                data={contourData}
                                style={{
                                    color: '#000000',
                                    weight: 3,
                                    fillColor: 'transparent',
                                    fillOpacity: 0
                                }}
                            />
                        )}

                        {visibleStations.map(station => (
                            <CircleMarker
                                key={station.id}
                                center={[station.lat, station.lon]}
                                radius={5}
                                pathOptions={{
                                    fillColor: getMarkerColor(station),
                                    color: isCleanMode ? '#1e293b' : '#fff',
                                    weight: 1,
                                    fillOpacity: 1
                                }}
                            >
                                <Popup>
                                    <strong>{station.name}</strong> ({station.id})<br />
                                    <hr style={{ margin: '4px 0', borderTop: '1px solid #ccc' }} />
                                    Temp Max: {station.temp_max?.toFixed(1) ?? '-'}°C<br />
                                    Temp Min: {station.temp_min?.toFixed(1) ?? '-'}°C<br />
                                    Pluie 24h: {station.rain_total?.toFixed(1) ?? '-'} mm<br />
                                    Rafale Max: {station.wind_max?.toFixed(0) ?? '-'} km/h
                                    <hr style={{ margin: '8px 0', borderTop: '1px solid #eee' }} />
                                    <a
                                        href={`https://donneespubliques.meteofrance.fr/FichesClim/FICHECLIM_${station.id}.pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none', fontSize: '0.8rem', display: 'block', textAlign: 'center' }}
                                    >
                                        Consulter la Fiche Climatologique »
                                    </a>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default ObservationsMap;
