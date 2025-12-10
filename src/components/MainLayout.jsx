// src/components/MainLayout.jsx
'use client';

import { useEffect, useState } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import { getSession } from '../app/lib/services/authService';
import supabase from '../app/lib/supabaseClient';

export default function MainLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    async function loadUser() {
      try {
        const session = await getSession();
        if (session?.user) {
          setUser(session.user);
          // Verificar si es admin (puedes ajustar la lógica según tu estructura)
          checkAdminStatus(session.user.id);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          checkAdminStatus(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Verificar si el usuario es admin consultando la tabla profiles
  async function checkAdminStatus(authUserId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_user_id', authUserId)
        .single();

      if (data && !error && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error verificando rol de admin:', error);
      setIsAdmin(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar user={user} isAdmin={isAdmin} />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

