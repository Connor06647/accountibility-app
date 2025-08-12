import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  loading = false
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      text: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      text: 'text-green-600 dark:text-green-400'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      text: 'text-purple-600 dark:text-purple-400'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      light: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      text: 'text-orange-600 dark:text-orange-400'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      light: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      text: 'text-red-600 dark:text-red-400'
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
            {change && (
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mt-2"></div>
            )}
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp size={12} />;
      case 'decrease':
        return <TrendingDown size={12} />;
      default:
        return <Minus size={12} />;
    }
  };

  const getTrendColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-700 dark:text-green-400';
      case 'decrease':
        return 'text-red-700 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2 leading-tight">
            {title}
          </p>
          <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <div className={`flex items-center mt-2 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {change.type === 'neutral' 
                  ? 'No change' 
                  : `${Math.abs(change.value)}% from last week`
                }
              </span>
            </div>
          )}
        </div>
        
        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${colorClasses[color].light} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 md:w-6 md:h-6 ${colorClasses[color].text}`} />
        </div>
      </div>
    </div>
  );
};

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  stats?: StatCardProps[];
  loading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  action,
  stats = [],
  loading = false
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
          >
            {action.icon && <action.icon size={20} className="mr-2" />}
            {action.label}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="stats-cards">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} loading={loading} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;
