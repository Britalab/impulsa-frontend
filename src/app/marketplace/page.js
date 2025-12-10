'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabaseClient';
import NavBar from '../../components/NavBar';

export default function Marketplace() {
  const router = useRouter();
  const [workshops, setWorkshops] = useState([]);
  const [session, setSession] = useState(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.warn('Error getSession:', error);
        setSession(data?.session ?? null);
      } catch (err) {
        console.error('getSession catch:', err);
        setSession(null);
      } finally {
        setCheckedSession(true);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    const fetchWorkshops = async () => {
      try {
        const { data, error } = await supabase
          .from('workshops')
          .select('*, instructor:profiles!workshops_instructor_id_fkey(full_name)')
          .eq('status', 'published');
        if (!error && data) setWorkshops(data);
        if (error) console.warn('Error fetching workshops:', error);
      } catch (err) {
        console.error('fetchWorkshops catch:', err);
      }
    };

    fetchWorkshops();

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  const viewDetails = (id) => {
    router.push(`/marketplace/${id}`);
  };

  return (
    <>
      {checkedSession ? (
        <NavBar user={session?.user ?? null} />
      ) : (
        <div style={{ height: 64 }} />
      )}

      <h1 style={{ textAlign: 'center', marginTop: 24 }}>Marketplace</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 24 }}>
        Explora los talleres disponibles y encuentra el que más te interese
      </p>

      <div style={gridStyle}>
        {workshops.map(w => (
          <div key={w.id} style={cardStyle}>
            <div>
              {w.category && <span style={categoryBadge}>{w.category}</span>}
              <h3 style={titleStyle}>{w.title}</h3>
              <p style={descStyle}>{w.description}</p>
              {w.instructor?.full_name && (
                <p style={instructorStyle}>👤 {w.instructor.full_name}</p>
              )}
              {w.date && (
                <p style={dateStyle}>
                  📅 {new Date(w.date).toLocaleDateString('es-CL', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                  {w.time && ` • ${w.time}`}
                </p>
              )}
            </div>
            <button style={buttonStyle} onClick={() => viewDetails(w.id)}>
              Ver Detalles
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 20,
  padding: '0 24px 24px'
};

const cardStyle = {
  padding: 20,
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s, box-shadow 0.2s'
};

const categoryBadge = {
  display: 'inline-block',
  background: '#ede9fe',
  color: '#6d28d9',
  padding: '4px 10px',
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 8
};

const titleStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: '#1f2937',
  margin: '0 0 8px 0'
};

const descStyle = {
  fontSize: 14,
  color: '#6b7280',
  lineHeight: 1.5,
  margin: '0 0 12px 0',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const instructorStyle = {
  fontSize: 13,
  color: '#4b5563',
  margin: '0 0 4px 0'
};

const dateStyle = {
  fontSize: 13,
  color: '#4b5563',
  margin: 0
};

const buttonStyle = {
  padding: '10px 20px',
  borderRadius: 9999,
  background: '#4f46e5',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  marginTop: 16,
  fontWeight: 500,
  fontSize: 14,
  transition: 'background 0.2s'
};
