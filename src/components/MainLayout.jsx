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

  // Verificar si el usuario es admin
  async function checkAdminStatus(userId) {
    try {
      // Opción 1: Verificar en user_metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role === 'admin') {
        setIsAdmin(true);
        return;
      }

      // Opción 2: Verificar en una tabla de admins (si existe)
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setIsAdmin(true);
      }
    } catch (error) {
      // Si la tabla no existe o hay error, simplemente no es admin
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

