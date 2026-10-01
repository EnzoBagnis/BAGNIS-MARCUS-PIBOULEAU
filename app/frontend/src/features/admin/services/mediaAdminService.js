import { httpClient } from '../../../infrastructure/http/httpClient';
import { API_BASE_URL } from '../../../infrastructure/http/config';
import { adminHeaders } from './adminHttp';

/**
 * Service d'administration des médias (CRUD + upload de fichier).
 * Les payloads échangés avec l'API sont en snake_case (cf. MediaDTO côté PHP).
 */
export const mediaAdminService = {
  /**
   * Liste tous les médias (actifs et inactifs).
   * @returns {Promise<import('../../../core/entities/Media').Media[]>}
   */
  async list() {
    const response = await httpClient.get('/api/medias');
    return response?.data ?? [];
  },

  /**
   * Envoie un fichier (image / vidéo) et récupère son URL publique.
   * @param {File} file
   * @returns {Promise<{ url: string, mime_type: string, size_bytes: number }>}
   */
  async uploadFile(file) {
    const form = new FormData();
    form.append('file', file);
    const response = await httpClient.post('/api/medias/upload', form, { headers: adminHeaders() });
    return response?.data;
  },

  /**
   * Crée un média à partir d'un payload déjà normalisé en snake_case.
   * @param {object} payload
   */
  async create(payload) {
    const response = await httpClient.post('/api/medias', payload, { headers: adminHeaders() });
    return response?.data;
  },

  /**
   * Met à jour partiellement un média (PATCH-like via PUT).
   * @param {number} id
   * @param {object} payload
   */
  async update(id, payload) {
    const response = await httpClient.put(`/api/medias/${id}`, payload, { headers: adminHeaders() });
    return response?.data;
  },

  /**
   * Active ou désactive un média.
   * @param {number} id
   * @param {boolean} actif
   */
  async setActif(id, actif) {
    return this.update(id, { actif });
  },

  /**
   * Supprime définitivement un média.
   * @param {number} id
   */
  async remove(id) {
    await httpClient.delete(`/api/medias/${id}`, { headers: adminHeaders() });
  },

  /**
   * Préfixe une URL relative renvoyée par le backend pour obtenir une URL absolue.
   * @param {string|null} path
   * @returns {string}
   */
  formatMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${baseUrl}/${cleanPath}`;
  },
};
