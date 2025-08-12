'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';
import { detectPlatform } from './platform-detection';

// Admin email - replace with your actual email
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "your-admin-email@example.com";

// Session timeout constants
const WEBSITE_IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours for website
const PWA_IDLE_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days for PWA (much longer)

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
  signUp: (email: string, password: string, displayName: string, username?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  // Session management
  clearSession: () => Promise<void>;
  getSessionAge: () => number | null;
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
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState<number | null>(null);

  // Check if current user is admin - more robust checking
  const checkIsAdmin = (email: string | null | undefined): boolean => {
    if (!email) {
      // Don't log when no email (normal during loading state)
      return false;
    }
    const adminEmail = ADMIN_EMAIL.toLowerCase().trim();
    const userEmail = email.toLowerCase().trim();
    console.log('🔐 Admin check:', { 
      userEmail: userEmail, 
      isAdmin: userEmail === adminEmail 
    });
    return userEmail === adminEmail;
  };
  
  // Calculate admin status with better logic
  const isAdmin = useMemo(() => {
    const firebaseAdmin = checkIsAdmin(firebaseUser?.email);
    const userAdmin = checkIsAdmin(user?.email);
    const result = firebaseAdmin || userAdmin;
    
    // Only log when we have users to avoid console spam
    if (firebaseUser || user) {
      console.log('🔐 Admin Status Calculation:', {
        userEmail: firebaseUser?.email || user?.email,
        isAdmin: result
      });
    }
    
    return result;
  }, [firebaseUser?.email, user?.email]);
  
  // Firebase connection test
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        console.log('🔥 Testing Firebase connection...');
        console.log('🔥 Auth instance:', {
          currentUser: auth.currentUser,
          config: auth.config
        });
        
        // Test if we can access Firestore
        const testDoc = doc(db, 'test', 'connection');
        console.log('🔥 Firestore connection test passed');
        
      } catch (error) {
        console.error('🔥 Firebase connection test failed:', error);
      }
    };
    
    testFirebaseConnection();
  }, []);

  // Debug logging for admin detection
  useEffect(() => {
    if (firebaseUser || user) {
      console.log('🔐 Admin Detection Debug:', {
        firebaseUserEmail: firebaseUser?.email,
        userEmail: user?.email,
        adminEmail: ADMIN_EMAIL,
        isAdmin,
        userTier: user?.subscription || 'free',
        firebaseUserExists: !!firebaseUser,
        userDocExists: !!user
      });
      
      // Extra logging for troubleshooting
      if (firebaseUser?.email === ADMIN_EMAIL || user?.email === ADMIN_EMAIL) {
        console.log('✅ Admin email detected! Admin status:', isAdmin);
      }
    }
  }, [firebaseUser, user, isAdmin]);
  
  const userTier = user?.subscription || 'free';

  const clearError = () => setError(null);

  // Track user activity when they log in or are active
  const updateUserActivity = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        lastSeen: serverTimestamp(),
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  };

  useEffect(() => {
    // Handle redirect results for mobile OAuth
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in via redirect
          console.log('OAuth redirect successful:', result.user.email);
        }
      } catch (error) {
        console.error('OAuth redirect error:', error);
        setError('OAuth sign-in failed. Please try again.');
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth State Changed:', {
        firebaseUser: firebaseUser ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified
        } : null,
        timestamp: new Date().toISOString()
      });
      
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log('🔐 Fetching user document for UID:', firebaseUser.uid);
          
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

            // Update user activity when they sign in
            await updateUserActivity(firebaseUser.uid);

            const finalUserData = {
              ...userData,
              id: firebaseUser.uid,
              createdAt
            };

            console.log('🔐 Setting user data from Firestore:', {
              email: finalUserData.email,
              isAdminEmail: finalUserData.email === ADMIN_EMAIL,
              adminEmailFromEnv: ADMIN_EMAIL,
              firebaseEmail: firebaseUser.email,
              bothMatch: finalUserData.email === firebaseUser.email
            });

            setUser(finalUserData);
            
            // Set session start time for tracking
            if (!sessionStartTime) {
              setSessionStartTime(Date.now());
            }
            
            // Set initial activity time for idle tracking
            if (!lastActivity) {
              setLastActivity(Date.now());
            }
          } else {
            // Create new user document
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || 'User',
              subscription: 'free',
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              subscriptionStatus: 'inactive',
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
              createdAt: serverTimestamp(),
              lastSeen: new Date(),
              lastActive: new Date(),
            });
            
            setUser(newUser);
            
            // Set session start time for new user
            if (!sessionStartTime) {
              setSessionStartTime(Date.now());
            }
            
            // Set initial activity time for new user
            if (!lastActivity) {
              setLastActivity(Date.now());
            }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // We intentionally omit sessionStartTime and lastActivity to prevent infinite re-renders

  // Idle timeout effect - auto-logout inactive users on website
  useEffect(() => {
    if (!user || !lastActivity) return;

    const platformInfo = detectPlatform();
    const isWebsite = platformInfo.isWebsite;
    
    // Only apply idle timeout to website users, not PWA users
    if (!isWebsite) return;

    const WARNING_TIME = 10 * 60 * 1000; // Show warning 10 minutes before logout
    let warningShown = false;

    const checkIdleTimeout = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilLogout = WEBSITE_IDLE_TIMEOUT - timeSinceActivity;
      
      // Show warning 10 minutes before logout
      if (timeUntilLogout <= WARNING_TIME && !warningShown) {
        warningShown = true;
        console.log('⚠️ Idle timeout warning - logging out in 10 minutes due to inactivity');
      }
      
      // Auto-logout after full timeout period
      if (timeSinceActivity > WEBSITE_IDLE_TIMEOUT) {
        console.log('🔐 User idle timeout - auto-logout after 2 hours of inactivity');
        signOut();
      }
    };

    // Check every minute for idle timeout
    const intervalId = setInterval(checkIdleTimeout, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, lastActivity]);

  // Update activity on user interactions
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Set initial activity time when user logs in
    if (!lastActivity) {
      updateActivity();
    }

    // Listen for user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [user, lastActivity]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Starting signIn process for:', email);
      clearError();
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('🔐 SignIn successful, Firebase user:', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('🔐 SignIn error:', err);
      const errorMessage = err.message || 'An error occurred during sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, displayName: string, username?: string) => {
    try {
      clearError();
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: displayName,
        username: username?.toLowerCase() || null,
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
      provider.addScope('email');
      provider.addScope('profile');
      
      // For mobile devices, use redirect. For desktop, use popup
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return { success: true };
      } else {
        await signInWithPopup(auth, provider);
        return { success: true };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during Google sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signInWithApple = async () => {
    try {
      clearError();
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      // For mobile devices, use redirect. For desktop, use popup
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return { success: true };
      } else {
        await signInWithPopup(auth, provider);
        return { success: true };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during Apple sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setSessionStartTime(null);
      setLastActivity(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Session management functions
  const clearSession = async () => {
    try {
      console.log('🧹 Clearing session for testing...');
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setSessionStartTime(null);
      setLastActivity(null);
      
      // Clear local storage
      localStorage.clear();
      
      console.log('✅ Session cleared successfully');
    } catch (err) {
      console.error('Error clearing session:', err);
    }
  };

  const getSessionAge = (): number | null => {
    if (!sessionStartTime) return null;
    return Date.now() - sessionStartTime;
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
    signInWithApple,
    signOut,
    clearError,
    clearSession,
    getSessionAge,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
