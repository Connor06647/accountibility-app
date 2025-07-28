'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context-real';

interface UpgradePromptProps {
  feature: string;
  description: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'overlay' | 'banner' | 'inline';
}

const tierInfo = {
  standard: {
    name: 'Standard',
    price: '$15/month',
    color: 'blue',
    features: [
      '10 active goals',
      'Advanced analytics',
      'Custom reminders',
      'Export data',
      '90-day history'
    ]
  },
  premium: {
    name: 'Premium',
    price: '$35/month',
    color: 'purple',
    features: [
      'Unlimited goals',
      'Team features',
      'Coach connections',
      'API access',
      'Unlimited history'
    ]
  }
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  description,
  className = '',
  size = 'medium',
  type = 'overlay'
}) => {
  const { userTier } = useAuth();

  const getRecommendedTier = () => {
    // Simple logic: recommend standard for most features, premium for advanced ones
    const premiumFeatures = ['team', 'api', 'coach', 'unlimited'];
    const needsPremium = premiumFeatures.some(pf => feature.toLowerCase().includes(pf));
    return needsPremium ? 'premium' : 'standard';
  };

  const recommendedTier = getRecommendedTier();
  const tierData = tierInfo[recommendedTier];

  if (type === 'overlay') {
    return (
      <div className={`absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 ${className}`}>
        <div className="text-center p-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">✨</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature}</h3>
          <p className="text-gray-600 mb-4 text-sm">{description}</p>
          <button className={`px-4 py-2 text-white rounded-lg transition-all text-sm font-medium ${
            recommendedTier === 'premium' 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}>
            Upgrade to {tierData.name}
          </button>
        </div>
      </div>
    );
  }

  if (type === 'banner') {
    return (
      <div className={`rounded-lg p-4 mb-4 ${
        recommendedTier === 'premium'
          ? 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200'
          : 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200'
      } ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${
              recommendedTier === 'premium' ? 'text-purple-800' : 'text-blue-800'
            }`}>{feature}</h4>
            <p className={`text-sm ${
              recommendedTier === 'premium' ? 'text-purple-600' : 'text-blue-600'
            }`}>{description}</p>
          </div>
          <button className={`px-3 py-1 text-white rounded text-sm transition-colors ${
            recommendedTier === 'premium'
              ? 'bg-purple-500 hover:bg-purple-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}>
            Upgrade
          </button>
        </div>
      </div>
    );
  }

  // Inline type
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">{description}</span>
      <button className={`px-2 py-1 text-white rounded text-xs transition-all ${
        recommendedTier === 'premium'
          ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
      }`}>
        Upgrade
      </button>
    </div>
  );
};

interface TierBadgeProps {
  tier: 'free' | 'standard' | 'premium';
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className = '' }) => {
  const colors = {
    free: 'bg-gray-100 text-gray-700 border-gray-300',
    standard: 'bg-blue-100 text-blue-700 border-blue-300',
    premium: 'bg-purple-100 text-purple-700 border-purple-300'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[tier]} ${className}`}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
};

interface FeatureLimitProps {
  current: number;
  limit: number;
  label: string;
  className?: string;
}

export const FeatureLimit: React.FC<FeatureLimitProps> = ({ current, limit, label, className = '' }) => {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isNearLimit = percentage > 80;
  const isAtLimit = current >= limit;

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-700'}`}>
          {current}{limit > 0 ? `/${limit}` : ''}
        </span>
      </div>
      {limit > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
