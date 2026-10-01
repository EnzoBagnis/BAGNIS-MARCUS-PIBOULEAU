import React, { useCallback, useEffect, useState } from 'react';
import { storageService, formatBytes } from '../services/storageService';
import { describeError } from '../services/adminHttp';

// Rafraîchissement périodique de la jauge (en ms).
const REFRESH_MS = 30000;

/**
 * Carte « Stockage » : occupation disque du compte (quota AlwaysData) avec
 * barre de progression colorée et rafraîchissement automatique.
 */
const StorageCard = () => {
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setUsage(await storageService.get());
      setError(null);
    } catch (err) {
      setError(describeError(err, 'Impossible de charger le stockage.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const intervalId = setInterval(load, REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [load]);

  const percent = usage ? usage.percent_used : 0;
  const level = percent >= 90 ? 'danger' : percent >= 70 ? 'warn' : 'ok';

  return (
    <section className="admin-card">
      <div className="card-header">
        <h2>Stockage</h2>
      </div>
      <div className="card-body">
        {loading && !usage && <p className="text-muted">Chargement de l'occupation disque…</p>}
        {error && <p className="admin-error">{error}</p>}

        {usage && (
          <>
            <div
              className="storage-bar"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`storage-bar__fill storage-bar__fill--${level}`}
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>

            <p className="storage-summary">
              <strong>{formatBytes(usage.used_bytes)}</strong> utilisés sur{' '}
              {formatBytes(usage.quota_bytes)} ({percent}%)
            </p>
            <p className="text-muted">
              Reste {formatBytes(usage.free_bytes)} — médias {formatBytes(usage.breakdown.uploads)},
              bases {formatBytes(usage.breakdown.database)}
            </p>

            {level === 'danger' && (
              <p className="admin-error">Stockage presque plein : pense à supprimer des médias.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default StorageCard;
