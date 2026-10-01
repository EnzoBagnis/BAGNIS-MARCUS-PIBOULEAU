export default function FallbackScreen() {
  return (
    <div className="fallback-screen" style={styles.container}>
      {/* 
        Le chemin de l'image est un placeholder temporaire. 
        "Renvoie sur un chemin, on s'en occupera plus tard"
      */}
      <img 
        src="/images/logo-lycee.png" 
        alt="Logo Lycée" 
        style={styles.logo}
        onError={(e) => {
          // Si l'image n'existe pas encore, on affiche un texte pour éviter une image cassée vide
          e.target.style.display = 'none';
          document.getElementById('fallback-text').style.display = 'block';
        }}
      />
      <h2 id="fallback-text" style={{ ...styles.text, display: 'none' }}>
        Informations momentanément indisponibles
      </h2>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg)', // suit le thème actif
    flexDirection: 'column'
  },
  logo: {
    maxWidth: '300px',
    maxHeight: '300px',
    objectFit: 'contain'
  },
  text: {
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text-muted)',
    marginTop: '20px'
  }
};
