import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import Holidays from 'date-holidays';
import MachineCalendar from '../pages/MachineCalendar.jsx';
import RecurrenceModal from '../components/RecurrenceModal.jsx';
import { machineColor } from '../utils/machineColors.js';
import { agendaService } from '../services/agendaService.js';
import { authSession } from '../../auth/session/authSession.js';
import ThemeSwitcher from '../../../shared/theme/ThemeSwitcher.jsx';
import '../styles/AgendaPage.css';

export default function AgendaPage({ forcedView = null } = {}) {
  const [reservations, setReservations] = useState([]);
  const [machineEnCours, setMachineEnCours] = useState(null);

  // Lists loaded from backend
  const [machines, setMachines] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States pour la CRÉATION
  const [modalData, setModalData] = useState(null);
  const [professeurId, setProfesseurId] = useState("");
  const [classeId, setClasseId] = useState("");
  const [description, setDescription] = useState("");
  const [dureeH, setDureeH] = useState(4); // Durée par défaut : 4h

  // Garde anti-double-réservation : bloque le bouton pendant l'envoi puis
  // impose un court délai avant d'autoriser une nouvelle réservation. Évite
  // qu'un double-clic (ou une connexion lente) ne crée deux réservations.
  const [reservationEnCours, setReservationEnCours] = useState(false);

  // NOUVEAU STATE pour la LECTURE d'une réservation existante
  const [reservationVue, setReservationVue] = useState(null);

  // States pour la MODIFICATION d'une réservation existante
  const [editMode, setEditMode] = useState(false);
  const [editProfesseurId, setEditProfesseurId] = useState("");
  const [editClasseId, setEditClasseId] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const navigate = useNavigate();
  const isKiosk = window.location.pathname.includes('/ecran');
  const session = authSession.read();
  const isInteractive = !isKiosk && session && session.role === 'prof';

  // Helper date formatter: Local YYYY-MM-DD HH:mm:ss
  const pad = (n) => String(n).padStart(2, '0');
  const formatLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  // STATE pour la popup "Déjà réservé"
  const [alerteDejaReserve, setAlerteDejaReserve] = useState(null);

  // STATE pour la fenêtre de réservation récurrente (ouverte depuis la modale de création)
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);

  // Jours fériés français : un même calculateur réutilisé pour exclure les
  // jours non réservables (week-ends + fériés) des récurrences.
  const joursFeries = useMemo(() => new Holidays('FR'), []);
  const isDayDisabled = useCallback(
    (date) => {
      const day = date.getDay();
      if (day === 0 || day === 6) return true; // dimanche / samedi : hall fermé
      return Boolean(joursFeries.isHoliday(date));
    },
    [joursFeries]
  );

  // Construit un créneau à partir de l'heure cliquée/déposée et de la durée
  // choisie. L'heure de fin ne dépasse jamais 18h (fermeture du hall).
  const buildSlot = (date, hours = dureeH) => {
    const start = new Date(date);
    start.setMinutes(0, 0, 0);
    const endHour = Math.min(start.getHours() + hours, 18);
    const end = new Date(start);
    end.setHours(endHour, 0, 0, 0);
    return { start, end };
  };

  // Helper names resolvers
  const getMachineName = (id) => {
    const m = machines.find(x => x.id === id);
    return m ? m.nom : `Machine #${id}`;
  };

  const getProfName = (id) => {
    const p = professeurs.find(x => x.id === id);
    return p ? `${p.prenom} ${p.nom}` : `Prof #${id}`;
  };

  const getClassName = (id) => {
    const c = classes.find(x => x.id === id);
    return c ? c.nom : `Classe #${id}`;
  };

  const getDescription = (id) => {
    const d = reservations.find(x => x.id === id);
    return d ? d.description : `Aucune description`;
  };

  // Intervalle de rafraîchissement automatique en mode kiosque (60 s)
  const REFRESH_INTERVAL_MS = 60 * 1000;
  // Garde l'état "monté" pour éviter de mettre à jour le state après démontage
  const activeRef = useRef(true);

  // Charge les données depuis le backend.
  // silent = true : rafraîchissement en arrière-plan (pas de spinner ni de bascule en erreur si on a déjà des données)
  const loadData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const [resList, machList, profList, classList] = await Promise.all([
        agendaService.fetchReservations(),
        agendaService.fetchMachines(),
        agendaService.fetchProfesseurs(),
        agendaService.fetchClasses()
      ]);

      if (!activeRef.current) return;

      setMachines(machList);
      setProfesseurs(profList);
      setClasses(classList);

      // Format reservations to calendar events
      const formatted = resList.map(res => {
        const mach = machList.find(m => m.id === res.machine_id);
        const prof = profList.find(p => p.id === res.professeur_id);
        const cls = classList.find(c => c.id === res.classe_id);

        const machName = mach ? mach.nom : `Machine #${res.machine_id}`;
        const profName = prof ? `M. ${prof.nom}` : `Prof #${res.professeur_id}`;
        const clsName = cls ? cls.nom : `Classe #${res.classe_id}`;

        return {
          id: res.id,
          title: `${machName} - ${profName} - ${clsName}`,
          start: new Date(res.debut),
          end: new Date(res.fin),
          description: res.description || '',
          machine_id: res.machine_id,
          professeur_id: res.professeur_id,
          classe_id: res.classe_id
        };
      });

      setReservations(formatted);
      setError(null);
    } catch (err) {
      console.error("Erreur de chargement des données", err);
      // En rafraîchissement silencieux, on garde l'affichage existant plutôt que de basculer en erreur
      if (activeRef.current && !silent) {
        setError("Impossible de charger les données du planning. Veuillez réessayer plus tard.");
      }
    } finally {
      if (activeRef.current && !silent) setLoading(false);
    }
  }, []);

  // Chargement initial au montage
  useEffect(() => {
    activeRef.current = true;
    loadData({ silent: false });
    return () => {
      activeRef.current = false;
    };
  }, [loadData]);

  // Rafraîchissement automatique périodique — uniquement en mode kiosque (non-interactif),
  // afin de ne pas perturber un professeur en train de glisser/déposer une réservation.
  useEffect(() => {
    if (isInteractive) return;
    const intervalId = setInterval(() => {
      loadData({ silent: true });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isInteractive, loadData, REFRESH_INTERVAL_MS]);

  const handleLogout = () => {
    authSession.clear();
    navigate('/login', { replace: true });
  };

  // --- Fonctions de déplacement ---
  const handleEventDrop = async ({ event, start }) => {
    if (!isInteractive) return;

    const { start: correctedStart, end: correctedEnd } = buildSlot(start, (event.end - event.start) / (3600 * 1000));

    const originalReservations = [...reservations];

    // Optimistic UI update
    setReservations((prev) =>
      prev.map((item) =>
        item.id === event.id ? { ...item, start: correctedStart, end: correctedEnd } : item
      )
    );

    try {
      await agendaService.updateReservation(event.id, {
        debut: formatLocal(correctedStart),
        fin: formatLocal(correctedEnd)
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification de la réservation en base. Action annulée.");
      setReservations(originalReservations);
    }
  };

  const dragFromOutsideItem = () => {
    if (!isInteractive || !machineEnCours) return null;
    return {
      ...machineEnCours,
      start: new Date(0),
      end: new Date(dureeH * 60 * 60 * 1000)
    };
  };

  const onDropFromOutside = ({ start }) => {
    if (!isInteractive || !machineEnCours) return;

    const { start: correctedStart, end: correctedEnd } = buildSlot(start);

    // LOGIQUE : "Si c'est réservé"
    // On vérifie s'il y a déjà une réservation pour CETTE machine qui chevauche CE créneau
    // LOGIQUE : "Si c'est réservé"
    // On utilise .find() pour récupérer la réservation qui bloque
    const reservationBloquante = reservations.find(res => {
      const memeMachine = res.machine_id === machineEnCours.id;
      const chevauchement = (correctedStart < res.end && correctedEnd > res.start);

      return memeMachine && chevauchement;
    });

    if (reservationBloquante) {
      // ALORS : On stocke l'objet complet de la réservation conflictuelle
      setAlerteDejaReserve(reservationBloquante);
      setMachineEnCours(null);
    }

    setModalData({
      machine: machineEnCours,
      start: correctedStart,
      end: correctedEnd,
    });

    setMachineEnCours(null);
  };

  const handleValiderReservation = async (e) => {
    e.preventDefault();

    // Si une réservation est déjà en cours (requête en vol ou délai de
    // cooldown non écoulé), on ignore le clic pour éviter les doublons.
    if (reservationEnCours) return;
    setReservationEnCours(true);

    try {
      const payload = {
        debut: formatLocal(modalData.start),
        fin: formatLocal(modalData.end),
        description: description || null,
        professeur_id: parseInt(professeurId, 10),
        classe_id: parseInt(classeId, 10),
        machine_id: parseInt(modalData.machine.id, 10)
      };

      const res = await agendaService.createReservation(payload);

      const newRes = {
        id: res.id,
        title: `${getMachineName(res.machine_id)} - ${getProfName(res.professeur_id)} - ${getClassName(res.classe_id)}`,
        start: new Date(res.debut),
        end: new Date(res.fin),
        description: res.description || '',
        machine_id: res.machine_id,
        professeur_id: res.professeur_id,
        classe_id: res.classe_id
      };

      setReservations((prev) => [...prev, newRes]);
      fermerModal();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de la réservation. Veuillez réessayer.");
    } finally {
      // Court délai avant de réautoriser une réservation : suffisant pour
      // absorber un double-clic ou un renvoi accidentel, sans gêner l'usage.
      setTimeout(() => setReservationEnCours(false), 1500);
    }
  };

  const fermerModal = () => {
    setModalData(null);
    setProfesseurId("");
    setClasseId("");
    setDescription("");
    setDureeH(4);
    setRecurrenceOpen(false);
  };

  // Ouvre la fenêtre de récurrence : professeur + classe doivent déjà être
  // choisis dans la modale de création (ils s'appliquent à toutes les occurrences).
  const ouvrirRecurrence = () => {
    if (!professeurId || !classeId) {
      alert("Veuillez d'abord choisir un professeur et une classe avant de programmer une récurrence.");
      return;
    }
    setRecurrenceOpen(true);
  };

  // Crée une réservation par occurrence générée. Les créneaux déjà occupés sur
  // la même machine sont ignorés (et signalés) plutôt que de bloquer le lot.
  const handleConfirmRecurrence = async (occurrences) => {
    if (!modalData || occurrences.length === 0) return;

    const machineId = parseInt(modalData.machine.id, 10);
    const profId = parseInt(professeurId, 10);
    const clsId = parseInt(classeId, 10);
    const desc = description || null;

    // Pré-filtre des conflits contre les réservations déjà connues de cette machine.
    const aCreer = [];
    let ignorees = 0;
    occurrences.forEach((start) => {
      const end = new Date(start.getTime() + dureeH * 60 * 60 * 1000);
      // Cap à 18h
      if (end.getHours() > 18 || (end.getHours() === 0 && end.getDate() !== start.getDate())) {
        end.setHours(18, 0, 0, 0);
        end.setFullYear(start.getFullYear(), start.getMonth(), start.getDate());
      }
      const conflit = reservations.some(
        (res) => res.machine_id === machineId && start < res.end && end > res.start
      );
      if (conflit) ignorees += 1;
      else aCreer.push({ start, end });
    });

    if (aCreer.length === 0) {
      alert("Toutes les dates de cette récurrence sont déjà réservées pour cette machine.");
      return;
    }

    const results = await Promise.allSettled(
      aCreer.map(({ start, end }) =>
        agendaService.createReservation({
          debut: formatLocal(start),
          fin: formatLocal(end),
          description: desc,
          professeur_id: profId,
          classe_id: clsId,
          machine_id: machineId,
        })
      )
    );

    const nouvelles = [];
    let echecs = 0;
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        const res = result.value;
        nouvelles.push({
          id: res.id,
          title: `${getMachineName(res.machine_id)} - ${getProfName(res.professeur_id)} - ${getClassName(res.classe_id)}`,
          start: new Date(res.debut),
          end: new Date(res.fin),
          description: res.description || '',
          machine_id: res.machine_id,
          professeur_id: res.professeur_id,
          classe_id: res.classe_id,
        });
      } else {
        echecs += 1;
      }
    });

    if (nouvelles.length > 0) {
      setReservations((prev) => [...prev, ...nouvelles]);
    }

    const messages = [`${nouvelles.length} réservation(s) créée(s).`];
    if (ignorees > 0) messages.push(`${ignorees} créneau(x) déjà réservé(s) ignoré(s).`);
    if (echecs > 0) messages.push(`${echecs} échec(s) d'enregistrement.`);
    if (ignorees > 0 || echecs > 0) alert(messages.join('\n'));

    fermerModal();
  };

  // --- Fonctions de MODIFICATION d'une réservation existante ---
  const ouvrirEdition = () => {
    setEditProfesseurId(String(reservationVue.professeur_id));
    setEditClasseId(String(reservationVue.classe_id));
    setEditDescription(reservationVue.description || "");
    setEditMode(true);
  };

  const fermerEdition = () => {
    setEditMode(false);
    setEditProfesseurId("");
    setEditClasseId("");
    setEditDescription("");
  };

  const fermerVue = () => {
    setReservationVue(null);
    fermerEdition();
  };

  const handleValiderModification = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        debut: formatLocal(reservationVue.start),
        fin: formatLocal(reservationVue.end),
        professeur_id: parseInt(editProfesseurId, 10),
        classe_id: parseInt(editClasseId, 10),
        description: editDescription || null,
        machine_id: reservationVue.machine_id
      };

      await agendaService.updateReservation(reservationVue.id, payload);

      // Mise à jour optimiste de la liste
      setReservations((prev) =>
        prev.map((item) =>
          item.id === reservationVue.id
            ? {
              ...item,
              professeur_id: payload.professeur_id,
              classe_id: payload.classe_id,
              description: payload.description || '',
              title: `${getMachineName(item.machine_id)} - ${getProfName(payload.professeur_id)} - ${getClassName(payload.classe_id)}`
            }
            : item
        )
      );

      fermerVue();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification de la réservation. Veuillez réessayer.");
    }
  };

  const handleSupprimerReservation = async () => {
    if (!reservationVue) return;
    const confirmMsg = `Supprimer la réservation de ${getMachineName(reservationVue.machine_id)} ?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await agendaService.deleteReservation(reservationVue.id);
      setReservations((prev) => prev.filter((item) => item.id !== reservationVue.id));
      fermerVue();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la réservation. Veuillez réessayer.");
    }
  };

  // Only display available machines in the sidebar
  const availableMachines = machines;

  if (loading) {
    return (
      <div className="agenda-dashboard agenda-state">
        <div>Chargement du planning...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agenda-dashboard agenda-state agenda-state--error">
        <div>{error}</div>
        <button onClick={() => window.location.reload()} className="btn-primary btn-primary--auto">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="agenda-dashboard">

      {/* --- MODAL DE CRÉATION --- */}
      {modalData && (
        <div className="modal-overlay" onClick={fermerModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-card__title">Réserver : {modalData.machine.nom}</h3>
            <p className="modal-card__subtitle">
              Créneau : {modalData.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' à '}
              {modalData.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <form onSubmit={handleValiderReservation} className="modal-form">
              <div className="modal-field">
                <label>Professeur</label>
                <select required value={professeurId} onChange={(e) => setProfesseurId(e.target.value)} className="modal-control">
                  <option value="" disabled>-- Choisir un professeur --</option>
                  {professeurs.map(prof => (
                    <option key={prof.id} value={prof.id}>{prof.prenom} {prof.nom}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Classe</label>
                <select required value={classeId} onChange={(e) => setClasseId(e.target.value)} className="modal-control">
                  <option value="" disabled>-- Choisir une classe --</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.nom}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Durée du créneau</label>
                <select
                  value={dureeH}
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10);
                    setDureeH(h);
                    // Recalcule la fin en fonction de la nouvelle durée
                    if (modalData) {
                      const newEnd = new Date(modalData.start);
                      newEnd.setHours(Math.min(modalData.start.getHours() + h, 18), 0, 0, 0);
                      setModalData(prev => ({ ...prev, end: newEnd }));
                    }
                  }}
                  className="modal-control"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(h => {
                    const startH = modalData?.start?.getHours() || 8;
                    // Ne propose que les durées qui ne dépassent pas 18h
                    if (startH + h > 18) return null;
                    return (
                      <option key={h} value={h}>{h}h</option>
                    );
                  })}
                </select>
              </div>

              <div className="modal-field">
                <label>Description (Optionnelle)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Usinage pièce projet Tuteuré..." rows="3" className="modal-control modal-control--textarea" />
              </div>
              <div className="modal-actions modal-actions--split">
                <button type="button" onClick={ouvrirRecurrence} className="btn-repeat">
                  Répéter
                </button>
                <div className="modal-actions__main">
                  <button type="button" onClick={fermerModal} className="btn-ghost">Annuler</button>
                  <button type="submit" className="btn-primary btn-primary--auto" disabled={reservationEnCours}>
                    {reservationEnCours ? "Envoi…" : "Confirmer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FENÊTRE DE RÉSERVATION RÉCURRENTE --- */}
      {modalData && recurrenceOpen && (
        <RecurrenceModal
          baseDate={modalData.start}
          machineNom={modalData.machine.nom}
          isDayDisabled={isDayDisabled}
          onConfirm={handleConfirmRecurrence}
          onClose={() => setRecurrenceOpen(false)}
        />
      )}

      {/* --- NOUVEAU MODAL : LECTURE / MODIFICATION DE LA RÉSERVATION --- */}
      {reservationVue && (
        <div className="modal-overlay" onClick={fermerVue}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-card__title">
              {editMode ? 'Modifier la réservation' : 'Détails de la réservation'}
            </h3>

            {!editMode ? (
              /* ── Mode LECTURE ── */
              <>
                <div className="modal-details">
                  <p><strong>Machine :</strong> {getMachineName(reservationVue.machine_id)}</p>
                  <p><strong>Professeur :</strong> {getProfName(reservationVue.professeur_id)}</p>
                  <p><strong>Classe :</strong> {getClassName(reservationVue.classe_id)}</p>
                  <p>
                    <strong>Horaire :</strong> {reservationVue.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' à '}
                    {reservationVue.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>

                  <div className="modal-description-box">
                    <strong>Description :</strong>
                    <span className={reservationVue.description ? '' : 'modal-description-box__empty'}>
                      {reservationVue.description || "Aucune description fournie pour cette réservation."}
                    </span>
                  </div>
                </div>

                <div className="modal-actions">
                  {isInteractive && (
                    <>
                      <button
                        type="button"
                        onClick={handleSupprimerReservation}
                        className="btn-danger"
                      >
                        Supprimer
                      </button>
                      <button
                        type="button"
                        onClick={ouvrirEdition}
                        className="btn-edit"
                      >
                        Modifier
                      </button>
                    </>
                  )}
                  <button
                    onClick={fermerVue}
                    className="btn-primary btn-primary--auto"
                  >
                    Fermer
                  </button>
                </div>
              </>
            ) : (
              /* ── Mode ÉDITION ── */
              <form onSubmit={handleValiderModification} className="modal-form">
                <div className="modal-field">
                  <label>Machine</label>
                  <input
                    type="text"
                    value={getMachineName(reservationVue.machine_id)}
                    disabled
                    className="modal-control"
                  />
                </div>

                <div className="modal-field">
                  <label>Professeur</label>
                  <select required value={editProfesseurId} onChange={(e) => setEditProfesseurId(e.target.value)} className="modal-control">
                    <option value="" disabled>-- Choisir un professeur --</option>
                    {professeurs.map(prof => (
                      <option key={prof.id} value={prof.id}>{prof.prenom} {prof.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="modal-field">
                  <label>Classe</label>
                  <select required value={editClasseId} onChange={(e) => setEditClasseId(e.target.value)} className="modal-control">
                    <option value="" disabled>-- Choisir une classe --</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="modal-field">
                  <label>Description (Optionnelle)</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Ex: Usinage pièce projet Tuteuré..." rows="3" className="modal-control modal-control--textarea" />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={fermerEdition} className="btn-ghost">Annuler</button>
                  <button type="submit" className="btn-primary btn-primary--auto">Enregistrer</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- POPUP : DÉJÀ RÉSERVÉ --- */}
      {alerteDejaReserve && (
        <div className="modal-overlay" onClick={() => setAlerteDejaReserve(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-card__title" style={{ color: '#d9534f' }}>
              Créneau déjà réservé pour cette machine
            </h3>
            <p>
              <strong>{getMachineName(alerteDejaReserve.machine_id)}</strong> est déjà réservée sur ce créneau par : <strong>{getProfName(alerteDejaReserve.professeur_id)}</strong>
              <br /> Pour la classe de : <strong>{getClassName(alerteDejaReserve.classe_id)}</strong>
              <br /><strong>{getDescription(alerteDejaReserve.id)}</strong>
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setAlerteDejaReserve(false)}
                className="btn-primary btn-primary--auto"
              >
                J'ai compris, je reserve quand même
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bandeau d'actions — visible uniquement en mode réservation (prof) */}
      {isInteractive && (
        <header className="dashboard-header">
          <div className="dashboard-header__title">
            <h1>Planning du Hall Aéronautique</h1>
          </div>
          <div className="user-disconnect">
            <ThemeSwitcher />
            <span className="user-disconnect__label">
              Espace Professeur
            </span>
            <button className="btn-disconnect" onClick={handleLogout} title="Se déconnecter">
              <svg className="btn-disconnect__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="btn-disconnect__text">Se déconnecter</span>
            </button>
          </div>
        </header>
      )}

      {/* Corps : machines (mode prof) + calendrier. En colonne sur mobile. */}
      <div className="dashboard-body">
        {isInteractive && (
          <aside className="dashboard-sidebar">
            <h2>Machines</h2>
            <p className="text-muted dashboard-sidebar__hint" style={{ marginBottom: '15px' }}>Glissez une machine vers le calendrier</p>
            <div className="machine-list">
              {availableMachines.length === 0 ? (
                <p className="text-muted">Aucune machine disponible</p>
              ) : (
                availableMachines.map((machine) => (
                  <div key={machine.id} draggable="true" onDragStart={() => setMachineEnCours(machine)} className="machine-chip">
                    <span
                      className="machine-chip__swatch"
                      style={{ backgroundColor: machineColor(machine.id).bg }}
                      aria-hidden="true"
                    />
                    {machine.nom}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        <main className="dashboard-main">
          <div className="dashboard-calendar-wrapper">
            <MachineCalendar
              events={reservations}
              onEventDrop={handleEventDrop}
              dragFromOutsideItem={dragFromOutsideItem}
              onDropFromOutside={onDropFromOutside}
              onSelectEvent={(event) => setReservationVue(event)}
              readOnly={!isInteractive}
              forcedView={forcedView}
            />
          </div>
        </main>
      </div>
    </div>
  );
}