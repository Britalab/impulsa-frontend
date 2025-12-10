'use client';

import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';

import NavBar from '../../components/NavBar';

export default function Marketplace() {
  const [workshops, setWorkshops] = useState([]);
  const [session, setSession] = useState(null);
  const [checkedSession, setCheckedSession] = useState(false); // indica que ya comprobamos la sesión

  useEffect(() => {
    // obtener sesión inicial
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error getSession:', error);
        }
        setSession(data?.session ?? null);
      } catch (err) {
        console.error('getSession catch:', err);
        setSession(null);
      } finally {
        setCheckedSession(true);
      }
    };

    loadSession();

    // listener para cambios de auth (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      // no tocamos checkedSession aquí: ya fue comprobada
    });

    // traer talleres
    const fetchWorkshops = async () => {
      try {
        const { data, error } = await supabase.from('workshops').select('*');
        if (!error && data) setWorkshops(data);
        if (error) console.warn('Error fetching workshops:', error);
      } catch (err) {
        console.error('fetchWorkshops catch:', err);
      }
    };

    fetchWorkshops();

    return () => {
      // desuscribimos listener
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // --- enrollWorkshop: envía workshop_id + user_id (Opción A: rápida) ---
  const enrollWorkshop = async (id) => {
    // obtener la sesión actual justo antes de inscribir (evita usar estado stale)
    const { data: currentData, error: getSessionError } = await supabase.auth.getSession();
    const currentSession = currentData?.session ?? null;

    if (getSessionError) {
      console.error('Error obteniendo sesión al inscribir:', getSessionError);
      return alert('Error al verificar sesión. Intenta cerrar sesión y volver a ingresar.');
    }

    if (!currentSession) {
      return alert('Debes iniciar sesión primero');
    }

    // construimos body incluyendo user_id (rápido, pero menos seguro)
    const body = {
      workshop_id: id,
      user_id: currentSession.user.id
    };

    console.log('enrollWorkshop -> body:', body);

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // credentials: 'include', // opcional con esta opción; no imprescindible aquí
        body: JSON.stringify(body)
      });

      const respJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.warn('Enroll backend error (non-ok):', respJson);
        return alert('Error al inscribirse: ' + (respJson.error || JSON.stringify(respJson)));
      }

      alert('Inscripción correcta ✅');
      console.log('Enrolamiento OK:', respJson);
    } catch (err) {
      console.error('Error en enrollWorkshop (fetch):', err);
      alert('Error al inscribirse. Revisa la consola para más detalles.');
    }
  };

  return (
    <>
      {/* renderizamos NavBar sólo después de que hayamos comprobado la sesión
          esto evita que NavBar reciba props inconsistentes en el primer render */}
      {checkedSession ? (
        <NavBar user={session?.user ?? null} />
      ) : (
        // opcional: espacio vacío hasta que sepamos el estado de sesión
        <div style={{ height: 64 }} />
      )}

      <h1 style={{ textAlign: 'center', marginTop: 24 }}>Marketplace</h1>

      <div style={gridStyle}>
        {workshops.map(w => (
          <div key={w.id} style={cardStyle}>
            <div>
              <h3>{w.title}</h3>
              <p>{w.description}</p>
            </div>
            <button style={buttonStyle} onClick={() => enrollWorkshop(w.id)}>
              Ver Detalles e Inscribir
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: 16,
  padding: 24
};

const cardStyle = {
  padding: 16,
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: 9999,
  background: '#4f46e5',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  marginTop: 12
};
