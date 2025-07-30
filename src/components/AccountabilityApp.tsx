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

  // Goals functionality state
  const [goals, setGoals] = useState([
    { id: 1, title: 'Exercise Daily', description: 'Work out for 30 minutes', status: 'active', progress: 65, completed: false }
  ]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });

  // Check-ins functionality state
  const [checkIns, setCheckIns] = useState([
    { id: 1, date: new Date().toISOString().split('T')[0], rating: 8, reflection: 'Made good progress on my goals today. Feeling motivated!', completed: true },
    { id: 2, date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], rating: 7, reflection: 'Good day overall, stayed consistent.', completed: true },
    { id: 3, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], rating: 6, reflection: 'Had some challenges but pushed through.', completed: true }
  ]);
  const [todayCheckIn, setTodayCheckIn] = useState({ rating: 5, reflection: '' });
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

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
                className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-all duration-200 ease-in-out transform focus:scale-[1.02] hover:shadow-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-all duration-200 ease-in-out transform focus:scale-[1.02] hover:shadow-md"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
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
              className="mt-3 w-full px-6 py-3 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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
                className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-all duration-200 ease-in-out transform focus:scale-[1.02] hover:shadow-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-all duration-200 ease-in-out transform focus:scale-[1.02] hover:shadow-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition-all duration-200 ease-in-out transform focus:scale-[1.02] hover:shadow-md"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
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
              className="mt-3 w-full px-6 py-3 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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

  // Functionality handlers
  const handleAddGoal = () => {
    if (newGoal.title.trim() && newGoal.description.trim()) {
      const goal = {
        id: Date.now(),
        title: newGoal.title.trim(),
        description: newGoal.description.trim(),
        status: 'active' as const,
        progress: 0,
        completed: false
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', description: '' });
      setShowAddGoal(false);
    }
  };

  const handleDeleteGoal = (goalId: number) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const handleToggleGoal = (goalId: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: !goal.completed, progress: !goal.completed ? 100 : 0 }
        : goal
    ));
  };

  const handleSubmitCheckIn = () => {
    if (todayCheckIn.reflection.trim() && !hasCheckedInToday) {
      const checkIn = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        rating: todayCheckIn.rating,
        reflection: todayCheckIn.reflection.trim(),
        completed: true
      };
      setCheckIns([checkIn, ...checkIns]);
      setTodayCheckIn({ rating: 5, reflection: '' });
      setHasCheckedInToday(true);
    }
  };

  const handleExportData = () => {
    const data = {
      goals,
      checkIns,
      user: { name: user?.name, email: user?.email },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accountability-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dashboard with tiered features
  const renderDashboard = () => {
    const maxGoals = getFeatureLimit('goals') || 0;
    const currentGoals = goals.length; // Count all goals (active + completed)
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
            <div className="p-6 border-b border-blue-200 dark:border-blue-700">
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
                  { id: 'subscription', label: 'Subscription', icon: '💎' },
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
                  className="w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-4 border-t border-blue-200 dark:border-blue-700 pt-4"
                  aria-label="Select theme"
                >
                  <span className="mr-3">🌓</span> Theme
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="transition-all duration-300 ease-in-out">
              {currentPage === 'dashboard' && (
                <div className="animate-in fade-in duration-300">
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
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-400">Free Plan Usage</h3>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                            Current Plan
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Goals Limit</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{currentGoals}/{maxGoals}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${maxGoals > 0 ? (currentGoals / maxGoals) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {maxGoals - currentGoals <= 0 ? '0 goals remaining' : `${maxGoals - currentGoals} goals remaining`}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Check-ins</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{checkIns.length}/30</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((checkIns.length / 30) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.max(30 - checkIns.length, 0)} check-ins remaining this month
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-400">
                            💡 <strong>Upgrade benefits:</strong> Unlimited goals, advanced analytics, data export, and priority support.
                          </p>
                        </div>
                      </div>
                      <div className="ml-6">
                        <button 
                          onClick={handleUpgradeClick}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          ✨ Upgrade Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Daily Goals Card */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Active Goals</h3>
                    <p className="text-blue-100 dark:text-blue-200 mb-4">Goals in progress</p>
                    <div className="text-3xl font-bold">{goals.filter(g => !g.completed).length}</div>
                    <p className="text-sm text-blue-200 dark:text-blue-300">
                      {goals.filter(g => !g.completed).length === 1 ? 'goal' : 'goals'} active • {goals.filter(g => g.completed).length} completed
                    </p>
                  </div>

                  {/* Streak Card */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Streak</h3>
                    <p className="text-green-100 dark:text-green-200 mb-4">Your consistency record</p>
                    <div className="text-3xl font-bold">{checkIns.length}</div>
                    <p className="text-sm text-green-200 dark:text-green-300">Total check-ins</p>
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
                        onClick={() => setShowAddGoal(true)}
                        disabled={!canAddMoreGoals}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                          canAddMoreGoals 
                            ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg' 
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed hover:scale-100'
                        }`}
                      >
                        + Add New Goal
                      </button>
                      {!canAddMoreGoals && userTier === 'free' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Goal Limit: {currentGoals}/{maxGoals}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Add Goal Form */}
                  {showAddGoal && (
                    <div className="mb-6 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 animate-in slide-in-from-top duration-300">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-3">Add New Goal</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Goal title..."
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out transform focus:scale-[1.02] hover:shadow-md"
                        />
                        <textarea
                          placeholder="Goal description..."
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out transform focus:scale-[1.02] hover:shadow-md"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddGoal}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-lg"
                          >
                            Add Goal
                          </button>
                          <button
                            onClick={() => setShowAddGoal(false)}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {goals.map((goal) => (
                      <div key={goal.id} className={`p-4 border border-blue-200 dark:border-blue-700 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-md ${goal.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 animate-pulse' : 'hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center mt-1">
                              <input
                                type="checkbox"
                                checked={goal.completed}
                                onChange={() => handleToggleGoal(goal.id)}
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200 ease-in-out transform hover:scale-110"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-medium mb-1 transition-all duration-300 ease-in-out ${goal.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                                {goal.title}
                              </h3>
                              <p className={`text-sm mb-2 transition-all duration-300 ease-in-out ${goal.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                                {goal.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-500 ease-out ${goal.completed ? 'bg-green-500 dark:bg-green-400 animate-pulse' : 'bg-blue-600 dark:bg-blue-500'}`}
                                    style={{ width: `${goal.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{goal.progress}%</span>
                                {goal.completed && (
                                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full animate-in slide-in-from-right duration-300">
                                    ✓ Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="ml-4 px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 ease-in-out transform hover:scale-110"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    
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
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                        const dayDate = new Date();
                        dayDate.setDate(dayDate.getDate() - (6 - index));
                        const dateString = dayDate.toDateString();
                        const hasCheckIn = checkIns.some(checkIn => 
                          new Date(checkIn.date).toDateString() === dateString
                        );
                        
                        return (
                          <div key={day} className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{day}</span>
                            <div className="flex gap-1">
                              {goals.slice(0, 3).map((goal, goalIndex) => (
                                <div 
                                  key={goalIndex}
                                  className={`w-6 h-6 rounded ${
                                    hasCheckIn && goal.progress > 0 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                                  }`}
                                />
                              ))}
                              {goals.length === 0 && (
                                <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-600" />
                              )}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {hasCheckIn ? `${Math.min(goals.length, 3)}/${Math.max(goals.length, 1)}` : '0/1'}
                            </span>
                          </div>
                        );
                      })}
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
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {checkIns.length > 0 ? Math.round((checkIns.reduce((sum, checkIn) => sum + checkIn.rating, 0) / checkIns.length / 10) * 100) : 0}%
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-400">Avg Rating</div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{checkIns.length}</div>
                            <div className="text-sm text-purple-700 dark:text-purple-400">Total Check-ins</div>
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
                          className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue={user?.name || ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                          value={user?.email || ''}
                          disabled
                        />
                      </div>
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
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
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300 ease-in-out hover:shadow-2xl">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      {hasCheckedInToday ? "Today's Check-in Complete ✅" : "Today's Check-in"}
                    </h2>
                    {!hasCheckedInToday ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How did today go?</label>
                          <textarea 
                            value={todayCheckIn.reflection}
                            onChange={(e) => setTodayCheckIn({ ...todayCheckIn, reflection: e.target.value })}
                            className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out transform focus:scale-[1.02] hover:shadow-md"
                            rows={3}
                            placeholder="Reflect on your progress today..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rate your day: {todayCheckIn.rating}/10
                          </label>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={todayCheckIn.rating}
                            onChange={(e) => setTodayCheckIn({ ...todayCheckIn, rating: parseInt(e.target.value) })}
                            className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02]"
                          />
                        </div>
                        <button 
                          onClick={handleSubmitCheckIn}
                          disabled={!todayCheckIn.reflection.trim()}
                          className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                          Submit Check-in
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 animate-in fade-in duration-500">
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        <p className="text-gray-600 dark:text-gray-400">You've already checked in today! Come back tomorrow.</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Check-ins */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300 ease-in-out hover:shadow-2xl">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Check-ins</h2>
                    {checkIns.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-gray-600 dark:text-gray-400">No check-ins yet. Submit your first one above!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {checkIns.slice(0, 5).map((checkIn, index) => (
                          <div key={checkIn.id} className="p-4 border border-blue-200 dark:border-blue-700 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/10"
                               style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800 dark:text-white">{checkIn.date}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                Rating: {checkIn.rating}/10
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">{checkIn.reflection}</p>
                          </div>
                        ))}
                      </div>
                    )}
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

            {currentPage === 'subscription' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Subscription</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your subscription and billing</p>
                  </div>
                  <TierBadge tier={userTier} />
                </div>

                <div className="space-y-6">
                  {/* Current Plan Overview */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Current Plan</h2>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white text-lg">{userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {userTier === 'free' ? 'Limited features - Upgrade for full access' : 
                           userTier === 'standard' ? '$15/month - Great for individuals' :
                           '$35/month - Perfect for power users'}
                        </div>
                      </div>
                      <TierBadge tier={userTier} />
                    </div>

                    {/* Plan Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white mb-3">What's Included</h3>
                        <ul className="space-y-2">
                          {userTier === 'free' && (
                            <>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Up to 2 goals
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Basic check-ins
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Basic progress tracking
                              </li>
                              <li className="flex items-center text-sm text-gray-400 dark:text-gray-500">
                                <span className="text-gray-400 mr-2">✗</span> Advanced analytics
                              </li>
                              <li className="flex items-center text-sm text-gray-400 dark:text-gray-500">
                                <span className="text-gray-400 mr-2">✗</span> Data export
                              </li>
                            </>
                          )}
                          {userTier === 'standard' && (
                            <>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Up to 10 goals
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Advanced check-ins
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Advanced analytics
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Data export
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Priority support
                              </li>
                            </>
                          )}
                          {userTier === 'premium' && (
                            <>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Unlimited goals
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Advanced check-ins
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Advanced analytics
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Data export
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Priority support
                              </li>
                              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Custom integrations
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white mb-3">Usage This Month</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Goals</span>
                              <span className="text-gray-800 dark:text-white">{goals.length}/{userTier === 'free' ? '2' : userTier === 'standard' ? '10' : '∞'}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                                style={{ width: `${userTier === 'premium' ? 25 : Math.min((goals.length / (userTier === 'free' ? 2 : 10)) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Check-ins</span>
                              <span className="text-gray-800 dark:text-white">{checkIns.length}/30</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                              <div 
                                className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                                style={{ width: `${Math.min((checkIns.length / 30) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Options */}
                  {userTier === 'free' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Standard Plan */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-blue-200 dark:border-blue-700">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Standard Plan</h3>
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">$15</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
                        </div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Up to 10 goals</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Advanced analytics</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Data export</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Priority support</span>
                          </li>
                        </ul>
                        <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                          ✨ Upgrade to Standard
                        </button>
                      </div>

                      {/* Premium Plan */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-purple-200 dark:border-purple-700 relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                          </span>
                        </div>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Premium Plan</h3>
                          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">$35</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
                        </div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Unlimited goals</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Advanced analytics</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Data export</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Priority support</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-600 dark:text-gray-400">Custom integrations</span>
                          </li>
                        </ul>
                        <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-500 dark:hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                          ✨ Upgrade to Premium
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Billing History */}
                  {userTier !== 'free' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Billing History</h2>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">July 2025</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-800 dark:text-white">${userTier === 'standard' ? '15.00' : '35.00'}</div>
                            <div className="text-sm text-green-600 dark:text-green-400">Paid</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">June 2025</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-800 dark:text-white">${userTier === 'standard' ? '15.00' : '35.00'}</div>
                            <div className="text-sm text-green-600 dark:text-green-400">Paid</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manage Subscription */}
                  {userTier !== 'free' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Manage Subscription</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="px-4 py-2 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          Update Payment Method
                        </button>
                        <button className="px-4 py-2 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          Download Invoices
                        </button>
                        <button className="px-4 py-2 border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                          Pause Subscription
                        </button>
                        <button className="px-4 py-2 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          Cancel Subscription
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentPage === 'admin' && isAdmin && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Admin Control Center</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage system settings, monitor performance, and oversee user operations</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <TierBadge tier={userTier} />
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-sm font-medium">
                      Admin Access
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* System Status Cards */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">System Status</h3>
                        <div className="text-3xl font-bold">Online</div>
                        <p className="text-green-100 dark:text-green-200 text-sm">All services operational</p>
                      </div>
                      <div className="text-4xl opacity-80">🟢</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Total Users</h3>
                        <div className="text-3xl font-bold">1,247</div>
                        <p className="text-blue-100 dark:text-blue-200 text-sm">+23 this week</p>
                      </div>
                      <div className="text-4xl opacity-80">👥</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Server Load</h3>
                        <div className="text-3xl font-bold">34%</div>
                        <p className="text-purple-100 dark:text-purple-200 text-sm">Optimal performance</p>
                      </div>
                      <div className="text-4xl opacity-80">⚡</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* User Management */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Management</h2>
                      <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                        Active Session
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 dark:text-white">Current User</span>
                          <span className="text-sm text-blue-600 dark:text-blue-400">{userTier} Tier</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><strong>Email:</strong> {user?.email}</p>
                          <p><strong>Name:</strong> {user?.name}</p>
                          <p><strong>ID:</strong> {user?.id?.substring(0, 12)}...</p>
                          <p><strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button className="p-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium">
                          📊 View Analytics
                        </button>
                        <button className="p-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-medium">
                          💼 Manage Tiers
                        </button>
                        <button className="p-3 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors text-sm font-medium">
                          🔄 Reset Data
                        </button>
                        <button className="p-3 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm font-medium">
                          📋 Export Data
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* System Configuration */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">System Configuration</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Feature Limits</h3>
                        <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Max Goals:</span>
                            <span>{getFeatureLimit('maxGoals') === -1 ? 'Unlimited' : getFeatureLimit('maxGoals')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Daily Check-ins:</span>
                            <span>{getFeatureLimit('maxCheckInsPerDay') === -1 ? 'Unlimited' : getFeatureLimit('maxCheckInsPerDay')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Advanced Analytics:</span>
                            <span>{canAccessFeature('canUseAdvancedAnalytics') ? 'Enabled' : 'Disabled'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Data Export:</span>
                            <span>{canAccessFeature('canExportData') ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Environment Info</h3>
                        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Environment:</span>
                            <span className="font-mono">{process.env.NODE_ENV || 'development'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Firebase Project:</span>
                            <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.substring(0, 20) || 'Not configured'}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Theme:</span>
                            <span>{typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Updated:</span>
                            <span>{new Date().toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Tools */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 xl:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Administrative Tools</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔧</div>
                          <h3 className="font-medium text-gray-800 dark:text-white mb-1">System Maintenance</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Clear cache, optimize database</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                          <h3 className="font-medium text-gray-800 dark:text-white mb-1">Usage Analytics</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">View detailed usage metrics</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛡️</div>
                          <h3 className="font-medium text-gray-800 dark:text-white mb-1">Security Center</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Manage access & permissions</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                          <h3 className="font-medium text-gray-800 dark:text-white mb-1">System Logs</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">View application logs</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
                          <h3 className="font-medium text-gray-800 dark:text-white mb-1">App Settings</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Configure app behavior</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                          <h3 className="font-medium text-gray-800 dark:text-white mb-1">Backup Manager</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Create & restore backups</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔄</div>
                          <h3 className="font-medium text-gray-800 dark:text-white mb-1">Data Migration</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Import & export user data</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📧</div>
                          <h3 className="font-medium text-gray-800 dark:text-white mb-1">Notifications</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Manage system notifications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
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
