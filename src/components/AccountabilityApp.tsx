'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-real';
import { UpgradePrompt, TierBadge, FeatureLimit } from '@/components/ui/upgrade-prompt-no-styles';
import { ThemeDialog } from '@/components/ui/theme-dialog';

const AccountabilityApp: React.FC = () => {
  const { user, loading, error, isAdmin, userTier, canAccessFeature, getFeatureLimit, signIn, signUp, signInWithGoogle, signOut, clearError } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'signup' | 'dashboard'>('welcome');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('welcome');
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const result = await signIn(loginForm.email, loginForm.password);
    setSubmitLoading(false);
    if (result.success) {
      setCurrentScreen('dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const result = await signUp(signupForm.email, signupForm.password, signupForm.name);
    setSubmitLoading(false);
    if (result.success) {
      setCurrentScreen('dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitLoading(true);
    const result = await signInWithGoogle();
    setSubmitLoading(false);
    if (result.success) {
      setCurrentScreen('dashboard');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Welcome Screen
  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      {/* ThemeToggle removed, theme selection now in sidebar dialog */}
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Accountability On Autopilot</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Your AI-powered discipline coach</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setCurrentScreen('login')}
              className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentScreen('signup')}
              className="w-full px-6 py-3 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Login Screen
  const renderLoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      {/* ThemeToggle removed, theme selection now in sidebar dialog */}
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Sign In</h2>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {submitLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={submitLoading}
              className="mt-3 w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              🔍 Sign in with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <button
              onClick={() => setCurrentScreen('signup')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Signup Screen
  const renderSignupScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      {/* ThemeToggle removed, theme selection now in sidebar dialog */}
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Create Account</h2>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {submitLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={submitLoading}
              className="mt-3 w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              🔍 Sign up with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <button
              onClick={() => setCurrentScreen('login')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard with tiered features
  const renderDashboard = () => {
    const maxGoals = getFeatureLimit('maxGoals') || 0;
    const currentGoals = 0; // This would come from actual data
    const canAddMoreGoals = maxGoals === -1 || currentGoals < maxGoals;
    const canUseAdvancedAnalytics = canAccessFeature('canUseAdvancedAnalytics');
    const canExportData = canAccessFeature('canExportData');

    // Handler to navigate to settings for upgrades
    const handleUpgradeClick = () => {
      setCurrentPage('settings');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <ThemeDialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} />
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Accountability</h1>
                <TierBadge tier={userTier} />
              </div>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
                  { id: 'goals', label: 'Goals', icon: '🎯' },
                  { id: 'checkins', label: 'Check-ins', icon: '✅' },
                  { id: 'progress', label: 'Progress', icon: '📊' },
                  { id: 'settings', label: 'Settings', icon: '⚙️' },
                  ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: '🔧' }] : []),
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentPage === item.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500 text-blue-700 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                {/* Theme selector item */}
                <button
                  onClick={() => setThemeDialogOpen(true)}
                  className="w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                  aria-label="Select theme"
                >
                  <span className="mr-3">🌓</span> Theme
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {currentPage === 'dashboard' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}!</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Ready to stay accountable today?</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await signOut();
                        setCurrentScreen('welcome');
                      }}
                      className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded text-xs hover:bg-red-600 dark:hover:bg-red-500 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Usage Summary for Free Users */}
                {userTier === 'free' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-4">Your Usage</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <FeatureLimit 
                            current={currentGoals} 
                            limit={maxGoals} 
                            label="Active Goals" 
                          />
                          <FeatureLimit 
                            current={0} 
                            limit={30} 
                            label="Check-ins this month" 
                          />
                        </div>
                      </div>
                      <div className="ml-6">
                        <button 
                          onClick={handleUpgradeClick}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all text-sm font-medium"
                        >
                          Upgrade Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Daily Goals Card */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Daily Goals</h3>
                    <p className="text-blue-100 dark:text-blue-200 mb-4">Track your daily objectives</p>
                    <div className="text-3xl font-bold">0/0</div>
                    <p className="text-sm text-blue-200 dark:text-blue-300">Goals completed today</p>
                  </div>

                  {/* Streak Card */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Streak</h3>
                    <p className="text-green-100 dark:text-green-200 mb-4">Your consistency record</p>
                    <div className="text-3xl font-bold">0</div>
                    <p className="text-sm text-green-200 dark:text-green-300">Days in a row</p>
                  </div>

                  {/* Progress Card */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Progress</h3>
                    <p className="text-purple-100 dark:text-purple-200 mb-4">Overall completion rate</p>
                    <div className="text-3xl font-bold">0%</div>
                    <p className="text-sm text-purple-200 dark:text-purple-300">This month</p>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'goals' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Goals</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your accountability goals</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Goals</h2>
                    <div className="relative">
                      <button 
                        className="px-4 py-2 rounded-lg transition-colors bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        + Add New Goal
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-1">Exercise Daily</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Work out for 30 minutes</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-1">Read Books</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Read for 20 minutes daily</p>
                    </div>
                    
                    {userTier === 'free' && (
                      <UpgradePrompt 
                        feature="Unlock More Goals"
                        description="Free plan is limited to 2 goals. Upgrade to Standard for up to 10 goals, or Premium for unlimited goals."
                        size="medium"
                        onUpgrade={handleUpgradeClick}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'progress' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Progress</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your accountability journey</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Progress */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Weekly Overview</h2>
                    <div className="space-y-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{day}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((goal) => (
                              <div 
                                key={goal}
                                className={`w-6 h-6 rounded ${
                                  index < 5 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {index < 5 ? '3/3' : '0/3'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Analytics */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Advanced Analytics</h2>
                    {userTier === 'free' ? (
                      <UpgradePrompt 
                        feature="Advanced Analytics"
                        description="Get detailed insights, trends, performance metrics, and custom charts with Standard or Premium plans."
                        size="large"
                        onUpgrade={handleUpgradeClick}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Completion Trends</h3>
                          <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800/40 dark:to-blue-700/40 rounded flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400">📈 Interactive Chart</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0%</div>
                            <div className="text-sm text-green-700 dark:text-green-400">Success Rate</div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
                            <div className="text-sm text-purple-700 dark:text-purple-400">Best Streak</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Data Feature */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Data Export</h2>
                      <p className="text-gray-600 dark:text-gray-400">Download your progress data</p>
                    </div>
                    <div className="relative">
                      <button 
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          canExportData 
                            ? 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600' 
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!canExportData}
                      >
                        Export Data
                      </button>
                      {!canExportData && userTier === 'free' && (
                        <div className="mt-4">
                          <UpgradePrompt 
                            feature="Data Export"
                            description="Export your progress data in CSV format with Standard or Premium plans."
                            size="medium"
                            onUpgrade={handleUpgradeClick}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'settings' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Customize your accountability experience</p>
                  </div>
                  <TierBadge tier={userTier} />
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Account</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          defaultValue={user?.name || ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                          value={user?.email || ''}
                          disabled
                        />
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={async () => {
                            await signOut();
                            setCurrentScreen('welcome');
                          }}
                          className="w-full p-3 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Management */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Subscription</h2>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">Current Plan</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan</div>
                      </div>
                      <TierBadge tier={userTier} />
                    </div>
                    
                    {userTier === 'free' && (
                      <div className="space-y-3">
                        <button className="w-full p-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                          Upgrade to Standard - $15/month
                        </button>
                        <button className="w-full p-3 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors">
                          Upgrade to Premium - $35/month
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'checkins' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Check-ins</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your daily accountability</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Today's Check-in */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Today's Check-in</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How did today go?</label>
                        <textarea 
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows={3}
                          placeholder="Reflect on your progress today..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate your day (1-10)</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          className="w-full"
                        />
                      </div>
                      <button className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                        Submit Check-in
                      </button>
                    </div>
                  </div>

                  {/* Recent Check-ins */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Check-ins</h2>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800 dark:text-white">Day {5-i}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Made good progress on my goals today. Feeling motivated!</p>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Rating: </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{8 - i}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {userTier === 'free' && (
                    <UpgradePrompt 
                      feature="Advanced Check-ins"
                      description="Get detailed analytics, mood tracking, habit insights, and custom reflection prompts with Standard or Premium plans."
                      size="large"
                      onUpgrade={handleUpgradeClick}
                    />
                  )}
                </div>
              </div>
            )}

            {currentPage === 'admin' && isAdmin && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Admin Panel</h1>
                    <p className="text-gray-600 dark:text-gray-400">System administration and debug information</p>
                  </div>
                  <TierBadge tier={userTier} />
                </div>

                <div className="space-y-6">
                  {/* Admin Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Admin Information</h2>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                      <div className="text-sm text-red-700 dark:text-red-400 space-y-2">
                        <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Name:</strong> {user?.name}</p>
                        <p><strong>Admin Status:</strong> {isAdmin ? 'Yes' : 'No'}</p>
                        <p><strong>User Tier:</strong> {userTier}</p>
                        <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Feature Limits & Permissions */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Feature Limits & Permissions</h2>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-2">
                        <p><strong>Max Goals:</strong> {getFeatureLimit('maxGoals') === -1 ? 'Unlimited' : getFeatureLimit('maxGoals')}</p>
                        <p><strong>Max Daily Check-ins:</strong> {getFeatureLimit('maxCheckInsPerDay') === -1 ? 'Unlimited' : getFeatureLimit('maxCheckInsPerDay')}</p>
                        <p><strong>Can Use Advanced Analytics:</strong> {canAccessFeature('canUseAdvancedAnalytics') ? 'Yes' : 'No'}</p>
                        <p><strong>Can Export Data:</strong> {canAccessFeature('canExportData') ? 'Yes' : 'No'}</p>
                        <p><strong>Can Use Custom Reminders:</strong> {canAccessFeature('canUseCustomReminders') ? 'Yes' : 'No'}</p>
                        <p><strong>Can Create Unlimited Goals:</strong> {canAccessFeature('canCreateUnlimitedGoals') ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* System Debug Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">System Debug Information</h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <div className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                        <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
                        <p><strong>Firebase Project:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not configured'}</p>
                        <p><strong>Current Theme:</strong> {document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}</p>
                        <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</p>
                        <p><strong>Screen Resolution:</strong> {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}</p>
                        <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="p-4 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
                        Clear Cache
                      </button>
                      <button className="p-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                        Export User Data
                      </button>
                      <button className="p-4 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors">
                        Reset User Preferences
                      </button>
                      <button className="p-4 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors">
                        View System Logs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  if (user) {
    return renderDashboard();
  }

  switch (currentScreen) {
    case 'login':
      return renderLoginScreen();
    case 'signup':
      return renderSignupScreen();
    default:
      return renderWelcomeScreen();
  }
};

export default AccountabilityApp;
