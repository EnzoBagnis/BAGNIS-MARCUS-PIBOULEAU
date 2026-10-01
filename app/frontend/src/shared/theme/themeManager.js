/**
 * themeManager — pilotage du thème visuel de l'application.
 *
 * Le thème est matérialisé par l'attribut `data-theme` posé sur <html>
 * (cf. styles/themes.css) et persisté dans localStorage pour rester actif
 * au rechargement de la page et lors de la navigation entre les pages.
 */

export const THEMES = [
  { id: 'epure', label: 'Épuré' },
  { id: 'moderne', label: 'Moderne' },
  { id: 'colore', label: 'Coloré' },
];

const STORAGE_KEY = 'lpmf-theme';
const DEFAULT_THEME = 'epure';
const VALID_THEMES = new Set(THEMES.map((t) => t.id));

/** Lit le thème mémorisé (ou le thème par défaut si absent / invalide). */
export function getStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.has(value) ? value : DEFAULT_THEME;
  } catch {
    // localStorage indisponible (mode privé, kiosque verrouillé…) : on dégrade proprement.
    return DEFAULT_THEME;
  }
}

/** Applique un thème au DOM (sans le persister). */
export function applyTheme(theme) {
  const resolved = VALID_THEMES.has(theme) ? theme : DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}

/** Applique ET mémorise un thème. Retourne le thème effectivement appliqué. */
export function setTheme(theme) {
  const resolved = applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, resolved);
  } catch {
    /* persistance impossible : le thème reste appliqué pour la session courante */
  }
  return resolved;
}

/** Initialise le thème au démarrage de l'application. */
export function initTheme() {
  return applyTheme(getStoredTheme());
}
