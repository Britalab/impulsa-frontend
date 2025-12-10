// src/app/proponer-taller/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Lightbulb,
  BookOpen,
  Clock,
  Sun,
  Sunset,
  Moon,
  Package,
  Send,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import Toast, { useToast } from '../../components/Toast';
import { getSession } from '../lib/services/authService';
import { getProfileByAuthId } from '../lib/services/profileService';
import supabase from '../lib/supabaseClient';

// Categorías disponibles
const categorias = [
  { value: '', label: 'Selecciona una categoría' },
  { value: 'Informática y Ciberseguridad', label: 'Informática y Ciberseguridad' },
  { value: 'Administración de Empresas', label: 'Administración de Empresas' },
  { value: 'Ingeniería', label: 'Ingeniería' },
  { value: 'Ciencias de la Salud', label: 'Ciencias de la Salud' },
  { value: 'Comunicaciones', label: 'Comunicaciones' },
  { value: 'Derecho', label: 'Derecho' },
  { value: 'Arte y Diseño', label: 'Arte y Diseño' },
  { value: 'Habilidades Blandas', label: 'Habilidades Blandas' },
  { value: 'Liderazgo', label: 'Liderazgo' },
];

// Duraciones disponibles
const duraciones = [
  { value: '', label: 'Selecciona duración' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
];

// Preferencias horarias
const preferenciasHorarias = [
  { value: 'manana', label: 'Mañana', sublabel: '8:00 - 12:00', icon: Sun },
  { value: 'tarde', label: 'Tarde', sublabel: '14:00 - 18:00', icon: Sunset },
  { value: 'noche', label: 'Noche', sublabel: '18:00 - 21:00', icon: Moon },
];

export default function ProponerTallerPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    duracion: '',
    preferenciaHoraria: '',
    materialNecesario: '',
  });

  // Estado de validación (touched)
  const [touched, setTouched] = useState({
    titulo: false,
    categoria: false,
    descripcion: false,
    duracion: false,
    preferenciaHoraria: false,
  });

  // Cargar perfil
  useEffect(() => {
    async function loadProfile() {
      const session = await getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await getProfileByAuthId(session.user.id);
      if (!profileData) {
        router.push('/login');
        return;
      }

      setProfile(profileData);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  // Validaciones
  const getErrors = () => {
    const errors = {};
    
    if (formData.titulo.trim().length < 10) {
      errors.titulo = 'El título debe tener al menos 10 caracteres';
    }
    
    if (!formData.categoria) {
      errors.categoria = 'Selecciona una categoría';
    }
    
    if (formData.descripcion.trim().length < 50) {
      errors.descripcion = `La descripción debe tener al menos 50 caracteres (${formData.descripcion.trim().length}/50)`;
    }
    
    if (!formData.duracion) {
      errors.duracion = 'Selecciona una duración';
    }
    
    if (!formData.preferenciaHoraria) {
      errors.preferenciaHoraria = 'Selecciona una preferencia horaria';
    }

    return errors;
  };

  const errors = getErrors();
  const isFormValid = Object.keys(errors).length === 0;

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos como touched
    setTouched({
      titulo: true,
      categoria: true,
      descripcion: true,
      duracion: true,
      preferenciaHoraria: true,
    });

    if (!isFormValid) return;

    setSubmitting(true);

    try {
      // Insertar propuesta en la base de datos
      const { error } = await supabase
        .from('workshops')
        .insert({
          title: formData.titulo.trim(),
          category: formData.categoria,
          description: formData.descripcion.trim(),
          duration: parseInt(formData.duracion),
          instructor_id: profile.id,
          status: 'pending', // Estado pendiente de aprobación
          capacity: 25, // Capacidad por defecto, el admin puede cambiarla
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Simular delay adicional para UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mostrar toast de éxito
      showToast('¡Propuesta Enviada! Te notificaremos pronto.', 'success', '¡Felicitaciones!');

      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/perfil?tab=propuestas');
      }, 2000);

    } catch (error) {
      console.error('Error al enviar propuesta:', error);
      showToast('Hubo un error al enviar tu propuesta. Intenta nuevamente.', 'error', 'Error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[#7B2CBF] animate-spin mx-auto mb-4" />
            <p className="text-muted">Cargando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#7B2CBF]/5 to-transparent py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#7B2CBF] to-[#5A189A] rounded-2xl shadow-lg shadow-[#7B2CBF]/25 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Comparte tu Pasión
            </h1>
            <p className="text-muted text-lg max-w-md mx-auto">
              Propón un taller y conviértete en Impulsor. El equipo revisará tu propuesta en 24-48hrs.
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título del Taller */}
              <div>
                <label htmlFor="titulo" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <BookOpen className="w-4 h-4 text-[#7B2CBF]" />
                  Título del Taller
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  value={formData.titulo}
                  onChange={handleChange}
                  onBlur={() => handleBlur('titulo')}
                  placeholder="Ej: Introducción a la Inteligencia Artificial"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.titulo && errors.titulo 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#7B2CBF] focus:ring-[#7B2CBF]/20'
                  } focus:ring-4 outline-none transition-all`}
                  disabled={submitting}
                />
                {touched.titulo && errors.titulo && (
                  <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {errors.titulo}
                  </p>
                )}
                {touched.titulo && !errors.titulo && formData.titulo && (
                  <p className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Buen título!
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label htmlFor="categoria" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <Lightbulb className="w-4 h-4 text-[#7B2CBF]" />
                  Categoría
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  onBlur={() => handleBlur('categoria')}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.categoria && errors.categoria 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#7B2CBF] focus:ring-[#7B2CBF]/20'
                  } focus:ring-4 outline-none transition-all bg-white`}
                  disabled={submitting}
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {touched.categoria && errors.categoria && (
                  <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {errors.categoria}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <BookOpen className="w-4 h-4 text-[#7B2CBF]" />
                  Descripción Detallada
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  onBlur={() => handleBlur('descripcion')}
                  placeholder="Describe el temario y qué necesitan los alumnos. ¿Qué aprenderán? ¿Qué nivel de conocimiento previo se requiere? ¿Cuáles son los objetivos del taller?"
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.descripcion && errors.descripcion 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#7B2CBF] focus:ring-[#7B2CBF]/20'
                  } focus:ring-4 outline-none transition-all resize-none`}
                  disabled={submitting}
                />
                <div className="flex justify-between mt-2">
                  {touched.descripcion && errors.descripcion ? (
                    <p className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.descripcion}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className={`text-sm ${formData.descripcion.length >= 50 ? 'text-green-600' : 'text-muted'}`}>
                    {formData.descripcion.length}/50 mínimo
                  </span>
                </div>
              </div>

              {/* Duración */}
              <div>
                <label htmlFor="duracion" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <Clock className="w-4 h-4 text-[#7B2CBF]" />
                  Duración Estimada
                </label>
                <select
                  id="duracion"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                  onBlur={() => handleBlur('duracion')}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.duracion && errors.duracion 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-[#7B2CBF] focus:ring-[#7B2CBF]/20'
                  } focus:ring-4 outline-none transition-all bg-white`}
                  disabled={submitting}
                >
                  {duraciones.map(dur => (
                    <option key={dur.value} value={dur.value}>
                      {dur.label}
                    </option>
                  ))}
                </select>
                {touched.duracion && errors.duracion && (
                  <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {errors.duracion}
                  </p>
                )}
              </div>

              {/* Preferencia Horaria */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Clock className="w-4 h-4 text-[#7B2CBF]" />
                  Preferencia Horaria
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {preferenciasHorarias.map(pref => {
                    const Icon = pref.icon;
                    const isSelected = formData.preferenciaHoraria === pref.value;
                    return (
                      <button
                        key={pref.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, preferenciaHoraria: pref.value }));
                          setTouched(prev => ({ ...prev, preferenciaHoraria: true }));
                        }}
                        disabled={submitting}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-[#7B2CBF] bg-[#7B2CBF]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-[#7B2CBF]' : 'text-muted'}`} />
                        <p className={`font-medium ${isSelected ? 'text-[#7B2CBF]' : 'text-foreground'}`}>
                          {pref.label}
                        </p>
                        <p className="text-xs text-muted mt-1">{pref.sublabel}</p>
                      </button>
                    );
                  })}
                </div>
                {touched.preferenciaHoraria && errors.preferenciaHoraria && (
                  <p className="flex items-center gap-1 mt-3 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {errors.preferenciaHoraria}
                  </p>
                )}
              </div>

              {/* Material Necesario (Opcional) */}
              <div>
                <label htmlFor="materialNecesario" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <Package className="w-4 h-4 text-[#7B2CBF]" />
                  Material Necesario
                  <span className="text-xs font-normal text-muted">(Opcional)</span>
                </label>
                <input
                  id="materialNecesario"
                  name="materialNecesario"
                  type="text"
                  value={formData.materialNecesario}
                  onChange={handleChange}
                  placeholder="Ej: Traer laptop, cuaderno, ropa cómoda..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/20 outline-none transition-all"
                  disabled={submitting}
                />
                <p className="mt-2 text-xs text-muted">
                  Indica qué deben traer los participantes al taller
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-6">
                {/* Info */}
                <div className="flex items-start gap-3 p-4 bg-[#00F5D4]/10 rounded-xl mb-6">
                  <Sparkles className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">¿Qué sigue después?</p>
                    <p className="text-sm text-muted mt-1">
                      Nuestro equipo revisará tu propuesta y te contactará para coordinar fecha, 
                      hora y sala. ¡Prepárate para inspirar a otros!
                    </p>
                  </div>
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                    isFormValid && !submitting
                      ? 'bg-gradient-to-r from-[#7B2CBF] to-[#5A189A] hover:shadow-lg hover:shadow-[#7B2CBF]/25 hover:-translate-y-0.5'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando propuesta...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Propuesta
                    </>
                  )}
                </button>

                {/* Helper text */}
                {!isFormValid && (
                  <p className="text-center text-sm text-muted mt-4">
                    Completa todos los campos requeridos para enviar tu propuesta
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        title={toast.title}
        onClose={hideToast}
      />
    </MainLayout>
  );
}

