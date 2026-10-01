import React from 'react';
import { useNavigate } from 'react-router';
import { authSession } from '../../auth/session/authSession';
import ProfSection from './../components/ProfSelection';
import MachineSection from './../components/MachineSection';
import ClassSection from './../components/ClassSection';
import MediaSection from './../components/MediaSection';
import StorageCard from './../components/StorageCard';
import ThemeSwitcher from '@/shared/theme/ThemeSwitcher.jsx';
import '../styles/admin.css';

/**
 * Panneau d'administration.
 *
 * La structure HTML (sidebar de navigation + topbar + zone de contenu) est
 * unique ; c'est le CSS qui la réagence différemment selon le thème actif
 * (`[data-theme]`), afin que les professeurs comparent trois dispositions :
 *   - Épuré    : colonne unique centrée, sans navigation.
 *   - Moderne  : sidebar latérale (dashboard SaaS).
 *   - Coloré   : barre de navigation horizontale.
 *
 * Les liens de navigation pointent vers les ancres des sections (défilement
 * natif) ; la logique métier des sections reste inchangée.
 */
const AdminPanel = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        authSession.clear();
        navigate('/login', { replace: true });
    };

    const NAV_ITEMS = [
        { href: '#sec-stockage', label: 'Stockage' },
        { href: '#sec-agenda', label: 'Agenda' },
        { href: '#sec-medias', label: 'Médias & Playlists' },
    ];

    return (
        <div className="admin-panel-container">
            <div className="admin-shell">
                <aside className="admin-nav">
                    <nav className="admin-nav__links">
                        {NAV_ITEMS.map((item) => (
                            <a key={item.href} className="admin-nav__link" href={item.href}>
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                <header className="admin-topbar">
                    <div className="admin-topbar__title">
                        <h1>Panneau d'Administration</h1>
                        <p>Gestion globale des ressources et des listes de diffusion</p>
                    </div>
                    <div className="admin-topbar__actions">
                        <ThemeSwitcher />
                        <button type="button" className="admin-logout" onClick={handleLogout}>
                            Se déconnecter
                        </button>
                    </div>
                </header>

                <main className="admin-content admin-grid-layout">
                    <div className="admin-grid-item" id="sec-stockage">
                        <StorageCard />
                    </div>

                    {/* Bulle « Agenda » : regroupe la gestion des professeurs, machines et classes. */}
                    <div className="admin-grid-item admin-grid-item--wide" id="sec-agenda">
                        <section className="admin-card admin-group">
                            <div className="card-header">
                                <h2>Agenda</h2>
                                <p className="admin-group__subtitle">
                                    Professeurs, machines et classes
                                </p>
                            </div>
                            <div className="card-body admin-group__grid">
                                <ProfSection />
                                <MachineSection />
                                <ClassSection />
                            </div>
                        </section>
                    </div>

                    <div className="admin-grid-item admin-grid-item--wide" id="sec-medias">
                        <MediaSection />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
