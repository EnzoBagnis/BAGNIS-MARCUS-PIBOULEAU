import React, { useCallback, useEffect, useState } from 'react';
import { playlistAdminService } from '../services/playlistAdminService';
import { describeError } from '../services/adminHttp';

/**
 * Gestion des playlists : création, activation, suppression, et composition
 * (ajout / retrait / ordonnancement des médias).
 *
 * @param {{ medias: Array<object> }} props - bibliothèque de médias (pour les libellés et l'ajout)
 */
const PlaylistManager = ({ medias }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nom, setNom] = useState('');
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [items, setItems] = useState([]); // composition : [{ media_id, ordre }]
  const [itemsLoading, setItemsLoading] = useState(false);
  const [mediaToAdd, setMediaToAdd] = useState('');
  const [busy, setBusy] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const mediaTitle = useCallback(
    (mediaId) => medias.find((m) => m.id === mediaId)?.titre ?? `Média #${mediaId}`,
    [medias],
  );

  const reloadPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPlaylists(await playlistAdminService.list());
    } catch (err) {
      setError(describeError(err, 'Impossible de charger les playlists.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadItems = useCallback(async (playlistId) => {
    if (!playlistId) {
      setItems([]);
      return;
    }
    setItemsLoading(true);
    try {
      const data = await playlistAdminService.listMedias(playlistId);
      setItems([...data].sort((a, b) => a.ordre - b.ordre));
    } catch (err) {
      setError(describeError(err, 'Impossible de charger la composition.'));
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadPlaylists();
  }, [reloadPlaylists]);

  // Recharge la composition quand la playlist change, mais aussi quand la
  // bibliothèque de médias évolue : si un média de la playlist a été supprimé,
  // sa ligne est retirée en cascade côté base, on resynchronise donc l'affichage.
  useEffect(() => {
    reloadItems(selectedId);
  }, [selectedId, reloadItems, medias]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError(null);
    if (!nom.trim()) {
      setError('Le nom de la playlist est obligatoire.');
      return;
    }
    setCreating(true);
    try {
      await playlistAdminService.create(nom.trim());
      setNom('');
      await reloadPlaylists();
    } catch (err) {
      setError(describeError(err, 'Impossible de créer la playlist.'));
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (playlist) => {
    setBusy(true);
    setError(null);
    try {
      await playlistAdminService.setActive(playlist.id, !playlist.active);
      await reloadPlaylists();
    } catch (err) {
      setError(describeError(err, "Impossible de modifier l'état de la playlist."));
    } finally {
      setBusy(false);
    }
  };

  const handleDeletePlaylist = async (playlist) => {
    if (!window.confirm(`Supprimer la playlist « ${playlist.nom} » et sa composition ?`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await playlistAdminService.remove(playlist.id);
      if (selectedId === playlist.id) {
        setSelectedId(null);
      }
      await reloadPlaylists();
    } catch (err) {
      setError(describeError(err, 'Impossible de supprimer la playlist.'));
    } finally {
      setBusy(false);
    }
  };

  const handleAttach = async (event) => {
    event.preventDefault();
    setError(null);
    if (!mediaToAdd) {
      return;
    }
    setBusy(true);
    try {
      const nextOrdre = items.length > 0 ? Math.max(...items.map((i) => i.ordre)) + 1 : 1;
      await playlistAdminService.attachMedia(selectedId, Number(mediaToAdd), nextOrdre);
      setMediaToAdd('');
      await reloadItems(selectedId);
    } catch (err) {
      setError(describeError(err, "Impossible d'ajouter le média à la playlist."));
    } finally {
      setBusy(false);
    }
  };

  const handleDetach = async (mediaId) => {
    setBusy(true);
    setError(null);
    try {
      await playlistAdminService.detachMedia(selectedId, mediaId);
      await reloadItems(selectedId);
    } catch (err) {
      setError(describeError(err, 'Impossible de retirer le média.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (event, index) => {
    event.preventDefault(); // autorise le drop
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Déplace l'élément glissé à la position de dépôt puis persiste le nouvel ordre.
  const handleDrop = async (dropIndex) => {
    const fromIndex = dragIndex;
    setDragIndex(null);
    setDragOverIndex(null);
    if (fromIndex === null || fromIndex === dropIndex) {
      return;
    }

    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setItems(reordered); // mise à jour optimiste pour un rendu immédiat

    setBusy(true);
    setError(null);
    try {
      // Réattribue des ordres séquentiels (1..n) et ne persiste que ce qui change.
      for (let position = 0; position < reordered.length; position += 1) {
        const item = reordered[position];
        const newOrdre = position + 1;
        if (item.ordre !== newOrdre) {
          await playlistAdminService.updateOrdre(selectedId, item.media_id, newOrdre);
        }
      }
      await reloadItems(selectedId);
    } catch (err) {
      setError(describeError(err, 'Impossible de réordonner la playlist.'));
      await reloadItems(selectedId); // resynchronise sur l'état réel en cas d'échec
    } finally {
      setBusy(false);
    }
  };

  // Médias pas encore présents dans la playlist sélectionnée.
  const availableMedias = medias.filter((m) => !items.some((i) => i.media_id === m.id));

  // Filtrage par nom pour la barre de recherche des playlists enregistrées.
  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.nom.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="media-playlist-block">
      <h3>Gestion des playlists</h3>

      <form className="admin-form" onSubmit={handleCreate}>
        <div className="form-group">
          <label htmlFor="playlist-name">Nom de la nouvelle playlist</label>
          <input
            type="text"
            id="playlist-name"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Écran Accueil - Alternants"
            maxLength={100}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-secondary" disabled={creating}>
            {creating ? 'Création…' : 'Créer la playlist'}
          </button>
        </div>
      </form>

      {error && <p className="admin-error">{error}</p>}

      {loading && <p className="text-muted">Chargement des playlists…</p>}

      {!loading && playlists.length === 0 && (
        <p className="text-muted">Aucune playlist pour le moment.</p>
      )}

      {!loading && playlists.length > 0 && (
        <div className="search-box">
          <input
            type="search"
            className="search-box__input"
            placeholder="Rechercher une playlist…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher une playlist"
          />
          <div className="search-box__scroll">
            {filteredPlaylists.length === 0 ? (
              <p className="text-muted search-box__empty">Aucun résultat.</p>
            ) : (
              <ul className="admin-item-list">
                {filteredPlaylists.map((playlist) => (
            <li
              key={playlist.id}
              className={`admin-item admin-item--clickable ${selectedId === playlist.id ? 'admin-item--selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={selectedId === playlist.id}
              onClick={() => setSelectedId(selectedId === playlist.id ? null : playlist.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedId(selectedId === playlist.id ? null : playlist.id);
                }
              }}
            >
              <div className="admin-item__main">
                <span className="admin-item__title">{playlist.nom}</span>
              </div>
              <div className="admin-item__actions">
                <label
                  className="actif-toggle"
                  onClick={(e) => e.stopPropagation()}
                  title={playlist.active ? 'Active — décocher pour désactiver' : 'Inactive — cocher pour activer'}
                >
                  <input
                    type="checkbox"
                    checked={playlist.active}
                    disabled={busy}
                    onChange={() => handleToggleActive(playlist)}
                  />
                  <span>Active</span>
                </label>
                <button
                  type="button"
                  className="btn-danger-sm"
                  disabled={busy}
                  onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist); }}
                  title="Supprimer la playlist"
                >
                  ✕
                </button>
              </div>
            </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {selectedId && (
        <div className="playlist-composition">
          <h4>
            Composition de « {playlists.find((p) => p.id === selectedId)?.nom ?? ''} »
          </h4>

          <form className="playlist-add-form" onSubmit={handleAttach}>
            <select value={mediaToAdd} onChange={(e) => setMediaToAdd(e.target.value)}>
              <option value="">— Ajouter un média —</option>
              {availableMedias.map((m) => (
                <option key={m.id} value={m.id}>{m.titre}</option>
              ))}
            </select>
            <button type="submit" className="btn-secondary" disabled={busy || !mediaToAdd}>
              Ajouter
            </button>
          </form>

          {itemsLoading && <p className="text-muted">Chargement de la composition…</p>}
          {!itemsLoading && items.length === 0 && (
            <p className="text-muted">Cette playlist ne contient aucun média.</p>
          )}
          {!itemsLoading && items.length > 0 && (
            <ol className="playlist-order-list">
              {items.map((item, index) => (
                <li
                  key={item.media_id}
                  className={[
                    'playlist-order-item',
                    dragIndex === index ? 'playlist-order-item--dragging' : '',
                    dragOverIndex === index && dragIndex !== index ? 'playlist-order-item--dragover' : '',
                  ].join(' ').trim()}
                  draggable={!busy}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => { e.preventDefault(); handleDrop(index); }}
                  onDragEnd={handleDragEnd}
                >
                  <span className="playlist-order-item__handle" aria-hidden="true">⠿</span>
                  <span className="playlist-order-item__title">{mediaTitle(item.media_id)}</span>
                  <div className="admin-item__actions">
                    <button
                      type="button"
                      className="btn-link btn-link--danger"
                      disabled={busy}
                      onClick={() => handleDetach(item.media_id)}
                    >
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistManager;
