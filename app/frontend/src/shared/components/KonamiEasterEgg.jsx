import { useCallback } from 'react';
import { useKonamiCode } from '@/shared/hooks/useKonamiCode';

/**
 * Easter egg : à la saisie du Konami code (clavier ou télécommande TV), toute
 * l'interface se met à tourner sur elle-même, en continu et à vitesse constante.
 * Le code agit comme un interrupteur : on le rejoue pour arrêter la rotation.
 *
 * Le composant ne rend rien : il ne fait que basculer une classe sur `<body>` ;
 * toute l'animation est portée par `styles/konami.css`.
 */
export default function KonamiEasterEgg() {
  const basculer = useCallback(() => {
    document.body.classList.toggle('konami-spin');
  }, []);

  useKonamiCode(basculer);

  return null;
}
