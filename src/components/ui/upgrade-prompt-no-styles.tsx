'use client';

import React from 'react';

interface UpgradePromptProps {
  feature: string;
  description: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onUpgrade?: () => void;
}

interface TierBadgeProps {
  tier: 'free' | 'standard' | 'premium';
  className?: string;
}

interface FeatureLimitProps {
  current: number;
  limit: number;
  label: string;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  description,
  className = '',
  size = 'medium',
  onUpgrade
}) => {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      console.log('Upgrade clicked for feature:', feature);
    }
  };

  if (size === 'small') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-xs text-gray-600 dark:text-gray-400">{description}</span>
        <button
          onClick={handleUpgrade}
          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all font-medium text-xs shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          ✨ Upgrade Now
        </button>
      </div>
    );
  }

  if (size === 'large') {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{description}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpgrade}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ✨ Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Medium size (default) - redesigned to be more subtle
  return (
    <div className={`bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{feature}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ✨ Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className = '' }) => {
  let badgeClasses = '';
  let displayText = '';

  if (tier === 'free') {
    badgeClasses = 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300';
    displayText = 'Free';
  } else if (tier === 'standard') {
    badgeClasses = 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300';
    displayText = 'Standard';
  } else {
    badgeClasses = 'bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300';
    displayText = 'Premium';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badgeClasses} ${className}`}>
      {displayText}
    </span>
  );
};

export const FeatureLimit: React.FC<FeatureLimitProps> = ({ current, limit, label, className = '' }) => {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isAtLimit = current >= limit;
  const isNearLimit = percentage >= 80;

  let textColorClass = 'text-gray-700 dark:text-gray-300';

  if (isAtLimit) {
    textColorClass = 'text-red-600 dark:text-red-400';
  } else if (isNearLimit) {
    textColorClass = 'text-yellow-600 dark:text-yellow-400';
  }

  // Create a simple progress indicator without inline styles
  const getProgressBarClass = () => {
    if (percentage >= 100) return 'w-full';
    if (percentage >= 95) return 'w-11/12';
    if (percentage >= 90) return 'w-5/6';
    if (percentage >= 80) return 'w-4/5';
    if (percentage >= 75) return 'w-3/4';
    if (percentage >= 66) return 'w-2/3';
    if (percentage >= 60) return 'w-3/5';
    if (percentage >= 50) return 'w-1/2';
    if (percentage >= 40) return 'w-2/5';
    if (percentage >= 33) return 'w-1/3';
    if (percentage >= 25) return 'w-1/4';
    if (percentage >= 20) return 'w-1/5';
    if (percentage >= 10) return 'w-1/12';
    return 'w-0';
  };

  const getProgressBarColor = () => {
    if (isAtLimit) return 'bg-red-500 dark:bg-red-400';
    if (isNearLimit) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-blue-500 dark:bg-blue-400';
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center text-xs">
        <span className={`text-sm font-medium ${textColorClass}`}>
          {label}: {current}/{limit}
        </span>
      </div>
      {limit > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
          <div className={`h-2 rounded-full transition-all ${getProgressBarColor()} ${getProgressBarClass()}`} />
        </div>
      )}
    </div>
  );
};
