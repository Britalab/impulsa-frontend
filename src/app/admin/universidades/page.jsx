// src/app/admin/universidades/page.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  DoorOpen,
  Plus,
  Loader2,
  MapPin
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { getUniversitiesWithRooms } from '../../lib/services/adminService';

export default function UniversidadesPage() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data } = await getUniversitiesWithRooms();
      setUniversities(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Universidades y Salas
          </h1>
          <p className="text-muted">
            Gestiona los espacios disponibles para talleres
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#7B2CBF] text-white font-medium rounded-xl hover:bg-[#5A189A] transition-colors">
          <Plus className="w-5 h-5" />
          Agregar
        </button>
      </div>

      {/* Grid de universidades */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#7B2CBF] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((uni) => (
            <div
              key={uni.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-[#7B2CBF]/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#7B2CBF]/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#7B2CBF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{uni.name}</h3>
                    <p className="text-sm text-muted">
                      {uni.rooms?.length || 0} salas disponibles
                    </p>
                  </div>
                </div>
              </div>

              {/* Salas */}
              <div className="p-4 space-y-2">
                {uni.rooms?.length > 0 ? (
                  uni.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <DoorOpen className="w-5 h-5 text-muted" />
                      <span className="text-sm font-medium text-foreground">
                        {room.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted text-center py-4">
                    Sin salas registradas
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Gestión de espacios</h4>
            <p className="text-sm text-blue-700 mt-1">
              Para agregar nuevas universidades o salas, contacta al equipo de desarrollo 
              o utiliza el panel de Supabase directamente.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

