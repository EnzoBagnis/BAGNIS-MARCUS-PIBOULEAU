import { httpClient } from '../../../infrastructure/http/httpClient';
import { authSession } from '../../auth/session/authSession';

/**
 * Headers d'authentification admin (Bearer token).
 */
function authHeaders() {
  const session = authSession.read();
  const headers = {};
  if (session?.cle) {
    headers['Authorization'] = `Bearer ${session.cle}`;
  }
  return headers;
}

export const adminService = {
  // ── Professeurs ──────────────────────────────────────────────

  /**
   * Récupère la liste de tous les professeurs.
   * @returns {Promise<Array>}
   */
  async fetchProfesseurs() {
    const response = await httpClient.get('/api/professeurs');
    return response?.data || response || [];
  },

  /**
   * Crée un nouveau professeur.
   * @param {{ nom: string, prenom: string }} data
   * @returns {Promise<Object>}
   */
  async createProfesseur(data) {
    const response = await httpClient.post('/api/professeurs', data, { headers: authHeaders() });
    return response?.data || response;
  },

  /**
   * Met à jour un professeur existant.
   * @param {number} id
   * @param {{ nom: string, prenom: string }} data
   * @returns {Promise<Object>}
   */
  async updateProfesseur(id, data) {
    const response = await httpClient.put(`/api/professeurs/${id}`, data, { headers: authHeaders() });
    return response?.data || response;
  },

  /**
   * Supprime un professeur.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteProfesseur(id) {
    await httpClient.delete(`/api/professeurs/${id}`, { headers: authHeaders() });
  },

  // ── Classes ──────────────────────────────────────────────────

  /**
   * Récupère la liste de toutes les classes.
   * @returns {Promise<Array>}
   */
  async fetchClasses() {
    const response = await httpClient.get('/api/classes');
    return response?.data || response || [];
  },

  /**
   * Crée une nouvelle classe.
   * @param {{ nom: string }} data
   * @returns {Promise<Object>}
   */
  async createClasse(data) {
    const response = await httpClient.post('/api/classes', data, { headers: authHeaders() });
    return response?.data || response;
  },

  /**
   * Met à jour une classe existante.
   * @param {number} id
   * @param {{ nom: string }} data
   * @returns {Promise<Object>}
   */
  async updateClasse(id, data) {
    const response = await httpClient.put(`/api/classes/${id}`, data, { headers: authHeaders() });
    return response?.data || response;
  },

  /**
   * Supprime une classe.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteClasse(id) {
    await httpClient.delete(`/api/classes/${id}`, { headers: authHeaders() });
  },

  // ── Machines ─────────────────────────────────────────────────

  /**
   * Récupère la liste de toutes les machines.
   * @returns {Promise<Array>}
   */
  async fetchMachines() {
    const response = await httpClient.get('/api/machines');
    return response?.data || response || [];
  },

  /**
   * Crée une nouvelle machine.
   * @param {{ nom: string, type: string }} data
   * @returns {Promise<Object>}
   */
  async createMachine(data) {
    const response = await httpClient.post('/api/machines', data, { headers: authHeaders() });
    return response?.data || response;
  },

  /**
   * Met à jour une machine existante.
   * @param {number} id
   * @param {{ nom: string, type: string }} data
   * @returns {Promise<Object>}
   */
  async updateMachine(id, data) {
    const response = await httpClient.put(`/api/machines/${id}`, data, { headers: authHeaders() });
    return response?.data || response;
  },

  /**
   * Supprime une machine.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteMachine(id) {
    await httpClient.delete(`/api/machines/${id}`, { headers: authHeaders() });
  },
};
