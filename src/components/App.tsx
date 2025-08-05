import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDays: number;
  currentStreak: number;
  completedDays: number;
  createdAt: Date;
  lastCheckedIn: Date | null;
}

interface CheckIn {
  id: string;
  goalId: string;
  date: Date;
  note?: string;
}

const AccountabilityApp: React.FC = () => {
  const { user, loading, signInWithGoogle, signOut, userTier } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDays: 30 });
  const [loadingGoals, setLoadingGoals] = useState(false);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;
    
    setLoadingGoals(true);
    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(goalsQuery);
      const goalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastCheckedIn: doc.data().lastCheckedIn?.toDate() || null,
      })) as Goal[];
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoadingGoals(false);
    }
  };

  const addGoal = async () => {
    if (!user || !newGoal.title.trim()) return;

    try {
      const goalData = {
        userId: user.id,
        title: newGoal.title,
        description: newGoal.description,
        targetDays: newGoal.targetDays,
        currentStreak: 0,
        completedDays: 0,
        createdAt: new Date(),
        lastCheckedIn: null,
      };

      await addDoc(collection(db, 'goals'), goalData);
      setNewGoal({ title: '', description: '', targetDays: 30 });
      setShowAddGoal(false);
      loadGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const checkInGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Check if already checked in today
      if (goal.lastCheckedIn) {
        const lastCheckinStart = new Date(
          goal.lastCheckedIn.getFullYear(),
          goal.lastCheckedIn.getMonth(),
          goal.lastCheckedIn.getDate()
        );
        if (lastCheckinStart.getTime() === todayStart.getTime()) {
          alert('You have already checked in today!');
          return;
        }
      }

      // Add check-in record
      await addDoc(collection(db, 'checkins'), {
        userId: user.id,
        goalId: goalId,
        date: today,
        note: '',
      });

      // Update goal stats
      const newCompletedDays = goal.completedDays + 1;
      let newStreak = goal.currentStreak + 1;
      
      // Check if streak is broken (missed yesterday)
      if (goal.lastCheckedIn) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const lastCheckinStart = new Date(
          goal.lastCheckedIn.getFullYear(),
          goal.lastCheckedIn.getMonth(),
          goal.lastCheckedIn.getDate()
        );
        
        if (lastCheckinStart.getTime() < yesterdayStart.getTime()) {
          newStreak = 1; // Reset streak
        }
      }

      await updateDoc(doc(db, 'goals', goalId), {
        completedDays: newCompletedDays,
        currentStreak: newStreak,
        lastCheckedIn: today,
      });

      loadGoals();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user || !confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteDoc(doc(db, 'goals', goalId));
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getTierBadge = () => {
    const colors: Record<string, string> = {
      free: 'bg-slate-100 text-slate-700 border border-slate-200',
      standard: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      premium: 'bg-amber-100 text-amber-700 border border-amber-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[userTier] || colors.free}`}>
        {userTier.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-slate-900">
              Accountability App
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Track your goals, build habits, stay accountable
            </p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                Accountability
              </h1>
              {getTierBadge()}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600 font-medium">Welcome, {user.name}</span>
              <button
                onClick={signOut}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Goals Overview */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Your Goals</h2>
              <button
                onClick={() => setShowAddGoal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Goal
              </button>
            </div>

            {loadingGoals ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading your goals...</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200">
                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 mb-6 text-lg">No goals yet. Create your first goal to get started!</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">{goal.title}</h3>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-slate-400 hover:text-red-500 text-sm p-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {goal.description && (
                      <p className="text-slate-600 mb-4 text-sm">{goal.description}</p>
                    )}
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Current Streak:</span>
                        <span className="font-bold text-emerald-600">{goal.currentStreak} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Total Completed:</span>
                        <span className="font-bold text-blue-600">{goal.completedDays} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Target:</span>
                        <span className="font-bold text-slate-700">{goal.targetDays} days</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((goal.completedDays / goal.targetDays) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500 text-center">
                        {Math.round((goal.completedDays / goal.targetDays) * 100)}% Complete
                      </div>
                    </div>
                    
                    <button
                      onClick={() => checkInGoal(goal.id)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      ✓ Check In Today
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Add New Goal</h3>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="e.g., Exercise daily"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                    placeholder="What does this goal mean to you?"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Days
                  </label>
                  <input
                    type="number"
                    value={newGoal.targetDays}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDays: parseInt(e.target.value) || 30 })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    min="1"
                    max="365"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addGoal}
                  disabled={!newGoal.title.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountabilityApp;
