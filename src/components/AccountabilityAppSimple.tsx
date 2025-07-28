'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-real';

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  checkIns: CheckIn[];
  createdAt: string;
}

interface CheckIn {
  id: string;
  goalId: string;
  content: string;
  timestamp: string;
  mood: 'great' | 'good' | 'okay' | 'struggling';
  completed: boolean;
}

export default function AccountabilityApp() {
  const { user, loading, error, isAdmin, userTier, canAccessFeature, getFeatureLimit, signIn, signUp, signInWithGoogle, signOut, clearError } = useAuth();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'checkins' | 'analytics' | 'admin'>('dashboard');

  // Authentication form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Goal form states
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as const
  });
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);

  // Check-in form states
  const [newCheckIn, setNewCheckIn] = useState({
    goalId: '',
    content: '',
    mood: 'good' as const,
    completed: false
  });
  const [showNewCheckInForm, setShowNewCheckInForm] = useState(false);

  // Load mock data on component mount
  useEffect(() => {
    if (user) {
      // Clear data for fresh start
      const mockGoals: Goal[] = [];

      const mockCheckIns: CheckIn[] = [];

      setGoals(mockGoals);
      setCheckIns(mockCheckIns);
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      let result;
      if (authMode === 'signin') {
        result = await signIn(authEmail, authPassword);
      } else {
        result = await signUp(authEmail, authPassword, authName);
      }

      if (result.success) {
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    clearError();
    
    try {
      const result = await signInWithGoogle();
      // Success is handled by the auth context
    } catch (err) {
      console.error('Google sign-in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setGoals([]);
      setCheckIns([]);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const addGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      deadline: newGoal.deadline,
      priority: newGoal.priority,
      status: 'active',
      checkIns: [],
      createdAt: new Date().toISOString()
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', description: '', deadline: '', priority: 'medium' });
    setShowNewGoalForm(false);
  };

  const addCheckIn = () => {
    if (!newCheckIn.content.trim() || !newCheckIn.goalId) return;

    const checkIn: CheckIn = {
      id: Date.now().toString(),
      goalId: newCheckIn.goalId,
      content: newCheckIn.content,
      timestamp: new Date().toISOString(),
      mood: newCheckIn.mood,
      completed: newCheckIn.completed
    };

    setCheckIns([...checkIns, checkIn]);
    setNewCheckIn({ goalId: '', content: '', mood: 'good', completed: false });
    setShowNewCheckInForm(false);
  };

  const getMoodColor = (mood: CheckIn['mood']) => {
    switch (mood) {
      case 'great': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'okay': return 'bg-yellow-100 text-yellow-800';
      case 'struggling': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get tier information for feature limits
  const maxGoals = getFeatureLimit('maxGoals') || 0;
  const maxCheckInsPerDay = getFeatureLimit('maxCheckInsPerDay') || 0;
  const maxAdvancedReports = getFeatureLimit('maxAdvancedReports') || 0;
  const canUseAdvancedAnalytics = canAccessFeature('canUseAdvancedAnalytics');
  const canExportData = canAccessFeature('canExportData');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Accountability App
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {authMode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <div className="rounded-md shadow-sm space-y-4">
              {authMode === 'signup' && (
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Full name"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              )}
              <input
                type="email"
                autoComplete="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email address"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
              <input
                type="password"
                autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Sign in with Google
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-blue-600 hover:text-blue-500"
              >
                {authMode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Accountability App</h1>
              <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}!</span>
              {isAdmin && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Admin</span>
              )}
              <button
                onClick={handleSignOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['dashboard', 'goals', 'checkins', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Dashboard Overview</h3>
                  <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Active Goals</dt>
                              <dd className="text-lg font-medium text-gray-900">{goals.filter(g => g.status === 'active').length}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Check-ins</dt>
                              <dd className="text-lg font-medium text-gray-900">{checkIns.length}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {checkIns.length > 0 ? Math.round((checkIns.filter(c => c.completed).length / checkIns.length) * 100) : 0}%
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Check-ins */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Check-ins</h3>
                  {checkIns.length > 0 ? (
                    <div className="space-y-4">
                      {checkIns.slice(-3).reverse().map((checkIn) => {
                        const goal = goals.find(g => g.id === checkIn.goalId);
                        return (
                          <div key={checkIn.id} className="border-l-4 border-blue-400 pl-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">{goal?.title}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMoodColor(checkIn.mood)}`}>
                                {checkIn.mood}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{checkIn.content}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {new Date(checkIn.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No check-ins yet. Start by creating a goal and checking in!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Your Goals</h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        {goals.length} / {maxGoals} goals used
                      </div>
                      <button
                        onClick={() => setShowNewGoalForm(!showNewGoalForm)}
                        disabled={goals.length >= maxGoals}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Add Goal
                      </button>
                    </div>
                  </div>

                  {/* Goal creation limit warning for free users */}
                  {userTier === 'free' && goals.length >= maxGoals && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Goal Limit Reached</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>You've reached your limit of {maxGoals} goals on the Free plan.</p>
                          </div>
                          <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                              <button
                                type="button"
                                className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                              >
                                Upgrade to Premium
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {showNewGoalForm && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Add New Goal</h4>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Goal title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <textarea
                          placeholder="Goal description"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                        <div className="flex space-x-4">
                          <input
                            type="date"
                            value={newGoal.deadline}
                            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <select
                            value={newGoal.priority}
                            onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={addGoal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                          >
                            Add Goal
                          </button>
                          <button
                            onClick={() => setShowNewGoalForm(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {goals.length > 0 ? (
                      goals.map((goal) => (
                        <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">{goal.title}</h4>
                              <p className="mt-1 text-sm text-gray-600">{goal.description}</p>
                              <div className="mt-2 flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority)}`}>
                                  {goal.priority} priority
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  goal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {goal.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No goals yet. Create your first goal to get started!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Check-ins Tab */}
          {activeTab === 'checkins' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Check-ins</h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        Daily limit: {maxCheckInsPerDay} check-ins
                      </div>
                      <button
                        onClick={() => setShowNewCheckInForm(!showNewCheckInForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Add Check-in
                      </button>
                    </div>
                  </div>

                  {showNewCheckInForm && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Add New Check-in</h4>
                      <div className="space-y-4">
                        <select
                          value={newCheckIn.goalId}
                          onChange={(e) => setNewCheckIn({ ...newCheckIn, goalId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a goal</option>
                          {goals.filter(g => g.status === 'active').map((goal) => (
                            <option key={goal.id} value={goal.id}>{goal.title}</option>
                          ))}
                        </select>
                        <textarea
                          placeholder="How did you progress on this goal?"
                          value={newCheckIn.content}
                          onChange={(e) => setNewCheckIn({ ...newCheckIn, content: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                        <div className="flex space-x-4">
                          <select
                            value={newCheckIn.mood}
                            onChange={(e) => setNewCheckIn({ ...newCheckIn, mood: e.target.value as any })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="great">Great</option>
                            <option value="good">Good</option>
                            <option value="okay">Okay</option>
                            <option value="struggling">Struggling</option>
                          </select>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newCheckIn.completed}
                              onChange={(e) => setNewCheckIn({ ...newCheckIn, completed: e.target.checked })}
                              className="mr-2"
                            />
                            Completed today's target
                          </label>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={addCheckIn}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                          >
                            Add Check-in
                          </button>
                          <button
                            onClick={() => setShowNewCheckInForm(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {checkIns.length > 0 ? (
                      checkIns.slice().reverse().map((checkIn) => {
                        const goal = goals.find(g => g.id === checkIn.goalId);
                        return (
                          <div key={checkIn.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-lg font-medium text-gray-900">{goal?.title}</h4>
                                <p className="mt-1 text-sm text-gray-600">{checkIn.content}</p>
                                <div className="mt-2 flex items-center space-x-4">
                                  <span className="text-sm text-gray-500">
                                    {new Date(checkIn.timestamp).toLocaleDateString()}
                                  </span>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMoodColor(checkIn.mood)}`}>
                                    {checkIn.mood}
                                  </span>
                                  {checkIn.completed && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                      Completed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500">No check-ins yet. Start tracking your progress!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics</h3>
                    <div className="text-sm text-gray-600">
                      {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
                    </div>
                  </div>

                  {!canUseAdvancedAnalytics && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Advanced Analytics</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Upgrade to Premium to unlock advanced analytics and insights.</p>
                          </div>
                          <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                              <button
                                type="button"
                                className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                              >
                                Upgrade Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Basic Analytics */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                    <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Goals</dt>
                              <dd className="text-lg font-medium text-gray-900">{goals.length}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Active Goals</dt>
                              <dd className="text-lg font-medium text-gray-900">{goals.filter(g => g.status === 'active').length}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Avg. Check-ins/Goal</dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {goals.length > 0 ? (checkIns.length / goals.length).toFixed(1) : '0'}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {canUseAdvancedAnalytics ? (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Advanced Insights</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Advanced analytics would include:</p>
                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                          <li>Progress trends over time</li>
                          <li>Goal completion patterns</li>
                          <li>Mood correlation analysis</li>
                          <li>Predictive success indicators</li>
                          <li>Custom report generation</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Basic analytics only. Upgrade for advanced insights.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && isAdmin && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Admin Panel</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="text-md font-medium text-red-800 mb-2">Admin Information</h4>
                      <div className="text-sm text-red-700 space-y-1">
                        <p><strong>User ID:</strong> {user.id}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Admin Status:</strong> {isAdmin ? 'Yes' : 'No'}</p>
                        <p><strong>User Tier:</strong> {userTier}</p>
                        <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <h4 className="text-md font-medium text-yellow-800 mb-2">Debug Information</h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <p><strong>Total Goals:</strong> {goals.length}</p>
                        <p><strong>Active Goals:</strong> {goals.filter(g => g.status === 'active').length}</p>
                        <p><strong>Total Check-ins:</strong> {checkIns.length}</p>
                        <p><strong>Goals Limit:</strong> {maxGoals}</p>
                        <p><strong>Daily Check-ins Limit:</strong> {maxCheckInsPerDay}</p>
                        <p><strong>Can Use Advanced Analytics:</strong> {canUseAdvancedAnalytics ? 'Yes' : 'No'}</p>
                        <p><strong>Can Export Data:</strong> {canExportData ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
