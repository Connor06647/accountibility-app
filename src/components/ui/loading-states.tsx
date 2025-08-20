import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'shimmer' | 'pulse';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  variant = 'default' 
}) => {
  const baseClasses = "bg-gray-200 rounded animate-pulse";
  const variantClasses = {
    default: "",
    shimmer: "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:animate-shimmer",
    pulse: "animate-pulse"
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="progressbar"
      aria-label="Loading content"
    />
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const colorClasses = {
    blue: "text-blue-600",
    gray: "text-gray-600",
    white: "text-white"
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      aria-label="Loading"
    />
  );
};

interface ProfessionalLoadingProps {
  message?: string;
  showSparkles?: boolean;
  className?: string;
}

export const ProfessionalLoading: React.FC<ProfessionalLoadingProps> = ({ 
  message = "Loading your dashboard...",
  showSparkles = true,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 p-8 ${className}`}>
      {/* Main loading animation */}
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse shadow-lg">
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <LoadingSpinner size="md" color="blue" />
          </div>
        </div>
        
        {showSparkles && (
          <>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-blue-400 animate-bounce delay-200" />
          </>
        )}
      </div>

      {/* Loading message */}
      <div className="text-center space-y-2">
        <p className="text-gray-700 font-medium animate-fade-in">{message}</p>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color = 'blue',
  showPercentage = false,
  animated = true,
  className = ""
}) => {
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600"
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`space-y-2 ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${
            animated ? 'relative overflow-hidden' : ''
          }`}
          style={{ width: `${clampedProgress}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};

interface CardSkeletonProps {
  lines?: number;
  showHeader?: boolean;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  lines = 3, 
  showHeader = true,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-lg border p-6 space-y-4 ${className}`}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" variant="shimmer" />
          <Skeleton className="h-4 w-1/2" variant="shimmer" />
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i}
            className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
            variant="shimmer"
          />
        ))}
      </div>
    </div>
  );
};

interface ButtonSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'wide';
  className?: string;
}

export const ButtonSkeleton: React.FC<ButtonSkeletonProps> = ({ 
  size = 'md',
  variant = 'default',
  className = ""
}) => {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32"
  };

  const variantClasses = {
    default: "",
    wide: "w-full"
  };

  return (
    <Skeleton 
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      variant="shimmer"
    />
  );
};
