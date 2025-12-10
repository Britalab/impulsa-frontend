// src/components/WorkshopCard.jsx
'use client';

import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Imágenes por categoría (áreas universitarias)
const categoryImages = {
  'informática y ciberseguridad': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
  'administración de empresas': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
  'ingeniería': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=250&fit=crop',
  'ciencias de la salud': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop',
  'comunicaciones': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop',
  'derecho': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop',
  'educación': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
  'habilidades blandas': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
  'liderazgo': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop',
  'default': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop',
};

// Colores para badges de categorías (áreas universitarias)
const categoryColors = {
  'informática y ciberseguridad': 'bg-blue-100 text-blue-700',
  'administración de empresas': 'bg-emerald-100 text-emerald-700',
  'ingeniería': 'bg-indigo-100 text-indigo-700',
  'ciencias de la salud': 'bg-rose-100 text-rose-700',
  'comunicaciones': 'bg-orange-100 text-orange-700',
  'derecho': 'bg-slate-100 text-slate-700',
  'educación': 'bg-amber-100 text-amber-700',
  'habilidades blandas': 'bg-purple-100 text-purple-700',
  'liderazgo': 'bg-cyan-100 text-cyan-700',
  'default': 'bg-gray-100 text-gray-700',
};

export default function WorkshopCard({ workshop, featured = false }) {
  const {
    id,
    title,
    description,
    instructor,
    instructor_avatar,
    instructor_reputation = 4.5,
    date,
    time,
    university_name,
    room_name,
    capacity = 20,
    enrolled = 0,
    categories = [],
    image,
  } = workshop;

  // Calcular cupos restantes
  const spotsLeft = capacity - enrolled;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 5;

  // Obtener imagen por categoría principal
  const mainCategory = categories[0]?.toLowerCase() || 'default';
  const cardImage = image || categoryImages[mainCategory] || categoryImages.default;

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Por definir';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 ${featured ? 'ring-2 ring-[#00F5D4] ring-offset-2' : ''}`}>
      {/* Imagen */}
      <div className="relative h-44 overflow-hidden">
        <img 
          src={cardImage} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badge destacado */}
        {featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-[#7B2CBF] text-white text-xs font-semibold rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Destacado
          </div>
        )}

        {/* Estado de cupos */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full ${
          isFull 
            ? 'bg-red-500 text-white' 
            : isAlmostFull 
              ? 'bg-amber-500 text-white' 
              : 'bg-white/90 text-gray-700'
        }`}>
          {isFull ? 'Agotado' : `${spotsLeft} cupos`}
        </div>

        {/* Categorías sobre la imagen */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {categories.slice(0, 2).map((cat, index) => (
            <span 
              key={index}
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[cat.toLowerCase()] || categoryColors.default}`}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Impulsor */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
            {instructor_avatar ? (
              <img src={instructor_avatar} alt={instructor} className="w-full h-full object-cover" />
            ) : (
              instructor?.charAt(0).toUpperCase() || 'I'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{instructor || 'Impulsor'}</p>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs text-muted">{instructor_reputation.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="space-y-2 mb-4">
          {/* Fecha y hora */}
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{time || 'Por definir'}</span>
            </div>
          </div>

          {/* Universidad */}
          {university_name && (
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{university_name}{room_name && ` - ${room_name}`}</span>
            </div>
          )}

          {/* Capacidad */}
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Users className="w-4 h-4" />
            <span>{enrolled}/{capacity} inscritos</span>
            {/* Barra de progreso */}
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-2">
              <div 
                className={`h-full rounded-full transition-all ${
                  isFull 
                    ? 'bg-red-500' 
                    : isAlmostFull 
                      ? 'bg-amber-500' 
                      : 'bg-primary'
                }`}
                style={{ width: `${Math.min((enrolled / capacity) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Botón */}
        <Link
          href={`/marketplace/${id}`}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
            isFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#7B2CBF]/10 text-[#7B2CBF] hover:bg-[#7B2CBF] hover:text-white'
          }`}
        >
          {isFull ? 'Sin cupos disponibles' : (
            <>
              Ver Detalle
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
