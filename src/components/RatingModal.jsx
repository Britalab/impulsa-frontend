// src/components/RatingModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Star, Loader2, CheckCircle } from 'lucide-react';
import { submitRating, getUserRating } from '../app/lib/services/profileService';

export default function RatingModal({ 
  isOpen, 
  onClose, 
  workshop, 
  profileId,
  onRatingSubmitted 
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [existingRating, setExistingRating] = useState(null);

  // Cargar calificación existente si la hay
  useEffect(() => {
    async function loadExisting() {
      if (isOpen && workshop?.id && profileId) {
        const { data } = await getUserRating(workshop.id, profileId);
        if (data) {
          setExistingRating(data);
          setRating(data.rating);
          setComment(data.comment || '');
        }
      }
    }
    loadExisting();
  }, [isOpen, workshop?.id, profileId]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setSuccess(false);
      setError(null);
      setExistingRating(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await submitRating(workshop.id, profileId, rating, comment || null);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      onRatingSubmitted?.();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  if (!isOpen) return null;

  const displayRating = hoverRating || rating;

  const ratingLabels = {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-foreground">
            {existingRating ? 'Editar Calificación' : 'Calificar Taller'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Workshop info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {workshop?.title}
            </h3>
            <p className="text-sm text-muted mt-1">
              Impartido por {workshop?.instructor_name || workshop?.instructor?.full_name || 'Impulsor'}
            </p>
          </div>

          {success ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ¡Gracias por tu calificación!
              </h3>
              <p className="text-muted text-sm">
                Tu opinión ayuda a otros estudiantes
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Stars */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted mb-3">
                  ¿Cómo calificarías este taller?
                </p>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= displayRating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className={`text-sm font-medium transition-opacity ${displayRating ? 'opacity-100' : 'opacity-0'}`}>
                  <span className={`${
                    displayRating >= 4 ? 'text-green-600' : 
                    displayRating >= 3 ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {ratingLabels[displayRating] || ''}
                  </span>
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos tu experiencia..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-[#7B2CBF] focus:ring-4 focus:ring-[#7B2CBF]/10 outline-none transition-all resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 text-muted font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="flex-1 py-3 px-4 bg-[#7B2CBF] text-white font-semibold rounded-xl hover:bg-[#5A189A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    existingRating ? 'Actualizar' : 'Enviar Calificación'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

