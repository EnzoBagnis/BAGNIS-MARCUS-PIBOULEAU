import { useEffect, useMemo, useRef, useState } from 'react';
import { MEDIA_TYPES, isFetchableUrl } from '@/core/entities/Media.js';
import './MediaPlayer.css';

/**
 * Composant générique d'affichage plein écran d'un média (image / vidéo / texte).
 * Réutilisé par la rotation automatique (issue #50).
 *
 * Comportements :
 *  - image : <img> plein écran avec object-fit configurable
 *  - vidéo : <video> autoplay + muted (kiosque), pas de contrôles
 *  - texte : zone plein écran, grande typo, contraste élevé
 *
 * États gérés : loading (pendant le chargement), error (média introuvable / KO).
 *
 * Événements émis :
 *  - onEnded : appelé en fin de lecture vidéo (utile pour enchaîner en rotation).
 *              Pour image/texte, ce callback n'est PAS appelé automatiquement,
 *              la rotation pilotera elle-même le timer à partir de `duree_sec`.
 *  - onLoad  : appelé une fois le média prêt à être affiché.
 *  - onError : appelé avec un message en cas d'échec.
 *
 * @param {Object} props
 * @param {import('@/core/entities/Media.js').Media} props.media
 * @param {'contain' | 'cover'} [props.objectFit='contain']
 * @param {() => void}            [props.onEnded]
 * @param {() => void}            [props.onLoad]
 * @param {(message: string) => void} [props.onError]
 */
export default function MediaPlayer({
  media,
  objectFit = 'contain',
  onEnded,
  onLoad,
  onError,
}) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Reset synchrone du status quand le média change. On le fait pendant le
  // render (pattern React officiel) plutôt que dans un useEffect : sinon
  // l'effet parent écraserait l'`onReady()` déjà émis par le composant
  // enfant (Image/Video/Text), qui s'exécute AVANT l'effet parent.
  const lastMediaKeyRef = useRef(null);
  const currentMediaKey = media
    ? `${media.id}|${media.url_fichier ?? ''}|${media.contenu_texte ?? ''}|${media.type}`
    : null;
  if (lastMediaKeyRef.current !== currentMediaKey) {
    lastMediaKeyRef.current = currentMediaKey;
    if (status !== 'loading') setStatus('loading');
    if (errorMessage) setErrorMessage('');
  }

  const handleReady = () => {
    setStatus('ready');
    onLoad?.();
  };

  const handleError = (message) => {
    setStatus('error');
    setErrorMessage(message);
    onError?.(message);
  };

  if (!media) {
    return null;
  }

  const containerClass = `media-player media-player--${objectFit}`;

  return (
    <div className={containerClass} role="region" aria-label={media.titre}>
      {renderMedia(media, { onReady: handleReady, onError: handleError, onEnded })}

      {status === 'loading' && (
        <div className="media-player__overlay" aria-live="polite">
          <div className="media-player__spinner" aria-hidden="true" />
          <p>Chargement de « {media.titre} »…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="media-player__overlay media-player__overlay--error" role="alert">
          <h2>Impossible d'afficher ce média</h2>
          <p>{errorMessage || 'Une erreur est survenue.'}</p>
          <p>« {media.titre} »</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function renderMedia(media, handlers) {
  switch (media.type) {
    case MEDIA_TYPES.IMAGE:
      return <ImageMedia media={media} {...handlers} />;
    case MEDIA_TYPES.VIDEO:
      return <VideoMedia media={media} {...handlers} />;
    case MEDIA_TYPES.TEXTE:
      return <TextMedia media={media} {...handlers} />;
    default:
      // Sécurité : type inconnu → on déclenche l'erreur
      handlers.onError(`Type de média inconnu : "${media.type}".`);
      return null;
  }
}

/* ------------------------------------------------------------------
   Image
   ------------------------------------------------------------------ */
function ImageMedia({ media, onReady, onError }) {
  return (
    <img
      className="media-player__image"
      src={media.url_fichier}
      alt={media.titre}
      draggable={false}
      onLoad={onReady}
      onError={() => onError(`Image introuvable : ${media.url_fichier}`)}
    />
  );
}

/* ------------------------------------------------------------------
   Vidéo
   ------------------------------------------------------------------ */
function VideoMedia({ media, onReady, onError, onEnded }) {
  // Orientation du média, déduite des dimensions intrinsèques une fois les
  // métadonnées chargées : 'landscape' (large) ou 'portrait' (haut).
  //
  // Pourquoi en JS plutôt qu'en pur CSS ? Le navigateur Vidaa des TV Hisense
  // (comme Tizen/WebOS anciens) ignore `object-fit` sur les <video> ET applique
  // `max-width`/`max-height` indépendamment sans préserver le ratio : une vidéo
  // portrait se retrouvait étirée en « ultra-wide ». En ne contraignant qu'UN
  // seul axe (celui qui déborde) et en laissant l'autre en `auto`, le ratio
  // intrinsèque est toujours respecté, même sur ces navigateurs.
  const [orientation, setOrientation] = useState(null); // null | 'landscape' | 'portrait'

  const handleLoadedMetadata = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (videoWidth > 0 && videoHeight > 0) {
      setOrientation(videoHeight > videoWidth ? 'portrait' : 'landscape');
    }
  };

  const handleCanPlay = (event) => {
    const video = event.currentTarget;
    onReady();

    // Filet de sécurité pour les Smart TV qui ignorent parfois l'attribut
    // `autoPlay` : si la vidéo est toujours en pause une fois prête, on
    // tente un play() manuel. On ignore les AbortError (typiques en mode
    // dev avec React.StrictMode qui démonte/remonte le composant).
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          if (err && err.name === 'AbortError') return;
          // eslint-disable-next-line no-console
          console.warn('[MediaPlayer] play() refusé :', err);
          onError(
            'Lecture automatique refusée par le navigateur. ' +
            'Vérifie que la vidéo est bien `muted` et que le format est H.264.'
          );
        });
      }
    }
  };

  const handleError = (event) => {
    const code = event.currentTarget.error?.code;
    onError(
      `Vidéo illisible (codec non supporté ?) — code MediaError ${code ?? '?'} — ${media.url_fichier}`,
    );
  };

  const videoClass = orientation
    ? `media-player__video media-player__video--${orientation}`
    : 'media-player__video';

  return (
    <video
      // `key` force un vrai remount quand on change de média :
      // évite tout résidu d'état (pause/buffer) du média précédent.
      key={media.id}
      className={videoClass}
      src={media.url_fichier}
      autoPlay
      muted
      playsInline
      preload="auto"
      controls={false}
      onLoadedMetadata={handleLoadedMetadata}
      onCanPlay={handleCanPlay}
      onError={handleError}
      onEnded={() => onEnded?.()}
    />
  );
}

/* ------------------------------------------------------------------
   Texte
   ------------------------------------------------------------------ */
function TextMedia({ media, onReady, onError }) {
  const [content, setContent] = useState(null);

  // Depuis l'issue #47, le contenu texte vit dans `contenu_texte`.
  // `url_fichier` reste supporté en fallback pour pointer vers un .txt distant.
  const inlineText = media.contenu_texte ?? null;
  const fetchUrl = useMemo(
    () => (isFetchableUrl(media.url_fichier) ? media.url_fichier : null),
    [media.url_fichier],
  );

  useEffect(() => {
    let cancelled = false;

    if (!fetchUrl) {
      if (inlineText === null || inlineText === '') {
        onError('Média texte sans contenu (`contenu_texte` est vide).');
        return () => {};
      }
      setContent(inlineText);
      onReady();
      return () => {};
    }

    setContent(null);
    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        setContent(text);
        onReady();
      })
      .catch((err) => {
        if (cancelled) return;
        onError(`Texte introuvable (${err.message}) : ${fetchUrl}`);
      });

    return () => {
      cancelled = true;
    };
    // onReady/onError sont stables (refs vers les handlers du parent), on volontairement
    // les omet pour éviter une boucle de re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl, inlineText]);

  if (content === null) return null;

  // Le `titre` est une métadonnée d'administration (identification du média) :
  // on n'affiche QUE le contenu à l'écran, pas le titre.
  return (
    <div className="media-player__text">
      <p className="media-player__text-body">{content}</p>
    </div>
  );
}
