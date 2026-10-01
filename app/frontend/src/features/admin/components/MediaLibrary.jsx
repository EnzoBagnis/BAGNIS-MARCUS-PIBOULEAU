import React, { useRef, useState } from 'react';
import { MEDIA_TYPES } from '../../../core/entities/Media';
import { mediaAdminService } from '../services/mediaAdminService';
import { describeError } from '../services/adminHttp';

const EMPTY_FORM = {
  titre: '',
  type: MEDIA_TYPES.IMAGE,
  contenuTexte: '',
  dureeSec: '',
};

const TYPE_LABELS = {
  [MEDIA_TYPES.IMAGE]: 'Image',
  [MEDIA_TYPES.VIDEO]: 'Vidéo',
  [MEDIA_TYPES.TEXTE]: 'Texte',
};

/**
 * Bibliothèque de médias : formulaire d'ajout (upload de fichier ou texte)
 * et liste des médias existants avec activation/suppression.
 *
 * @param {{
 *   medias: Array<object>,
 *   loading: boolean,
 *   error: string|null,
 *   onChanged: () => Promise<void> | void,
 * }} props
 */
const MediaLibrary = ({ medias, loading, error, onChanged }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0); // pour réinitialiser <input type="file">
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  // Édition en ligne d'un champ d'un média : { id, field: 'titre'|'duree'|'contenu', value }
  const [edit, setEdit] = useState(null);
  // Évite un double-déclenchement quand le blur suit une validation/annulation au clavier.
  const skipBlurRef = useRef(false);
  // Recherche locale dans la liste des médias enregistrés.
  const [query, setQuery] = useState('');

  const isTexte = form.type === MEDIA_TYPES.TEXTE;

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  /**
   * Lit la durée réelle d'un fichier vidéo via ses métadonnées et la reporte
   * automatiquement dans le champ « Durée ».
   * @param {File} videoFile
   */
  const detectVideoDuration = (videoFile) => {
    try {
      const objectUrl = URL.createObjectURL(videoFile);
      const probe = document.createElement('video');
      probe.preload = 'metadata';
      probe.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        if (Number.isFinite(probe.duration) && probe.duration > 0) {
          setForm((prev) => ({ ...prev, dureeSec: String(Math.round(probe.duration)) }));
        }
      };
      probe.onerror = () => URL.revokeObjectURL(objectUrl);
      probe.src = objectUrl;
    } catch {
      /* la détection automatique est optionnelle : on laisse l'utilisateur saisir la durée */
    }
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setForm((prev) => ({ ...prev, type }));
    if (type === MEDIA_TYPES.VIDEO && file) {
      detectVideoDuration(file);
    }
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && form.type === MEDIA_TYPES.VIDEO) {
      detectVideoDuration(selected);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setFileInputKey((k) => k + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!form.titre.trim()) {
      setFormError('Le titre est obligatoire.');
      return;
    }
    if (isTexte && !form.contenuTexte.trim()) {
      setFormError('Le contenu texte est obligatoire pour un média de type « Texte ».');
      return;
    }
    if (!isTexte && !file) {
      setFormError('Sélectionne un fichier à uploader pour un média image ou vidéo.');
      return;
    }
    const duree = form.dureeSec.trim();
    if (duree === '') {
      setFormError(
        form.type === MEDIA_TYPES.VIDEO
          ? 'Une vidéo doit avoir une durée (en secondes).'
          : "La durée d'affichage est obligatoire (en secondes)."
      );
      return;
    }
    if (Number.isNaN(Number(duree)) || Number(duree) <= 0) {
      setFormError('La durée doit être un nombre de secondes strictement positif.');
      return;
    }

    setSubmitting(true);
    try {
      let urlFichier = null;
      if (!isTexte) {
        const uploaded = await mediaAdminService.uploadFile(file);
        urlFichier = uploaded?.url ?? null;
      }

      await mediaAdminService.create({
        titre: form.titre.trim(),
        type: form.type,
        url_fichier: urlFichier,
        contenu_texte: isTexte ? form.contenuTexte.trim() : null,
        duree_sec: duree === '' ? null : Number(duree),
        actif: true,
      });

      resetForm();
      await onChanged();
    } catch (err) {
      setFormError(describeError(err, "Impossible d'enregistrer le média."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActif = async (media) => {
    setBusyId(media.id);
    try {
      await mediaAdminService.setActif(media.id, !media.actif);
      await onChanged();
    } catch (err) {
      setFormError(describeError(err, "Impossible de modifier l'état du média."));
    } finally {
      setBusyId(null);
    }
  };

  const isEditing = (mediaId, field) => edit !== null && edit.id === mediaId && edit.field === field;

  const originalValue = (media, field) => {
    if (field === 'titre') return media.titre ?? '';
    if (field === 'contenu') return media.contenu_texte ?? '';
    return media.duree_sec != null ? String(media.duree_sec) : ''; // 'duree'
  };

  const startEdit = (media, field) => {
    setEdit({ id: media.id, field, value: originalValue(media, field) });
    setFormError(null);
  };

  const cancelEdit = () => setEdit(null);

  const handleEditChange = (event) => {
    const { value } = event.target;
    setEdit((prev) => (prev ? { ...prev, value } : prev));
  };

  const saveEdit = async (media) => {
    if (!edit) return;
    const { field } = edit;
    const value = edit.value;
    const original = originalValue(media, field);

    // Pas de changement → on referme sans appel API.
    if (value === original) {
      cancelEdit();
      return;
    }

    // Validation + payload selon le champ (mêmes invariants que le domaine).
    let payload;
    if (field === 'titre') {
      const trimmed = value.trim();
      if (trimmed === '') {
        setFormError('Le titre ne peut pas être vide.');
        return;
      }
      if (trimmed.length > 150) {
        setFormError('Le titre ne peut pas dépasser 150 caractères.');
        return;
      }
      payload = { titre: trimmed };
    } else if (field === 'contenu') {
      if (value.trim() === '') {
        setFormError('Le contenu texte ne peut pas être vide.');
        return;
      }
      payload = { contenu_texte: value };
    } else {
      const trimmed = value.trim();
      if (trimmed === '' || Number.isNaN(Number(trimmed)) || Number(trimmed) <= 0) {
        setFormError('La durée doit être un nombre de secondes strictement positif.');
        return;
      }
      payload = { duree_sec: Number(trimmed) };
    }

    setBusyId(media.id);
    setFormError(null);
    try {
      await mediaAdminService.update(media.id, payload);
      cancelEdit();
      await onChanged();
    } catch (err) {
      setFormError(describeError(err, 'Impossible de modifier le média.'));
    } finally {
      setBusyId(null);
    }
  };

  // multiline = true pour le textarea (Entrée insère un retour à la ligne, ne valide pas).
  const handleEditKeyDown = (event, media, multiline = false) => {
    if (event.key === 'Enter' && !multiline) {
      event.preventDefault();
      skipBlurRef.current = true;
      saveEdit(media);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      skipBlurRef.current = true;
      cancelEdit();
    }
  };

  const handleEditBlur = (media) => {
    if (skipBlurRef.current) {
      skipBlurRef.current = false;
      return;
    }
    saveEdit(media);
  };

  const handleDelete = async (media) => {
    if (!window.confirm(`Supprimer définitivement le média « ${media.titre} » ?`)) {
      return;
    }
    setBusyId(media.id);
    try {
      await mediaAdminService.remove(media.id);
      await onChanged();
    } catch (err) {
      setFormError(describeError(err, 'Impossible de supprimer le média.'));
    } finally {
      setBusyId(null);
    }
  };

  // Filtrage par titre pour la barre de recherche des médias enregistrés.
  const filteredMedias = medias.filter((media) =>
    (media.titre ?? '').toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="media-upload-block">
      <h3>Bibliothèque de médias</h3>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="media-titre">Titre</label>
          <input
            type="text"
            id="media-titre"
            value={form.titre}
            onChange={update('titre')}
            placeholder="Ex: Affiche portes ouvertes"
            maxLength={150}
          />
        </div>

        <div className="form-group">
          <label htmlFor="media-type">Type de média</label>
          <select id="media-type" value={form.type} onChange={handleTypeChange}>
            <option value={MEDIA_TYPES.IMAGE}>Image</option>
            <option value={MEDIA_TYPES.VIDEO}>Vidéo</option>
            <option value={MEDIA_TYPES.TEXTE}>Texte</option>
          </select>
        </div>

        {isTexte ? (
          <div className="form-group">
            <label htmlFor="media-contenu">Contenu texte</label>
            <textarea
              id="media-contenu"
              className="admin-textarea"
              value={form.contenuTexte}
              onChange={update('contenuTexte')}
              placeholder="Message court affiché plein écran"
              rows={3}
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="media-file">Fichier ({TYPE_LABELS[form.type]})</label>
            <input
              key={fileInputKey}
              type="file"
              id="media-file"
              accept={form.type === MEDIA_TYPES.VIDEO ? 'video/*' : 'image/*'}
              onChange={handleFileChange}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="media-duree">
            Durée (secondes)
            {form.type === MEDIA_TYPES.VIDEO ? ' — détectée automatiquement' : ''}
          </label>
          <input
            type="number"
            id="media-duree"
            className="admin-number"
            min="1"
            required
            value={form.dureeSec}
            onChange={update('dureeSec')}
            placeholder="Ex: 10"
          />
        </div>

        {formError && <p className="admin-error">{formError}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Enregistrement…' : 'Ajouter le média'}
          </button>
        </div>
      </form>

      <div className="admin-list-wrapper">
        <h3>Médias enregistrés</h3>
        {loading && <p className="text-muted">Chargement des médias…</p>}
        {error && <p className="admin-error">{error}</p>}
        {!loading && !error && medias.length === 0 && (
          <p className="text-muted">Aucun média pour le moment.</p>
        )}
        {!loading && medias.length > 0 && (
          <div className="search-box">
            <input
              type="search"
              className="search-box__input"
              placeholder="Rechercher un média…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Rechercher un média"
            />
            <div className="search-box__scroll">
              {filteredMedias.length === 0 ? (
                <p className="text-muted search-box__empty">Aucun résultat.</p>
              ) : (
                <ul className="admin-item-list">
                  {filteredMedias.map((media) => (
              <li key={media.id} className="admin-item admin-item--stacked">
                <div className="admin-item__row">
                <div className="admin-item__main">
                  {isEditing(media.id, 'titre') ? (
                    <input
                      type="text"
                      className="admin-item__title-input"
                      value={edit.value}
                      maxLength={150}
                      onChange={handleEditChange}
                      onKeyDown={(e) => handleEditKeyDown(e, media)}
                      onBlur={() => handleEditBlur(media)}
                      onFocus={(e) => e.target.select()}
                      aria-label="Titre du média"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      className="editable-text admin-item__title"
                      disabled={busyId === media.id}
                      onClick={() => startEdit(media, 'titre')}
                      title="Cliquer pour modifier le titre"
                    >
                      {media.titre}
                    </button>
                  )}
                  <span className="admin-badge">{TYPE_LABELS[media.type] ?? media.type}</span>
                  {isEditing(media.id, 'duree') ? (
                    <span className="media-duree-edit">
                      <input
                        type="number"
                        className="admin-number media-duree-edit__input"
                        min="1"
                        value={edit.value}
                        onChange={handleEditChange}
                        onKeyDown={(e) => handleEditKeyDown(e, media)}
                        onBlur={() => handleEditBlur(media)}
                        onFocus={(e) => e.target.select()}
                        aria-label="Durée en secondes"
                        autoFocus
                      />
                      <span className="text-muted">s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="duree-trigger"
                      disabled={busyId === media.id}
                      onClick={() => startEdit(media, 'duree')}
                      title="Cliquer pour modifier la durée"
                    >
                      {media.duree_sec != null ? `${media.duree_sec} s` : 'durée libre'}
                    </button>
                  )}
                </div>

                  <div className="admin-item__actions">
                    <label
                      className="actif-toggle"
                      title={media.actif ? 'Actif — décocher pour désactiver' : 'Inactif — cocher pour activer'}
                    >
                      <input
                        type="checkbox"
                        checked={media.actif}
                        disabled={busyId === media.id}
                        onChange={() => handleToggleActif(media)}
                      />
                      <span>Actif</span>
                    </label>
                    <button
                      type="button"
                      className="btn-danger-sm"
                      disabled={busyId === media.id}
                      onClick={() => handleDelete(media)}
                      title="Supprimer ce média"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Médias texte : contenu affiché/éditable sur sa propre ligne */}
                {media.type === MEDIA_TYPES.TEXTE && (
                  <div className="admin-item__text">
                    {isEditing(media.id, 'contenu') ? (
                      <textarea
                        className="admin-textarea admin-item__text-input"
                        value={edit.value}
                        rows={2}
                        onChange={handleEditChange}
                        onKeyDown={(e) => handleEditKeyDown(e, media, true)}
                        onBlur={() => handleEditBlur(media)}
                        aria-label="Contenu texte"
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        className="editable-text admin-item__text-preview"
                        disabled={busyId === media.id}
                        onClick={() => startEdit(media, 'contenu')}
                        title="Cliquer pour modifier le texte"
                      >
                        {media.contenu_texte || '(texte vide — cliquer pour saisir)'}
                      </button>
                    )}
                  </div>
                )}
              </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;
