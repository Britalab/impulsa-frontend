// src/app/lib/services/workshopService.js
import supabase from '../supabaseClient';

/**
 * Obtiene todos los talleres publicados con información relacionada
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getPublishedWorkshops() {
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
      .eq('status', 'published')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching workshops:', error);
      return { data: [], error: error.message };
    }

    // Obtener conteo de inscripciones para cada taller
    const workshopsWithEnrollments = await Promise.all(
      data.map(async (workshop) => {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('workshop_id', workshop.id);

        return {
          ...workshop,
          enrolled: count || 0,
          instructor_name: workshop.instructor?.full_name || 'Por asignar',
          university_name: workshop.university?.name || null,
          room_name: workshop.room?.name || null,
        };
      })
    );

    return { data: workshopsWithEnrollments, error: null };
  } catch (err) {
    console.error('Error in getPublishedWorkshops:', err);
    return { data: [], error: 'Error al cargar los talleres' };
  }
}

/**
 * Obtiene talleres por categoría/área de interés
 * @param {string} category - Nombre de la categoría
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getWorkshopsByCategory(category) {
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
        instructor:profiles!workshops_instructor_id_fkey (
          id,
          full_name
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
      .eq('status', 'published')
      .eq('category', category)
      .order('date', { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }

    const workshopsWithEnrollments = await Promise.all(
      data.map(async (workshop) => {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('workshop_id', workshop.id);

        return {
          ...workshop,
          enrolled: count || 0,
          instructor_name: workshop.instructor?.full_name || 'Por asignar',
          university_name: workshop.university?.name || null,
          room_name: workshop.room?.name || null,
        };
      })
    );

    return { data: workshopsWithEnrollments, error: null };
  } catch (err) {
    console.error('Error in getWorkshopsByCategory:', err);
    return { data: [], error: 'Error al cargar los talleres' };
  }
}

/**
 * Obtiene un taller por su ID con toda la información
 * @param {number} id - ID del taller
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getWorkshopById(id) {
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
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Obtener inscripciones
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', id);

    return {
      data: {
        ...data,
        enrolled: count || 0,
        instructor_name: data.instructor?.full_name || 'Por asignar',
        university_name: data.university?.name || null,
        room_name: data.room?.name || null,
      },
      error: null
    };
  } catch (err) {
    console.error('Error in getWorkshopById:', err);
    return { data: null, error: 'Error al cargar el taller' };
  }
}

/**
 * Obtiene las categorías disponibles (áreas de interés)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('category')
      .eq('status', 'published')
      .not('category', 'is', null);

    if (error) {
      return { data: [], error: error.message };
    }

    // Obtener categorías únicas
    const uniqueCategories = [...new Set(data.map(w => w.category))];
    
    return { data: uniqueCategories, error: null };
  } catch (err) {
    console.error('Error in getCategories:', err);
    return { data: [], error: 'Error al cargar las categorías' };
  }
}

const WorkshopService = {
  getPublishedWorkshops,
  getWorkshopsByCategory,
  getWorkshopById,
  getCategories,
};

export default WorkshopService;

