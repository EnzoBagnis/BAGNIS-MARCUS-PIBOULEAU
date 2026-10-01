import { Navigate } from 'react-router';
import { authSession } from '../session/authSession';

/**
 * Protège une route : redirige vers /login si l'utilisateur n'a pas de session,
 * ou si son rôle ne correspond pas à `role`.
 *
 * @param {{ role: 'admin' | 'prof', children: import('react').ReactNode }} props
 */
export default function RequireAuth({ role, children }) {
  const session = authSession.read();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.role !== role) {
    // Session existante mais mauvais rôle (ex. un admin qui tape /prof manuellement).
    // On purge et on renvoie sur le login pour forcer la re-saisie.
    authSession.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
}
