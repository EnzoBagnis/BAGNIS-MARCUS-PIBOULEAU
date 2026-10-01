import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const ClassSection = () => {
    const [classes, setClasses] = useState([]);
    const [nom, setNom] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    // Chargement initial de la liste
    useEffect(() => {
        loadClasses();
    }, []);

    // Filtrage local pour la barre de recherche de la boîte des classes.
    const filteredClasses = classes.filter((classe) =>
        classe.nom.toLowerCase().includes(query.trim().toLowerCase())
    );

    async function loadClasses() {
        try {
            const data = await adminService.fetchClasses();
            setClasses(data);
        } catch (err) {
            console.error('Erreur chargement classes:', err);
        }
    }

    async function handleAdd() {
        if (!nom.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await adminService.createClasse({ nom: nom.trim() });
            setNom('');
            await loadClasses();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'ajout.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        setError(null);
        try {
            await adminService.deleteClasse(id);
            await loadClasses();
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression.');
        }
    }

    return (
        <section className="admin-card">
            <div className="card-header">
                <h2>Gestion des Classes</h2>
            </div>
            <div className="card-body">
                {/* Formulaire d'ajout */}
                <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="class-name">Nom de la classe / Promotion</label>
                        <input
                            type="text"
                            id="class-name"
                            placeholder="Ex: Promotion A"
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
                            {loading ? 'Ajout…' : 'Ajouter la classe'}
                        </button>
                    </div>
                    {error && <p className="form-error">{error}</p>}
                </form>

                {/* Zone de liste (Sous le formulaire) */}
                <div className="admin-list-wrapper">
                    <h3>Classes / Groupes actifs</h3>
                    {classes.length === 0 ? (
                        <p className="text-muted">Aucune classe enregistrée.</p>
                    ) : (
                        <div className="search-box">
                            <input
                                type="search"
                                className="search-box__input"
                                placeholder="Rechercher une classe…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Rechercher une classe"
                            />
                            <div className="search-box__scroll">
                                {filteredClasses.length === 0 ? (
                                    <p className="text-muted search-box__empty">Aucun résultat.</p>
                                ) : (
                                    <ul className="entity-list">
                                        {filteredClasses.map((classe) => (
                                            <li key={classe.id} className="entity-list-item">
                                                <span className="entity-label">{classe.nom}</span>
                                                <button
                                                    type="button"
                                                    className="btn-danger-sm"
                                                    onClick={() => handleDelete(classe.id)}
                                                    title="Supprimer cette classe"
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

export default ClassSection;