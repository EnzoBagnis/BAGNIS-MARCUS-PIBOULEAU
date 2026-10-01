import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App.jsx';
import { initTheme } from '@/shared/theme/themeManager';
import { initTouchDragDrop } from '@/infrastructure/dnd/initTouchDragDrop';
import 'mobile-drag-drop/default.css';
import '@/styles/themes.css';
import '@/styles/global.css';
import '@/styles/konami.css';

// Applique le thème mémorisé avant le premier rendu (évite tout flash de style).
initTheme();

// Active le glisser-déposer au doigt (mobile) ; no-op sur PC/souris.
initTouchDragDrop();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
