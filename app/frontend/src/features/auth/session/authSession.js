const STORAGE_KEY = 'lpmf.authSession';

function pickStorage(persist) {
  try {
    return persist ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export const authSession = {
  /**
   * @param {{ role: 'admin' | 'prof', cle: string, persist: boolean }} session
   */
  save({ role, cle, persist }) {
    const storage = pickStorage(persist);
    if (!storage) return;
    const payload = JSON.stringify({ role, cle });
    // On nettoie l'autre support pour ne pas garder deux sessions divergentes.
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    storage.setItem(STORAGE_KEY, payload);
  },

  /** @returns {{ role: 'admin' | 'prof', cle: string } | null} */
  read() {
    for (const store of ['localStorage', 'sessionStorage']) {
      try {
        const raw = window[store].getItem(STORAGE_KEY);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'prof') && typeof parsed.cle === 'string') {
          return parsed;
        }
      } catch {
        // support indisponible, on essaie l'autre
      }
    }
    return null;
  },

  clear() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  },

  /**
   * En-tête d'autorisation à joindre aux requêtes protégées de l'API.
   * La clé stockée en session correspond exactement à la clé attendue côté
   * backend (cf. AdminAuthMiddleware : `Authorization: Bearer <ADMIN_API_KEY>`).
   * @returns {{ Authorization: string } | {}}
   */
  authHeader() {
    const session = this.read();
    return session ? { Authorization: `Bearer ${session.cle}` } : {};
  },
};
