'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-real';
import { GoalSetupWizard } from './GoalSetupWizard';
import { PremiumFeatures } from './PremiumFeatures';
import OnboardingFlow from './OnboardingFlow';

const AccountabilityApp: React.FC = () => {
  const { user, loading, error, isAdmin, userTier, signIn, signUp, signInWithGoogle, signOut, clearError } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'signup' | 'onboarding' | 'goalSetup' | 'dashboard' | 'premium'>('welcome');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [userGoals, setUserGoals] = useState<Array<{
    id: string;
    title: string; 
    description: string; 
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    targetValue?: number;
    unit?: string;
  }>>([]);
  const [hasCompletedGoalSetup, setHasCompletedGoalSetup] = useState(false);

  useEffect(() => {
    if (user) {
      // For now, just check if user exists to determine onboarding flow
      // In production, you'd check user.profile.hasCompletedOnboarding or similar
      const shouldShowOnboarding = false; // Simplified for now
      
      if (shouldShowOnboarding && !hasSeenOnboarding) {
        setCurrentScreen('onboarding');
      } else if (!hasCompletedGoalSetup && userGoals.length === 0) {
        setCurrentScreen('goalSetup');
      } else {
        setCurrentScreen('dashboard');
      }
    } else {
      setCurrentScreen('welcome');
    }
  }, [user, hasSeenOnboarding, hasCompletedGoalSetup, userGoals]);

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
      setCurrentScreen('onboarding'); // New users go to onboarding
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitLoading(true);
    const result = await signInWithGoogle();
    setSubmitLoading(false);
    if (result.success) {
      setCurrentScreen('onboarding'); // New Google users also get onboarding
    }
  };

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setCurrentScreen('goalSetup');
  };

  const handleOnboardingSkip = () => {
    setHasSeenOnboarding(true);
    setCurrentScreen('dashboard');
  };

  const handleGoalSetupComplete = (data: {
    goals: Array<{ 
      id: string;
      title: string; 
      description: string; 
      category: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      targetValue?: number;
      unit?: string;
    }>;
    preferences: {
      reminderTime: string;
      checkInFrequency: string;
      weeklyReviewDay: string;
    };
  }) => {
    setUserGoals(data.goals);
    setHasCompletedGoalSetup(true);
    setCurrentScreen('dashboard');
    // Here you would typically save the goals to Firebase
    console.log('Goals created:', data);
  };

  const handleGoalSetupSkip = () => {
    setHasCompletedGoalSetup(true);
    setCurrentScreen('dashboard');
  };

  const handleUpgrade = (tier: 'standard' | 'premium') => {
    // Integrate with Stripe checkout
    console.log('Upgrading to:', tier);
    // For now, just close the premium modal
    setCurrentScreen('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading your accountability journey...</p>
        </div>
      </div>
    );
  }

  // Onboarding Flow
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Goal Setup Wizard  
  if (currentScreen === 'goalSetup') {
    return (
      <GoalSetupWizard
        userTier={userTier}
        onComplete={handleGoalSetupComplete}
        onSkip={handleGoalSetupSkip}
      />
    );
  }

  // Premium Features Modal
  if (currentScreen === 'premium') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
          <PremiumFeatures
            userTier={userTier}
            onUpgrade={handleUpgrade}
            onClose={() => setCurrentScreen('dashboard')}
          />
        </div>
      </div>
    );
  }

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Accountability On Autopilot</h1>
              <p className="text-gray-600 text-lg">
                Your AI-powered discipline coach for building lasting habits
              </p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => setCurrentScreen('login')}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Sign In
              </button>
              <button 
                onClick={() => setCurrentScreen('signup')}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Create Account
              </button>
            </div>
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Join 10,000+ people achieving their goals
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-start">
                <p className="text-red-800 text-sm">{error}</p>
                <button onClick={clearError} className="text-red-600 hover:text-red-800 font-bold">×</button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={submitLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
            >
              {submitLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="my-6 text-center text-gray-500">or</div>
          
          <button 
            onClick={handleGoogleSignIn}
            disabled={submitLoading}
            className="w-full py-3 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>🔍</span>
            <span>Continue with Google</span>
          </button>
          
          <div className="text-center mt-6">
            <button 
              onClick={() => setCurrentScreen('welcome')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (currentScreen === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
            <p className="text-gray-600 mt-2">Start your accountability journey today</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-start">
                <p className="text-red-800 text-sm">{error}</p>
                <button onClick={clearError} className="text-red-600 hover:text-red-800 font-bold">×</button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={submitLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
            >
              {submitLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="my-6 text-center text-gray-500">or</div>
          
          <button 
            onClick={handleGoogleSignIn}
            disabled={submitLoading}
            className="w-full py-3 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>🔍</span>
            <span>Sign Up with Google</span>
          </button>
          
          <div className="text-center mt-6">
            <button 
              onClick={() => setCurrentScreen('welcome')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <span className="text-gray-500">Welcome back, {user?.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              userTier === 'premium' ? 'bg-purple-100 text-purple-800' :
              userTier === 'standard' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {userTier.toUpperCase()}
            </span>
            {isAdmin && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                ADMIN
              </span>
            )}
            <button 
              onClick={signOut}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">🎯</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Active Goals</h3>
                <p className="text-2xl font-bold text-gray-900">{userGoals.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">🔥</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
                <p className="text-2xl font-bold text-gray-900">0 days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">📊</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Weekly Progress</h3>
                <p className="text-2xl font-bold text-gray-900">0%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">✅</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Check-ins</h3>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goals Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Goals</h2>
              <button 
                onClick={() => setCurrentScreen('goalSetup')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Add Goal
              </button>
            </div>
            
            {userGoals.length > 0 ? (
              <div className="space-y-4">
                {userGoals.slice(0, 3).map((goal, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{goal.title}</h3>
                      <span className="text-xs text-gray-500 capitalize">{goal.frequency}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{goal.category}</span>
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
                {userGoals.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{userGoals.length - 3} more goals
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
                <p className="text-gray-600 mb-4">Create your first goal to start your accountability journey!</p>
                <button 
                  onClick={() => setCurrentScreen('goalSetup')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create First Goal
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Check-ins</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No check-ins yet</h3>
              <p className="text-gray-600">Complete your first goal check-in to see progress here!</p>
            </div>
          </div>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {userTier === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">👑</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Your Full Potential</h3>
                <p className="text-gray-600 mb-4">
                  Upgrade to Premium for unlimited goals, AI insights, social accountability, and advanced analytics!
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setCurrentScreen('premium')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                  >
                    View Premium Features
                  </button>
                  <button className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountabilityApp;
