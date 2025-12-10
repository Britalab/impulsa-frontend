// src/app/register/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  MailCheck,
  Sparkles
} from 'lucide-react';
import { useRegisterForm } from '../lib/hooks/useRegisterForm';
import { validateRut } from '../lib/validators/rutValidator';

export default function RegisterPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [touched, setTouched] = useState({
    nombres: false,
    apellidos: false,
    rut: false,
    email: false
  });

  const handleSuccess = (email) => {
    setSentEmail(email);
    setEmailSent(true);
  };

  const {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit
  } = useRegisterForm(handleSuccess);

  // Validaciones
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const getFieldError = (field) => {
    if (!touched[field]) return null;
    
    switch (field) {
      case 'nombres':
        return !formData.nombres.trim() ? 'El nombre es requerido' : null;
      case 'apellidos':
        return !formData.apellidos.trim() ? 'El apellido es requerido' : null;
      case 'rut':
        if (!formData.rut.trim()) return 'El RUT es requerido';
        if (!validateRut(formData.rut)) return 'RUT inválido';
        return null;
      case 'email':
        if (!formData.email.trim()) return 'El correo es requerido';
        if (!isValidEmail(formData.email)) return 'Correo inválido';
        return null;
      default:
        return null;
    }
  };

  const isFieldValid = (field) => {
    if (!touched[field] || !formData[field].trim()) return false;
    return !getFieldError(field);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Pantalla de éxito - Email enviado
  if (emailSent) {
    return (
      <div className="auth-background min-h-screen flex items-center justify-center p-4 md:p-6">
        <div className="auth-card animate-slide-up text-center">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-emerald-100 flex items-center justify-center animate-pulse-ring">
              <MailCheck className="w-10 h-10 text-success" strokeWidth={1.5} />
            </div>
          </div>

          {/* Mensaje de éxito */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            ¡Revisa tu correo!
          </h1>
          
          <p className="text-muted mb-2">
            Enviamos un link de verificación a
          </p>
          
          <p className="text-lg font-semibold text-foreground mb-6">
            {sentEmail}
          </p>

          {/* Instrucciones */}
          <div className="bg-primary/5 rounded-xl p-5 text-left mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Próximos pasos
            </h3>
            <ol className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                Abre tu bandeja de entrada
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                Busca el correo de IMPULSA
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                Haz clic en el botón de verificación
              </li>
            </ol>
          </div>

          {/* Nota sobre spam */}
          <p className="text-xs text-subtle">
            ¿No lo encuentras? Revisa tu carpeta de spam o correo no deseado.
          </p>

          {/* Link a login */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted">
              ¿Ya verificaste tu cuenta?{' '}
              <Link href="/login" className="auth-link">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de registro
  return (
    <div className="auth-background min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="auth-card animate-slide-up max-w-lg">
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
            Crea tu cuenta
          </h1>
          <p className="text-muted text-sm">
            Únete a la comunidad de aprendizaje colaborativo
          </p>
        </div>

        {/* Error general */}
        {error && (
          <div className="error-box flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombres y Apellidos en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombres */}
            <div>
              <label htmlFor="nombres" className="field-label">
                Nombres
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                <input
                  id="nombres"
                  type="text"
                  name="nombres"
                  placeholder="Juan Pablo"
                  value={formData.nombres}
                  onChange={handleChange}
                  onBlur={() => handleBlur('nombres')}
                  required
                  className={`input-field pl-12 ${getFieldError('nombres') ? 'error' : ''} ${
                    isFieldValid('nombres') ? 'success' : ''
                  }`}
                  disabled={loading}
                />
                {isFieldValid('nombres') && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                )}
              </div>
              {getFieldError('nombres') && (
                <p className="field-error">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {getFieldError('nombres')}
                </p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor="apellidos" className="field-label">
                Apellidos
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                <input
                  id="apellidos"
                  type="text"
                  name="apellidos"
                  placeholder="González Silva"
                  value={formData.apellidos}
                  onChange={handleChange}
                  onBlur={() => handleBlur('apellidos')}
                  required
                  className={`input-field pl-12 ${getFieldError('apellidos') ? 'error' : ''} ${
                    isFieldValid('apellidos') ? 'success' : ''
                  }`}
                  disabled={loading}
                />
                {isFieldValid('apellidos') && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                )}
              </div>
              {getFieldError('apellidos') && (
                <p className="field-error">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {getFieldError('apellidos')}
                </p>
              )}
            </div>
          </div>

          {/* RUT */}
          <div>
            <label htmlFor="rut" className="field-label">
              RUT
            </label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
              <input
                id="rut"
                type="text"
                name="rut"
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={handleChange}
                onBlur={() => handleBlur('rut')}
                required
                maxLength={12}
                className={`input-field pl-12 ${getFieldError('rut') ? 'error' : ''} ${
                  isFieldValid('rut') ? 'success' : ''
                }`}
                disabled={loading}
              />
              {isFieldValid('rut') && (
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
              )}
            </div>
            {getFieldError('rut') ? (
              <p className="field-error">
                <AlertCircle className="w-3.5 h-3.5" />
                {getFieldError('rut')}
              </p>
            ) : (
              <p className="field-hint">Este será tu identificador único</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="field-label">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                required
                className={`input-field pl-12 ${getFieldError('email') ? 'error' : ''} ${
                  isFieldValid('email') ? 'success' : ''
                }`}
                disabled={loading}
              />
              {isFieldValid('email') && (
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
              )}
            </div>
            {getFieldError('email') ? (
              <p className="field-error">
                <AlertCircle className="w-3.5 h-3.5" />
                {getFieldError('email')}
              </p>
            ) : (
              <p className="field-hint">Te enviaremos un link para verificar tu cuenta</p>
            )}
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando tu cuenta...
              </>
            ) : (
              <>
                Crear cuenta
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-subtle">¿Ya tienes cuenta?</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Link a login */}
        <Link
          href="/login"
          className="block w-full py-3 px-6 rounded-xl font-semibold text-center text-primary border-2 border-primary/20 bg-primary/5 transition-all duration-200 ease-out hover:bg-primary/10 hover:border-primary/30"
        >
          Iniciar sesión
        </Link>

        {/* Footer */}
        <p className="text-center text-xs text-subtle mt-8">
          Al crear tu cuenta, aceptas nuestros{' '}
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
