// src/app/lib/services/adminService.js
import supabase from '../supabaseClient';

/**
 * Obtiene todos los talleres pendientes de aprobación
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getPendingWorkshops() {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        id,
        title,
        description,
        category,
        duration,
        status,
        date,
        time,
        capacity,
        created_at,
        instructor:profiles!workshops_instructor_id_fkey (
          id,
          full_name,
          email
        ),
        university:universities (
          id,
          name
        ),
        room:rooms (
          id,
          name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getPendingWorkshops:', err);
    return { data: [], error: 'Error al cargar propuestas' };
  }
}

/**
 * Obtiene todos los talleres (para gestión)
 * @param {string} status - Filtro de estado (opcional)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getAllWorkshops(status = null) {
  try {
    let query = supabase
      .from('workshops')
      .select(`
        id,
        title,
        description,
        category,
        duration,
        status,
        date,
        time,
        capacity,
        created_at,
        instructor:profiles!workshops_instructor_id_fkey (
          id,
          full_name,
          email
        ),
        university:universities (
          id,
          name
        ),
        room:rooms (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: error.message };
    }

    // Agregar conteo de inscripciones
    const workshopsWithEnrollments = await Promise.all(
      data.map(async (workshop) => {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('workshop_id', workshop.id);

        return {
          ...workshop,
          enrolled: count || 0,
        };
      })
    );

    return { data: workshopsWithEnrollments, error: null };
  } catch (err) {
    console.error('Error in getAllWorkshops:', err);
    return { data: [], error: 'Error al cargar talleres' };
  }
}

/**
 * Obtiene todas las universidades con sus salas
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getUniversitiesWithRooms() {
  try {
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('id, name')
      .order('name');

    if (uniError) {
      return { data: [], error: uniError.message };
    }

    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, university_id')
      .order('name');

    if (roomsError) {
      return { data: [], error: roomsError.message };
    }

    // Agrupar salas por universidad
    const universitiesWithRooms = universities.map(uni => ({
      ...uni,
      rooms: rooms.filter(room => room.university_id === uni.id)
    }));

    return { data: universitiesWithRooms, error: null };
  } catch (err) {
    console.error('Error in getUniversitiesWithRooms:', err);
    return { data: [], error: 'Error al cargar universidades' };
  }
}

/**
 * Aprueba un taller y lo publica
 * @param {number} workshopId - ID del taller
 * @param {number} universityId - ID de la universidad asignada
 * @param {number} roomId - ID de la sala asignada
 * @param {string} date - Fecha asignada (YYYY-MM-DD)
 * @param {string} time - Hora asignada (HH:MM)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function approveWorkshop(workshopId, universityId, roomId, date, time) {
  try {
    const { error } = await supabase
      .from('workshops')
      .update({
        status: 'published',
        university_id: universityId,
        room_id: roomId,
        date: date,
        time: time,
      })
      .eq('id', workshopId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in approveWorkshop:', err);
    return { success: false, error: 'Error al aprobar taller' };
  }
}

/**
 * Rechaza un taller
 * @param {number} workshopId - ID del taller
 * @param {string} reason - Razón del rechazo (opcional)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function rejectWorkshop(workshopId, reason = null) {
  try {
    const { error } = await supabase
      .from('workshops')
      .update({
        status: 'rejected',
      })
      .eq('id', workshopId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in rejectWorkshop:', err);
    return { success: false, error: 'Error al rechazar taller' };
  }
}

/**
 * Obtiene estadísticas generales para el dashboard
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getDashboardStats() {
  try {
    // Contar talleres por estado
    const { count: pendingCount } = await supabase
      .from('workshops')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: publishedCount } = await supabase
      .from('workshops')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const { count: totalWorkshops } = await supabase
      .from('workshops')
      .select('*', { count: 'exact', head: true });

    // Contar usuarios
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Contar inscripciones
    const { count: totalEnrollments } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true });

    return {
      data: {
        pendingWorkshops: pendingCount || 0,
        publishedWorkshops: publishedCount || 0,
        totalWorkshops: totalWorkshops || 0,
        totalUsers: totalUsers || 0,
        totalEnrollments: totalEnrollments || 0,
      },
      error: null
    };
  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    return { data: null, error: 'Error al cargar estadísticas' };
  }
}

const AdminService = {
  getPendingWorkshops,
  getAllWorkshops,
  getUniversitiesWithRooms,
  approveWorkshop,
  rejectWorkshop,
  getDashboardStats,
};

export default AdminService;

