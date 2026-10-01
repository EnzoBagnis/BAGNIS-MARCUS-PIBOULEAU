import { useEffect, useRef, useCallback } from 'react';

/**
 * Délai d'inactivité de la souris avant masquage du curseur (ms).
 * @type {number}
 */
const CURSOR_HIDE_DELAY_MS = 2000;

/**
 * Classe CSS appliquée au <html> pour masquer le curseur.
 * Définie dans global.css.
 * @type {string}
 */
const CURSOR_HIDDEN_CLASS = 'kiosk-cursor-hidden';

/**
 * Hook « mode kiosque » — plein écran + masquage du curseur.
 *
 * Fonctionnement :
 *  1. Au montage, demande le plein écran via l'API Fullscreen.
 *  2. Masque le curseur après {@link CURSOR_HIDE_DELAY_MS} ms d'inactivité.
 *  3. Ré‑affiche le curseur dès que la souris bouge, puis relance le timer.
 *  4. Au démontage, quitte le plein écran et ré‑affiche le curseur.
 *
 * Le hook est conçu pour être utilisé dans un layout (ex. EcranLayout)
 * afin que toutes les pages enfant bénéficient automatiquement du mode kiosque.
 */
export function useKioskMode() {
  const hideTimerRef = useRef(null);
  // Dernière position connue du pointeur : sert à ignorer les « mousemove »
  // fantômes des Smart TV (voir handleMouseMove).
  const lastPosRef = useRef({ x: null, y: null });

  // ── Masquage / affichage du curseur ──────────────────────────

  const hideCursor = useCallback(() => {
    document.documentElement.classList.add(CURSOR_HIDDEN_CLASS);
  }, []);

  const showCursor = useCallback(() => {
    document.documentElement.classList.remove(CURSOR_HIDDEN_CLASS);
  }, []);

  const resetHideTimer = useCallback(() => {
    showCursor();
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(hideCursor, CURSOR_HIDE_DELAY_MS);
  }, [hideCursor, showCursor]);

  /**
   * Gestionnaire de `mousemove` qui ignore les évènements « fantômes ».
   *
   * Contrairement à une souris de PC, le pointeur d'une télécommande de Smart TV
   * émet régulièrement des `mousemove` aux MÊMES coordonnées (le pointeur se
   * « réveille » sans bouger). Ces évènements relançaient en boucle le timer de
   * masquage → le curseur restait affiché de façon aléatoire. On ne réagit donc
   * qu'à un déplacement réel (coordonnées différentes de la dernière position).
   */
  const handleMouseMove = useCallback(
    (event) => {
      const { clientX, clientY } = event;
      const { x, y } = lastPosRef.current;
      if (clientX === x && clientY === y) return; // pointeur immobile : on ignore
      lastPosRef.current = { x: clientX, y: clientY };
      resetHideTimer();
    },
    [resetHideTimer]
  );

  // ── Plein écran ──────────────────────────────────────────────

  const requestFullscreen = useCallback(async () => {
    const el = document.documentElement;

    // Évite de redemander si on est déjà en plein écran
    if (document.fullscreenElement) return;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        // Safari
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        // IE/Edge legacy
        await el.msRequestFullscreen();
      }
    } catch (err) {
      // Le navigateur peut refuser (nécessite un geste utilisateur).
      // eslint-disable-next-line no-console
      console.warn('[useKioskMode] Impossible de passer en plein écran :', err.message);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) return;

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch {
      // Silencieux — on quitte la page de toute façon.
    }
  }, []);

  // ── Effet principal ──────────────────────────────────────────

  useEffect(() => {
    // 1. Demander le plein écran
    requestFullscreen();

    // 2. Lancer le timer de masquage du curseur
    hideTimerRef.current = setTimeout(hideCursor, CURSOR_HIDE_DELAY_MS);

    // 3. Écouter les mouvements de souris (en filtrant les évènements fantômes)
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      clearTimeout(hideTimerRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      showCursor();
      exitFullscreen();
    };
  }, [requestFullscreen, exitFullscreen, hideCursor, showCursor, handleMouseMove]);
}
