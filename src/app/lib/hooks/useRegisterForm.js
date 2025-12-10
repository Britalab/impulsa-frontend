// src/app/lib/hooks/useRegisterForm.js
// Single Responsibility: Maneja SOLO el estado y lógica del formulario de registro

import { useState, useCallback } from 'react';
import { formatRut } from '../validators/rutValidator';
import { initiateRegistration } from '../services/authService';

const INITIAL_STATE = {
  nombres: '',
  apellidos: '',
  rut: '',
  email: ''
};

/**
 * Hook personalizado para manejar el formulario de registro
 * @param {Function} onSuccess - Callback cuando el registro inicia exitosamente
 * @returns {Object} Estado y handlers del formulario
 */
export function useRegisterForm(onSuccess) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateField = useCallback((field, value) => {
    setError(null);
    
    if (field === 'rut') {
      value = formatRut(value);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    updateField(name, value);
  }, [updateField]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    setLoading(true);
    setError(null);

    const result = await initiateRegistration(formData);

    setLoading(false);

    if (result.success) {
      onSuccess?.(formData.email);
    } else {
      setError(result.error);
    }

    return result;
  }, [formData, onSuccess]);

  const reset = useCallback(() => {
    setFormData(INITIAL_STATE);
    setError(null);
    setLoading(false);
  }, []);

  return {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
    updateField,
    reset
  };
}

export default useRegisterForm;
