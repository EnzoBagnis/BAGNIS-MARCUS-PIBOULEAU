import React from 'react';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
// 1. Les imports principaux + l'addon Drag and Drop
import { Calendar, dateFnsLocalizer, Views, Navigate } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { machineColor } from '../utils/machineColors.js';
import '../styles/MachineCalendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // Style obligatoire pour le DnD
import Holidays from 'date-holidays';

const locales = {
  'fr': fr,
};
const joursFeriesFR = new Holidays('FR');

// Mode kiosque : durée d'affichage de chaque vue (semaine / jour) avant de
// basculer automatiquement sur l'autre. Permet de montrer les deux échelles.
const KIOSK_VIEW_ROTATION_MS = 20 * 1000;

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// On crée le composant enrichi avec le Drag and Drop
const DragAndDropCalendar = withDragAndDrop(Calendar);

// CORRECTION ICI : Toutes les props doivent être dans les accolades des paramètres
export default function MachineCalendar({
  events,
  onEventDrop,
  dragFromOutsideItem,
  onDropFromOutside,
  onSelectEvent,
  readOnly = false,
  // Vue imposée de l'extérieur (mode rotation piloté). Quand elle est définie,
  // elle prend le pas sur l'état interne et désactive la rotation automatique.
  forcedView = null
}) {

  const { min, max } = useMemo(() => {
    const minDate = new Date();
    minDate.setHours(8, 0, 0); // La grille commencera à 08h00
    const maxDate = new Date();
    maxDate.setHours(18, 0, 0); // La grille finira à 18h00
    return { min: minDate, max: maxDate };
  }, []);

  // Vue et date contrôlées : nécessaires pour retrouver la date d'une colonne survolée.
  // - Mode kiosque (lecture seule) : on démarre sur « Jour » (l'écran enchaînera
  //   ensuite jour → semaine).
  // - Sur téléphone, la grille hebdo est illisible : on démarre aussi sur « Jour ».
  const [view, setView] = useState(() =>
    readOnly || (typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches)
      ? Views.DAY
      : Views.WORK_WEEK
  );

  // Vue effectivement affichée : la vue imposée (mode rotation piloté) l'emporte
  // sur l'état interne.
  const effectiveView = forcedView ?? view;

  // Sécurité : on ne transmet au calendrier que des événements valides et toujours
  // dotés d'un titre. Évite le crash « Cannot read properties of undefined (reading
  // 'title') » si la liste contient une entrée nulle/incomplète.
  const safeEvents = useMemo(
    () =>
      (Array.isArray(events) ? events : [])
        .filter((evt) => evt && evt.start && evt.end)
        .map((evt) => ({ ...evt, title: evt.title ?? '' })),
    [events]
  );
  const [date, setDate] = useState(new Date());

  // En mode kiosque autonome (/ecran/agenda), on fait défiler automatiquement
  // les vues « jour » puis « semaine » sans intervention. Désactivé quand une
  // vue est imposée de l'extérieur (mode rotation, qui pilote la séquence).
  useEffect(() => {
    if (!readOnly || forcedView) return;
    const intervalId = setInterval(() => {
      setView((prev) => (prev === Views.DAY ? Views.WORK_WEEK : Views.DAY));
    }, KIOSK_VIEW_ROTATION_MS);
    return () => clearInterval(intervalId);
  }, [readOnly, forcedView]);

  // Bloc demi-journée actuellement survolé pendant un glisser-déposer : { date, period: 'morning'|'afternoon' }
  const [hoverBlock, setHoverBlock] = useState(null);
  const containerRef = useRef(null);

  // Pendant le glisser d'une machine, on déduit la colonne (jour) + l'heure sous le curseur
  // afin de surligner le bloc horaire visé (le fantôme natif, lui, est masqué en CSS).
  const handleDragOver = useCallback((e) => {
    if (readOnly || view !== Views.WORK_WEEK || !containerRef.current) return;
    e.preventDefault(); // autorise le drop natif
    const col = e.target.closest && e.target.closest('.rbc-day-slot');
    if (!col) {
      if (hoverBlock) setHoverBlock(null);
      return;
    }
    const slots = containerRef.current.querySelectorAll('.rbc-day-slot');
    const idx = Array.prototype.indexOf.call(slots, col);
    if (idx < 0) return;

    // Semaine de travail = lundi → vendredi : la date de la colonne se déduit de son index.
    const dayDate = addDays(startOfWeek(date, { weekStartsOn: 1 }), idx);

    // Position verticale → heure (grille 08h-18h, soit 10h de haut).
    const rect = col.getBoundingClientRect();
    const frac = (e.clientY - rect.top) / rect.height;
    const hour = Math.floor(8 + frac * 10);

    setHoverBlock((prev) =>
      prev && isSameDay(prev.date, dayDate) && prev.hour === hour
        ? prev
        : { date: dayDate, hour }
    );
  }, [readOnly, view, date, hoverBlock]);

  const handleDragLeave = useCallback((e) => {
    if (!containerRef.current || !containerRef.current.contains(e.relatedTarget)) {
      setHoverBlock(null);
    }
  }, []);

  const clearHover = useCallback(() => setHoverBlock(null), []);

  // Couleurs via variables CSS (var(--…)) pour suivre le thème actif (clair/sombre).
  const customSlotPropGetter = (slotDate) => {
    if (joursFeriesFR.isHoliday(slotDate)) {
      return {
        style: {
          backgroundColor: 'var(--color-surface-2)',
          cursor: 'not-allowed',
          opacity: 0.6
        },
      };
    }
    const hour = slotDate.getHours();
    if (hour >= 12 && hour < 14) {
      return {
        style: {
          backgroundColor: 'var(--color-surface-2)',
          cursor: 'not-allowed',
        },
      };
    }
    // Surlignage du bloc horaire survolé pendant le glisser-déposer (4h par défaut, capé à 18h)
    if (hoverBlock && isSameDay(slotDate, hoverBlock.date)) {
      const startH = hoverBlock.hour;
      const endH = Math.min(startH + 4, 18);
      if (hour >= startH && hour < endH) {
        return {
          style: {
            backgroundColor: 'var(--color-primary-soft)',
            boxShadow: 'inset 0 0 0 1px var(--color-primary)',
          },
        };
      }
    }
    return {};
  };

  // Couleur d'identité par machine : on n'écrase pas les règles `!important` du
  // CSS (.rbc-event) — on alimente simplement les variables --event-* que ces
  // règles consomment déjà. Chaque réservation prend ainsi la teinte de sa machine.
  const eventPropGetter = (event) => {
    if (event?.machine_id == null) return {};
    const { bg, border, text } = machineColor(event.machine_id);
    return {
      style: {
        '--event-bg': bg,
        '--event-border': border,
        '--event-text': text,
      },
    };
  };

  const customDayPropGetter = (date) => {
    if (joursFeriesFR.isHoliday(date)) {
      return {
        style: {
          backgroundColor: 'var(--color-surface-2)',
          cursor: 'not-allowed',
          opacity: 0.6
        }
      }
    }
    return {};
  };

  // --- NOUVEAUTÉ : La barre d'outils sur-mesure ---
  const CustomToolbar = (toolbar) => {
    // Fonctions pour déclencher la navigation
    const allerPrecedent = () => toolbar.onNavigate(Navigate.PREVIOUS);
    const allerAujourdhui = () => toolbar.onNavigate(Navigate.TODAY);
    const allerSuivant = () => toolbar.onNavigate(Navigate.NEXT);

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          {/* On a inversé l'ordre ici ! */}
          <button type="button" onClick={allerPrecedent} aria-label="Jour précédent" title="Précédent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button type="button" onClick={allerAujourdhui} aria-label="Aujourd'hui" title="Aujourd'hui">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              {/* Le petit point qui symbolise la date du jour */}
              <circle cx="12" cy="15" r="1.5" fill="currentColor"></circle>
            </svg>
          </button>
          <button type="button" onClick={allerSuivant} aria-label="Jour suivant" title="Suivant">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </span>

        {/* Le titre au centre (ex: "Mai 2026") */}
        <span className="rbc-toolbar-label">{toolbar.label}</span>

        {/* Les boutons de vues (Jour / Semaine) */}
        <span className="rbc-btn-group">
          <button
            type="button"
            className={toolbar.view === Views.DAY ? 'rbc-active' : ''}
            onClick={() => toolbar.onView(Views.DAY)}
          >
            Jour
          </button>
          <button
            type="button"
            className={toolbar.view === Views.WORK_WEEK ? 'rbc-active' : ''}
            onClick={() => toolbar.onView(Views.WORK_WEEK)}
          >
            Semaine
          </button>
          <button
            type="button"
            className={toolbar.view === Views.MONTH ? 'rbc-active' : ''}
            onClick={() => toolbar.onView(Views.MONTH)}
          >
            Mois
          </button>
        </span>
      </div>
    );
  };

  return (
    <div
      className="calendar-container"
      style={{ height: '100%', width: '100%' }}
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={clearHover}
    >

      <DragAndDropCalendar
        localizer={localizer}
        events={safeEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor={(event) => (event && event.title != null ? event.title : '')}
        culture="fr"
        min={min}
        max={max}
        view={effectiveView}
        onView={setView}
        date={date}
        onNavigate={setDate}
        slotPropGetter={customSlotPropGetter}
        dayPropGetter={customDayPropGetter}
        eventPropGetter={eventPropGetter}

        // --- NOUVEAUTÉ : On remplace la barre par défaut par la nôtre ---
        components={{
          toolbar: CustomToolbar,
          event: ({ event }) => (
            <div className="rbc-custom-event">
              <strong className="rbc-custom-event__title">{event.title}</strong>
              {event.description && (
                <span className="rbc-custom-event__desc">{event.description}</span>
              )}
            </div>
          ),
        }}

        // Réservations simultanées sur un même créneau : côte à côte plutôt que
        // superposées (évite le chevauchement illisible quand il y en a plusieurs).
        dayLayoutAlgorithm="no-overlap"

        // Configuration de l'interactivité
        selectable={!readOnly}
        resizable={false}

        // CORRECTION ICI : On passe bien les 3 fonctions d'interactivité au calendrier
        onEventDrop={readOnly ? undefined : onEventDrop}
        dragFromOutsideItem={readOnly ? undefined : dragFromOutsideItem}
        onDropFromOutside={readOnly ? undefined : onDropFromOutside}

        // NOUVEAUTÉ : On écoute le clic sur un événement
        onSelectEvent={onSelectEvent}

        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          work_week: "Semaine",
          day: "Jour",
        }}

        step={60}
        timeslots={1}

        views={[Views.WORK_WEEK, Views.DAY, Views.MONTH]}

        formats={{
          dayFormat: 'EEEE d MMMM',
        }}
        defaultDate={new Date()}
      />

    </div>
  );
}