import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { machineColor } from '../../agenda/utils/machineColors';

const MachineSection = () => {
    const [machines, setMachines] = useState([]);
    const [nom, setNom] = useState('');
    const [type, setType] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    // Chargement initial de la liste
    useEffect(() => {
        loadMachines();
    }, []);

    // Filtrage local pour la barre de recherche (nom ou type de machine).
    const filteredMachines = machines.filter((machine) =>
        `${machine.nom} ${machine.type}`.toLowerCase().includes(query.trim().toLowerCase())
    );

    async function loadMachines() {
        try {
            const data = await adminService.fetchMachines();
            setMachines(data);
        } catch (err) {
            console.error('Erreur chargement machines:', err);
        }
    }

    async function handleAdd() {
        if (!nom.trim() || !type.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await adminService.createMachine({
                nom: nom.trim(),
                type: type.trim(),
            });
            setNom('');
            setType('');
            await loadMachines();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'ajout.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        setError(null);
        try {
            await adminService.deleteMachine(id);
            await loadMachines();
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression.');
        }
    }

    return (
        <section className="admin-card">
            <div className="card-header">
                <h2>Gestion des Machines</h2>
            </div>
            <div className="card-body">
                {/* Formulaire d'ajout épuré */}
                <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="machine-name">Nom de la machine</label>
                        <input
                            type="text"
                            id="machine-name"
                            placeholder="Ex: Imprimante 3D"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="machine-type">Type / Catégorie</label>
                        <select
                            id="machine-type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="">Sélectionner un type</option>
                            <option value="Avion">Avion</option>
                            <option value="Helicoptere">Helicoptere</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleAdd}
                            disabled={loading}
                        >
                            {loading ? 'Ajout…' : 'Ajouter la machine'}
                        </button>
                    </div>
                    {error && <p className="form-error">{error}</p>}
                </form>

                {/* Zone de liste (Sous le formulaire) */}
                <div className="admin-list-wrapper">
                    <h3>Parc de machines</h3>
                    {machines.length === 0 ? (
                        <p className="text-muted">Aucune machine enregistrée.</p>
                    ) : (
                        <div className="search-box">
                            <input
                                type="search"
                                className="search-box__input"
                                placeholder="Rechercher une machine…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Rechercher une machine"
                            />
                            <div className="search-box__scroll">
                                {filteredMachines.length === 0 ? (
                                    <p className="text-muted search-box__empty">Aucun résultat.</p>
                                ) : (
                                    <ul className="entity-list">
                                        {filteredMachines.map((machine) => (
                                            <li key={machine.id} className="entity-list-item">
                                                <span className="entity-label">
                                                    <span
                                                        aria-hidden="true"
                                                        style={{
                                                            display: 'inline-block',
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            marginRight: 8,
                                                            verticalAlign: 'middle',
                                                            backgroundColor: machineColor(machine.id).bg,
                                                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                                                        }}
                                                    />
                                                    {machine.nom}
                                                    <span className="entity-badge">{machine.type}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn-danger-sm"
                                                    onClick={() => handleDelete(machine.id)}
                                                    title="Supprimer cette machine"
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

export default MachineSection;