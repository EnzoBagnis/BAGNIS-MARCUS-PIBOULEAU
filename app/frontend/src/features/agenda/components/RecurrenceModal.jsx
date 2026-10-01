import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import {
  generateOccurrences,
  schoolYearEnd,
  isoWeekday,
  parseISODate,
} from '../utils/recurrence.js';
import '../styles/RecurrenceModal.css';

// Jours de la semaine travaillés (le hall est fermé le week-end).
const WEEKDAYS = [
  { iso: 1, short: 'L', label: 'Lundi' },
  { iso: 2, short: 'M', label: 'Mardi' },
  { iso: 3, short: 'M', label: 'Mercredi' },
  { iso: 4, short: 'J', label: 'Jeudi' },
  { iso: 5, short: 'V', label: 'Vendredi' },
];

const ORDINAUX = ['', 'premier', 'deuxième', 'troisième', 'quatrième', 'cinquième'];

const toInputDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Fenêtre de configuration d'une réservation récurrente, très inspirée de
 * l'agenda Samsung : fréquence (jour / semaine / mois), paramètres dédiés à
 * chaque fréquence, et condition de fin (année scolaire / N répétitions /
 * jusqu'à une date). Un aperçu en direct annonce le nombre de réservations.
 *
 * @param {object}   props
 * @param {Date}     props.baseDate    créneau de base (jour + demi-journée)
 * @param {string}   props.machineNom  nom de la machine réservée (affichage)
 * @param {(day: Date) => boolean} props.isDayDisabled  jours non réservables (week-ends, fériés)
 * @param {(occurrences: Date[]) => void} props.onConfirm  valide avec la liste des créneaux
 * @param {() => void} props.onClose   ferme sans rien créer
 */
export default function RecurrenceModal({ baseDate, machineNom, isDayDisabled, onConfirm, onClose }) {
  const base = useMemo(() => new Date(baseDate), [baseDate]);

  const [frequency, setFrequency] = useState('weekly');
  const [interval, setIntervalValue] = useState(1);
  const [weekdays, setWeekdays] = useState([isoWeekday(base)]);
  const [monthlyMode, setMonthlyMode] = useState('dayOfMonth');
  const [selectedDates, setSelectedDates] = useState([]);
  const [newDate, setNewDate] = useState(toInputDate(base));

  const [endType, setEndType] = useState('schoolYear');
  const [endCount, setEndCount] = useState(10);
  const [endUntil, setEndUntil] = useState(toInputDate(schoolYearEnd(base)));

  const periode = `à partir de ${String(base.getHours()).padStart(2, '0')}h`;
  const schoolEndLabel = format(schoolYearEnd(base), 'd MMMM yyyy', { locale: fr });
  const dom = base.getDate();
  const dowLabel = format(base, 'EEEE', { locale: fr });
  const nth = Math.ceil(dom / 7);

  // Configuration courante assemblée pour le générateur.
  const config = useMemo(
    () => ({
      frequency,
      interval,
      weekdays,
      monthlyMode,
      selectedDates,
      end:
        endType === 'count'
          ? { type: 'count', count: endCount }
          : endType === 'until'
            ? { type: 'until', until: endUntil }
            : { type: 'schoolYear' },
    }),
    [frequency, interval, weekdays, monthlyMode, selectedDates, endType, endCount, endUntil]
  );

  // Aperçu en direct : on déroule les occurrences à chaque changement.
  const occurrences = useMemo(
    () => generateOccurrences(config, base, { exclude: isDayDisabled }),
    [config, base, isDayDisabled]
  );

  const toggleWeekday = (iso) => {
    setWeekdays((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso].sort((a, b) => a - b)
    );
  };

  const ajouterDate = () => {
    const parsed = parseISODate(newDate);
    if (!parsed) return;
    if (isDayDisabled && isDayDisabled(parsed)) return; // week-end / férié
    setSelectedDates((prev) => (prev.includes(newDate) ? prev : [...prev, newDate].sort()));
  };

  const retirerDate = (iso) => setSelectedDates((prev) => prev.filter((d) => d !== iso));

  const handleConfirm = () => {
    if (occurrences.length === 0) return;
    onConfirm(occurrences);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card rec-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">Réservation récurrente</h3>
        <p className="modal-card__subtitle">
          {machineNom} — {periode}, à partir du {format(base, 'EEEE d MMMM yyyy', { locale: fr })}
        </p>

        <div className="rec-body">
          {/* ── Fréquence ─────────────────────────────────────── */}
          <div className="rec-section">
            <span className="rec-section__label">Fréquence</span>
            <div className="rec-segment" role="group" aria-label="Fréquence">
              {[
                { id: 'daily', label: 'Quotidien' },
                { id: 'weekly', label: 'Hebdomadaire' },
                { id: 'monthly', label: 'Mensuel' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`rec-segment__btn${frequency === opt.id ? ' is-active' : ''}`}
                  onClick={() => setFrequency(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Paramètres « Quotidien » ──────────────────────── */}
          {frequency === 'daily' && (
            <div className="rec-section">
              <label className="rec-inline">
                Répéter tous les
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={interval}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  className="modal-control rec-number"
                />
                jour(s) ouvré(s)
              </label>
              <p className="rec-hint">Les week-ends et jours fériés sont automatiquement ignorés.</p>
            </div>
          )}

          {/* ── Paramètres « Hebdomadaire » ───────────────────── */}
          {frequency === 'weekly' && (
            <div className="rec-section">
              <label className="rec-inline">
                Répéter toutes les
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={interval}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  className="modal-control rec-number"
                />
                semaine(s)
              </label>
              <span className="rec-section__label">Les jours</span>
              <div className="rec-weekdays">
                {WEEKDAYS.map((wd) => (
                  <button
                    key={wd.iso}
                    type="button"
                    title={wd.label}
                    aria-pressed={weekdays.includes(wd.iso)}
                    className={`rec-day${weekdays.includes(wd.iso) ? ' is-active' : ''}`}
                    onClick={() => toggleWeekday(wd.iso)}
                  >
                    {wd.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Paramètres « Mensuel » ────────────────────────── */}
          {frequency === 'monthly' && (
            <div className="rec-section">
              {monthlyMode !== 'selectedDates' && (
                <label className="rec-inline">
                  Tous les
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={interval}
                    onChange={(e) => setIntervalValue(e.target.value)}
                    className="modal-control rec-number"
                  />
                  mois
                </label>
              )}
              <div className="rec-radios">
                <label className="rec-radio">
                  <input
                    type="radio"
                    name="monthlyMode"
                    checked={monthlyMode === 'dayOfMonth'}
                    onChange={() => setMonthlyMode('dayOfMonth')}
                  />
                  <span>Le {dom} de chaque mois</span>
                </label>
                <label className="rec-radio">
                  <input
                    type="radio"
                    name="monthlyMode"
                    checked={monthlyMode === 'weekdayOfMonth'}
                    onChange={() => setMonthlyMode('weekdayOfMonth')}
                  />
                  <span>Le {ORDINAUX[nth] || `${nth}e`} {dowLabel} de chaque mois</span>
                </label>
                <label className="rec-radio">
                  <input
                    type="radio"
                    name="monthlyMode"
                    checked={monthlyMode === 'selectedDates'}
                    onChange={() => setMonthlyMode('selectedDates')}
                  />
                  <span>Dates précises à répéter</span>
                </label>
              </div>

              {monthlyMode === 'selectedDates' && (
                <div className="rec-dates">
                  <div className="rec-inline">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="modal-control rec-date-input"
                    />
                    <button type="button" className="btn-ghost rec-add" onClick={ajouterDate}>
                      Ajouter
                    </button>
                  </div>
                  {selectedDates.length > 0 ? (
                    <ul className="rec-date-list">
                      {selectedDates.map((iso) => {
                        const d = parseISODate(iso);
                        return (
                          <li key={iso} className="rec-date-chip">
                            {d ? format(d, 'd MMM yyyy', { locale: fr }) : iso}
                            <button
                              type="button"
                              aria-label={`Retirer ${iso}`}
                              onClick={() => retirerDate(iso)}
                            >
                              ×
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="rec-hint">Ajoutez une ou plusieurs dates à reproduire.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Fin de la récurrence ──────────────────────────── */}
          <div className="rec-section">
            <span className="rec-section__label">Fin de la récurrence</span>
            <div className="rec-radios">
              <label className="rec-radio">
                <input
                  type="radio"
                  name="endType"
                  checked={endType === 'schoolYear'}
                  onChange={() => setEndType('schoolYear')}
                />
                <span>Toute l'année scolaire (jusqu'au {schoolEndLabel})</span>
              </label>

              <label className="rec-radio">
                <input
                  type="radio"
                  name="endType"
                  checked={endType === 'count'}
                  onChange={() => setEndType('count')}
                />
                <span>Après un nombre de réservations</span>
              </label>
              {/* Le champ ne se déplie qu'une fois l'option choisie (fenêtre épurée). */}
              {endType === 'count' && (
                <label className="rec-inline rec-suboption">
                  Arrêter après
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={endCount}
                    onChange={(e) => setEndCount(e.target.value)}
                    className="modal-control rec-number"
                  />
                  réservation(s)
                </label>
              )}

              <label className="rec-radio">
                <input
                  type="radio"
                  name="endType"
                  checked={endType === 'until'}
                  onChange={() => setEndType('until')}
                />
                <span>Jusqu'à une date</span>
              </label>
              {endType === 'until' && (
                <label className="rec-inline rec-suboption">
                  Jusqu'au
                  <input
                    type="date"
                    value={endUntil}
                    max={toInputDate(schoolYearEnd(base))}
                    onChange={(e) => setEndUntil(e.target.value)}
                    className="modal-control rec-date-input"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-ghost">
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={occurrences.length === 0}
            className="btn-primary btn-primary--auto"
          >
            Créer {occurrences.length > 0 ? `${occurrences.length} réservation${occurrences.length > 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
