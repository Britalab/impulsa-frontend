// src/app/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, KeyRound, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sendLoginCode, verifyOtp } from '../lib/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({ email: false });

  // Validación de email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const emailError = touched.email && email && !isValidEmail(email) 
    ? 'Ingresa un correo válido' 
    : null;

  const handleSendLink = async (e) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      setTouched({ email: true });
      return;
    }

    setLoading(true);
    setError(null);

    const result = await sendLoginCode(email);

    setLoading(false);

    if (result.success) {
      setStep('code');
    } else {
      setError(result.error);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await verifyOtp(email, token);

    setLoading(false);

    if (result.success) {
      router.push('/marketplace');
    } else {
      setError(result.error);
    }
  };

  // Pantalla de ingreso de código OTP
  if (step === 'code') {
    return (
      <div className="auth-background min-h-screen flex items-center justify-center p-4 md:p-6">
        <div className="auth-card animate-slide-up">
          {/* Icono animado */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center animate-pulse-ring">
              <KeyRound className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          {/* Encabezado */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Ingresa el código
            </h1>
            <p className="text-muted text-sm">
              Enviamos un código de 8 dígitos a{' '}
              <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <label htmlFor="otp" className="field-label">
                Código de verificación
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="00000000"
                value={token}
                onChange={(e) => {
                  // Solo permitir números
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setToken(value);
                  setError(null);
                }}
                required
                maxLength={8}
                className="input-field text-center text-2xl tracking-[0.3em] font-semibold"
                disabled={loading}
                autoFocus
              />
              <p className="field-hint text-center">
                El código expira en 10 minutos
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2"
              disabled={loading || token.length < 8}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Verificar código
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Volver */}
          <button
            onClick={() => {
              setStep('email');
              setToken('');
              setError(null);
            }}
            className="mt-6 w-full py-3 text-sm text-muted hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Usar otro correo
          </button>

          {/* Reenviar código */}
          <p className="text-center text-sm text-muted mt-4">
            ¿No recibiste el código?{' '}
            <button 
              onClick={handleSendLink}
              className="auth-link"
              disabled={loading}
            >
              Reenviar
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de ingreso de email
  return (
    <div className="auth-background min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="auth-card animate-slide-up">
        {/* Logo y marca */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              IMPULSA
            </span>
          </div>
        </div>

        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-muted text-sm">
            Ingresa tu correo para recibir un código de acceso
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="error-box flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSendLink} className="space-y-5">
          <div>
            <label htmlFor="email" className="field-label">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onBlur={() => setTouched({ ...touched, email: true })}
                required
                className={`input-field pl-12 ${emailError ? 'error' : ''} ${
                  touched.email && email && isValidEmail(email) ? 'success' : ''
                }`}
                disabled={loading}
                autoFocus
              />
              {touched.email && email && isValidEmail(email) && (
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
              )}
            </div>
            {emailError && (
              <p className="field-error">
                <AlertCircle className="w-3.5 h-3.5" />
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando código...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-subtle">¿Primera vez aquí?</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Link a registro */}
        <Link
          href="/register"
          className="block w-full py-3 px-6 rounded-xl font-semibold text-center text-primary border-2 border-primary/20 bg-primary/5 transition-all duration-200 ease-out hover:bg-primary/10 hover:border-primary/30"
        >
          Crear una cuenta nueva
        </Link>

        {/* Footer */}
        <p className="text-center text-xs text-subtle mt-8">
          Al continuar, aceptas nuestros{' '}
          <Link href="/terms" className="text-muted hover:text-primary transition-colors">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="text-muted hover:text-primary transition-colors">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}
