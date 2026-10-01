import { useNavigate } from 'react-router';
import { authSession } from '../session/authSession';
import '../styles/placeholder.css';

export default function ProfHomePlaceholderPage() {
  const navigate = useNavigate();
  const session = authSession.read();

  const handleLogout = () => {
    authSession.clear();
    navigate('/login', { replace: true });
  };

  return (
    <main className="placeholder-page">
      <section className="placeholder-card">
        <span className="placeholder-card__badge placeholder-card__badge--prof">Espace professeur</span>
        <h1>Connexion réussie</h1>
        <p>
          Cette page est un emplacement réservé. L'écran de réservation par glisser-déposer
          (machines × créneaux) sera développé dans une autre US.
        </p>
        {session && (
          <p className="placeholder-card__hint">
            Rôle détecté : <strong>{session.role}</strong>.
          </p>
        )}
        <button type="button" className="placeholder-card__logout" onClick={handleLogout}>
          Se déconnecter
        </button>
      </section>
    </main>
  );
}
