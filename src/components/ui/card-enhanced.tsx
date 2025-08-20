'use client';

import React, { useState } from 'react';

interface ProfessionalCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  className = '',
  hover = true,
  glow = false,
  gradient = false,
  onClick,
  header,
  footer
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = `
    bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700
    transition-all duration-300 ease-in-out relative overflow-hidden
  `;

  const interactiveClasses = hover ? `
    hover:shadow-2xl hover:-translate-y-1
    transform-gpu will-change-transform
    ${onClick ? 'cursor-pointer' : ''}
  ` : '';

  const glowClasses = glow ? `
    shadow-xl
    ${isHovered ? 'shadow-blue-500/20 ring-1 ring-blue-500/10' : ''}
  ` : 'shadow-lg';

  const gradientClasses = gradient ? `
    bg-gradient-to-br from-white via-white to-blue-50/50
    dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/20
  ` : '';

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${glowClasses} ${gradientClasses} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle shimmer effect on hover */}
      {hover && (
        <div 
          className={`
            absolute inset-0 opacity-0 transition-opacity duration-500
            bg-gradient-to-r from-transparent via-white/5 to-transparent
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
            transition: 'transform 0.6s ease-in-out, opacity 0.5s ease-in-out'
          }}
        />
      )}

      {/* Header */}
      {header && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          {header}
        </div>
      )}

      {/* Main content */}
      <div className="p-6">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default ProfessionalCard;
