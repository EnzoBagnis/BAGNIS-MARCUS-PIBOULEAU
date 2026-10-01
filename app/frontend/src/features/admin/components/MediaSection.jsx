import React, { useCallback, useEffect, useState } from 'react';
import MediaLibrary from './MediaLibrary';
import PlaylistManager from './PlaylistManager';
import { mediaAdminService } from '../services/mediaAdminService';
import { describeError } from '../services/adminHttp';

/**
 * Carte « Médias & Playlists » du panneau d'administration.
 *
 * La liste des médias est détenue ici puis partagée :
 *   - MediaLibrary l'affiche et la modifie (création / activation / suppression) ;
 *   - PlaylistManager s'en sert pour composer les playlists.
 */
const MediaSection = () => {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadMedias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMedias(await mediaAdminService.list());
    } catch (err) {
      setError(describeError(err, 'Impossible de charger les médias.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadMedias();
  }, [reloadMedias]);

  return (
    <section className="admin-card media-full-width">
      <div className="card-header">
        <h2>Espace Médias &amp; Playlists</h2>
      </div>
      <div className="card-body media-split-layout">
        <MediaLibrary
          medias={medias}
          loading={loading}
          error={error}
          onChanged={reloadMedias}
        />
        <PlaylistManager medias={medias} />
      </div>
    </section>
  );
};

export default MediaSection;
