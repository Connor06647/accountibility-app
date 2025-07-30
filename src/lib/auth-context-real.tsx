'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

// Admin email - replace with your actual email
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "your-admin-email@example.com";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = user?.email === ADMIN_EMAIL || firebaseUser?.email === ADMIN_EMAIL;
  
  const userTier = user?.subscription || 'free';

  const clearError = () => setError(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            let createdAt = new Date();
            
            // Handle Firestore timestamp conversion
            if (userData.createdAt) {
              if (typeof userData.createdAt === 'object' && 'toDate' in userData.createdAt) {
                // It's a Firestore timestamp
                createdAt = (userData.createdAt as any).toDate();
              } else if (userData.createdAt instanceof Date) {
                // It's already a Date
                createdAt = userData.createdAt;
              } else {
                // It's something else, try to convert
                createdAt = new Date(userData.createdAt);
              }
            }

            setUser({
              ...userData,
              id: firebaseUser.uid,
              createdAt
            });
          } else {
            // Create new user document
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || 'User',
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
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              createdAt: serverTimestamp()
            });
            
            setUser(newUser);
          }
        } catch (err) {
          console.error('Error fetching/creating user data:', err);
          setError('Failed to load user data');
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      clearError();
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      clearError();
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
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
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during sign up';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    try {
      clearError();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during Google sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
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
    if (userTier === 'premium') return -1; // Unlimited (return -1 instead of null for clarity)

    switch (feature) {
      case 'goals':
        return userTier === 'free' ? 2 : 10;
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
    firebaseUser,
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
