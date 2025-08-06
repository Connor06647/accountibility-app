import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  userTier: 'free' | 'standard' | 'premium';
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
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

  const isAdmin = user?.email === ADMIN_EMAIL || firebaseUser?.email === ADMIN_EMAIL;
  const userTier = user?.subscription || 'free';
  const clearError = () => setError(null);

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
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser({
              ...userData,
              id: firebaseUser.uid,
              createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt)
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
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    isAdmin,
    userTier,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
