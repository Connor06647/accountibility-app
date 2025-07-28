'use client';

import React from 'react';

interface UpgradePromptProps {
  feature: string;
  description: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
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
  size = 'medium'
}) => {
  const handleUpgrade = () => {
    console.log('Upgrade clicked for feature:', feature);
  };

  if (size === 'small') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-xs text-gray-600">{description}</span>
        <button
          onClick={handleUpgrade}
          className="px-2 py-1 text-white rounded text-xs transition-all bg-blue-600 hover:bg-blue-700"
        >
          Upgrade
        </button>
      </div>
    );
  }

  if (size === 'large') {
    return (
      <div className="absolute inset-0 bg-white backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade Required</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 text-white rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  // Medium size (default)
  return (
    <div className="rounded-lg p-4 mb-4 bg-yellow-50 border border-yellow-200">
      <div className="flex">
        <div className="ml-3">
          <h4 className="font-medium text-yellow-800">{feature}</h4>
          <p className="text-sm text-yellow-700">{description}</p>
          <div className="mt-2">
            <button
              onClick={handleUpgrade}
              className="px-3 py-1 text-white rounded text-sm transition-colors bg-yellow-600 hover:bg-yellow-700"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className = '' }) => {
  let badgeClasses = '';
  let displayText = '';

  if (tier === 'free') {
    badgeClasses = 'bg-gray-100 border-gray-300 text-gray-700';
    displayText = 'Free';
  } else if (tier === 'standard') {
    badgeClasses = 'bg-blue-100 border-blue-300 text-blue-700';
    displayText = 'Standard';
  } else {
    badgeClasses = 'bg-purple-100 border-purple-300 text-purple-700';
    displayText = 'Premium';
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeClasses} ${className}`}>
      {displayText}
    </span>
  );
};

export const FeatureLimit: React.FC<FeatureLimitProps> = ({ current, limit, label, className = '' }) => {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isAtLimit = current >= limit;
  const isNearLimit = percentage >= 80;

  let textColorClass = 'text-gray-700';
  let barColorClass = 'bg-blue-500';

  if (isAtLimit) {
    textColorClass = 'text-red-600';
    barColorClass = 'bg-red-500';
  } else if (isNearLimit) {
    textColorClass = 'text-yellow-600';
    barColorClass = 'bg-yellow-500';
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center text-xs">
        <span className={`text-sm font-medium ${textColorClass}`}>
          {label}: {current}/{limit}
        </span>
      </div>
      {limit > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className={`h-2 rounded-full transition-all ${barColorClass}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
