import { RouterProvider } from 'react-router';
import { router } from '@/infrastructure/router/router.jsx';
import KonamiEasterEgg from '@/shared/components/KonamiEasterEgg.jsx';

// Le sélecteur de couleurs n'est plus global/flottant : il est intégré dans les
// barres de navigation (topbar admin, en-tête prof, carte de connexion). Les
// écrans kiosque (/ecran/*) restent figés en « Coloré » et n'en ont pas.
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* Easter egg global : Konami code (clavier ou télécommande TV). */}
      <KonamiEasterEgg />
    </>
  );
}
