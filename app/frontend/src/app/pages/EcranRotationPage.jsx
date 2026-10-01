import { useState, useEffect, useCallback } from 'react';
import { Views } from 'react-big-calendar';
import AgendaPage from '@/features/agenda/pages/AgendaPage.jsx';
import InformationPage from '@/features/information/pages/InformationPage.jsx';

// Séquence ordonnée du mode rotation :
//   1. agenda vue « jour »    pendant AGENDA_DAY_DURATION_MS
//   2. agenda vue « semaine » pendant AGENDA_WEEK_DURATION_MS
//   3. agenda vue « mois »    pendant AGENDA_MONTH_DURATION_MS
//   4. information : toute la playlist, chaque média affiché toute sa durée
//      (fin signalée par onCycleComplete), puis on repart à l'étape 1.
const AGENDA_DAY_DURATION_MS = 30 * 1000;    // 30 s sur la vue Jour
const AGENDA_WEEK_DURATION_MS = 30 * 1000;   // 30 s sur la vue Semaine
const AGENDA_MONTH_DURATION_MS = 30 * 1000;  // 30 s sur la vue Mois

// Garde-fou de la phase information : normalement, on rebascule sur l'agenda dès
// que la playlist a fait UN tour complet (rien n'est coupé) via onCycleComplete.
// Ce délai n'intervient que si ce signal n'arrive jamais (erreur réseau,
// fallback prolongé…), pour ne pas rester bloqué indéfiniment sur l'information.
const INFO_SAFETY_MS = 10 * 60 * 1000; // 10 minutes

// Durée du fondu enchaîné entre les deux pages.
const FADE_MS = 600;

// Style d'un panneau empilé : on garde les DEUX pages montées et on masque
// l'inactive (visibility/opacity plutôt que display:none, pour que le calendrier
// react-big-calendar conserve ses dimensions et ne se remesure pas à 0).
// La transition d'opacité crée le fondu enchaîné ; pour l'inactive, on retarde
// le passage en visibility:hidden jusqu'à la fin du fondu afin qu'elle reste
// visible pendant toute la disparition.
const paneStyle = (active) => ({
  position: 'absolute',
  inset: 0,
  visibility: active ? 'visible' : 'hidden',
  opacity: active ? 1 : 0,
  zIndex: active ? 2 : 1,
  pointerEvents: active ? 'auto' : 'none',
  transition: active
    ? `opacity ${FADE_MS}ms ease`
    : `opacity ${FADE_MS}ms ease, visibility 0s linear ${FADE_MS}ms`,
});

/**
 * Mode rotation pour l'écran kiosque. Enchaîne, dans cet ordre :
 *   agenda (vue jour) → agenda (vue semaine) → agenda (vue mois) → information (playlist complète)
 * puis reboucle. Chaque étape dure le temps prévu ; l'information n'est jamais
 * coupée : on attend qu'elle ait fait un tour complet avant de revenir à l'agenda.
 *
 * Les deux pages (Agenda et Information) restent montées en permanence : leurs
 * données sont chargées une seule fois (puis rafraîchies en arrière-plan), ce
 * qui rend les bascules instantanées, sans écran de chargement.
 *
 * Les deux pages détectent déjà le contexte kiosque via l'URL (/ecran), donc
 * l'Agenda s'affiche en lecture seule et l'Information en diffusion.
 */
export default function EcranRotationPage() {
  // Phase courante : 'day' | 'week' | 'month' | 'info'
  const [phase, setPhase] = useState('day');

  // Étape 1 : vue Jour, durée fixe → vue Semaine.
  useEffect(() => {
    if (phase !== 'day') return;
    const timerId = setTimeout(() => setPhase('week'), AGENDA_DAY_DURATION_MS);
    return () => clearTimeout(timerId);
  }, [phase]);

  // Étape 2 : vue Semaine, durée fixe → vue Mois.
  useEffect(() => {
    if (phase !== 'week') return;
    const timerId = setTimeout(() => setPhase('month'), AGENDA_WEEK_DURATION_MS);
    return () => clearTimeout(timerId);
  }, [phase]);

  // Étape 3 : vue Mois, durée fixe → information.
  useEffect(() => {
    if (phase !== 'month') return;
    const timerId = setTimeout(() => setPhase('info'), AGENDA_MONTH_DURATION_MS);
    return () => clearTimeout(timerId);
  }, [phase]);

  // Étape 4 : information. Pilotée par la fin de playlist (onCycleComplete) ;
  // le timer ci-dessous n'est qu'un garde-fou si ce signal n'arrive jamais.
  useEffect(() => {
    if (phase !== 'info') return;
    const timerId = setTimeout(() => setPhase('day'), INFO_SAFETY_MS);
    return () => clearTimeout(timerId);
  }, [phase]);

  // Un tour complet de playlist vient d'être affiché → on repart à la vue Jour.
  const handleInfoCycleComplete = useCallback(() => {
    setPhase('day');
  }, []);

  const isAgenda = phase === 'day' || phase === 'week' || phase === 'month';
  const agendaView = phase === 'month' ? Views.MONTH : phase === 'week' ? Views.WORK_WEEK : Views.DAY;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={paneStyle(isAgenda)}>
        <AgendaPage forcedView={agendaView} />
      </div>
      <div style={paneStyle(phase === 'info')}>
        <InformationPage
          active={phase === 'info'}
          onCycleComplete={handleInfoCycleComplete}
        />
      </div>
    </div>
  );
}
