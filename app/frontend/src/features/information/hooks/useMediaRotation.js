import { useCallback, useEffect, useRef, useState } from 'react';
import { MEDIA_TYPES } from '@/core/entities/Media.js';

/**
 * Durée par défaut (en secondes) quand `duree_sec` est null.
 * Utilisé pour les images et les textes sans durée explicite.
 */
const DEFAULT_DURATION_SEC = 10;

/**
 * Durée de la transition CSS de fondu enchaîné (en millisecondes).
 * Doit correspondre à la valeur dans MediaRotation.css.
 */
const TRANSITION_DURATION_MS = 600;

/**
 * Délai avant de skip un média en erreur (en millisecondes).
 */
const ERROR_SKIP_DELAY_MS = 2000;

/**
 * Hook encapsulant la logique de rotation automatique des médias.
 *
 * Comportements :
 *  - Image / texte : timer basé sur `duree_sec` (ou DEFAULT_DURATION_SEC)
 *  - Vidéo : attend `notifyVideoEnded()` OU expire après `duree_sec` (premier arrivé)
 *  - Boucle infinie : (index + 1) % length
 *  - Hot-swap : si la playlist change, on reste sur le même média (par ID) si possible
 *  - Skip sur erreur : passe au suivant après ERROR_SKIP_DELAY_MS
 *
 * Options :
 *  - active : false met la rotation en pause (timers stoppés). Au passage à
 *    true, la playlist est rejouée depuis le début (index 0).
 *  - onCycleComplete : appelé à la fin d'un tour complet de playlist (le dernier
 *    média a été affiché toute sa durée). Si fourni, la rotation ne reboucle
 *    pas d'elle-même : c'est l'appelant qui décide de la suite (utilisé par le
 *    mode rotation pour rebasculer sur l'agenda). Sans ce callback, boucle infinie.
 *
 * @param {import('@/core/entities/Media.js').Media[]} medias
 * @param {{ active?: boolean, onCycleComplete?: () => void }} [options]
 * @returns {{
 *   currentMedia: import('@/core/entities/Media.js').Media | null,
 *   currentIndex: number,
 *   isTransitioning: boolean,
 *   notifyVideoEnded: () => void,
 *   notifyError: () => void,
 * }}
 */
export function useMediaRotation(medias, { active = true, onCycleComplete } = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs pour les timers (permettent un cleanup fiable)
  const timerRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const errorTimerRef = useRef(null);

  // Ref pour tracker les IDs de la playlist précédente (hot-swap)
  const prevMediaIdsRef = useRef('');

  // Ref pour l'index courant (accessible dans les callbacks sans re-render)
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;

  // Ref pour la liste de médias courante
  const mediasRef = useRef(medias);
  mediasRef.current = medias;

  // Ref vers le callback de fin de tour (évite les closures périmées dans les timers).
  const onCycleCompleteRef = useRef(onCycleComplete);
  onCycleCompleteRef.current = onCycleComplete;

  /**
   * Nettoie tous les timers en cours.
   */
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  /**
   * Avance au média suivant avec transition de fondu.
   */
  const advanceToNext = useCallback(() => {
    const list = mediasRef.current;
    if (!list || list.length === 0) return;

    // Éviter un double-advance si déjà en transition
    if (transitionTimerRef.current) return;

    // Nettoyer le timer principal (si avance via onEnded ou onError)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    // Fin d'un tour complet : si un callback est fourni, on prévient l'appelant
    // (qui rebascule p. ex. sur l'agenda) au lieu de reboucler immédiatement.
    // Le dernier média vient d'être affiché toute sa durée, rien n'est coupé.
    const isLastMedia = currentIndexRef.current >= list.length - 1;
    if (isLastMedia && onCycleCompleteRef.current) {
      onCycleCompleteRef.current();
      return;
    }

    // Phase 1 : lancer le fondu sortant
    setIsTransitioning(true);

    // Phase 2 : après la durée du fondu, changer le média
    transitionTimerRef.current = setTimeout(() => {
      transitionTimerRef.current = null;
      const nextIndex = (currentIndexRef.current + 1) % list.length;
      setCurrentIndex(nextIndex);
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);
  }, []);

  /**
   * Lance le timer pour le média courant.
   */
  const startTimer = useCallback(() => {
    const list = mediasRef.current;
    if (!list || list.length === 0) return;

    const media = list[currentIndexRef.current];
    if (!media) return;

    // Nettoyer tout timer précédent
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const durationSec = media.duree_sec ?? DEFAULT_DURATION_SEC;
    const durationMs = durationSec * 1000;

    // Pour les vidéos, le timer sert de cap de sécurité.
    // Pour image/texte, c'est le timer principal.
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      advanceToNext();
    }, durationMs);
  }, [advanceToNext]);

  /**
   * Callback à appeler quand une vidéo émet l'événement `ended`.
   * Déclenche le passage immédiat au média suivant.
   */
  const notifyVideoEnded = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  /**
   * Callback à appeler quand un média est en erreur.
   * Skip au suivant après un court délai.
   */
  const notifyError = useCallback(() => {
    // Nettoyer le timer principal
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Éviter un double-skip
    if (errorTimerRef.current) return;

    errorTimerRef.current = setTimeout(() => {
      errorTimerRef.current = null;
      advanceToNext();
    }, ERROR_SKIP_DELAY_MS);
  }, [advanceToNext]);

  // ── Hot-swap de playlist ──────────────────────────────────────
  useEffect(() => {
    const newIds = (medias || []).map((m) => m.id).join(',');
    const prevIds = prevMediaIdsRef.current;

    if (newIds === prevIds) return;
    prevMediaIdsRef.current = newIds;

    // Première mount ou playlist vide → index 0
    if (!medias || medias.length === 0) {
      clearAllTimers();
      setCurrentIndex(0);
      setIsTransitioning(false);
      return;
    }

    // Si on avait un média courant, essayer de le retrouver dans la nouvelle liste
    if (prevIds !== '') {
      const prevMedias = prevIds.split(',');
      const currentMediaId = prevMedias[currentIndexRef.current];
      const foundIndex = medias.findIndex((m) => String(m.id) === currentMediaId);

      if (foundIndex !== -1) {
        // Le média courant existe encore → on met à jour l'index
        setCurrentIndex(foundIndex);
      } else {
        // Le média courant a disparu → reprendre à 0
        clearAllTimers();
        setCurrentIndex(0);
        setIsTransitioning(false);
      }
    }
  }, [medias, clearAllTimers]);

  // ── Pause / reprise (mode rotation) ───────────────────────────
  // active=false : on stoppe tous les timers (les deux panneaux restent montés).
  // Passage à active=true : on rejoue la playlist depuis le début.
  useEffect(() => {
    if (active) {
      setCurrentIndex(0);
      setIsTransitioning(false);
    } else {
      clearAllTimers();
      setIsTransitioning(false);
    }
  }, [active, clearAllTimers]);

  // ── Lancement du timer à chaque changement de média ───────────
  useEffect(() => {
    if (!active) return; // en pause : aucun timer

    // Playlist vide : en mode piloté (onCycleComplete fourni), on laisse le
    // fallback s'afficher un court instant puis on signale la fin de tour pour
    // rebasculer sur l'agenda plutôt que de rester bloqué.
    if (!medias || medias.length === 0) {
      if (onCycleCompleteRef.current) {
        const id = setTimeout(() => onCycleCompleteRef.current?.(), DEFAULT_DURATION_SEC * 1000);
        return () => clearTimeout(id);
      }
      return;
    }

    if (currentIndex >= medias.length) return;

    startTimer();

    return () => {
      clearAllTimers();
    };
  }, [currentIndex, medias, active, startTimer, clearAllTimers]);

  // ── Cleanup final au démontage ────────────────────────────────
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // ── Valeur de retour ──────────────────────────────────────────
  const currentMedia =
    medias && medias.length > 0 && currentIndex < medias.length
      ? medias[currentIndex]
      : null;

  return {
    currentMedia,
    currentIndex,
    isTransitioning,
    notifyVideoEnded,
    notifyError,
  };
}
