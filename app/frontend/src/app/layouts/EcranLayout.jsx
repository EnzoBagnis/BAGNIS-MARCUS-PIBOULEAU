import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useKioskMode } from '@/shared/hooks/useKioskMode.js';
import { applyTheme, getStoredTheme } from '@/shared/theme/themeManager';

export default function EcranLayout() {
  useKioskMode();

  // Les écrans kiosque (info / agenda / rotation) sont figés sur le style
  // « Coloré » — pensé pour la lisibilité à distance sur les TV — quel que soit
  // le choix de couleurs de l'utilisateur. On l'applique sans le persister, puis
  // on restaure le thème mémorisé en quittant le mode écran.
  useEffect(() => {
    applyTheme('colore');
    return () => {
      applyTheme(getStoredTheme());
    };
  }, []);

  return (
    <div className="ecran-layout">
      <Outlet />
    </div>
  );
}
