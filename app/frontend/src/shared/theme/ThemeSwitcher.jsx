import { useState } from 'react';
import { THEMES, getStoredTheme, setTheme } from './themeManager';
import './ThemeSwitcher.css';

/**
 * Sélecteur de styles — trois boutons (« Épuré », « Moderne », « Coloré »)
 * présents sur toutes les pages pendant la phase de validation avec les
 * professeurs. Le choix est appliqué immédiatement et persisté (localStorage),
 * donc conservé au rechargement et lors de la navigation.
 *
 * Monté une seule fois, globalement, dans App.jsx (en dehors du routeur).
 */
export default function ThemeSwitcher() {
  const [theme, setThemeState] = useState(getStoredTheme);

  const handleSelect = (id) => {
    setThemeState(setTheme(id));
  };

  return (
    <div className="theme-switcher" role="group" aria-label="Choix du style visuel">
      <span className="theme-switcher__label">Style</span>
      {THEMES.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            className={
              'theme-switcher__btn' +
              (active ? ' theme-switcher__btn--active' : '')
            }
            aria-pressed={active}
            onClick={() => handleSelect(t.id)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
