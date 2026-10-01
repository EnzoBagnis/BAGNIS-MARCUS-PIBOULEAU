import { useState, useEffect, useRef } from 'react';
import { playlistService } from '../services/playlistService';

/**
 * Hook to manage fetching and polling of the active playlist.
 *
 * Le rafraîchissement est « silencieux » : on ne met à jour l'état que si le
 * contenu de la playlist a réellement changé (comparaison de signature), afin de
 * ne pas relancer inutilement la rotation des médias. Un échec réseau ponctuel
 * en arrière-plan ne coupe pas la diffusion (on garde l'affichage courant).
 *
 * @param {number} refreshIntervalMs - Polling interval in milliseconds (default: 30 s)
 * @returns {{ playlist: any, loading: boolean, error: Error | null, medias: any[] }}
 */
export function useActivePlaylist(refreshIntervalMs = 30 * 1000) {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Signature du dernier contenu appliqué, pour éviter les mises à jour inutiles.
  const signatureRef = useRef(null);

  useEffect(() => {
    let active = true;

    const fetchPlaylist = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);

        const data = await playlistService.fetchActivePlaylist();
        if (!active) return;

        setError(null);

        // N'actualise l'état que si le contenu a changé : sinon on garderait la
        // même donnée mais avec une nouvelle référence, ce qui relancerait les
        // timers de rotation à chaque poll.
        const signature = JSON.stringify(data);
        if (signature !== signatureRef.current) {
          signatureRef.current = signature;
          setPlaylist(data);
        }
      } catch (err) {
        if (!active) return;
        console.error('[useActivePlaylist] Failed to fetch active playlist:', err);
        // On ne bascule sur le FallbackScreen que si on n'a encore rien à
        // afficher. Un échec ponctuel pendant un rafraîchissement de fond ne
        // doit pas interrompre la diffusion en cours.
        if (signatureRef.current === null) {
          setError(err);
        }
      } finally {
        if (active && isInitial) setLoading(false);
      }
    };

    // Initial fetch
    fetchPlaylist(true);

    // Polling périodique en arrière-plan
    const intervalId = setInterval(() => {
      fetchPlaylist(false);
    }, refreshIntervalMs);

    // Cleanup on unmount
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [refreshIntervalMs]);

  // Derive medias array for convenience
  const medias = playlist?.medias || [];

  return { playlist, medias, loading, error };
}
