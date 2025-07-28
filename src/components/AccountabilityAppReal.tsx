'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-real';

const AccountabilityApp: React.FC = () => {
  const { user, loading, error, isAdmin, userTier, signIn, signUp, signInWithGoogle, signOut, clearError } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'signup' | 'dashboard'>('welcome');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (currentScreen === 'welcome') {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Accountability On Autopilot</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Your AI-powered discipline coach for building lasting habits
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => setCurrentScreen('login')}
            style={{ padding: '1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem' }}
          >
            Sign In
          </button>
          <button 
            onClick={() => setCurrentScreen('signup')}
            style={{ padding: '1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem' }}
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign In</h2>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
            <button onClick={clearError} style={{ float: 'right', background: 'none', border: 'none' }}>×</button>
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            required
          />
          <button 
            type="submit" 
            disabled={submitLoading}
            style={{ padding: '1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem' }}
          >
            {submitLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div style={{ margin: '1rem 0', textAlign: 'center' }}>or</div>
        <button 
          onClick={handleGoogleSignIn}
          disabled={submitLoading}
          style={{ width: '100%', padding: '1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem' }}
        >
          Sign In with Google
        </button>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            onClick={() => setCurrentScreen('welcome')}
            style={{ background: 'none', border: 'none', color: '#6b7280', textDecoration: 'underline' }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'signup') {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
            <button onClick={clearError} style={{ float: 'right', background: 'none', border: 'none' }}>×</button>
          </div>
        )}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Full Name"
            value={signupForm.name}
            onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
            style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={signupForm.email}
            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
            style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={signupForm.password}
            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            required
          />
          <button 
            type="submit" 
            disabled={submitLoading}
            style={{ padding: '1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem' }}
          >
            {submitLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div style={{ margin: '1rem 0', textAlign: 'center' }}>or</div>
        <button 
          onClick={handleGoogleSignIn}
          disabled={submitLoading}
          style={{ width: '100%', padding: '1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem' }}
        >
          Sign Up with Google
        </button>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            onClick={() => setCurrentScreen('welcome')}
            style={{ background: 'none', border: 'none', color: '#6b7280', textDecoration: 'underline' }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Accountability Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {user?.name}</span>
          <span style={{ 
            padding: '0.25rem 0.5rem', 
            backgroundColor: userTier === 'premium' ? '#10b981' : userTier === 'standard' ? '#3b82f6' : '#6b7280',
            color: 'white',
            borderRadius: '0.25rem',
            fontSize: '0.75rem'
          }}>
            {userTier.toUpperCase()}
          </span>
          {isAdmin && (
            <span style={{ 
              padding: '0.25rem 0.5rem', 
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '0.25rem',
              fontSize: '0.75rem'
            }}>
              ADMIN
            </span>
          )}
          <button 
            onClick={signOut}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}>
          <h3>Active Goals</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}>
          <h3>Current Streak</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0 days</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}>
          <h3>Weekly Progress</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0%</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}>
          <h3>Total Check-ins</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h2>Your Goals</h2>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>No goals yet. Create your first goal to get started!</p>
            <button style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.5rem' 
            }}>
              Add Goal
            </button>
          </div>
        </div>

        <div>
          <h2>Recent Check-ins</h2>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>No check-ins yet. Complete your first goal to see progress here!</p>
          </div>
        </div>
      </div>

      {userTier === 'free' && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#fef3c7', 
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem'
        }}>
          <h3>Upgrade to Premium</h3>
          <p>Unlock unlimited goals, advanced analytics, and AI coaching insights!</p>
          <button style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#f59e0b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem' 
          }}>
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountabilityApp;
