/* ============================================================================
   machineColors.js — couleur d'identité d'une machine (déterministe, sans BDD)
   ----------------------------------------------------------------------------
   Chaque machine reçoit une couleur stable, dérivée de son identifiant. Comme
   le calcul est purement déterministe, TOUT LE MONDE (profs, écrans TV, admin)
   voit la même couleur pour une machine donnée, sans rien stocker en base.

   ⚠️ Limite assumée : ces couleurs ne sont PAS modifiables par l'admin. Pour
   les rendre personnalisables et partagées, il faudrait une colonne `couleur`
   en BDD exposée par l'API machines (voir note dans la PR / discussion).

   Les couleurs de la palette sont volontairement assez foncées pour rester
   lisibles avec du texte blanc, quel que soit le thème (clair ou sombre).
   ========================================================================== */

/** Palette de couleurs distinctes et accessibles (texte blanc dessus). */
export const MACHINE_PALETTE = [
  '#2563eb', // bleu
  '#16a34a', // vert
  '#ea580c', // orange
  '#9333ea', // violet
  '#0891b2', // cyan
  '#dc2626', // rouge
  '#ca8a04', // ocre / moutarde
  '#db2777', // rose
  '#4f46e5', // indigo
  '#0d9488', // teal
  '#65a30d', // vert olive
  '#7c3aed', // pourpre
  '#b45309', // brun
  '#475569', // ardoise
];

/** Index stable dans la palette pour un identifiant de machine donné. */
export function machineColorIndex(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return 0;
  const len = MACHINE_PALETTE.length;
  return ((Math.trunc(n) % len) + len) % len; // gère aussi les id négatifs
}

/** Assombrit une couleur hexadécimale d'un pourcentage (0–100). */
function darken(hex, percent) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const factor = 1 - percent / 100;
  const channel = (i) => {
    const v = Math.round(parseInt(m[i], 16) * factor);
    return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  };
  return `#${channel(1)}${channel(2)}${channel(3)}`;
}

/**
 * Couleur d'une machine, prête à l'emploi pour un événement d'agenda.
 * @param {number|string} id  identifiant de la machine
 * @returns {{ bg: string, border: string, text: string }}
 */
export function machineColor(id) {
  const bg = MACHINE_PALETTE[machineColorIndex(id)];
  return {
    bg,
    border: darken(bg, 14),
    text: '#ffffff',
  };
}
