import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { authSession } from '../session/authSession';
import ThemeSwitcher from '../../../shared/theme/ThemeSwitcher.jsx';
import '../styles/login.css';

// Cibles de redirection : deux placeholders dédiés en attendant les vraies pages
// (panel admin et écran réservation drag&drop, qui appartiennent à d'autres US).
// Routes en dur ici pour éviter une dépendance circulaire avec router.jsx.
const POST_LOGIN_ROUTE = {
  admin: '/admin',
  prof: '/prof',
};

export default function LoginPage() {
  const [cle, setCle] = useState('');
  const [persist, setPersist] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showCle, setShowCle] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await authService.login(cle);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    authSession.save({ role: result.role, cle: cle.trim(), persist });
    navigate(POST_LOGIN_ROUTE[result.role], { replace: true });
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <header className="login-card__header">
          <h1>GESTIONNAIRE HALL AERO</h1>
          <p>Connexion par clé partagée</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-form__field">
            <span className="login-form__label">Clé d'accès</span>
            <div className="login-form__input-wrap">
              <input
                className="login-form__input"
                type={showCle ? 'text' : 'password'}
                value={cle}
                onChange={(e) => setCle(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
                disabled={submitting}
                placeholder="Saisir la clé (admin ou prof)"
              />
              <button
                type="button"
                className="login-form__toggle"
                onClick={() => setShowCle((v) => !v)}
                disabled={submitting}
                aria-pressed={showCle}
                aria-label={showCle ? 'Masquer la clé' : 'Afficher la clé'}
                title={showCle ? 'Masquer la clé' : 'Afficher la clé'}
              >
                {showCle ? (
                  // Œil barré : la clé est visible, cliquer pour masquer
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  // Œil ouvert : la clé est masquée, cliquer pour afficher
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <label className="login-form__remember">
            <input
              type="checkbox"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
              disabled={submitting}
            />
            <span>Rester connecté sur ce poste</span>
          </label>

          {error && (
            <div className="login-form__error" role="alert">{error}</div>
          )}

          <button
            type="submit"
            className="login-form__submit"
            disabled={submitting || !cle.trim()}
          >
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <footer className="login-card__hint">
          Une seule clé suffit : selon qu'elle correspond à la clé administrateur
          ou à la clé professeur, vous serez dirigé vers le bon espace.
        </footer>

        <div className="login-card__theme">
          <ThemeSwitcher />
        </div>
      </section>
    </main>
  );
}
