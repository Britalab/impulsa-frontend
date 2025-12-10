// src/app/admin/page.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Loader2,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  RefreshCw,
  FileText
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import WorkshopManageModal from '../../components/WorkshopManageModal';
import AdminProposalManager from '../../components/AdminProposalManager';
import Toast, { useToast } from '../../components/Toast';
import { getAllWorkshops, getDashboardStats } from '../lib/services/adminService';

// Configuración de estados
const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  published: { label: 'Publicado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: Clock },
};

export default function AdminDashboard() {
  const { toast, showToast, hideToast } = useToast();
  const [workshops, setWorkshops] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('published'); // 'all' | 'published' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals' | 'workshops'
  
  // Modal de gestión
  const [manageModal, setManageModal] = useState({ open: false, workshop: null });

  // Cargar datos
  const loadData = async () => {
    setLoading(true);
    
    const [workshopsResult, statsResult] = await Promise.all([
      getAllWorkshops(filter === 'all' ? null : filter),
      getDashboardStats()
    ]);

    if (workshopsResult.data) {
      setWorkshops(workshopsResult.data);
    }

    if (statsResult.data) {
      setStats(statsResult.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  // Filtrar por búsqueda
  const filteredWorkshops = workshops.filter(w => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      w.title?.toLowerCase().includes(query) ||
      w.instructor?.full_name?.toLowerCase().includes(query) ||
      w.category?.toLowerCase().includes(query)
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

  // Manejar acción completada (desde modal de gestión)
  const handleActionComplete = (action) => {
    if (action === 'approved') {
      showToast('Taller aprobado y publicado exitosamente', 'success', '¡Hecho!');
    } else if (action === 'rejected') {
      showToast('Taller rechazado', 'info');
    }
    loadData();
  };

  // Manejar acción completada desde propuestas
  const handleProposalActionComplete = (action) => {
    if (action === 'approved') {
      showToast('Taller publicado exitosamente en el Home', 'success', '¡Publicado!');
    } else if (action === 'rejected') {
      showToast('Propuesta rechazada correctamente', 'info', 'Rechazada');
    }
    loadData(); // Recargar estadísticas
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Panel de Administración
        </h1>
        <p className="text-muted">
          Gestiona las propuestas de talleres y recursos de la plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Clock}
          label="Pendientes"
          value={stats?.pendingWorkshops || 0}
          color="amber"
          onClick={() => setActiveTab('proposals')}
          active={activeTab === 'proposals'}
        />
        <StatCard
          icon={CheckCircle}
          label="Publicados"
          value={stats?.publishedWorkshops || 0}
          color="green"
          onClick={() => { setActiveTab('workshops'); setFilter('published'); }}
          active={activeTab === 'workshops' && filter === 'published'}
        />
        <StatCard
          icon={Users}
          label="Usuarios"
          value={stats?.totalUsers || 0}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Inscripciones"
          value={stats?.totalEnrollments || 0}
          color="purple"
        />
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'proposals'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" />
          Propuestas Pendientes
          {stats?.pendingWorkshops > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
              {stats.pendingWorkshops}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('workshops')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'workshops'
              ? 'border-[#7B2CBF] text-[#7B2CBF]'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Todos los Talleres
        </button>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'proposals' ? (
        <AdminProposalManager onActionComplete={handleProposalActionComplete} />
      ) : (
        <>
        {/* Tabla de talleres existente */}

      {/* Tabla de talleres */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header de tabla */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {filter === 'published' ? 'Talleres Publicados' :
                 filter === 'rejected' ? 'Talleres Rechazados' : 'Todos los Talleres'}
              </h2>
              <p className="text-sm text-muted">
                {filteredWorkshops.length} {filteredWorkshops.length === 1 ? 'taller' : 'talleres'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Buscar taller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#7B2CBF] focus:ring-2 focus:ring-[#7B2CBF]/10 outline-none w-full sm:w-64"
                />
              </div>

              {/* Filtro */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#7B2CBF] focus:ring-2 focus:ring-[#7B2CBF]/10 outline-none bg-white"
              >
                <option value="published">Publicados</option>
                <option value="rejected">Rechazados</option>
                <option value="all">Todos</option>
              </select>

              {/* Refresh */}
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 text-muted hover:text-foreground hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de tabla */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#7B2CBF] animate-spin" />
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted">No hay talleres para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Taller
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                    Impulsor
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                    Categoría
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWorkshops.map((workshop) => {
                  const status = statusConfig[workshop.status] || statusConfig.draft;
                  const StatusIcon = status.icon;

                  return (
                    <tr key={workshop.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-foreground truncate">
                            {workshop.title}
                          </p>
                          <p className="text-sm text-muted truncate md:hidden">
                            {workshop.instructor?.full_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B2CBF] to-[#00F5D4] flex items-center justify-center text-white text-xs font-semibold">
                            {workshop.instructor?.full_name?.charAt(0) || 'I'}
                          </div>
                          <span className="text-sm text-foreground">
                            {workshop.instructor?.full_name || 'Sin asignar'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-muted">
                          {workshop.category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-muted">
                          {formatDate(workshop.date || workshop.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setManageModal({ open: true, workshop })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#7B2CBF] bg-[#7B2CBF]/10 hover:bg-[#7B2CBF]/20 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de gestión */}
      <WorkshopManageModal
        isOpen={manageModal.open}
        onClose={() => setManageModal({ open: false, workshop: null })}
        workshop={manageModal.workshop}
        onActionComplete={handleActionComplete}
      />
        </>
      )}

      {/* Toast */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        title={toast.title}
        onClose={hideToast}
      />
    </AdminLayout>
  );
}

// Componente StatCard
function StatCard({ icon: Icon, label, value, color, onClick, active }) {
  const colorClasses = {
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const activeClasses = active ? 'ring-2 ring-[#7B2CBF] ring-offset-2' : '';
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-md transition-all' : '';

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border ${colorClasses[color]} ${activeClasses} ${clickableClasses}`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6" />
        {active && <span className="text-xs font-medium">Activo</span>}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

