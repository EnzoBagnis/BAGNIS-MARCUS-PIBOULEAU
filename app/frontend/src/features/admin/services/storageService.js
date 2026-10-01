import { httpClient } from '../../../infrastructure/http/httpClient';
import { adminHeaders } from './adminHttp';

/**
 * Service d'occupation disque (quota AlwaysData).
 * La route est réservée admin : on joint l'en-tête d'autorisation.
 */
export const storageService = {
  /**
   * @returns {Promise<{
   *   quota_bytes: number, used_bytes: number, free_bytes: number,
   *   percent_used: number, breakdown: { uploads: number, database: number }
   * }>}
   */
  async get() {
    const response = await httpClient.get('/api/admin/storage', { headers: adminHeaders() });
    return response?.data;
  },
};

/**
 * Formate un nombre d'octets en unité lisible (o / Ko / Mo / Go).
 * @param {number|null|undefined} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes == null) return '—';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const decimals = unit === 0 || value >= 10 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unit]}`;
}
