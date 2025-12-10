// src/components/Toast.jsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';

const toastTypes = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    textColor: 'text-green-800',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
  },
};

export default function Toast({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose,
  duration = 4000,
  title
}) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsShowing(false);
          setTimeout(onClose, 300); // Esperar animación de salida
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsShowing(false);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isShowing) return null;

  const config = toastTypes[type] || toastTypes.info;
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-start gap-3 max-w-sm p-4 rounded-xl border shadow-lg ${config.bgColor} ${config.borderColor} ${isShowing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} transition-all duration-300`}>
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold text-sm mb-0.5 ${config.textColor}`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${config.textColor}`}>
            {message}
          </p>
        </div>
        
        <button
          onClick={() => {
            setIsShowing(false);
            setTimeout(onClose, 300);
          }}
          className={`p-1 rounded-lg hover:bg-black/5 transition-colors ${config.textColor}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Hook personalizado para manejar toasts
export function useToast() {
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
    title: '',
  });

  const showToast = (message, type = 'success', title = '') => {
    setToast({ isVisible: true, message, type, title });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
}

