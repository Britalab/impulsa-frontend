// src/app/lib/validators/rutValidator.js
// Single Responsibility: Este módulo SOLO maneja validación y formateo de RUT

/**
 * Limpia un RUT removiendo caracteres no válidos
 * @param {string} rut - RUT con cualquier formato
 * @returns {string} RUT limpio (solo números y K)
 */
export function cleanRut(rut) {
  if (!rut || typeof rut !== 'string') return '';
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Formatea un RUT al formato estándar XX.XXX.XXX-X
 * @param {string} rut - RUT limpio o con formato
 * @returns {string} RUT formateado
 */
export function formatRut(rut) {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formattedBody}-${dv}`;
}

/**
 * Calcula el dígito verificador de un RUT
 * @param {string} rutBody - Cuerpo del RUT (sin DV)
 * @returns {string} Dígito verificador calculado
 */
export function calculateDv(rutBody) {
  const body = rutBody.replace(/\D/g, '');
  if (!body) return '';

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);

  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

/**
 * Valida si un RUT chileno es válido
 * @param {string} rut - RUT a validar (cualquier formato)
 * @returns {boolean} true si el RUT es válido
 */
export function validateRut(rut) {
  const cleaned = cleanRut(rut);

  // Validar longitud mínima (7 dígitos + DV = 8 caracteres mínimo para RUT válido)
  if (cleaned.length < 8 || cleaned.length > 9) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  // Validar que el cuerpo sea numérico
  if (!/^\d+$/.test(body)) return false;

  const expectedDv = calculateDv(body);
  return expectedDv === dv;
}

/**
 * Normaliza un RUT para almacenamiento (sin puntos ni guión, mayúsculas)
 * @param {string} rut - RUT en cualquier formato
 * @returns {string} RUT normalizado para DB
 */
export function normalizeRutForStorage(rut) {
  return cleanRut(rut);
}

// Objeto con todas las funciones para exportación por defecto
const RutValidator = {
  clean: cleanRut,
  format: formatRut,
  calculateDv,
  validate: validateRut,
  normalize: normalizeRutForStorage
};

export default RutValidator;

