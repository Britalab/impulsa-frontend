// src/components/AdminLayout.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  Users,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { getSession, signOut } from '../app/lib/services/authService';
import { getProfileByAuthId } from '../app/lib/services/profileService';

const menuItems = [
  {
    id: 'talleres',
    label: 'Talleres',
    icon: BookOpen,
    href: '/admin',
    description: 'Gestionar propuestas'
  },
  {
    id: 'universidades',
    label: 'Universidades',
    icon: Building2,
    href: '/admin/universidades',
    description: 'Salas y espacios'
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: Users,
    href: '/admin/usuarios',
    description: 'Gestionar cuentas'
  },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const session = await getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await getProfileByAuthId(session.user.id);
      
      // Verificar si es admin (por rol o metadata)
      const isAdmin = profileData?.role === 'admin' || 
                      session.user?.user_metadata?.role === 'admin';
      
      if (!isAdmin) {
        router.push('/');
        return;
      }

      setProfile(profileData);
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#7B2CBF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar móvil overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B2CBF] to-[#00F5D4] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">IMPULSA</span>
              <p className="text-slate-400 text-xs">Panel Admin</p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
                           (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-[#7B2CBF] text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <span className="font-medium">{item.label}</span>
                  <p className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                    {item.description}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B2CBF] to-[#00F5D4] flex items-center justify-center text-white font-semibold">
              {getInitials(profile?.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-slate-400 text-xs truncate">
                {profile?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="lg:ml-64">
        {/* Header móvil */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-muted hover:text-foreground hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#7B2CBF]" />
              <span className="font-bold text-foreground">Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B2CBF] to-[#00F5D4] flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(profile?.full_name)}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

