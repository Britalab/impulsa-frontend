// src/components/WorkshopManageModal.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Building2,
  DoorOpen,
  User,
  BookOpen,
  Tag,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { approveWorkshop, rejectWorkshop, getUniversitiesWithRooms } from '../app/lib/services/adminService';

export default function WorkshopManageModal({
  isOpen,
  onClose,
  workshop,
  onActionComplete
}) {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [action, setAction] = useState(null); // 'approve' | 'reject'
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
      setAction(null);
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
    setLoading(true);
    setError(null);

    const result = await rejectWorkshop(workshop.id);

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-[#7B2CBF]/5 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Gestionar Propuesta
            </h2>
            <p className="text-sm text-muted mt-1">
              Revisa y asigna recursos al taller
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info del taller */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-lg text-foreground mb-3">
              {workshop.title}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <User className="w-4 h-4" />
                <span>{workshop.instructor?.full_name || 'Sin asignar'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Tag className="w-4 h-4" />
                <span>{workshop.category || 'Sin categoría'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(workshop.duration)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <BookOpen className="w-4 h-4" />
                <span>Capacidad: {workshop.capacity || 25}</span>
              </div>
            </div>

            {workshop.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-muted">
                  {workshop.description}
                </p>
              </div>
            )}
          </div>

          {/* Formulario de asignación */}
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#7B2CBF] animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#7B2CBF]" />
                Asignar Ubicación y Horario
              </h4>

              {/* Universidad */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Universidad
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => {
                    setSelectedUniversity(e.target.value);
                    setSelectedRoom(''); // Reset sala al cambiar universidad
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all"
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sala / Espacio
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

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

        {/* Footer con acciones */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-red-600 font-medium bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading && action === 'reject' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            Rechazar
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-muted font-medium hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApprove}
              disabled={loading || !selectedUniversity || !selectedRoom || !selectedDate || !selectedTime}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7B2CBF] to-[#5A189A] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && action === 'approve' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Aprobar y Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

