// src/app/perfil/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Star,
  BookOpen,
  Lightbulb,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  ChevronRight,
  CheckCircle,
  Clock3,
  XCircle,
  Award,
  TrendingUp
} from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import RatingModal from '../../components/RatingModal';
import { getSession } from '../lib/services/authService';
import {
  getProfileByAuthId,
  getUserEnrollments,
  getUserProposals,
  getImpulsorReputation
} from '../lib/services/profileService';

// Mapeo de estados de talleres
const statusConfig = {
  published: { label: 'Publicado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock3 },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: Clock3 },
};

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('aprendizajes');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState({ past: [], upcoming: [], all: [] });
  const [proposals, setProposals] = useState([]);
  const [reputation, setReputation] = useState({ average: 0, total: 0, count: 0 });
  
  // Modal de calificación
  const [ratingModal, setRatingModal] = useState({ open: false, workshop: null });

  // Cargar datos del perfil
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      
      // Obtener sesión
      const session = await getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      // Obtener perfil
      const { data: profileData } = await getProfileByAuthId(session.user.id);
      if (!profileData) {
        router.push('/login');
        return;
      }

      setProfile(profileData);

      // Cargar datos en paralelo
      const [enrollmentsResult, proposalsResult, reputationResult] = await Promise.all([
        getUserEnrollments(profileData.id),
        getUserProposals(profileData.id),
        getImpulsorReputation(profileData.id),
      ]);

      if (enrollmentsResult.data) {
        setEnrollments(enrollmentsResult.data);
      }

      if (proposalsResult.data) {
        setProposals(proposalsResult.data);
      }

      if (reputationResult.data) {
        setReputation(reputationResult.data);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  // Refrescar después de calificar
  const handleRatingSubmitted = async () => {
    if (profile) {
      const { data } = await getUserEnrollments(profile.id);
      if (data) setEnrollments(data);
    }
  };

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Por definir';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Verificar si es impulsor (tiene talleres propuestos)
  const isImpulsor = proposals.length > 0 || profile?.role === 'instructor';

  // Obtener iniciales
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[#7B2CBF] animate-spin mx-auto mb-4" />
            <p className="text-muted">Cargando perfil...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del perfil */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7B2CBF] to-[#00F5D4] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {getInitials(profile?.full_name)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {profile?.full_name || 'Usuario'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{profile?.email}</span>
                </div>
                
                {isImpulsor && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#7B2CBF]/10 text-[#7B2CBF] rounded-full">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">Impulsor</span>
                  </div>
                )}
              </div>

              {/* Reputación si es impulsor */}
              {isImpulsor && reputation.total > 0 && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(reputation.average)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {reputation.average.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-muted">
                    {reputation.total} calificaciones en {reputation.count} talleres
                  </span>
                </div>
              )}
            </div>

            {/* Stats rápidos */}
            <div className="flex gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7B2CBF]">
                  {enrollments.all.length}
                </div>
                <div className="text-xs text-muted">Inscripciones</div>
              </div>
              {isImpulsor && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00F5D4]">
                    {proposals.length}
                  </div>
                  <div className="text-xs text-muted">Talleres</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab headers */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('aprendizajes')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'aprendizajes'
                  ? 'text-[#7B2CBF] border-b-2 border-[#7B2CBF] bg-[#7B2CBF]/5'
                  : 'text-muted hover:text-foreground hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Mis Aprendizajes
            </button>
            <button
              onClick={() => setActiveTab('propuestas')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'propuestas'
                  ? 'text-[#7B2CBF] border-b-2 border-[#7B2CBF] bg-[#7B2CBF]/5'
                  : 'text-muted hover:text-foreground hover:bg-gray-50'
              }`}
            >
              <Lightbulb className="w-5 h-5" />
              Mis Propuestas
            </button>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'aprendizajes' && (
              <div className="space-y-8">
                {/* Próximos talleres */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                    <TrendingUp className="w-5 h-5 text-[#00F5D4]" />
                    Próximos Talleres
                  </h3>
                  
                  {enrollments.upcoming.length > 0 ? (
                    <div className="space-y-3">
                      {enrollments.upcoming.map((enrollment) => (
                        <WorkshopEnrollmentCard
                          key={enrollment.id}
                          enrollment={enrollment}
                          isPast={false}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={Calendar}
                      message="No tienes talleres próximos"
                      action={{ label: 'Explorar talleres', href: '/marketplace' }}
                    />
                  )}
                </div>

                {/* Talleres pasados */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Talleres Completados
                  </h3>
                  
                  {enrollments.past.length > 0 ? (
                    <div className="space-y-3">
                      {enrollments.past.map((enrollment) => (
                        <WorkshopEnrollmentCard
                          key={enrollment.id}
                          enrollment={enrollment}
                          isPast={true}
                          formatDate={formatDate}
                          onRate={() => setRatingModal({ 
                            open: true, 
                            workshop: enrollment.workshop 
                          })}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={BookOpen}
                      message="Aún no has completado ningún taller"
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'propuestas' && (
              <div>
                {proposals.length > 0 ? (
                  <div className="space-y-3">
                    {proposals.map((proposal) => (
                      <WorkshopProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={Lightbulb}
                    message="No has propuesto ningún taller aún"
                    action={{ label: 'Proponer un taller', href: '/proponer-taller' }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de calificación */}
      <RatingModal
        isOpen={ratingModal.open}
        onClose={() => setRatingModal({ open: false, workshop: null })}
        workshop={ratingModal.workshop}
        profileId={profile?.id}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </MainLayout>
  );
}

// Componente para tarjeta de inscripción
function WorkshopEnrollmentCard({ enrollment, isPast, formatDate, onRate }) {
  const workshop = enrollment.workshop;
  
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
      {/* Icono */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isPast ? 'bg-green-100' : 'bg-[#7B2CBF]/10'
      }`}>
        {isPast ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : (
          <Calendar className="w-6 h-6 text-[#7B2CBF]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate group-hover:text-[#7B2CBF] transition-colors">
          {workshop?.title || 'Taller'}
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted mt-1">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {workshop?.instructor_name || 'Impulsor'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(workshop?.date)}
          </span>
          {workshop?.time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {workshop.time}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {isPast && onRate && (
          <button
            onClick={onRate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <Star className="w-4 h-4" />
            Calificar
          </button>
        )}
        <Link
          href={`/marketplace/${workshop?.id}`}
          className="p-2 text-muted hover:text-[#7B2CBF] hover:bg-white rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

// Componente para tarjeta de propuesta
function WorkshopProposalCard({ proposal, formatDate }) {
  const status = statusConfig[proposal.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
      {/* Icono */}
      <div className="w-12 h-12 rounded-xl bg-[#7B2CBF]/10 flex items-center justify-center flex-shrink-0">
        <Lightbulb className="w-6 h-6 text-[#7B2CBF]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-foreground truncate group-hover:text-[#7B2CBF] transition-colors">
            {proposal.title}
          </h4>
          <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(proposal.date)}
          </span>
          {proposal.university_name && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {proposal.university_name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {proposal.enrolled}/{proposal.capacity} inscritos
          </span>
          {proposal.avg_rating && (
            <span className="flex items-center gap-1 text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {proposal.avg_rating.toFixed(1)} ({proposal.ratings_count})
            </span>
          )}
        </div>
      </div>

      {/* Acción */}
      <Link
        href={`/marketplace/${proposal.id}`}
        className="p-2 text-muted hover:text-[#7B2CBF] hover:bg-white rounded-lg transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}

// Componente para estado vacío
function EmptyState({ icon: Icon, message, action }) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-xl">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-muted mb-4">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7B2CBF] text-white font-medium rounded-lg hover:bg-[#5A189A] transition-colors"
        >
          {action.label}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

