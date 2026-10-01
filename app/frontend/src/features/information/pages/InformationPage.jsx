  import { useActivePlaylist } from '../hooks/useActivePlaylist';
  import FallbackScreen from '../components/FallbackScreen';
  import MediaRotation from '../components/MediaRotation';
  import './InformationPage.css';

  export default function InformationPage({ active = true, onCycleComplete } = {}) {
    // Rafraîchissement automatique toutes les 30 s (vaut aussi pour le mode
    // rotation /ecran/rotation : cette page y reste montée en permanence).
    const { medias, loading, error } = useActivePlaylist(30 * 1000);

    if (loading) {
      return (
        <main className="ecran-page ecran-info" style={styles.center}>
          <h2>Chargement de la playlist...</h2>
        </main>
      );
    }

    // S'il y a une erreur réseau (API indisponible, etc.), on affiche le Fallback
    if (error) {
      return <FallbackScreen />;
    }

    return (
      <main className="ecran-page ecran-info">
        <MediaRotation medias={medias} active={active} onCycleComplete={onCycleComplete} />
      </main>
    );
  }

  const styles = {
    center: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
    }
  };