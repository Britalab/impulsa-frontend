// src/components/AdminProposalManager.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  User,
  Tag,
  Calendar,
  Search,
  RefreshCw,
  Loader2,
  FileText,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Building2,
  DoorOpen,
  BookOpen,
  Sun,
  Sunset,
  Moon,
  Sparkles
} from 'lucide-react';
import { getPendingWorkshops, getUniversitiesWithRooms, approveWorkshop, rejectWorkshop } from '../app/lib/services/adminService';

// Mapeo de preferencias horarias
const preferenciasHorariasMap = {
  manana: { label: 'Mañana', sublabel: '8:00 - 12:00', icon: Sun },
  tarde: { label: 'Tarde', sublabel: '14:00 - 18:00', icon: Sunset },
  noche: { label: 'Noche', sublabel: '18:00 - 21:00', icon: Moon },
};

export default function AdminProposalManager({ onActionComplete }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de revisión
  const [reviewModal, setReviewModal] = useState({ open: false, workshop: null });

  // Cargar propuestas pendientes
  const loadProposals = async () => {
    setLoading(true);
    const { data, error } = await getPendingWorkshops();
    if (data) {
      setProposals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProposals();
  }, []);

  // Filtrar por búsqueda
  const filteredProposals = proposals.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(query) ||
      p.instructor?.full_name?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    );
  });

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Manejar acción completada
  const handleActionComplete = (action) => {
    loadProposals();
    onActionComplete?.(action);
  };

  return (
    <>
      {/* Tabla de Propuestas Pendientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Propuestas Pendientes de Revisión
              </h2>
              <p className="text-sm text-muted">
                {filteredProposals.length} {filteredProposals.length === 1 ? 'propuesta requiere' : 'propuestas requieren'} tu atención
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Buscar propuesta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#7B2CBF] focus:ring-2 focus:ring-[#7B2CBF]/10 outline-none w-full sm:w-64"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={loadProposals}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de tabla */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#7B2CBF] animate-spin" />
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <p className="text-muted font-medium">¡Todo al día!</p>
            <p className="text-sm text-muted mt-1">No hay propuestas pendientes de revisión</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Título
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                    Autor (Estudiante)
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                    Categoría
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                    Fecha de Solicitud
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-foreground truncate">
                          {proposal.title}
                        </p>
                        <p className="text-sm text-muted truncate md:hidden">
                          {proposal.instructor?.full_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                          {proposal.instructor?.full_name?.charAt(0) || 'E'}
                        </div>
                        <span className="text-sm text-foreground">
                          {proposal.instructor?.full_name || 'Sin asignar'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {proposal.category || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-muted">
                        {formatDate(proposal.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setReviewModal({ open: true, workshop: proposal })}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Revisión */}
      <ReviewModal
        isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, workshop: null })}
        workshop={reviewModal.workshop}
        onActionComplete={handleActionComplete}
      />
    </>
  );
}

// Modal de Revisión y Aprobación
function ReviewModal({ isOpen, onClose, workshop, onActionComplete }) {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Cargar universidades y salas
  useEffect(() => {
    async function loadData() {
      if (!isOpen) return;
      
      setLoadingData(true);
      const { data } = await getUniversitiesWithRooms();
      setUniversities(data || []);
      setLoadingData(false);
    }

    loadData();
  }, [isOpen]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedUniversity('');
      setSelectedRoom('');
      setSelectedDate('');
      setSelectedTime('');
      setRejectReason('');
      setShowRejectInput(false);
      setError(null);
    }
  }, [isOpen]);

  // Obtener salas de la universidad seleccionada
  const availableRooms = selectedUniversity
    ? universities.find(u => u.id === parseInt(selectedUniversity))?.rooms || []
    : [];

  // Formatear duración
  const formatDuration = (minutes) => {
    if (!minutes) return 'No especificada';
    if (minutes === 60) return '1 hora';
    if (minutes === 120) return '2 horas';
    if (minutes === 180) return '3 horas';
    return `${minutes} minutos`;
  };

  // Manejar aprobación
  const handleApprove = async () => {
    if (!selectedUniversity || !selectedRoom || !selectedDate || !selectedTime) {
      setError('Por favor completa todos los campos para aprobar');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await approveWorkshop(
      workshop.id,
      parseInt(selectedUniversity),
      parseInt(selectedRoom),
      selectedDate,
      selectedTime
    );

    setLoading(false);

    if (result.success) {
      onActionComplete?.('approved');
      onClose();
    } else {
      setError(result.error);
    }
  };

  // Manejar rechazo
  const handleReject = async () => {
    if (showRejectInput && !rejectReason.trim()) {
      setError('Por favor ingresa una razón para el rechazo');
      return;
    }

    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await rejectWorkshop(workshop.id, rejectReason);

    setLoading(false);

    if (result.success) {
      onActionComplete?.('rejected');
      onClose();
    } else {
      setError(result.error);
    }
  };

  if (!isOpen || !workshop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header con gradiente */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  Pendiente de Revisión
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Revisar Propuesta de Taller
              </h2>
              <p className="text-sm text-muted mt-1">
                Revisa los detalles y asigna los recursos necesarios
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-foreground hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          {/* ============================================ */}
          {/* PARTE SUPERIOR: Datos del estudiante (Solo Lectura) */}
          {/* ============================================ */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[#7B2CBF]" />
              <h3 className="font-bold text-foreground">Propuesta del Estudiante</h3>
              <span className="text-xs text-muted bg-gray-100 px-2 py-0.5 rounded-full">Solo lectura</span>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
              {/* Título */}
              <h4 className="font-bold text-lg text-foreground mb-4">
                {workshop.title}
              </h4>
              
              {/* Info en grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-xs text-muted">Autor</p>
                    <p className="text-sm font-medium text-foreground">
                      {workshop.instructor?.full_name || 'Sin asignar'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-xs text-muted">Categoría</p>
                    <p className="text-sm font-medium text-foreground">
                      {workshop.category || 'Sin categoría'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-xs text-muted">Duración</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDuration(workshop.duration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-xs text-muted">Capacidad</p>
                    <p className="text-sm font-medium text-foreground">
                      {workshop.capacity || 25} personas
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción completa */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                  Descripción Completa
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {workshop.description || 'Sin descripción proporcionada.'}
                </p>
              </div>

              {/* Preferencia horaria (si existe) */}
              {workshop.time_preference && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Preferencia Horaria del Estudiante
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                    {preferenciasHorariasMap[workshop.time_preference] ? (
                      <>
                        {(() => {
                          const pref = preferenciasHorariasMap[workshop.time_preference];
                          const Icon = pref.icon;
                          return (
                            <>
                              <Icon className="w-4 h-4 text-amber-500" />
                              <span className="text-sm font-medium text-foreground">
                                {pref.label}
                              </span>
                              <span className="text-xs text-muted">
                                ({pref.sublabel})
                              </span>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <span className="text-sm text-muted">No especificada</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* PARTE INFERIOR: Asignación de Recursos (Solo Admin) */}
          {/* ============================================ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[#7B2CBF]" />
              <h3 className="font-bold text-foreground">Asignación de Recursos</h3>
              <span className="text-xs text-white bg-[#7B2CBF] px-2 py-0.5 rounded-full">Solo Admin</span>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#7B2CBF] animate-spin" />
              </div>
            ) : (
              <div className="bg-[#7B2CBF]/5 rounded-xl p-5 border border-[#7B2CBF]/20 space-y-5">
                {/* Universidad */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <Building2 className="w-4 h-4 inline mr-1.5 text-[#7B2CBF]" />
                    Universidad
                  </label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => {
                      setSelectedUniversity(e.target.value);
                      setSelectedRoom('');
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all"
                    disabled={loading}
                  >
                    <option value="">Seleccionar universidad</option>
                    {universities.map(uni => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sala */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <DoorOpen className="w-4 h-4 inline mr-1.5 text-[#7B2CBF]" />
                    Sala / Espacio
                  </label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    disabled={loading || !selectedUniversity}
                  >
                    <option value="">
                      {selectedUniversity ? 'Seleccionar sala' : 'Primero selecciona universidad'}
                    </option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha y Hora */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      <Calendar className="w-4 h-4 inline mr-1.5 text-[#7B2CBF]" />
                      Fecha Oficial
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      <Clock className="w-4 h-4 inline mr-1.5 text-[#7B2CBF]" />
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Input de razón de rechazo */}
                {showRejectInput && (
                  <div className="border-t border-[#7B2CBF]/20 pt-5">
                    <label className="block text-sm font-semibold text-red-600 mb-2">
                      <AlertCircle className="w-4 h-4 inline mr-1.5" />
                      Razón del Rechazo
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explica brevemente por qué se rechaza esta propuesta..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none"
                      disabled={loading}
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-red-600 font-medium bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading && showRejectInput ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {showRejectInput ? 'Confirmar Rechazo' : 'Rechazar'}
          </button>

          <div className="flex gap-3">
            {showRejectInput && (
              <button
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectReason('');
                  setError(null);
                }}
                disabled={loading}
                className="px-5 py-2.5 text-muted font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                Volver
              </button>
            )}
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-muted font-medium hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            {!showRejectInput && (
              <button
                onClick={handleApprove}
                disabled={loading || !selectedUniversity || !selectedRoom || !selectedDate || !selectedTime}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7B2CBF] to-[#5A189A] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#7B2CBF]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Aprobar y Publicar
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

