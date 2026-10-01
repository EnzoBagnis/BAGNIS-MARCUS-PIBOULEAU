import { useEffect, useRef } from 'react';

/**
 * Détecte la saisie du « Konami code » et appelle un callback.
 *
 * Deux variantes sont acceptées pour couvrir le clavier ET la télécommande TV :
 *  - Clavier      : ↑ ↑ ↓ ↓ ← → ← → B A  (séquence historique)
 *  - Télécommande : ↑ ↑ ↓ ↓ ← → ← → OK OK  (les pavés directionnels des
 *                   télécommandes n'ont pas de touches « B »/« A » ; on termine
 *                   donc par deux validations « OK », qui émettent `Enter`).
 *
 * @param {() => void} onUnlock - appelé quand l'une des séquences est complétée.
 */
const SEQUENCE_CLAVIER = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
];

const SEQUENCE_TELECOMMANDE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'Enter', 'Enter',
];

// Anciennes Smart TV : certaines n'exposent pas `event.key` mais un `keyCode`.
const KEYCODES = {
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  13: 'Enter',
};

// Normalise un évènement clavier en un nom de touche comparable.
function toucheDe(event) {
  if (event.key && event.key !== 'Unidentified') {
    // Lettres en minuscule (« A »/« a ») ; flèches et Enter gardent leur nom.
    return event.key.length === 1 ? event.key.toLowerCase() : event.key;
  }
  return KEYCODES[event.keyCode] ?? null;
}

// Le tampon se termine-t-il exactement par `sequence` ?
function seTerminePar(tampon, sequence) {
  if (tampon.length < sequence.length) return false;
  const offset = tampon.length - sequence.length;
  return sequence.every((touche, i) => tampon[offset + i] === touche);
}

export function useKonamiCode(onUnlock) {
  const tamponRef = useRef([]);
  // On garde le callback dans une ref pour ne pas réattacher l'écouteur à
  // chaque rendu (le callback parent peut changer d'identité).
  const callbackRef = useRef(onUnlock);
  callbackRef.current = onUnlock;

  useEffect(() => {
    const longueurMax = Math.max(SEQUENCE_CLAVIER.length, SEQUENCE_TELECOMMANDE.length);

    const handler = (event) => {
      const touche = toucheDe(event);
      if (!touche) return;

      const tampon = tamponRef.current;
      tampon.push(touche);
      if (tampon.length > longueurMax) tampon.shift();

      if (seTerminePar(tampon, SEQUENCE_CLAVIER) || seTerminePar(tampon, SEQUENCE_TELECOMMANDE)) {
        tamponRef.current = [];
        callbackRef.current?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
