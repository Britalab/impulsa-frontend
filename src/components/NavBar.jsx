// src/components/NavBar.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut, 
  BookOpen, 
  ClipboardList,
  Sparkles,
  Shield
} from 'lucide-react';
import { signOut } from '../app/lib/services/authService';

export default function NavBar({ user, isAdmin = false }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Obtener datos del usuario
  const userEmail = user?.email ?? user?.user?.email ?? null;
  const userName = user?.user_metadata?.full_name ?? user?.user?.user_metadata?.full_name ?? userEmail?.split('@')[0] ?? 'Usuario';
  const userInitials = userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navLinks = [
    { href: '/marketplace', label: 'Explorar Talleres', icon: BookOpen },
    { href: '/mis-inscripciones', label: 'Mis Inscripciones', icon: ClipboardList },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7B2CBF] to-[#5A189A] flex items-center justify-center shadow-md shadow-[#7B2CBF]/20 group-hover:shadow-lg group-hover:shadow-[#7B2CBF]/30 transition-shadow">
              <span className="text-white font-bold text-base">I</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              IMPULSA
            </span>
          </Link>

          {/* Links de navegación - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-gray-50 rounded-lg transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Acciones - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* CTA Quiero Enseñar */}
            <Link
              href="/proponer-taller"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-[#00F5D4] rounded-full shadow-md shadow-[#00F5D4]/25 hover:shadow-lg hover:shadow-[#00F5D4]/30 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Quiero Enseñar
            </Link>

            {userEmail ? (
              /* Menú de usuario autenticado */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B2CBF] to-[#00F5D4] flex items-center justify-center text-white text-sm font-semibold">
                    {userInitials}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                    {/* Info del usuario */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-xs text-muted truncate">{userEmail}</p>
                    </div>

                    {/* Links del menú */}
                    <div className="py-1">
                      <Link
                        href="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </Link>
                      
                      <Link
                        href="/mis-inscripciones"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-gray-50 transition-colors"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Mis Inscripciones
                      </Link>

                      {/* Link Admin - Solo si es admin */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-orange-50 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Panel Admin
                        </Link>
                      )}
                    </div>

                    {/* Cerrar sesión */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Botones para usuarios no autenticados */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#7B2CBF] hover:bg-[#5A189A] rounded-full transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {/* Links de navegación */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-muted hover:text-foreground hover:bg-gray-50 rounded-lg transition-colors"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}

            {/* CTA Quiero Enseñar */}
            <Link
              href="/proponer-taller"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 mt-4 px-4 py-3 text-base font-semibold text-slate-900 bg-[#00F5D4] rounded-xl"
            >
              <Sparkles className="w-5 h-5" />
              Quiero Enseñar
            </Link>

            {/* Sección de usuario */}
            {userEmail ? (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                {/* Info del usuario */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B2CBF] to-[#00F5D4] flex items-center justify-center text-white font-semibold">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                    <p className="text-xs text-muted">{userEmail}</p>
                  </div>
                </div>

                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base text-muted hover:text-foreground hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  Mi Perfil
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base text-accent hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Panel Admin
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-base font-medium text-[#7B2CBF] border-2 border-[#7B2CBF]/20 rounded-xl hover:bg-[#7B2CBF]/5 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-base font-semibold text-white bg-[#7B2CBF] rounded-xl hover:bg-[#5A189A] transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

