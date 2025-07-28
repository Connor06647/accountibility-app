'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-real';
import { UpgradePrompt, TierBadge, FeatureLimit } from '@/components/ui/upgrade-prompt';

// Simple tiered demo component to test the system
const TieredDemo: React.FC = () => {
  const { user, userTier, canAccessFeature, getFeatureLimit } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to see tiered features</h1>
        </div>
      </div>
    );
  }

  const maxGoals = getFeatureLimit('maxGoals') || 0;
  const currentGoals = 2;
  const canAddMoreGoals = maxGoals === -1 || currentGoals < maxGoals;
  const canUseAdvancedAnalytics = canAccessFeature('canUseAdvancedAnalytics');
  const canExportData = canAccessFeature('canExportData');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Tiered Features Demo</h1>
              <p className="text-gray-600">Testing the subscription tier system</p>
            </div>
            <TierBadge tier={userTier} />
          </div>
        </div>

        {/* Usage Summary for Free Users */}
        {userTier === 'free' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-blue-800 mb-4">Your Usage</h3>
                <div className="grid grid-cols-2 gap-6">
                  <FeatureLimit 
                    current={currentGoals} 
                    limit={maxGoals} 
                    label="Active Goals" 
                  />
                  <FeatureLimit 
                    current={12} 
                    limit={30} 
                    label="Check-ins this month" 
                  />
                </div>
              </div>
              <div className="ml-6">
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium">
                  Upgrade to Standard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goals Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Goals Management</h2>
              <TierBadge tier={userTier} className="text-xs" />
            </div>

            <div className="mb-4">
              <FeatureLimit 
                current={currentGoals} 
                limit={maxGoals === -1 ? 999 : maxGoals} 
                label="Active Goals" 
                className="mb-4"
              />
            </div>

            <div className="relative">
              <button 
                className={`w-full px-4 py-3 rounded-lg transition-colors ${
                  canAddMoreGoals 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canAddMoreGoals}
              >
                + Add New Goal
              </button>
              {!canAddMoreGoals && (
                <UpgradePrompt 
                  feature="More Goals"
                  description="Upgrade to create unlimited goals"
                  type="overlay"
                />
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800">Exercise Daily</h3>
                <p className="text-sm text-gray-600">Work out for 30 minutes</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800">Read Books</h3>
                <p className="text-sm text-gray-600">Read for 20 minutes daily</p>
              </div>
              {userTier === 'free' && (
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg relative">
                  <div className="text-gray-400 text-center py-4">
                    More goals available with upgrade
                  </div>
                  <UpgradePrompt 
                    feature="Additional Goals"
                    description="Get up to 10 goals with Standard plan"
                    type="overlay"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Advanced Analytics</h2>
              <TierBadge tier={userTier} className="text-xs" />
            </div>

            {canUseAdvancedAnalytics ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Completion Trends</h3>
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center justify-center">
                    <span className="text-blue-600">📈 Interactive Chart</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-green-700">Success Rate</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-purple-700">Best Streak</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="space-y-4 opacity-30">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <h3 className="font-medium text-gray-600 mb-2">Completion Trends</h3>
                    <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">📈 Chart Preview</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-500">--</div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-500">--</div>
                      <div className="text-sm text-gray-500">Best Streak</div>
                    </div>
                  </div>
                </div>
                <UpgradePrompt 
                  feature="Advanced Analytics"
                  description="Get detailed insights, trends, and performance metrics"
                  type="overlay"
                />
              </div>
            )}
          </div>

          {/* Export Data Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Data Export</h2>
                <p className="text-gray-600">Download your progress data</p>
              </div>
              <TierBadge tier={userTier} className="text-xs" />
            </div>
            
            <div className="relative">
              <button 
                className={`w-full px-4 py-3 rounded-lg transition-colors ${
                  canExportData 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canExportData}
              >
                {canExportData ? 'Export Data (CSV)' : 'Export Data (Locked)'}
              </button>
              {!canExportData && (
                <UpgradePrompt 
                  feature="Data Export"
                  description="Export your data in CSV format"
                  type="overlay"
                />
              )}
            </div>
          </div>

          {/* Tier Comparison */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Upgrade Your Plan</h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${userTier === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">Free</h3>
                  <span className="text-sm text-gray-600">$0/month</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 3 active goals</li>
                  <li>• Basic progress tracking</li>
                  <li>• 30-day history</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg border-2 ${userTier === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">Standard</h3>
                  <span className="text-sm text-gray-600">$15/month</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 10 active goals</li>
                  <li>• Advanced analytics</li>
                  <li>• Data export</li>
                  <li>• 90-day history</li>
                </ul>
                {userTier !== 'standard' && (
                  <button className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                    Upgrade to Standard
                  </button>
                )}
              </div>

              <div className={`p-4 rounded-lg border-2 ${userTier === 'premium' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">Premium</h3>
                  <span className="text-sm text-gray-600">$35/month</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Unlimited goals</li>
                  <li>• Team features</li>
                  <li>• Coach connections</li>
                  <li>• API access</li>
                  <li>• Unlimited history</li>
                </ul>
                {userTier !== 'premium' && (
                  <button className="w-full mt-3 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm">
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Tier Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Plan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userTier.charAt(0).toUpperCase() + userTier.slice(1)}</div>
              <div className="text-sm text-gray-600">Current Plan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{maxGoals === -1 ? '∞' : maxGoals}</div>
              <div className="text-sm text-gray-600">Max Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{canUseAdvancedAnalytics ? 'Yes' : 'No'}</div>
              <div className="text-sm text-gray-600">Advanced Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TieredDemo;
