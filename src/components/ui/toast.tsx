import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    setToasts(prev => {
      const newToasts = [...prev, { ...toast, id }];
      // Limit the number of toasts
      return newToasts.slice(-maxToasts);
    });

    // Auto-dismiss non-persistent toasts
    if (!toast.persistent && toast.type !== 'loading') {
      const duration = toast.duration || (toast.type === 'error' ? 6000 : 4000);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [maxToasts, removeToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    updateToast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position} toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  position: ToastPosition;
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ position, toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div
      className={`fixed z-50 flex flex-col space-y-2 pointer-events-none ${positionClasses[position]}`}
      style={{ maxWidth: '420px', width: '100%' }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 200);
  };

  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertCircle,
    info: Info,
    loading: Loader2
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    loading: 'text-blue-600'
  };

  const backgroundColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    loading: 'bg-blue-50 border-blue-200'
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`pointer-events-auto bg-white border shadow-lg rounded-lg p-4 min-w-0 transition-all duration-200 ${
        backgroundColors[toast.type]
      } ${
        isVisible && !isLeaving 
          ? 'transform translate-x-0 opacity-100 scale-100' 
          : 'transform translate-x-full opacity-0 scale-95'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-0.5">
          <Icon 
            className={`w-5 h-5 ${iconColors[toast.type]} ${
              toast.type === 'loading' ? 'animate-spin' : ''
            }`} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-sm text-gray-600 mt-1">
              {toast.message}
            </p>
          )}
          
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        
        {toast.dismissible !== false && (
          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Convenience hook for common toast types
export const useToastHelpers = () => {
  const { addToast, updateToast } = useToast();

  const showSuccess = (title: string, message?: string) => {
    return addToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    return addToast({ type: 'error', title, message, duration: 6000 });
  };

  const showWarning = (title: string, message?: string) => {
    return addToast({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    return addToast({ type: 'info', title, message });
  };

  const showLoading = (title: string, message?: string) => {
    return addToast({ 
      type: 'loading', 
      title, 
      message, 
      persistent: true,
      dismissible: false 
    });
  };

  const dismissLoading = (id: string, successTitle?: string, successMessage?: string) => {
    if (successTitle) {
      updateToast(id, { 
        type: 'success', 
        title: successTitle, 
        message: successMessage,
        persistent: false,
        dismissible: true
      });
    } else {
      updateToast(id, { persistent: false, dismissible: true });
    }
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismissLoading
  };
};
