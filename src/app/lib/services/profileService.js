// src/app/lib/services/profileService.js
import supabase from '../supabaseClient';

/**
 * Obtiene el perfil del usuario actual por auth_user_id
 * @param {string} authUserId - UUID del usuario autenticado
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getProfileByAuthId(authUserId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getProfileByAuthId:', err);
    return { data: null, error: 'Error al cargar el perfil' };
  }
}

/**
 * Obtiene las inscripciones del usuario con info de talleres
 * @param {number} profileId - ID del perfil
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getUserEnrollments(profileId) {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        enrolled_at,
        workshop:workshops (
          id,
          title,
          description,
          category,
          date,
          time,
          capacity,
          status,
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
        )
      `)
      .eq('profile_id', profileId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    // Separar en pasados y futuros
    const now = new Date();
    const enrollments = data.map(e => ({
      ...e,
      workshop: {
        ...e.workshop,
        instructor_name: e.workshop?.instructor?.full_name || 'Por asignar',
        university_name: e.workshop?.university?.name || null,
        room_name: e.workshop?.room?.name || null,
      }
    }));

    const past = enrollments.filter(e => {
      if (!e.workshop?.date) return false;
      return new Date(e.workshop.date) < now;
    });

    const upcoming = enrollments.filter(e => {
      if (!e.workshop?.date) return true;
      return new Date(e.workshop.date) >= now;
    });

    return { 
      data: { past, upcoming, all: enrollments }, 
      error: null 
    };
  } catch (err) {
    console.error('Error in getUserEnrollments:', err);
    return { data: { past: [], upcoming: [], all: [] }, error: 'Error al cargar inscripciones' };
  }
}

/**
 * Obtiene las propuestas de taller del usuario (como impulsor)
 * @param {number} profileId - ID del perfil
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getUserProposals(profileId) {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        id,
        title,
        description,
        category,
        date,
        time,
        capacity,
        status,
        created_at,
        university:universities (
          id,
          name
        ),
        room:rooms (
          id,
          name
        )
      `)
      .eq('instructor_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    // Obtener conteo de inscripciones para cada taller
    const proposalsWithEnrollments = await Promise.all(
      data.map(async (workshop) => {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('workshop_id', workshop.id);

        // Obtener calificación promedio
        const { data: ratings } = await supabase
          .from('ratings')
          .select('rating')
          .eq('workshop_id', workshop.id);

        const avgRating = ratings && ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : null;

        return {
          ...workshop,
          enrolled: count || 0,
          university_name: workshop.university?.name || null,
          room_name: workshop.room?.name || null,
          avg_rating: avgRating,
          ratings_count: ratings?.length || 0,
        };
      })
    );

    return { data: proposalsWithEnrollments, error: null };
  } catch (err) {
    console.error('Error in getUserProposals:', err);
    return { data: [], error: 'Error al cargar propuestas' };
  }
}

/**
 * Obtiene la reputación del impulsor (promedio de calificaciones)
 * @param {number} profileId - ID del perfil
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function getImpulsorReputation(profileId) {
  try {
    // Obtener todos los talleres del impulsor
    const { data: workshops } = await supabase
      .from('workshops')
      .select('id')
      .eq('instructor_id', profileId);

    if (!workshops || workshops.length === 0) {
      return { data: { average: 0, total: 0, count: 0 }, error: null };
    }

    const workshopIds = workshops.map(w => w.id);

    // Obtener todas las calificaciones de esos talleres
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .in('workshop_id', workshopIds);

    if (!ratings || ratings.length === 0) {
      return { data: { average: 0, total: 0, count: 0 }, error: null };
    }

    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    return { 
      data: { 
        average: Math.round(average * 10) / 10,
        total: ratings.length,
        count: workshops.length
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Error in getImpulsorReputation:', err);
    return { data: { average: 0, total: 0, count: 0 }, error: 'Error al cargar reputación' };
  }
}

/**
 * Verifica si el usuario ya calificó un taller
 * @param {number} workshopId - ID del taller
 * @param {number} profileId - ID del perfil
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getUserRating(workshopId, profileId) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('workshop_id', workshopId)
      .eq('profile_id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { data: null, error: error.message };
    }

    return { data: data || null, error: null };
  } catch (err) {
    console.error('Error in getUserRating:', err);
    return { data: null, error: 'Error al verificar calificación' };
  }
}

/**
 * Crea o actualiza una calificación
 * @param {number} workshopId - ID del taller
 * @param {number} profileId - ID del perfil
 * @param {number} rating - Calificación (1-5)
 * @param {string} comment - Comentario opcional
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function submitRating(workshopId, profileId, rating, comment = null) {
  try {
    const { error } = await supabase
      .from('ratings')
      .upsert({
        workshop_id: workshopId,
        profile_id: profileId,
        rating,
        comment,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'workshop_id,profile_id'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in submitRating:', err);
    return { success: false, error: 'Error al guardar calificación' };
  }
}

const ProfileService = {
  getProfileByAuthId,
  getUserEnrollments,
  getUserProposals,
  getImpulsorReputation,
  getUserRating,
  submitRating,
};

export default ProfileService;

