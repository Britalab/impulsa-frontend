// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  TrendingUp, 
  BookOpen,
  ArrowRight,
  Zap,
  Monitor,
  Briefcase,
  Loader2
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import WorkshopCard from '../components/WorkshopCard';
import { getPublishedWorkshops } from './lib/services/workshopService';

// Áreas de interés universitarias
const areasDeInteres = [
  { 
    id: 'informatica',
    name: 'Informática y Ciberseguridad', 
    icon: Monitor, 
    description: 'Programación, seguridad digital y tecnología',
    color: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'administracion',
    name: 'Administración de Empresas', 
    icon: Briefcase, 
    description: 'Finanzas, emprendimiento y gestión',
    color: 'from-emerald-500 to-teal-600'
  },
];

export default function HomePage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState(null);

  // Cargar talleres desde Supabase
  useEffect(() => {
    async function loadWorkshops() {
      setLoading(true);
      const { data, error } = await getPublishedWorkshops();
      
      if (!error && data) {
        setWorkshops(data);
      }
      setLoading(false);
    }

    loadWorkshops();
  }, []);

  // Filtrar talleres por área seleccionada
  const filteredWorkshops = selectedArea 
    ? workshops.filter(w => w.category === selectedArea)
    : workshops;

  // Obtener talleres destacados (los primeros 3 o los más recientes)
  const featuredWorkshops = workshops.slice(0, 3);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#5A189A] to-slate-900">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Círculos decorativos */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7B2CBF]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#00F5D4]/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-[#00F5D4]" />
              Plataforma de aprendizaje colaborativo
            </div>

            {/* Título */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Comparte tu conocimiento,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#9D4EDD]">
                Aprende de tus pares
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Conecta con estudiantes de tu universidad, imparte talleres sobre lo que dominas 
              y aprende nuevas habilidades de otros impulsores.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#7B2CBF] font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                Explorar Talleres
              </Link>
              <Link
                href="/proponer-taller"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#00F5D4] text-slate-900 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <Zap className="w-5 h-5" />
                Quiero Enseñar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Talleres Destacados */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-[#7B2CBF] font-semibold text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                PRÓXIMOS TALLERES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Talleres Destacados
              </h2>
              <p className="text-muted mt-2">Inscríbete en los talleres más populares</p>
            </div>
            <Link 
              href="/marketplace"
              className="flex items-center gap-2 text-[#7B2CBF] font-semibold hover:gap-3 transition-all"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid de destacados */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#7B2CBF] animate-spin" />
            </div>
          ) : featuredWorkshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWorkshops.map((workshop) => (
                <WorkshopCard 
                  key={workshop.id} 
                  workshop={{
                    ...workshop,
                    instructor: workshop.instructor_name,
                    categories: workshop.category ? [workshop.category] : [],
                  }} 
                  featured 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted">No hay talleres disponibles por el momento</p>
            </div>
          )}
        </div>
      </section>

      {/* Sección CTA Quiero Enseñar */}
      <section className="py-16 bg-gradient-to-r from-[#7B2CBF] to-[#5A189A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ¿Tienes conocimientos que compartir?
              </h2>
              <p className="text-white/80 text-lg max-w-xl">
                Conviértete en impulsor, crea tu propio taller y ayuda a otros estudiantes a aprender.
              </p>
            </div>
            <Link
              href="/proponer-taller"
              className="flex items-center gap-2 px-8 py-4 bg-[#00F5D4] text-slate-900 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Zap className="w-5 h-5" />
              Proponer un Taller
            </Link>
          </div>
        </div>
      </section>

      {/* Explora por Áreas de Interés */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Explora por Áreas de Interés
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Encuentra talleres en las áreas que más te interesan para potenciar tu desarrollo académico y profesional
            </p>
          </div>

          {/* Grid de áreas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {areasDeInteres.map((area) => {
              const Icon = area.icon;
              const isSelected = selectedArea === area.name;
              const workshopsInArea = workshops.filter(w => w.category === area.name);
              
              return (
                <button
                  key={area.id}
                  onClick={() => setSelectedArea(isSelected ? null : area.name)}
                  className={`relative overflow-hidden p-8 rounded-2xl text-left transition-all group ${
                    isSelected 
                      ? 'ring-4 ring-[#7B2CBF] ring-offset-2' 
                      : 'hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {/* Fondo con gradiente */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-90`} />
                  
                  {/* Patrón decorativo */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                  </div>

                  {/* Contenido */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {area.name}
                    </h3>
                    <p className="text-white/80">
                      {area.description}
                    </p>
                    
                    {/* Indicador de selección */}
                    <div className={`mt-4 inline-flex items-center gap-2 text-white font-medium ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                      {isSelected ? 'Mostrando talleres' : 'Ver talleres'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Talleres del área seleccionada */}
          {selectedArea && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  Talleres de {selectedArea}
                </h3>
                <button
                  onClick={() => setSelectedArea(null)}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  Ver todos
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#7B2CBF] animate-spin" />
                </div>
              ) : filteredWorkshops.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredWorkshops.map((workshop) => (
                    <WorkshopCard 
                      key={workshop.id} 
                      workshop={{
                        ...workshop,
                        instructor: workshop.instructor_name,
                        categories: workshop.category ? [workshop.category] : [],
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted">No hay talleres en esta área por el momento</p>
                </div>
              )}
            </div>
          )}

          {/* Listado general si no hay área seleccionada */}
          {!selectedArea && workshops.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 text-[#7B2CBF] font-semibold text-sm mb-1">
                    <BookOpen className="w-4 h-4" />
                    TODOS LOS TALLERES
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Disponibles para inscripción
                  </h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {workshops.map((workshop) => (
                  <WorkshopCard 
                    key={workshop.id} 
                    workshop={{
                      ...workshop,
                      instructor: workshop.instructor_name,
                      categories: workshop.category ? [workshop.category] : [],
                    }} 
                  />
                ))}
              </div>

              {/* Ver más */}
              <div className="text-center mt-10">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#7B2CBF]/10 text-[#7B2CBF] font-semibold rounded-xl hover:bg-[#7B2CBF] hover:text-white transition-all"
                >
                  Explorar más talleres
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
