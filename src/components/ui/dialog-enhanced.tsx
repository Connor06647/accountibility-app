import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { ButtonEnhanced } from './button-enhanced';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? 'animate-fade-in' : 'animate-fade-out'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Dialog content */}
      <div 
        className={`relative bg-white rounded-xl shadow-2xl border w-full ${sizeClasses[size]} ${
          isOpen ? 'animate-scale-in' : 'animate-scale-out'
        } ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-4">
            {title && (
              <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`px-6 ${title || showCloseButton ? 'pb-6' : 'py-6'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default',
  isLoading = false
}) => {
  const icons = {
    default: Info,
    danger: AlertTriangle,
    warning: AlertCircle
  };

  const iconColors = {
    default: 'text-blue-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600'
  };

  const confirmButtonVariants = {
    default: 'primary' as const,
    danger: 'danger' as const,
    warning: 'warning' as const
  };

  const Icon = icons[type];

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 p-2 rounded-full bg-gray-100 ${iconColors[type]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <div className="flex justify-end space-x-3">
            <ButtonEnhanced
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </ButtonEnhanced>
            <ButtonEnhanced
              variant={confirmButtonVariants[type]}
              onClick={onConfirm}
              loading={isLoading}
            >
              {confirmText}
            </ButtonEnhanced>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  actionText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  actionText = 'OK'
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertCircle,
    info: Info
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const Icon = icons[type];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 p-2 rounded-full bg-gray-100 ${iconColors[type]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <div className="flex justify-end">
            <ButtonEnhanced variant="primary" onClick={onClose}>
              {actionText}
            </ButtonEnhanced>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  submitDisabled = false
}) => {
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>{children}</div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <ButtonEnhanced
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </ButtonEnhanced>
          <ButtonEnhanced
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={submitDisabled}
          >
            {submitText}
          </ButtonEnhanced>
        </div>
      </form>
    </Dialog>
  );
};
