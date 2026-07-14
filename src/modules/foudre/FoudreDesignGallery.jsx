import React, { useState, useEffect } from 'react';
import { Zap, LayoutGrid, Info } from 'lucide-react';
import { LIGHTNING_DESIGNS } from './LightningStyles';

const FoudreDesignGallery = () => {
    const [selected, setSelected] = useState('Classic');

    // Fake strikes for preview
    const previewStrikes = [
        { x: 50, y: 50, h: 14, isRecent: false },
        { x: 150, y: 50, h: 14, isRecent: true },
        { x: 50, y: 150, h: 22, isRecent: false },
        { x: 150, y: 150, h: 2, isRecent: false }
    ];

    const HOUR_COLORS = [
        "#0000FF", "#0022FF", "#0044FF", "#0066FF", "#0088FF", "#00AAFF", // 0h-5h
        "#00CCFF", "#00EEFF", "#00FFDD", "#00FFBB", "#00FF99", "#00FF77", // 6h-11h
        "#00FF00", "#77FF00", "#BBFF00", "#FFFF00", "#FFCC00", "#FFAA00", // 12h-17h
        "#FF8800", "#FF6600", "#FF4400", "#FF2200", "#FF0000", "#8B0000"  // 18h-23h
    ];

    useEffect(() => {
        Object.keys(LIGHTNING_DESIGNS).forEach(id => {
            const canvas = document.getElementById(`canvas-${id}`);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const design = LIGHTNING_DESIGNS[id];

            // Draw background
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            previewStrikes.forEach(s => {
                const color = HOUR_COLORS[s.h];
                design.render(ctx, s.x, s.y, 8, color, s.isRecent);
            });

            // Label
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(design.name, 100, 190);
        });
    }, []);

    return (
        <div style={{ padding: '30px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', maxWidth: '1200px', margin: '20px auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' }}>
                <div style={{ background: '#ef4444', padding: '10px', borderRadius: '12px' }}>
                    <LayoutGrid color="#fff" size={24} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>GALERIE DES DESIGNS D'IMPACT</h2>
                    <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>Propose moi 10 designs d'impact de foudre - Choisissez votre préféré</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {Object.keys(LIGHTNING_DESIGNS).map(id => (
                    <div
                        key={id}
                        style={{
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            textAlign: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        <canvas id={`canvas-${id}`} width="200" height="200" style={{ width: '100%', display: 'block' }} />
                        <div style={{ padding: '10px', background: '#f8fafc', fontWeight: 800, fontSize: '0.8rem' }}>
                            {LIGHTNING_DESIGNS[id].name}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '40px', padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', gap: '15px' }}>
                <Info color="#1e40af" size={24} />
                <div style={{ color: '#1e40af', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 800 }}>Comment choisir ?</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                        Chaque design a été optimisé pour la visibilité sur carte. Le point central blanc aide à localiser l'impact précis, tandis que la couleur indique l'heure de l'impact (du bleu au rouge sur 24h).
                        Les impacts récents (-15 min) peuvent avoir des animations supplémentaires de pulsation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FoudreDesignGallery;
