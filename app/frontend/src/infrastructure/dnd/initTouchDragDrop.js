import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';

let applied = false;

/**
 * Active le glisser-déposer au doigt.
 *
 * react-big-calendar (et nos pastilles de machines) reposent sur le
 * drag-and-drop HTML5 natif, que les navigateurs mobiles ne déclenchent PAS au
 * toucher (uniquement à la souris). Ce polyfill traduit les gestes tactiles en
 * évènements `dragstart` / `dragover` / `drop`, ce qui fait fonctionner le
 * dépôt d'une machine sur le planning depuis un téléphone, sans rien changer à
 * la logique existante.
 *
 * Sur PC / souris : no-op (on n'applique le polyfill que sur écran tactile).
 */
export function initTouchDragDrop() {
  if (applied) return;
  applied = true;

  const isTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0);
  if (!isTouch) return;

  polyfill({
    // Sur mobile la détection auto suffit en théorie, mais on force pour éviter
    // qu'un navigateur exposant l'API DnD (sans la gérer au toucher) la désactive.
    forceApply: true,
    // Laisse la page défiler pendant le glisser (l'image suivie reste sous le doigt).
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
  });

  // iOS Safari : sans un listener touchmove NON passif, le polyfill ne peut pas
  // empêcher le défilement natif pendant un glisser.
  window.addEventListener('touchmove', () => {}, { passive: false });
}
