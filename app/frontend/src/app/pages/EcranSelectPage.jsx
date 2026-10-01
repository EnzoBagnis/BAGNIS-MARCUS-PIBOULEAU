import { useNavigate } from 'react-router';
import './EcranSelectPage.css';

function requestFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement) return Promise.resolve();
  const fn =
    el.requestFullscreen?.bind(el) ??
    el.webkitRequestFullscreen?.bind(el) ??
    el.msRequestFullscreen?.bind(el);
  if (!fn) return Promise.resolve();
  return Promise.resolve(fn()).catch((err) => {
    console.warn('[EcranSelectPage] Plein écran refusé :', err.message);
  });
}

export default function EcranSelectPage() {
  const navigate = useNavigate();

  const handleSelect = async (target) => {
    await requestFullscreen();
    navigate(target);
  };

  return (
    <main className="ecran-select">
      <header className="ecran-select__header">
        <h1>Écran d'affichage</h1>
        <p>Choisissez le mode à afficher sur ce poste.</p>
      </header>

      <div className="ecran-select__choices">
        <button
          type="button"
          className="ecran-select__card"
          onClick={() => handleSelect('info')}
        >
          <span className="ecran-select__card-title">Mode Information</span>
          <span className="ecran-select__card-desc">
            Diffusion des médias et playlists.
          </span>
        </button>

        <button
          type="button"
          className="ecran-select__card"
          onClick={() => handleSelect('agenda')}
        >
          <span className="ecran-select__card-title">Mode Agenda</span>
          <span className="ecran-select__card-desc">
            Affichage des réservations machines.
          </span>
        </button>

        <button
          type="button"
          className="ecran-select__card"
          onClick={() => handleSelect('rotation')}
        >
          <span className="ecran-select__card-title">Mode Rotation</span>
          <span className="ecran-select__card-desc">
            Alterne automatiquement entre l'agenda et les informations.
          </span>
        </button>
      </div>
    </main>
  );
}
