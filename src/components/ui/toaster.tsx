'use client';

import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToasterContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined);

export const useToaster = () => {
  const context = React.useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
  );
};

const getToastStyles = (type: string) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-white dark:bg-gray-800',
        border: 'border-l-4 border-l-green-500',
        icon: CheckCircle,
        iconColor: 'text-green-500',
        iconBg: 'bg-green-50 dark:bg-green-900/20'
      };
    case 'error':
      return {
        bg: 'bg-white dark:bg-gray-800',
        border: 'border-l-4 border-l-red-500',
        icon: AlertCircle,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-50 dark:bg-red-900/20'
      };
    case 'warning':
      return {
        bg: 'bg-white dark:bg-gray-800',
        border: 'border-l-4 border-l-yellow-500',
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        iconBg: 'bg-yellow-50 dark:bg-yellow-900/20'
      };
    default:
      return {
        bg: 'bg-white dark:bg-gray-800',
        border: 'border-l-4 border-l-blue-500',
        icon: Info,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20'
      };
  }
};

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToaster();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type || 'info');
        const IconComponent = styles.icon;
        
        return (
          <div
            key={toast.id}
            className={`
              ${styles.bg} ${styles.border}
              rounded-lg shadow-xl border border-gray-200 dark:border-gray-700
              p-4 animate-slide-up backdrop-blur-sm
              hover:shadow-2xl transition-all duration-200
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                <IconComponent className={`w-4 h-4 ${styles.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {toast.title}
                  </p>
                )}
                {toast.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
