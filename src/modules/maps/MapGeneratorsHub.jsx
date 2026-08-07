import React, { useState } from 'react';
import RegionalMapGenerator from './RegionalMapGenerator';
import VectorRegionPreview from './VectorRegionPreview';
import { Map, FileCheck } from 'lucide-react';

const MapGeneratorsHub = () => {
    const [activeTab, setActiveTab] = useState('leaflet');

    return (
        <div style={{ padding: '0px', width: '100%' }}>
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                borderBottom: '1px solid #e2e8f0',
                padding: '1rem 2rem',
                background: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <button
                    onClick={() => setActiveTab('leaflet')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: activeTab === 'leaflet' ? '#eff6ff' : 'transparent',
                        color: activeTab === 'leaflet' ? '#3b82f6' : '#64748b',
                        fontWeight: activeTab === 'leaflet' ? 600 : 500,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderBottom: activeTab === 'leaflet' ? '2px solid #3b82f6' : '2px solid transparent'
                    }}
                >
                    <Map size={18} />
                    Générateur Classique (Leaflet)
                </button>
                <button
                    onClick={() => setActiveTab('vector')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: activeTab === 'vector' ? '#f0fdf4' : 'transparent',
                        color: activeTab === 'vector' ? '#16a34a' : '#64748b',
                        fontWeight: activeTab === 'vector' ? 600 : 500,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderBottom: activeTab === 'vector' ? '2px solid #16a34a' : '2px solid transparent'
                    }}
                >
                    <FileCheck size={18} />
                    Générateur Vectoriel (SVG High-Res)
                </button>
            </div>

            {/* Content Area */}
            <div style={{ minHeight: 'calc(100vh - 80px)' }}>
                {activeTab === 'leaflet' ? (
                    <RegionalMapGenerator />
                ) : (
                    <VectorRegionPreview />
                )}
            </div>
        </div>
    );
};

export default MapGeneratorsHub;
