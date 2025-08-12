import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
  };
  className?: string;
  disabled?: boolean;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  validation,
  className = '',
  disabled = false,
  rows = 3
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (val: string): string | null => {
    if (required && !val.trim()) {
      return `${label} is required`;
    }

    if (validation) {
      if (validation.minLength && val.length < validation.minLength) {
        return `${label} must be at least ${validation.minLength} characters`;
      }

      if (validation.maxLength && val.length > validation.maxLength) {
        return `${label} must be no more than ${validation.maxLength} characters`;
      }

      if (validation.pattern && !validation.pattern.test(val)) {
        if (type === 'email') {
          return 'Please enter a valid email address';
        }
        return `${label} format is invalid`;
      }

      if (validation.customValidator) {
        return validation.customValidator(val);
      }
    }

    return null;
  };

  useEffect(() => {
    if (touched) {
      setError(validateField(value));
    }
  }, [value, touched]);

  const handleBlur = () => {
    setTouched(true);
    setError(validateField(value));
  };

  const isValid = touched && !error && value.trim();
  const hasError = touched && error;

  const inputClasses = `
    w-full p-3 border rounded-lg transition-all duration-200 
    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
    focus:ring-2 focus:border-transparent outline-none
    ${hasError 
      ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
      : isValid 
        ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
  `;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={inputClasses}
        />
      );
    }

    return (
      <div className="relative">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${inputClasses} ${type === 'password' ? 'pr-12' : ''}`}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {/* Validation feedback */}
      <div className="min-h-[20px]">
        {hasError && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400 animate-slide-up">
            <AlertCircle size={16} className="mr-1 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {isValid && (
          <div className="flex items-center text-sm text-green-600 dark:text-green-400 animate-slide-up">
            <CheckCircle2 size={16} className="mr-1 flex-shrink-0" />
            Looks good!
          </div>
        )}
      </div>
    </div>
  );
};

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  fullWidth = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-500 shadow-lg hover:shadow-xl'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${loading || disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default FormField;
