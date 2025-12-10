// src/app/lib/services/authService.js
// Single Responsibility: Maneja SOLO la lógica de autenticación
// Dependency Inversion: Abstrae Supabase del componente UI

import supabase from '../supabaseClient';
import { normalizeRutForStorage, validateRut } from '../validators/rutValidator';

/**
 * @typedef {Object} RegisterData
 * @property {string} nombres - Nombres del usuario
 * @property {string} apellidos - Apellidos del usuario
 * @property {string} rut - RUT chileno
 * @property {string} email - Correo electrónico
 */

/**
 * Valida los datos de registro antes de enviar
 * @param {RegisterData} data - Datos a validar
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateRegisterData(data) {
  const { nombres, apellidos, rut, email } = data;

  if (!nombres?.trim() || !apellidos?.trim()) {
    return { valid: false, error: 'Por favor ingresa nombres y apellidos.' };
  }

  if (!rut?.trim()) {
    return { valid: false, error: 'El RUT es requerido.' };
  }

  if (!validateRut(rut)) {
    return { valid: false, error: 'RUT inválido. Verifica el formato y dígito verificador.' };
  }

  if (!email?.trim()) {
    return { valid: false, error: 'El correo electrónico es requerido.' };
  }

  return { valid: true, error: null };
}

/**
 * Inicia el proceso de registro enviando un magic link
 * @param {RegisterData} data - Datos del registro
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function initiateRegistration(data) {
  const validation = validateRegisterData(data);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const { nombres, apellidos, rut, email } = data;
  const normalizedRut = normalizeRutForStorage(rut);
  const fullName = `${nombres.trim()} ${apellidos.trim()}`;

  try {
    // Enviar OTP para registro (crea usuario si no existe)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true, // Permitir crear usuario nuevo
        data: {
          full_name: fullName,
          rut: normalizedRut
        }
      }
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        return { success: false, error: 'Demasiados intentos. Espera unos minutos.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, error: null };

  } catch (err) {
    console.error('Error en registro:', err);
    return { success: false, error: 'Ocurrió un error. Intenta nuevamente.' };
  }
}

/**
 * Envía un código OTP para iniciar sesión (solo usuarios existentes)
 * @param {string} email - Correo electrónico
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sendLoginCode(email) {
  if (!email?.trim()) {
    return { success: false, error: 'El correo electrónico es requerido.' };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false // NO crear usuario nuevo, solo login
      }
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        return { success: false, error: 'Demasiados intentos. Espera unos minutos.' };
      }
      if (error.message.includes('Signups not allowed') || error.message.includes('User not found')) {
        return { success: false, error: 'No existe una cuenta con este correo. ¿Quieres registrarte?' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, error: null };

  } catch (err) {
    console.error('Error enviando código:', err);
    return { success: false, error: 'Ocurrió un error. Intenta nuevamente.' };
  }
}

/**
 * Verifica el código OTP
 * @param {string} email - Correo electrónico
 * @param {string} token - Código OTP
 * @returns {Promise<{success: boolean, user: Object|null, error: string|null}>}
 */
export async function verifyOtp(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'email'
    });

    if (error) {
      return { success: false, user: null, error: 'Código inválido o expirado.' };
    }

    return { success: true, user: data.user, error: null };

  } catch (err) {
    console.error('Error verificando OTP:', err);
    return { success: false, user: null, error: 'Ocurrió un error. Intenta nuevamente.' };
  }
}

/**
 * Cierra la sesión del usuario
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Obtiene la sesión actual
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

const AuthService = {
  initiateRegistration,
  sendLoginCode,
  verifyOtp,
  signOut,
  getSession
};

export default AuthService;
