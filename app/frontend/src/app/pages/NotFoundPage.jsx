import { Link } from 'react-router';
import { ROUTES } from '@/infrastructure/router/router.jsx';

export default function NotFoundPage() {
  return (
    <main className="ecran-404">
      <h1>404</h1>
      <p>Cette page n'existe pas.</p>
      <Link to={ROUTES.login}>Retour à l'accueil</Link>
    </main>
  );
}
