'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '../../lib/supabaseClient';
import NavBar from '../../../components/NavBar';

export default function WorkshopDetail() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id;

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [session, setSession] = useState(null);
  const [checkedSession, setCheckedSession] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(0);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setCheckedSession(true);
    };
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!workshopId) return;
    
    const fetchWorkshopDetails = async () => {
      setLoading(true);
      
      // Obtener datos del taller con relaciones
      const { data, error } = await supabase
        .from('workshops')
        .select(`
          *,
          instructor:profiles!workshops_instructor_id_fkey(full_name),
          university:universities(name),
          room:rooms(name)
        `)
        .eq('id', workshopId)
        .single();

      if (error || !data) {
        console.error('Error fetching workshop:', error);
        setLoading(false);
        return;
      }

      setWorkshop(data);

      // Contar inscritos
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('workshop_id', workshopId);
      
      setEnrolledCount(count || 0);
      setLoading(false);
    };

    fetchWorkshopDetails();
  }, [workshopId]);

  // Verificar si el usuario ya está inscrito
  useEffect(() => {
    if (!session?.user?.id || !workshopId) return;

    const checkEnrollment = async () => {
      // Primero obtener el profile_id del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (!profile) {
        setIsEnrolled(false);
        return;
      }

      // Verificar inscripción
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('workshop_id', workshopId)
        .single();

      setIsEnrolled(!!enrollment);
    };

    checkEnrollment();
  }, [session, workshopId]);

  const handleEnroll = async () => {
    const { data: currentData } = await supabase.auth.getSession();
    const currentSession = currentData?.session ?? null;

    if (!currentSession) {
      router.push('/login');
      return;
    }

    setEnrolling(true);

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshop_id: parseInt(workshopId),
          user_id: currentSession.user.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Error al inscribirse');
        setEnrolling(false);
        return;
      }

      setIsEnrolled(true);
      setEnrolledCount(prev => prev + 1);
      alert('¡Inscripción exitosa! 🎉');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al inscribirse');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <>
        {checkedSession && <NavBar user={session?.user ?? null} />}
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p>Cargando taller...</p>
        </div>
      </>
    );
  }

  if (!workshop) {
    return (
      <>
        {checkedSession && <NavBar user={session?.user ?? null} />}
        <div style={styles.errorContainer}>
          <h2>Taller no encontrado</h2>
          <button onClick={() => router.push('/marketplace')} style={styles.backButton}>
            Volver al Marketplace
          </button>
        </div>
      </>
    );
  }

  const spotsLeft = workshop.capacity ? workshop.capacity - enrolledCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <>
      {checkedSession && <NavBar user={session?.user ?? null} />}
      
      <div style={styles.container}>
        <button onClick={() => router.push('/marketplace')} style={styles.backLink}>
          ← Volver al Marketplace
        </button>

        <div style={styles.card}>
          <div style={styles.header}>
            <span style={styles.category}>{workshop.category || 'Taller'}</span>
            <span style={styles.status}>{workshop.status === 'published' ? '🟢 Disponible' : '🔴 No disponible'}</span>
          </div>

          <h1 style={styles.title}>{workshop.title}</h1>
          
          <p style={styles.description}>{workshop.description}</p>

          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📅 Fecha</span>
              <span style={styles.detailValue}>
                {workshop.date ? new Date(workshop.date).toLocaleDateString('es-CL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Por definir'}
              </span>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>🕐 Hora</span>
              <span style={styles.detailValue}>{workshop.time || 'Por definir'}</span>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>⏱️ Duración</span>
              <span style={styles.detailValue}>{workshop.duration ? `${workshop.duration} minutos` : 'Por definir'}</span>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>👤 Instructor</span>
              <span style={styles.detailValue}>{workshop.instructor?.full_name || 'Por asignar'}</span>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>🏛️ Universidad</span>
              <span style={styles.detailValue}>{workshop.university?.name || 'Por definir'}</span>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📍 Sala</span>
              <span style={styles.detailValue}>{workshop.room?.name || 'Por definir'}</span>
            </div>
          </div>

          <div style={styles.enrollSection}>
            <div style={styles.spotsInfo}>
              <span style={styles.enrolledCount}>
                {enrolledCount} inscrito{enrolledCount !== 1 ? 's' : ''}
              </span>
              {workshop.capacity && (
                <span style={styles.capacity}>
                  {spotsLeft > 0 
                    ? `• ${spotsLeft} cupo${spotsLeft !== 1 ? 's' : ''} disponible${spotsLeft !== 1 ? 's' : ''}`
                    : '• Sin cupos'}
                </span>
              )}
            </div>

            {isEnrolled ? (
              <div style={styles.enrolledBadge}>
                ✅ Ya estás inscrito en este taller
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling || isFull || workshop.status !== 'published'}
                style={{
                  ...styles.enrollButton,
                  opacity: (enrolling || isFull || workshop.status !== 'published') ? 0.6 : 1,
                  cursor: (enrolling || isFull || workshop.status !== 'published') ? 'not-allowed' : 'pointer'
                }}
              >
                {enrolling ? 'Inscribiendo...' : isFull ? 'Sin cupos' : 'Inscribirme al taller'}
              </button>
            )}

            {!session && (
              <p style={styles.loginHint}>
                Debes <a href="/login" style={styles.link}>iniciar sesión</a> para inscribirte
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '24px 16px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: 16
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e5e7eb',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: 16
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 16,
    padding: 0
  },
  backButton: {
    padding: '12px 24px',
    borderRadius: 8,
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  category: {
    background: '#ede9fe',
    color: '#6d28d9',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500
  },
  status: {
    fontSize: 13
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 16px 0'
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 1.6,
    marginBottom: 24
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    padding: '24px 0',
    borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: 500
  },
  detailValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: 500
  },
  enrollSection: {
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16
  },
  spotsInfo: {
    display: 'flex',
    gap: 8,
    fontSize: 14,
    color: '#6b7280'
  },
  enrolledCount: {
    fontWeight: 500
  },
  capacity: {
    color: '#059669'
  },
  enrollButton: {
    padding: '16px 48px',
    borderRadius: 9999,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
  },
  enrolledBadge: {
    padding: '16px 32px',
    borderRadius: 12,
    background: '#ecfdf5',
    color: '#059669',
    fontWeight: 600,
    fontSize: 15
  },
  loginHint: {
    fontSize: 14,
    color: '#6b7280'
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: 500
  }
};

