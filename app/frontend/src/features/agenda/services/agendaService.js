import { httpClient } from '../../../infrastructure/http/httpClient';
import { authSession } from '../../auth/session/authSession';

export const agendaService = {
  /**
   * Récupère la liste de toutes les réservations.
   * @returns {Promise<Array>}
   */
  async fetchReservations() {
    const response = await httpClient.get('/api/reservations');
    return response?.data || response || [];
  },

  /**
   * Récupère la liste de toutes les machines.
   * @returns {Promise<Array>}
   */
  async fetchMachines() {
    const response = await httpClient.get('/api/machines');
    return response?.data || response || [];
  },

  /**
   * Récupère la liste de tous les professeurs.
   * @returns {Promise<Array>}
   */
  async fetchProfesseurs() {
    const response = await httpClient.get('/api/professeurs');
    return response?.data || response || [];
  },

  /**
   * Récupère la liste de toutes les classes.
   * @returns {Promise<Array>}
   */
  async fetchClasses() {
    const response = await httpClient.get('/api/classes');
    return response?.data || response || [];
  },

  /**
   * Crée une nouvelle réservation en BDD.
   * @param {{ debut: string, fin: string, description: string|null, professeur_id: number, classe_id: number, machine_id: number }} data
   * @returns {Promise<Object>}
   */
  async createReservation(data) {
    const session = authSession.read();
    const headers = {};
    if (session?.cle) {
      headers['Authorization'] = `Bearer ${session.cle}`;
    }
    const response = await httpClient.post('/api/reservations', data, { headers });
    return response?.data || response;
  },

  /**
   * Met à jour une réservation existante en BDD.
   * @param {number} id
   * @param {{ debut?: string, fin?: string, description?: string|null, professeur_id?: number, classe_id?: number, machine_id?: number }} data
   * @returns {Promise<Object>}
   */
  async updateReservation(id, data) {
    const session = authSession.read();
    const headers = {};
    if (session?.cle) {
      headers['Authorization'] = `Bearer ${session.cle}`;
    }
    const response = await httpClient.put(`/api/reservations/${id}`, data, { headers });
    return response?.data || response;
  },

  /**
   * Supprime une réservation existante en BDD.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteReservation(id) {
    const session = authSession.read();
    const headers = {};
    if (session?.cle) {
      headers['Authorization'] = `Bearer ${session.cle}`;
    }
    await httpClient.delete(`/api/reservations/${id}`, { headers });
  }
};
