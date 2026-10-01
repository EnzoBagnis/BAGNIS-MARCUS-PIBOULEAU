/* ============================================================================
   recurrence.js — génération des occurrences d'une réservation récurrente
   ----------------------------------------------------------------------------
   Logique 100 % côté client : à partir d'un créneau de base (la demi-journée
   glissée dans le calendrier) et d'une configuration façon « Agenda Samsung »,
   on déroule la liste des dates à réserver. La création effective (un POST par
   occurrence) reste pilotée par AgendaPage via le service agenda.

   Aucune dépendance au DOM ici → testable et réutilisable.
   ========================================================================== */

import {
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfDay,
  endOfDay,
  isSameDay,
  getDate,
} from 'date-fns';

/** Plafond de sécurité : jamais plus d'occurrences que ça, quelle que soit la config. */
export const MAX_OCCURRENCES = 300;

/**
 * jour ISO de la semaine : Lundi = 1 … Dimanche = 7 (date-fns/JS renvoie 0 pour
 * dimanche, ce qui casse les tris ; on normalise sur la convention ISO).
 */
export function isoWeekday(date) {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

/**
 * Fin de l'année scolaire française « courante » pour une date donnée.
 * En France, les grandes vacances débutent le 1er samedi de juillet : le dernier
 * jour de classe est donc le vendredi qui précède. On borne la récurrence à ce
 * vendredi (le hall n'accueille plus de cours ensuite).
 *
 * Ex. : une base en juin 2026 → fin = vendredi 3 juillet 2026.
 *       une base en octobre 2025 → fin = vendredi 3 juillet 2026.
 */
export function schoolYearEnd(base) {
  const year = base.getFullYear();
  const month = base.getMonth(); // 0 = janvier … 11 = décembre
  // À partir d'août (7), on bascule sur l'année scolaire qui se termine l'été suivant.
  const endYear = month >= 7 ? year + 1 : year;
  // 1er samedi de juillet (6 = juillet), puis on recule d'un jour → vendredi.
  const julyFirst = new Date(endYear, 6, 1);
  const offsetToSaturday = (6 - julyFirst.getDay() + 7) % 7;
  const lastSchoolDay = 1 + offsetToSaturday - 1; // vendredi précédant le 1er samedi
  return new Date(endYear, 6, lastSchoolDay, 23, 59, 59, 999);
}

/**
 * Borne haute (date incluse) selon le mode de fin choisi. Toujours plafonnée à
 * la fin de l'année scolaire : le hall n'est pas réservable au-delà.
 */
export function resolveCeiling(end, base) {
  const schoolEnd = schoolYearEnd(base);
  if (end && end.type === 'until' && end.until) {
    const until = parseISODate(end.until);
    if (until) {
      const cap = endOfDay(until);
      return cap < schoolEnd ? cap : schoolEnd;
    }
  }
  // 'schoolYear' et 'count' : on déroule jusqu'à la fin d'année (le count
  // tronquera ensuite la liste au nombre demandé).
  return schoolEnd;
}

/** Parse une date « YYYY-MM-DD » en Date locale (minuit), ou null si invalide. */
export function parseISODate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Reporte l'heure (heures/minutes) du créneau de base sur un jour donné. */
function applyTimeOfDay(day, base) {
  const d = new Date(day);
  d.setHours(base.getHours(), base.getMinutes(), 0, 0);
  return d;
}

/**
 * Nième occurrence d'un jour de semaine dans un mois (ex. « 2e mardi »).
 * @param {number} year  année pleine
 * @param {number} month index du mois 0-11
 * @param {number} dow   jour JS visé (0 = dim … 6 = sam)
 * @param {number} nth   rang (1 = premier, 2 = deuxième, …)
 * @returns {Date|null}  null si le rang n'existe pas ce mois-là (ex. 5e lundi)
 */
export function nthWeekdayOfMonth(year, month, dow, nth) {
  const firstDow = new Date(year, month, 1).getDay();
  const day = 1 + ((dow - firstDow + 7) % 7) + (nth - 1) * 7;
  const date = new Date(year, month, day);
  return date.getMonth() === month ? date : null;
}

/**
 * Déroule la liste des occurrences (créneaux de début) à réserver.
 *
 * @param {object}   config              configuration de récurrence
 * @param {'daily'|'weekly'|'monthly'} config.frequency
 * @param {number}   [config.interval]   « tous les N jours/semaines/mois »
 * @param {number[]} [config.weekdays]   jours ISO (1=Lun…7=Dim) pour l'hebdo
 * @param {'dayOfMonth'|'weekdayOfMonth'|'selectedDates'} [config.monthlyMode]
 * @param {string[]} [config.selectedDates]  dates « YYYY-MM-DD » (mode mensuel custom)
 * @param {object}   config.end          { type:'schoolYear'|'count'|'until', count?, until? }
 * @param {Date}     baseDate            créneau de base (jour + heure de la demi-journée)
 * @param {object}   [options]
 * @param {(day: Date) => boolean} [options.exclude]  jours à ignorer (week-ends, fériés…)
 * @returns {Date[]} occurrences triées, dédoublonnées par jour
 */
export function generateOccurrences(config, baseDate, options = {}) {
  const exclude = options.exclude || (() => false);
  const base = new Date(baseDate);
  const baseStart = startOfDay(base);
  const ceiling = resolveCeiling(config.end, base);
  const occurrences = [];

  // Ajoute un jour candidat s'il est valide (dans la fenêtre + non exclu).
  const push = (day) => {
    if (!day) return false;
    const d = startOfDay(day);
    if (d < baseStart || d > ceiling) return false;
    if (exclude(d)) return false;
    occurrences.push(applyTimeOfDay(d, base));
    return true;
  };

  const interval = Math.max(1, parseInt(config.interval, 10) || 1);

  if (config.frequency === 'daily') {
    let cursor = new Date(baseStart);
    while (occurrences.length < MAX_OCCURRENCES && cursor <= ceiling) {
      push(cursor);
      cursor = addDays(cursor, interval);
    }
  } else if (config.frequency === 'weekly') {
    const days = (config.weekdays && config.weekdays.length
      ? [...config.weekdays]
      : [isoWeekday(base)]
    ).sort((a, b) => a - b);
    let weekCursor = startOfWeek(base, { weekStartsOn: 1 });
    while (occurrences.length < MAX_OCCURRENCES && weekCursor <= ceiling) {
      for (const wd of days) {
        if (occurrences.length >= MAX_OCCURRENCES) break;
        push(addDays(weekCursor, wd - 1)); // wd 1..7 → décalage Lun..Dim
      }
      weekCursor = addWeeks(weekCursor, interval);
    }
  } else if (config.frequency === 'monthly') {
    if (config.monthlyMode === 'selectedDates') {
      for (const iso of config.selectedDates || []) {
        if (occurrences.length >= MAX_OCCURRENCES) break;
        push(parseISODate(iso));
      }
    } else {
      let monthCursor = new Date(base.getFullYear(), base.getMonth(), 1);
      const dom = getDate(base);
      const dow = base.getDay();
      const nth = Math.ceil(dom / 7); // rang du jour de semaine dans son mois
      while (occurrences.length < MAX_OCCURRENCES && monthCursor <= ceiling) {
        let day = null;
        if (config.monthlyMode === 'weekdayOfMonth') {
          day = nthWeekdayOfMonth(monthCursor.getFullYear(), monthCursor.getMonth(), dow, nth);
        } else {
          // 'dayOfMonth' : même quantième ; on saute les mois sans ce jour (ex. 31).
          const candidate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), dom);
          day = candidate.getMonth() === monthCursor.getMonth() ? candidate : null;
        }
        push(day);
        monthCursor = addMonths(monthCursor, interval);
      }
    }
  }

  // Tri chronologique + dédoublonnage par jour (les dates choisies à la main
  // peuvent se recouper, ou un même jour revenir via deux règles).
  occurrences.sort((a, b) => a - b);
  const unique = [];
  for (const occ of occurrences) {
    if (!unique.some((u) => isSameDay(u, occ))) unique.push(occ);
  }

  // Fin « après N répétitions » : on tronque au nombre demandé.
  if (config.end && config.end.type === 'count') {
    const count = Math.max(1, parseInt(config.end.count, 10) || 1);
    return unique.slice(0, count);
  }

  return unique;
}
