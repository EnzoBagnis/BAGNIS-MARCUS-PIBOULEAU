import { httpClient, HttpError } from '@/infrastructure/http/httpClient';

export const AUTH_ERROR = {
  INVALID: 'INVALID',
  EMPTY: 'EMPTY',
  NETWORK: 'NETWORK',
  UNKNOWN: 'UNKNOWN',
};

function extractMessage(payload, fallback) {
  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string') return payload.message;
    if (typeof payload.error === 'string') return payload.error;
  }
  return fallback;
}

export const authService = {
  /**
   * Tente de connecter l'utilisateur avec la clé partagée.
   * @param {string} cle
   * @returns {Promise<{ ok: true, role: 'admin' | 'prof' } | { ok: false, error: { type: string, message: string } }>}
   */
  async login(cle) {
    const trimmed = cle.trim();
    if (!trimmed) {
      return { ok: false, error: { type: AUTH_ERROR.EMPTY, message: "Saisis ta clé d'accès." } };
    }

    try {
      const response = await httpClient.post('/api/auth/login', { cle: trimmed });
      const role = response?.data?.role;
      if (role !== 'admin' && role !== 'prof') {
        return {
          ok: false,
          error: { type: AUTH_ERROR.UNKNOWN, message: 'Réponse serveur inattendue.' },
        };
      }
      return { ok: true, role };
    } catch (error) {
      if (!(error instanceof HttpError)) {
        return {
          ok: false,
          error: {
            type: AUTH_ERROR.NETWORK,
            message: 'Le serveur est injoignable. Vérifie ta connexion puis réessaie.',
          },
        };
      }
      if (error.status === 401) {
        return {
          ok: false,
          error: {
            type: AUTH_ERROR.INVALID,
            message: extractMessage(error.payload, "Clé d'accès invalide."),
          },
        };
      }
      return {
        ok: false,
        error: {
          type: AUTH_ERROR.UNKNOWN,
          message: extractMessage(error.payload, `Erreur ${error.status}.`),
        },
      };
    }
  },
};
