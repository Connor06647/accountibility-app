'use client';

import React, { useState, useId } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfessionalInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
}

export const ProfessionalInput: React.FC<ProfessionalInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  success,
  hint,
  required = false,
  className = '',
  leftIcon,
  rightIcon,
  onBlur,
  onFocus
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-opacity-20
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-gray-400 dark:placeholder:text-gray-500
  `;

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/10'
    : isFocused
    ? 'border-blue-500 focus:border-blue-600 focus:ring-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500';

  const paddingClasses = leftIcon && rightIcon
    ? 'pl-11 pr-11'
    : leftIcon
    ? 'pl-11 pr-4'
    : rightIcon
    ? 'pl-4 pr-11'
    : 'px-4';

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={`transition-colors duration-200 ${
              error ? 'text-red-500' : 
              success ? 'text-green-500' :
              isFocused ? 'text-blue-500' : 'text-gray-400'
            }`}>
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input Field */}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${paddingClasses}
            text-gray-900 dark:text-gray-100
          `}
        />

        {/* Right Icon / Password Toggle */}
        {(rightIcon || type === 'password') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`transition-colors duration-200 hover:scale-110 transform ${
                  isFocused ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ) : rightIcon ? (
              <div className={`transition-colors duration-200 ${
                error ? 'text-red-500' : 
                success ? 'text-green-500' :
                isFocused ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {rightIcon}
              </div>
            ) : null}
          </div>
        )}

        {/* Status Icons */}
        {(error || success) && (
          <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
            {error && <AlertCircle size={18} className="text-red-500" />}
            {success && <CheckCircle size={18} className="text-green-500" />}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {(error || success || hint) && (
        <div className="mt-2 text-sm">
          {error && (
            <p className="text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
          {success && !error && (
            <p className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle size={14} />
              {success}
            </p>
          )}
          {hint && !error && !success && (
            <p className="text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalInput;
