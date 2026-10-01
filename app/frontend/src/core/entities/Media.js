/**
 * Types et helpers métier pour les médias d'affichage.
 * Côté frontend on travaille avec les payloads JSON renvoyés par l'API
 * (clés en snake_case, cf. MediaDTO::toArray() côté PHP).
 */

/**
 * @typedef {'image' | 'video' | 'texte'} MediaType
 */

/**
 * @typedef {Object} Media
 * @property {number}      id
 * @property {string}      titre
 * @property {MediaType}   type
 * @property {string|null} url_fichier   Pour image/video : URL du fichier
 *                                       (obligatoire). NULL pour texte.
 * @property {string|null} contenu_texte Pour texte : message court affiché
 *                                       plein écran (obligatoire). NULL pour
 *                                       image/video.
 * @property {number|null} duree_sec     Durée en secondes (null possible sauf
 *                                       pour les vidéos qui ont toujours une durée).
 * @property {boolean}     actif
 * @property {string}      date_ajout    ISO 8601
 */

/** @type {Record<string, MediaType>} */
export const MEDIA_TYPES = Object.freeze({
  IMAGE: 'image',
  VIDEO: 'video',
  TEXTE: 'texte',
});

/**
 * Décide si la valeur d'`url_fichier` d'un média texte doit être traitée
 * comme une URL à charger (fetch) ou comme un contenu inline directement
 * affichable. Heuristique simple :
 *   - commence par http://, https://, /, ./ → URL
 *   - sinon → inline
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isFetchableUrl(value) {
  if (typeof value !== 'string') return false;
  return /^(https?:\/\/|\/|\.\/)/.test(value.trim());
}
