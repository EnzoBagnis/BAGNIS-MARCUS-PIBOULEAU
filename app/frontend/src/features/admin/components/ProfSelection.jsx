import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const ProfSection = () => {
    const [professeurs, setProfesseurs] = useState([]);
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    // Chargement initial de la liste
    useEffect(() => {
        loadProfesseurs();
    }, []);

    // Filtrage local pour la barre de recherche de la boîte des professeurs enregistrés.
    const filteredProfesseurs = professeurs.filter((prof) =>
        `${prof.prenom} ${prof.nom}`.toLowerCase().includes(query.trim().toLowerCase())
    );

    async function loadProfesseurs() {
        try {
            const data = await adminService.fetchProfesseurs();
            setProfesseurs(data);
        } catch (err) {
            console.error('Erreur chargement professeurs:', err);
        }
    }

    async function handleAdd() {
        if (!prenom.trim() || !nom.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await adminService.createProfesseur({ nom: nom.trim(), prenom: prenom.trim() });
            setPrenom('');
            setNom('');
            await loadProfesseurs();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'ajout.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        setError(null);
        try {
            await adminService.deleteProfesseur(id);
            await loadProfesseurs();
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression.');
        }
    }

    return (
        <section className="admin-card">
            <div className="card-header">
                <h2>Gestion des Professeurs</h2>
            </div>
            <div className="card-body">
                {/* Formulaire d'ajout épuré */}
                <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="prof-firstName">Prénom</label>
                        <input
                            type="text"
                            id="prof-firstName"
                            placeholder="Ex: Jean"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prof-lastName">Nom</label>
                        <input
                            type="text"
                            id="prof-lastName"
                            placeholder="Ex: Dupont"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                        />
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleAdd}
                            disabled={loading}
                        >
                            {loading ? 'Ajout…' : 'Ajouter le professeur'}
                        </button>
                    </div>
                    {error && <p className="form-error">{error}</p>}
                </form>

                {/* Zone de liste */}
                <div className="admin-list-wrapper">
                    <h3>Professeurs enregistrés</h3>
                    {professeurs.length === 0 ? (
                        <p className="text-muted">Aucun professeur enregistré.</p>
                    ) : (
                        <div className="search-box">
                            <input
                                type="search"
                                className="search-box__input"
                                placeholder="Rechercher un professeur…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Rechercher un professeur"
                            />
                            <div className="search-box__scroll">
                                {filteredProfesseurs.length === 0 ? (
                                    <p className="text-muted search-box__empty">Aucun résultat.</p>
                                ) : (
                                    <ul className="entity-list">
                                        {filteredProfesseurs.map((prof) => (
                                            <li key={prof.id} className="entity-list-item">
                                                <span className="entity-label">{prof.prenom} {prof.nom}</span>
                                                <button
                                                    type="button"
                                                    className="btn-danger-sm"
                                                    onClick={() => handleDelete(prof.id)}
                                                    title="Supprimer ce professeur"
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProfSection;