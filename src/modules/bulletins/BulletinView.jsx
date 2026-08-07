import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { FileText, Calendar, CloudSun, Printer, AlertTriangle } from 'lucide-react';
import './Bulletin.css';

export default function BulletinView() {
    const [bulletin, setBulletin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load from storage or simulated DB
        async function load() {
            // First check local overridden admin bulletin
            try {
                const local = localStorage.getItem('daily_bulletin');
                if (local) {
                    setBulletin(JSON.parse(local));
                    setLoading(false);
                    return;
                }
            } catch (e) { console.error(e); }

            // Fallback default
            setBulletin({
                title: "Bulletin Météorologique Quotidien",
                date: new Date().toISOString(),
                content: "Situation générale : Anticyclonique sur le proche atlantique. Le flux de secteur Nord-Est maintient un temps sec mais frais pour la saison.\n\nPrévisions pour aujourd'hui : Le soleil domine largement après dissipation des quelques brumes matinales. Températures en légère hausse l'après-midi.",
                author: "Prévisionniste de garde"
            });
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div>Chargement du bulletin...</div>;
    if (!bulletin) return <div>Aucun bulletin disponible.</div>;

    const formattedDate = new Date(bulletin.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="bulletin-container">
            <div className="card bulletin-paper">
                <div className="bulletin-header">
                    <div className="header-logo">
                        <CloudSun size={32} />
                        <span>METEO-CLIMAT PRO</span>
                    </div>
                    <div className="header-date">
                        <Calendar size={16} /> {formattedDate}
                    </div>
                </div>

                <div className="bulletin-body">
                    <h1 className="bulletin-title">{bulletin.title}</h1>

                    <div className="bulletin-content">
                        {bulletin.content.split('\n').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>
                </div>

                <div className="bulletin-footer">
                    <div className="author">Rédigé par : {bulletin.author}</div>
                    <button className="btn-print" onClick={() => window.print()}>
                        <Printer size={16} /> Imprimer
                    </button>
                </div>
            </div>
        </div>
    );
}
