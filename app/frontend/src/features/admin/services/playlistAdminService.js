import { httpClient } from '../../../infrastructure/http/httpClient';
import { adminHeaders } from './adminHttp';

/**
 * Service d'administration des playlists et de leur composition
 * (association média ↔ playlist + ordonnancement).
 */
export const playlistAdminService = {
  /**
   * Liste toutes les playlists.
   * @returns {Promise<Array<{ id: number, nom: string, active: boolean }>>}
   */
  async list() {
    const response = await httpClient.get('/api/playlists');
    return response?.data ?? [];
  },

  /**
   * Crée une nouvelle playlist (inactive par défaut côté backend).
   * @param {string} nom
   */
  async create(nom) {
    const response = await httpClient.post('/api/playlists', { nom }, { headers: adminHeaders() });
    return response?.data;
  },

  /**
   * Active (ou désactive) une playlist. Plusieurs playlists peuvent être
   * actives simultanément : leurs médias seront diffusés à la suite.
   * @param {number} id
   * @param {boolean} active
   */
  async setActive(id, active) {
    const response = await httpClient.put(`/api/playlists/${id}`, { active }, { headers: adminHeaders() });
    return response?.data;
  },

  /**
   * Renomme une playlist.
   * @param {number} id
   * @param {string} nom
   */
  async rename(id, nom) {
    const response = await httpClient.put(`/api/playlists/${id}`, { nom }, { headers: adminHeaders() });
    return response?.data;
  },

  /**
   * Supprime une playlist (la composition est supprimée en cascade).
   * @param {number} id
   */
  async remove(id) {
    await httpClient.delete(`/api/playlists/${id}`, { headers: adminHeaders() });
  },

  /**
   * Liste la composition d'une playlist (médias et leur ordre).
   * @param {number} playlistId
   * @returns {Promise<Array<{ playlist_id: number, media_id: number, ordre: number }>>}
   */
  async listMedias(playlistId) {
    const response = await httpClient.get(`/api/playlists/${playlistId}/medias`);
    return response?.data ?? [];
  },

  /**
   * Ajoute un média à la playlist à une position donnée.
   * @param {number} playlistId
   * @param {number} mediaId
   * @param {number} ordre
   */
  async attachMedia(playlistId, mediaId, ordre) {
    const response = await httpClient.post(
      `/api/playlists/${playlistId}/medias`,
      { media_id: mediaId, ordre },
      { headers: adminHeaders() },
    );
    return response?.data;
  },

  /**
   * Change la position d'un média dans la playlist.
   * @param {number} playlistId
   * @param {number} mediaId
   * @param {number} ordre
   */
  async updateOrdre(playlistId, mediaId, ordre) {
    const response = await httpClient.put(
      `/api/playlists/${playlistId}/medias/${mediaId}`,
      { ordre },
      { headers: adminHeaders() },
    );
    return response?.data;
  },

  /**
   * Retire un média de la playlist.
   * @param {number} playlistId
   * @param {number} mediaId
   */
  async detachMedia(playlistId, mediaId) {
    await httpClient.delete(`/api/playlists/${playlistId}/medias/${mediaId}`, { headers: adminHeaders() });
  },
};
