import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import './MainLayout.css';

import CitySearch from '../components/CitySearch';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Basic breadcrumb / title derivation
    const getPageTitle = () => {
        const path = location.pathname.split('/').filter(Boolean);
        if (path.length === 0) return 'Tableau de Bord';
        return path.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
    };

    const currentDate = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="layout-root">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="main-content-wrapper">
                <header className="top-header">
                    <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu />
                    </button>
                    <div className="context-info">
                        <h2 className="page-title">{getPageTitle()}</h2>
                        <div className="header-controls">
                            <div className="date-display hidden-mobile">
                                {currentDate}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="content-area">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}
