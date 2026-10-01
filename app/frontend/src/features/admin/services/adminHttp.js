import { HttpError } from '../../../infrastructure/http/httpClient';
import { authSession } from '../../auth/session/authSession';

/**
 * En-têtes joints aux requêtes de mutation de l'admin (médias, playlists).
 * Les routes POST/PUT/DELETE de l'API sont protégées par AdminAuthMiddleware.
 * @returns {{ Authorization: string } | {}}
 */
export function adminHeaders() {
  return authSession.authHeader();
}

/**
 * Transforme une erreur de requête en message lisible pour l'utilisateur,
 * en privilégiant le message renvoyé par l'API (clé `message`).
 * @param {unknown} error
 * @param {string} fallback
 * @returns {string}
 */
export function describeError(error, fallback = 'Une erreur est survenue.') {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return "Action réservée à l'administrateur (clé invalide ou session expirée).";
    }
    const payload = error.payload;
    if (payload && typeof payload === 'object' && typeof payload.message === 'string') {
      return payload.message;
    }
    if (typeof payload === 'string' && payload) {
      return payload;
    }
    return `Erreur ${error.status}.`;
  }
  return fallback;
}
