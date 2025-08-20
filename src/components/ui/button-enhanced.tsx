'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const ProfessionalButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button'
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    transition-all duration-200 ease-in-out transform
    hover:scale-105 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    shadow-sm hover:shadow-lg active:shadow-sm
    relative overflow-hidden
  `;

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 
      hover:from-blue-700 hover:to-blue-800
      text-white border border-transparent
      focus:ring-blue-500
      shadow-blue-500/25
    `,
    secondary: `
      bg-white border border-gray-300 text-gray-700
      hover:bg-gray-50 hover:border-gray-400
      dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300
      dark:hover:bg-gray-700 dark:hover:border-gray-500
      focus:ring-gray-500
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700
      hover:from-green-700 hover:to-green-800
      text-white border border-transparent
      focus:ring-green-500
      shadow-green-500/25
    `,
    warning: `
      bg-gradient-to-r from-yellow-500 to-yellow-600
      hover:from-yellow-600 hover:to-yellow-700
      text-white border border-transparent
      focus:ring-yellow-500
      shadow-yellow-500/25
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-700 hover:to-red-800
      text-white border border-transparent
      focus:ring-red-500
      shadow-red-500/25
    `,
    ghost: `
      bg-transparent border border-transparent text-gray-600
      hover:bg-gray-100 hover:text-gray-800
      dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200
      focus:ring-gray-500
    `
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {/* Ripple effect overlay */}
      <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-lg"></div>
      
      {loading && (
        <Loader2 size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && icon}
      
      <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};

export default ProfessionalButton;
