'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      try {
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // Set minimum loading time to prevent flickering
          const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800));
          
          // Get user data from Firestore with timeout
          const userDataPromise = Promise.race([
            getDoc(doc(db, 'users', firebaseUser.uid)),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Firestore timeout')), 10000)
            )
          ]) as Promise<any>;

          try {
            const [userDoc] = await Promise.all([userDataPromise, minLoadingTime]);
            
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              setUser(userData);
            } else {
              // Create default user data
              const newUser: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || 'User',
                createdAt: new Date(),
                subscription: 'free',
                lastActive: new Date(),
                hasEngaged: false,
                preferences: {
                  timezone: 'UTC',
                  notificationTime: '09:00',
                  coachingTone: 'balanced',
                  reminderFrequency: 'daily',
                  focusAreas: [],
                },
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              setUser(newUser);
            }
          } catch (error) {
            console.error('Error loading user data:', error);
            // Fallback user object to prevent app from breaking
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || 'User',
              createdAt: new Date(),
              subscription: 'free',
              lastActive: new Date(),
              hasEngaged: false,
              preferences: {
                timezone: 'UTC',
                notificationTime: '09:00',
                coachingTone: 'balanced',
                reminderFrequency: 'daily',
                focusAreas: [],
              },
            });
          }
        } else {
          setUser(null);
          // Add small delay when logging out to prevent flicker
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    });

    // Failsafe timeout - if auth takes too long, show the app anyway
    timeoutId = setTimeout(() => {
      console.warn('Authentication taking too long, showing app...');
      setLoading(false);
      setInitializing(false);
    }, 15000);

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name,
      createdAt: new Date(),
      subscription: 'free',
      lastActive: new Date(),
      hasEngaged: false, // Track if user has actually used the app
      preferences: {
        timezone: 'UTC',
        notificationTime: '09:00',
        coachingTone: 'balanced',
        reminderFrequency: 'daily',
        focusAreas: [],
      },
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    initializing,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
