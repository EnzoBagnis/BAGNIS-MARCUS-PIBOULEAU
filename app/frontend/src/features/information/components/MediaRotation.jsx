import MediaPlayer from './MediaPlayer.jsx';
import FallbackScreen from './FallbackScreen.jsx';
import { useMediaRotation } from '../hooks/useMediaRotation.js';
import './MediaRotation.css';

/**
 * Composant de rotation automatique des médias d'une playlist.
 *
 * Enchaîne les médias en respectant `duree_sec`, gère les vidéos
 * (événement `ended`), les erreurs (skip auto), la playlist vide,
 * et applique un fondu enchaîné entre chaque transition.
 *
 * @param {Object} props
 * @param {import('@/core/entities/Media.js').Media[]} props.medias
 * @param {boolean} [props.active] - false met la rotation en pause (mode rotation).
 * @param {() => void} [props.onCycleComplete] - appelé après un tour complet de playlist.
 */
export default function MediaRotation({ medias = [], active = true, onCycleComplete }) {
  const {
    currentMedia,
    isTransitioning,
    notifyVideoEnded,
    notifyError,
  } = useMediaRotation(medias, { active, onCycleComplete });

  // Playlist vide ou aucun média courant → écran de repli
  if (!currentMedia) {
    return (
      <div className="media-rotation__empty">
        <FallbackScreen />
      </div>
    );
  }

  const slideClass = [
    'media-rotation__slide',
    isTransitioning ? 'media-rotation__slide--fade-out' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="media-rotation">
      <div className={slideClass}>
        <MediaPlayer
          media={currentMedia}
          objectFit="contain"
          onEnded={notifyVideoEnded}
          onError={(msg) => {
            // eslint-disable-next-line no-console
            console.warn('[MediaRotation] erreur média :', msg);
            notifyError();
          }}
        />
      </div>
    </div>
  );
}
