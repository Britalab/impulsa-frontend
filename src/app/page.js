import NavBar from '../components/NavBar';
import supabase from './lib/supabaseClient';

export default function Home() {
  const user = null;

  return (
    <>
      <NavBar user={user} />
      <main style={{ flex: 1 }}>
        <div style={{ position: 'relative', height: 650, width: '100%', backgroundColor: '#111' }}>
          <img src="/backg.jpg" alt="Campus" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, black 80%, transparent 30%)' }}></div>

          <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 16, color: 'white' }}>
            <h1 style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 24 }}>
              Conecta, aprende e<br />
              <span style={{ color: '#6366f1' }}>Impulsa</span> tu Futuro.
            </h1>
            <p style={{ fontSize: 18, maxWidth: 500, marginBottom: 32 }}>La plataforma donde el conocimiento se encuentra con la oportunidad y nos hace crecer.</p>

            <div style={{ background: 'white', borderRadius: 9999, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 4, maxWidth: 500, marginBottom: 24 }}>
              <input
                type="text"
                placeholder="¿Qué quieres aprender hoy?"
                style={{ flex: 1, padding: 12, border: 'none', outline: 'none', fontSize: 16, borderRadius: 9999 }}
              />
              <a href="/marketplace" style={{ background: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: 9999, marginLeft: 8, fontWeight: 'bold', textDecoration: 'none' }}>Buscar Talleres</a>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <a href="/login" style={{ ...buttonStyle }}>Ingresar</a>
              <a href="/register" style={{ ...buttonStyle, background: '#f59e0b' }}>Regístrate</a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const buttonStyle = {
  padding: "12px 24px",
  borderRadius: "9999px",
  border: "none",
  background: "#6366f1",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: 16,
  textDecoration: 'none',
};

