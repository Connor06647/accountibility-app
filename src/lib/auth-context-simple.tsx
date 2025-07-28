'use client';

import React, { createContext, useContext, useState } from 'react';
import { User } from '@/types';

// Admin email - replace with your actual email
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "your-admin-email@example.com";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  userTier: 'free' | 'standard' | 'premium';
  canAccessFeature: (feature: string) => boolean;
  getFeatureLimit: (feature: string) => number | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;
  
  const userTier = user?.subscription || 'free';

  const clearError = () => setError(null);

  // Mock functions for demo mode
  const signIn = async (email: string, password: string) => {
    // Create a mock user for demo purposes
    const mockUser: User = {
      id: 'demo-user-id',
      email: email,
      name: email.split('@')[0],
      subscription: email === ADMIN_EMAIL ? 'premium' : 'free',
      createdAt: new Date(),
      preferences: {
        timezone: 'UTC',
        notificationTime: '09:00',
        coachingTone: 'balanced',
        reminderFrequency: 'daily',
        focusAreas: ['habits']
      }
    };
    
    setUser(mockUser);
    return { success: true };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    // Create a mock user for demo purposes
    const mockUser: User = {
      id: 'demo-user-id',
      email: email,
      name: displayName,
      subscription: 'free',
      createdAt: new Date(),
      preferences: {
        timezone: 'UTC',
        notificationTime: '09:00',
        coachingTone: 'balanced',
        reminderFrequency: 'daily',
        focusAreas: ['habits']
      }
    };
    
    setUser(mockUser);
    return { success: true };
  };

  const signInWithGoogle = async () => {
    const mockUser: User = {
      id: 'demo-google-user-id',
      email: 'demo.user@gmail.com',
      name: 'Demo User',
      subscription: 'free',
      createdAt: new Date(),
      preferences: {
        timezone: 'UTC',
        notificationTime: '09:00',
        coachingTone: 'balanced',
        reminderFrequency: 'daily',
        focusAreas: ['habits']
      }
    };
    
    setUser(mockUser);
    return { success: true };
  };

  const signOut = async () => {
    setUser(null);
  };

  const canAccessFeature = (feature: string): boolean => {
    switch (userTier) {
      case 'free':
        return ['basic_goals', 'simple_tracking'].includes(feature);
      case 'standard':
        return ['basic_goals', 'simple_tracking', 'analytics', 'reminders'].includes(feature);
      case 'premium':
        return true;
      default:
        return false;
    }
  };

  const getFeatureLimit = (feature: string): number | null => {
    if (userTier === 'premium') return null; // No limits

    switch (feature) {
      case 'goals':
        return userTier === 'free' ? 3 : 10;
      case 'tags':
        return userTier === 'free' ? 5 : 20;
      case 'exports':
        return userTier === 'free' ? 1 : 5;
      default:
        return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAdmin,
    userTier,
    canAccessFeature,
    getFeatureLimit,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
