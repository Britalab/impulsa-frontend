// src/components/NavBar.js
export default function NavBar({ user }) {
  // Aceptamos tanto un objeto "user" (user.email) como una "session" (session.user.email)
  const email = user?.email ?? user?.user?.email ?? null;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: 80,
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <a href="/" style={{ fontWeight: 'bold', fontSize: 24, color: '#4f46e5', textDecoration: 'none' }}>IMPULSA</a>

      <div style={{ display: 'flex', gap: 16 }}>
        {email ? (
          <span>Hola, {email}</span>
        ) : (
          <>
            <a href="/login" style={buttonStyle}>Ingresar</a>
            <a href="/register" style={{...buttonStyle, background: '#f59e0b'}}>Regístrate</a>
          </>
        )}
      </div>
    </nav>
  );
}

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: 9999,
  background: '#4f46e5',
  color: 'white',
  fontWeight: 'bold',
  textDecoration: 'none',
  cursor: 'pointer',
};

