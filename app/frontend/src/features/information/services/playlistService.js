import { httpClient } from '../../../infrastructure/http/httpClient';
import { API_BASE_URL } from '../../../infrastructure/http/config';

export const playlistService = {
  /**
   * Fetches the currently active playlist and its media.
   * Ensures the medias are ordered by 'ordre' and URLs are formatted.
   * @returns {Promise<any>}
   */
  async fetchActivePlaylist() {
    const response = await httpClient.get('/api/playlists/active');
    
    let data = response.data || response;
    
    if (data && Array.isArray(data.medias)) {
      // Sort by order and format URLs
      data.medias = data.medias
        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
        .map(media => ({
          ...media,
          url_fichier: media.url_fichier ? this.formatMediaUrl(media.url_fichier) : null
        }));
    }
    
    return data;
  },

  /**
   * Formats a media URL, prefixing with the server address if it's a relative path.
   * @param {string} path - The media path from the backend
   * @returns {string} - The absolute URL
   */
  formatMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Remove trailing slash from base url and leading slash from path
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    
    return `${baseUrl}/${cleanPath}`;
  }
};
