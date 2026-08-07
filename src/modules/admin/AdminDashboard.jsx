import React, { useState, useEffect } from 'react';
import { Save, FileText, User, LogOut, Lock } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bulletinText, setBulletinText] = useState("");
    const [title, setTitle] = useState("Bulletin Météorologique Quotidien");
    const [status, setStatus] = useState(null);

    // Load existing bulletin (Mock or Real)
    useEffect(() => {
        // Here we would load from Supabase 'bulletins' table
        // For now, load from localStorage for persistence in demo
        const saved = localStorage.getItem('daily_bulletin');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setBulletinText(parsed.content);
                setTitle(parsed.title);
            } catch (e) { }
        }
    }, []);

    const handleSave = async () => {
        const bulletinData = {
            title,
            content: bulletinText,
            date: new Date().toISOString(),
            author: user?.email || 'Admin'
        };

        // Save to Supabase (if connected) or LocalStorage (fallback)
        localStorage.setItem('daily_bulletin', JSON.stringify(bulletinData));

        // Also save to Supabase table if exists (optional escalation)
        if (user && user.id !== 'demo') {
            const { error } = await supabase.from('bulletins').upsert(bulletinData);
            if (error) console.error("Supabase Save Error", error);
        }

        setStatus('success');
        setTimeout(() => setStatus(null), 3000);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="admin-container">
            <div className="card admin-header">
                <div className="header-left">
                    <h2>Espace Administration</h2>
                    <span className="badge-role">Météorologue</span>
                </div>
                <div className="admin-user">
                    <User size={18} />
                    <span>{user?.email}</span>
                    <button className="btn-logout" onClick={handleLogout} title="Déconnexion">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <div className="admin-grid">
                <div className="card editor-card">
                    <div className="card-header">
                        <h3><FileText size={20} /> Édition du Bulletin Quotidien</h3>
                        {status === 'success' && <span className="save-badge">Enregistré avec succès !</span>}
                    </div>

                    <div className="form-group">
                        <label>Titre du bulletin</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Contenu du bulletin</label>
                        <textarea
                            rows={15}
                            value={bulletinText}
                            onChange={(e) => setBulletinText(e.target.value)}
                            placeholder="Rédigez votre analyse météorologique ici..."
                        />
                        <small className="help-text">Ce bulletin sera visible par tous les clients sur la page "Bulletins".</small>
                    </div>

                    <div className="actions">
                        <button className="btn-save" onClick={handleSave}>
                            <Save size={18} /> Publier le bulletin
                        </button>
                    </div>
                </div>

                <div className="card side-panel">
                    <h3>État du système</h3>
                    <ul className="system-status">
                        <li className="ok"><div className="dot green"></div> API Meteo: Connecté</li>
                        <li className="ok"><div className="dot green"></div> Base de données: {user?.id === 'demo' ? 'Mode Démo (Local)' : 'Connectée (Supabase)'}</li>
                        <li className="ok"><div className="dot green"></div> Authentification: Active</li>
                    </ul>

                    <div className="admin-note">
                        <h4><Lock size={16} /> Note Admin</h4>
                        <p>
                            Les bulletins sont sauvegardés localement.
                            Pour les rendre persistants sur tous les appareils,
                            connectez Supabase.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
