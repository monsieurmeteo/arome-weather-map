import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { meteoAuth } from '../../services/meteoFranceAuth';
import { meteoCollector } from '../../services/meteoFranceCollector';

export default function OAuthDiagnostic() {
    const [tokenInfo, setTokenInfo] = useState(null);
    const [collectorStatus, setCollectorStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatus();
        const interval = setInterval(loadStatus, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const loadStatus = () => {
        const info = meteoAuth.getTokenInfo();
        setTokenInfo(info);

        const stats = meteoCollector.getStatistics();
        setCollectorStatus({
            isCollecting: meteoCollector.isCollecting,
            latestData: meteoCollector.latestData,
            stats: stats
        });

        setLoading(false);
    };

    const handleForceRefresh = async () => {
        setLoading(true);
        try {
            await meteoAuth.forceRefresh();
            loadStatus();
        } catch (error) {
            console.error('Erreur refresh:', error);
        }
        setLoading(false);
    };

    const handleStartCollection = () => {
        meteoCollector.startAutoCollection();
        setTimeout(loadStatus, 1000);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
                    <Key size={32} />
                    Diagnostic OAuth & Collecteur
                </h1>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                    État du système d'authentification et de collecte de données
                </p>
            </div>

            {/* OAuth Status */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0 }}>
                    {tokenInfo?.valid ? <CheckCircle color="#10b981" /> : <XCircle color="#ef4444" />}
                    OAuth Token
                </h2>

                {tokenInfo ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <span style={{ fontWeight: 600 }}>Status:</span>
                            <span style={{ color: tokenInfo.valid ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {tokenInfo.valid ? '✅ Valide' : '❌ Expiré'}
                            </span>
                        </div>

                        {tokenInfo.valid && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>Temps restant:</span>
                                    <span style={{ color: '#667eea', fontWeight: 600 }}>
                                        {tokenInfo.remainingMinutes} minutes
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>Expire à:</span>
                                    <span>{tokenInfo.expiresAt?.toLocaleTimeString('fr-FR')}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>Token:</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{tokenInfo.token}</span>
                                </div>
                            </>
                        )}

                        <button
                            onClick={handleForceRefresh}
                            disabled={loading}
                            style={{
                                padding: '1rem',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            <RefreshCw size={20} className={loading ? 'spin' : ''} />
                            Forcer le renouvellement
                        </button>
                    </div>
                ) : (
                    <p>Aucun token généré</p>
                )}
            </div>

            {/* Collector Status */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0 }}>
                    {collectorStatus?.isCollecting ? <CheckCircle color="#10b981" /> : <XCircle color="#ef4444" />}
                    Collecteur de Données
                </h2>

                {collectorStatus ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <span style={{ fontWeight: 600 }}>Status:</span>
                            <span style={{ color: collectorStatus.isCollecting ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {collectorStatus.isCollecting ? '✅ Actif' : '❌ Arrêté'}
                            </span>
                        </div>

                        {collectorStatus.stats && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>Stations totales:</span>
                                    <span style={{ color: '#667eea', fontWeight: 600 }}>{collectorStatus.stats.totalStations}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>Avec température:</span>
                                    <span>{collectorStatus.stats.stationsWithTemp}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>Dernière mise à jour:</span>
                                    <span>{new Date(collectorStatus.stats.lastUpdate).toLocaleString('fr-FR')}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>Température min/max:</span>
                                    <span>{collectorStatus.stats.temperature.min.toFixed(1)}°C / {collectorStatus.stats.temperature.max.toFixed(1)}°C</span>
                                </div>
                            </>
                        )}

                        {!collectorStatus.isCollecting && (
                            <button
                                onClick={handleStartCollection}
                                style={{
                                    padding: '1rem',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <RefreshCw size={20} />
                                Démarrer la collecte
                            </button>
                        )}
                    </div>
                ) : (
                    <p>Chargement...</p>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
