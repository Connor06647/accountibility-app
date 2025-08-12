'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-real';
import { UpgradePrompt, TierBadge } from '@/components/ui/upgrade-prompt-no-styles';
import { ThemeDialog } from '@/components/ui/theme-dialog';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToaster } from '@/components/ui/toaster';
import OnboardingFlow from '@/components/OnboardingFlow';
import SEO from '@/components/SEO';
import EmptyState from '@/components/ui/empty-state';
import { FormField, EnhancedButton } from '@/components/ui/enhanced-form';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { WebsiteOnboardingPrompt } from '@/components/ui/website-onboarding-prompt';
import { AppTour } from '@/components/AppTour';
import { collection, getDocs, query, orderBy, limit, onSnapshot, where, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePlatformDetection } from '@/lib/platform-detection';
import { shouldShowOnboarding, completeAppOnboarding, markWebsitePromptSeen } from '@/lib/onboarding-manager';

// Import Lucide React icons
import { 
  Target, 
  Calendar,
  Settings,
  BarChart3,
  Users,
  Crown,
  Plus,
  LogOut,
  Moon,
  Sun,
  CheckCircle2,
  TrendingUp,
  Activity,
  Zap,
  Star,
  Trash2,
  Save,
  Eye,
  Lock,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

const AccountabilityApp: React.FC = () => {
  const { user, loading, error, isAdmin, userTier, canAccessFeature, getFeatureLimit, signIn, signUp, signInWithGoogle, signOut, clearError, clearSession, getSessionAge } = useAuth();
  const { addToast } = useToaster();
  
  // Debug helper - expose admin test info globally for mobile testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugAuth = {
        adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        currentUserEmail: user?.email,
        firebaseUserEmail: user?.email,
        isAdmin,
        userProfile: user,
        testAdminLogin: () => {
          console.log('🔐 Admin Test Info:', {
            expectedAdminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
            currentUserEmail: user?.email,
            isAdmin,
            userTier: userTier,
            userProfile: user
          });
          addToast({
            type: 'info',
            title: 'Admin Debug Info',
            description: `Admin: ${process.env.NEXT_PUBLIC_ADMIN_EMAIL} | User: ${user?.email} | Is Admin: ${isAdmin}`
          });
        },
        forceRefreshAuth: () => {
          console.log('🔐 Force refreshing auth state...');
          window.location.reload();
        },
        checkEnvVars: () => {
          console.log('🔐 Environment Variables:', {
            adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
            hasFirebaseConfig: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            nodeEnv: process.env.NODE_ENV
          });
        },
        testFirebase: async () => {
          const { testFirebaseConnection } = await import('@/lib/admin-setup');
          const result = await testFirebaseConnection();
          console.log('🔥 Firebase test result:', result);
          addToast({
            type: result.success ? 'success' : 'error',
            title: 'Firebase Test',
            description: result.message || result.error
          });
        },
        testAdminDirectLogin: async () => {
          const { testAdminLogin } = await import('@/lib/admin-setup');
          const result = await testAdminLogin();
          console.log('🔐 Admin login test result:', result);
          addToast({
            type: result.success ? 'success' : 'error',
            title: 'Admin Login Test',
            description: result.message || result.error
          });
        },
        ensureAdminExists: async () => {
          const { ensureAdminExists } = await import('@/lib/admin-setup');
          const result = await ensureAdminExists();
          console.log('🔐 Ensure admin result:', result);
          addToast({
            type: result.success ? 'success' : 'error',
            title: result.success ? 'Admin Setup' : 'Admin Setup Failed',
            description: result.message || result.error
          });
        },
        resetAdminPassword: async () => {
          const { resetAdminPassword } = await import('@/lib/admin-setup');
          const result = await resetAdminPassword();
          console.log('🔐 Reset password result:', result);
          addToast({
            type: result.success ? 'success' : 'error',
            title: 'Password Reset',
            description: result.message || result.error
          });
        },
        testWithPassword: async (password: string) => {
          const { testAdminLoginWithPassword } = await import('@/lib/admin-setup');
          const result = await testAdminLoginWithPassword(password);
          console.log('🔐 Test with password result:', result);
          addToast({
            type: result.success ? 'success' : 'error',
            title: 'Password Test',
            description: result.message || result.error
          });
        },
        debugAdmin: async () => {
          const { debugAdminAccount } = await import('@/lib/admin-setup');
          await debugAdminAccount();
        }
      };
    }
  }, [user, isAdmin, userTier, addToast]);

  // Platform detection
  const platformInfo = usePlatformDetection();

  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'welcome' | 'login' | 'signup' | 'dashboard'>('welcome');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showWebsitePrompt, setShowWebsitePrompt] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', username: '', email: '', password: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isRunningAsPWA, setIsRunningAsPWA] = useState(false);

  // Admin-only testing features: Toast notifications and error boundary testing
  // Regular users see clean interface without development/testing UI elements

  // Goals functionality state - starts empty, loads from user's data
  const [goals, setGoals] = useState<any[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });

  // Check-ins functionality state - starts empty, loads from user's data  
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState({ rating: 5, reflection: '' });
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Admin panel state
  const [adminData, setAdminData] = useState<{
    totalUsers: number;
    activeUsers: number;
    totalGoals: number;
    totalCheckIns: number;
    systemStatus: string;
    serverLoad: string;
    recentUsers: any[];
    systemLogs: any[];
    usersByTier: { free: number; standard: number; premium: number };
    lastUpdated: Date;
  }>({
    totalUsers: 0,
    activeUsers: 0,
    totalGoals: 0,
    totalCheckIns: 0,
    systemStatus: 'online',
    serverLoad: '0%',
    recentUsers: [],
    systemLogs: [],
    usersByTier: { free: 0, standard: 0, premium: 0 },
    lastUpdated: new Date()
  });
  const [adminLoading, setAdminLoading] = useState(false);

  // Clear user data when logging out - defined early to avoid hoisting issues
  const clearUserData = () => {
    console.log('Clearing user data...');
    setGoals([]);
    setCheckIns([]);
    setTodayCheckIn({ rating: 5, reflection: '' });
    setHasCheckedInToday(false);
    setShowAddGoal(false);
    setNewGoal({ title: '', description: '' });
    // Clear login forms for security
    setLoginForm({ email: '', password: '' });
    setSignupForm({ name: '', username: '', email: '', password: '' });
    // Reset onboarding state completely
    setShowWebsitePrompt(false);
    setShowTour(false);
    setOnboardingChecked(false);
    // Reset screen to welcome (not dashboard)
    setCurrentScreen('welcome');
    setCurrentPage('dashboard');
    console.log('User data cleared - reset to welcome screen');
  };

  useEffect(() => {
    if (user) {
      // User is logged in - always start on dashboard
      setCurrentScreen('dashboard');
      setCurrentPage('dashboard');
      // Clear any lingering errors when successfully logged in
      clearError();
    } else {
      // User not logged in - always go to welcome screen
      // NEVER show onboarding without a user
      setCurrentScreen('welcome');
      setCurrentPage('dashboard'); // Set default page for when they do log in
      setShowWebsitePrompt(false); // Ensure website prompt is hidden
      setOnboardingChecked(false); // Reset onboarding check
    }
  }, [user]);

  // Platform-specific onboarding logic - ONLY for logged-in users
  useEffect(() => {
    const checkOnboardingRequirements = async () => {
      // Only check onboarding for authenticated users
      if (!user || !user.id) {
        console.log('📱 Skipping onboarding check - no authenticated user');
        return;
      }

      // Only run once per user login session
      if (onboardingChecked) {
        console.log('📱 Skipping onboarding check - already checked for this session');
        return;
      }

      try {
        const onboardingStatus = await shouldShowOnboarding(user.id);
        
        console.log('📱 Onboarding status:', {
          showWebsitePrompt: onboardingStatus.showWebsitePrompt,
          platform: onboardingStatus.platform,
          userId: user.id,
          userEmail: user.email
        });

        // All users get the same experience - just the website prompt
        if (onboardingStatus.showWebsitePrompt) {
          // Show tour prompt AFTER dashboard loads (all users)
          console.log('📱 Scheduling tour prompt in 500ms...');
          setTimeout(() => {
            console.log('📱 Showing tour prompt');
            setShowWebsitePrompt(true);
          }, 500); // Half second delay for smoother UX
        }

        setOnboardingChecked(true);
      } catch (error) {
        console.error('Error checking onboarding requirements:', error);
        setOnboardingChecked(true);
      }
    };

    checkOnboardingRequirements();
  }, [user, platformInfo, onboardingChecked]);

  // PWA Install prompt handler
  useEffect(() => {
    // Check if running as PWA
    const checkPWAMode = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isPWAMode = isStandalone || isInWebAppiOS;
      
      setIsRunningAsPWA(isPWAMode);
      
      if (isPWAMode) {
        console.log('🎉 Running as installed PWA');
      } else {
        console.log('🌐 Running in browser mode');
      }
      
      return isPWAMode;
    };

    // Check per-user install state
    const checkUserInstallState = () => {
      if (!user?.id) return false;
      
      const userInstallKey = `pwa-installed-${user.id}`;
      const userAttemptKey = `pwa-attempt-${user.id}`;
      
      const isInstalled = localStorage.getItem(userInstallKey) === 'true';
      const hasAttempted = localStorage.getItem(userAttemptKey) === 'true';
      
      setIsPWAInstalled(isInstalled);
      
      return { isInstalled, hasAttempted };
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('✅ PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAInstall(true);
      
      // Only show toast if user hasn't been informed yet
      if (user?.id) {
        const userState = checkUserInstallState();
        if (typeof userState !== 'boolean' && !userState.hasAttempted) {
          addToast({
            description: 'You can now install the app for a better experience!',
            type: 'success',
            duration: 5000
          });
        }
      }
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setDeferredPrompt(null);
      setIsPWAInstalled(true);
      
      // Save install state for this user
      if (user?.id) {
        const userInstallKey = `pwa-installed-${user.id}`;
        const userAttemptKey = `pwa-attempt-${user.id}`;
        localStorage.setItem(userInstallKey, 'true');
        localStorage.setItem(userAttemptKey, 'true');
      }
      
      addToast({
        description: 'App installed successfully! You can now access it from your apps.',
        type: 'success'
      });
    };

    // Initialize PWA state
    checkPWAMode();
    if (user?.id) {
      checkUserInstallState();
    }
    setShowPWAInstall(true); // Always show install button for better UX

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [addToast, user?.id]);

  // Clear errors when switching screens
  useEffect(() => {
    clearError();
  }, [currentScreen]);

  // Onboarding handlers
  const handleOnboardingComplete = async () => {
    if (user) {
      // Mark app onboarding as completed for logged-in users
      await completeAppOnboarding(user.id);
      setCurrentScreen('dashboard');
    } else {
      // User completed onboarding but not logged in - go to signup
      setCurrentScreen('signup');
    }
  };

  const handleOnboardingSkip = async () => {
    if (user) {
      // Even if skipped, mark as completed so it doesn't show again
      await completeAppOnboarding(user.id);
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('welcome');
    }
  };

  // Website onboarding prompt handlers
  const handleWebsitePromptStartTour = async () => {
    setShowWebsitePrompt(false);
    if (user) {
      await markWebsitePromptSeen(user.id);
    }
    // Start the interactive tour instead of old onboarding
    setShowTour(true);
  };

  const handleWebsitePromptSkipTour = async () => {
    setShowWebsitePrompt(false);
    if (user) {
      await markWebsitePromptSeen(user.id);
    }
  };

  const handleWebsitePromptClose = async () => {
    setShowWebsitePrompt(false);
    if (user) {
      await markWebsitePromptSeen(user.id);
    }
  };

  // Tour handlers
  const handleTourComplete = () => {
    setShowTour(false);
    // Tour completed successfully
    console.log('🎯 App tour completed!');
  };

  const handleTourClose = () => {
    setShowTour(false);
    console.log('🎯 App tour closed');
  };

  // Manual tour start (from settings)
  const startTour = () => {
    setShowTour(true);
  };

  // PWA Install handler
  const handleInstallPWA = async () => {
    if (!user?.id) {
      addToast({
        description: 'Please log in to install the app',
        type: 'error'
      });
      return;
    }

    // Check if already running as PWA
    if (isRunningAsPWA) {
      return; // No action needed - they're already using the app
    }

    // Check if user has already installed (per-user tracking)
    if (isPWAInstalled) {
      return; // No toast needed - button already shows "App Installed ✓"
    }

    // Mark that user has attempted install (for better UX on subsequent visits)
    const userAttemptKey = `pwa-attempt-${user.id}`;
    localStorage.setItem(userAttemptKey, 'true');
    if (deferredPrompt) {
      try {
        addToast({
          description: 'Opening install dialog...',
          type: 'info',
          duration: 2000
        });
        const result = await deferredPrompt.prompt();
        console.log('PWA install result:', result);
        
        setDeferredPrompt(null);
        
        if (result.outcome === 'accepted') {
          // Save install state for this user
          const userInstallKey = `pwa-installed-${user.id}`;
          localStorage.setItem(userInstallKey, 'true');
          setIsPWAInstalled(true);
          
          addToast({
            description: '🎉 App installation started! Look for it in your apps shortly.',
            type: 'success',
            duration: 6000
          });
        } else if (result.outcome === 'dismissed') {
          addToast({
            description: 'Installation cancelled. You can install later using your browser menu.',
            type: 'info',
            duration: 4000
          });
        }
      } catch (error) {
        console.error('PWA install error:', error);
        addToast({
          description: 'Installation dialog failed. Try using your browser menu: ⋮ → "Install app"',
          type: 'error',
          duration: 6000
        });
      }
    } else {
      // No prompt available - provide helpful instructions
      addToast({
        description: '🔧 To install: Look for an install icon (⊕) in your address bar, or use your browser menu: ⋮ → "Install Accountability on Autopilot"',
        type: 'info',
        duration: 8000
      });
    }
  };

  // Real-time admin data fetching
  useEffect(() => {
    if (isAdmin && currentPage === 'admin') {
      // Add some initial system logs
      addSystemLog('Admin panel accessed', 'admin');
      addSystemLog('System monitoring started', 'info');
      
      // Update current user's activity timestamp
      if (user?.id) {
        updateDoc(doc(db, 'users', user.id), {
          lastSeen: new Date(),
          lastActive: new Date()
        }).catch(error => {
          console.error('Error updating user activity:', error);
        });
      }
      
      fetchAdminData();
      
      // Set up real-time listeners for admin data
      const unsubscribers: (() => void)[] = [];

      // Listen to users collection
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Only count users who have actually engaged with the app
        const engagedUsers = users.filter((user: any) => user.hasEngaged === true);
        
        // Sort engaged users by creation date (most recent first)
        const sortedEngagedUsers = engagedUsers.sort((a: any, b: any) => {
          const aDate = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bDate = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });
        
        const activeToday = engagedUsers.filter((user: any) => {
          const lastSeen = user.lastSeen?.toDate?.() || user.lastActive?.toDate?.();
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          return lastSeen && lastSeen >= todayStart;
        }).length;
        
        updateAdminData({ 
          totalUsers: engagedUsers.length, // Only count engaged users
          recentUsers: sortedEngagedUsers.slice(0, 10), // Show recent engaged users for consistency
          usersByTier: countUsersByTier(engagedUsers), // Only count engaged users by tier
          activeUsers: activeToday,
          lastUpdated: new Date()
        });
        addSystemLog(`Users data updated: ${engagedUsers.length} engaged users, ${activeToday} active today`, 'info');
      }, (error) => {
        console.error('Error listening to users:', error);
        addSystemLog(`Error fetching users: ${error.message}`, 'error');
      });
      unsubscribers.push(unsubscribeUsers);

      // Listen to goals collection for total count
      const goalsQuery = collection(db, 'goals');
      const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
        updateAdminData({ 
          totalGoals: snapshot.size,
          lastUpdated: new Date()
        });
        addSystemLog(`Goals data updated: ${snapshot.size} total goals`, 'info');
      }, (error) => {
        console.error('Error listening to goals:', error);
        addSystemLog(`Error fetching goals: ${error.message}`, 'error');
      });
      unsubscribers.push(unsubscribeGoals);

      // Listen to check-ins collection for total count
      const checkInsQuery = collection(db, 'checkIns');
      const unsubscribeCheckIns = onSnapshot(checkInsQuery, (snapshot) => {
        updateAdminData({ 
          totalCheckIns: snapshot.size,
          lastUpdated: new Date()
        });
        addSystemLog(`Check-ins data updated: ${snapshot.size} total check-ins`, 'info');
      }, (error) => {
        console.error('Error listening to check-ins:', error);
        addSystemLog(`Error fetching check-ins: ${error.message}`, 'error');
      });
      unsubscribers.push(unsubscribeCheckIns);

      // Update system metrics every 30 seconds
      const systemMetricsInterval = setInterval(() => {
        updateSystemMetrics();
      }, 30000);

      return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe());
        clearInterval(systemMetricsInterval);
      };
    }
  }, [isAdmin, currentPage]);

  // Load user-specific data when user logs in
  useEffect(() => {
    console.log('User effect triggered:', user ? `${user.email} (${user.id})` : 'null');
    console.log('Current state - Goals:', goals.length, 'Check-ins:', checkIns.length);
    
    if (user) {
      console.log('User logged in, loading data...');
      loadUserData();
    } else {
      console.log('No user, clearing data...');
      clearUserData();
    }
  }, [user]);

  // Clear data when user logs out
  useEffect(() => {
    if (!user) {
      console.log('User logged out, clearing data...');
      clearUserData();
    }
  }, [user]);

  // Dashboard statistics calculations
  const calculateWeeklyChange = (currentWeekData: any[], previousWeekData: any[]) => {
    const currentCount = currentWeekData.length;
    const previousCount = previousWeekData.length;
    
    console.log('🔢 Calculating change:', {
      currentCount,
      previousCount
    });
    
    // No previous data to compare against
    if (previousCount === 0) {
      if (currentCount === 0) {
        return undefined; // No change to show
      }
      return { value: 100, type: 'increase' as const }; // New data is 100% increase
    }
    
    // Calculate percentage change
    const percentChange = Math.round(((currentCount - previousCount) / previousCount) * 100);
    
    console.log('📈 Percent change calculated:', percentChange);
    
    if (percentChange === 0) {
      return { value: 0, type: 'neutral' as const };
    }
    
    return {
      value: Math.abs(percentChange),
      type: percentChange > 0 ? 'increase' as const : 'decrease' as const
    };
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Debug logging (reduced for production)
    // console.log('📊 Weekly Stats Debug:', {
    //   now: now.toISOString(),
    //   oneWeekAgo: oneWeekAgo.toISOString(),
    //   twoWeeksAgo: twoWeeksAgo.toISOString(),
    //   totalGoals: goals.length,
    //   totalCheckIns: checkIns.length
    // });

    // Goals created this week vs last week
    const currentWeekGoals = goals.filter(goal => {
      if (!goal.createdAt) {
        console.log('⚠️ Goal missing createdAt:', goal.title);
        return false;
      }
      const createdAt = goal.createdAt?.toDate ? goal.createdAt.toDate() : new Date(goal.createdAt);
      return createdAt >= oneWeekAgo;
    });
    
    const previousWeekGoals = goals.filter(goal => {
      if (!goal.createdAt) return false;
      const createdAt = goal.createdAt?.toDate ? goal.createdAt.toDate() : new Date(goal.createdAt);
      return createdAt >= twoWeeksAgo && createdAt < oneWeekAgo;
    });

    // Check-ins this week vs last week
    const currentWeekCheckIns = checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.date);
      return checkInDate >= oneWeekAgo;
    });
    
    const previousWeekCheckIns = checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.date);
      return checkInDate >= twoWeeksAgo && checkInDate < oneWeekAgo;
    });

    console.log('📊 Weekly Comparison:', {
      currentWeekGoals: currentWeekGoals.length,
      previousWeekGoals: previousWeekGoals.length,
      currentWeekCheckIns: currentWeekCheckIns.length,
      previousWeekCheckIns: previousWeekCheckIns.length
    });

    // Calculate current streak
    const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    
    if (sortedCheckIns.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const latestCheckIn = sortedCheckIns[0];
      
      // Check if latest check-in is today or yesterday (consecutive days)
      if (latestCheckIn.date === today) {
        currentStreak = 1;
        
        // Count consecutive days backwards
        for (let i = 1; i < sortedCheckIns.length; i++) {
          const currentDate = new Date(sortedCheckIns[i].date);
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - i);
          
          if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        // Check if latest check-in was yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (latestCheckIn.date === yesterday.toISOString().split('T')[0]) {
          currentStreak = 1;
          
          // Count consecutive days backwards from yesterday
          for (let i = 1; i < sortedCheckIns.length; i++) {
            const currentDate = new Date(sortedCheckIns[i].date);
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - (i + 1));
            
            if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }
    }

    const goalsChange = calculateWeeklyChange(currentWeekGoals, previousWeekGoals);
    const checkInsChange = calculateWeeklyChange(currentWeekCheckIns, previousWeekCheckIns);

    // Debug logging (reduced for production)
    // console.log('📊 Final Stats:', {
    //   goalsChange,
    //   checkInsChange,
    //   currentStreak
    // });

    return {
      goalsChange,
      checkInsChange,
      currentStreak
    };
  };

  // Test data generator for statistics (admin only)
  const generateTestData = async () => {
    if (!isAdmin) {
      addToast({
        type: 'error',
        title: 'Access denied',
        description: 'Only admins can generate test data.'
      });
      return;
    }

    try {
      const testGoals = [];
      const testCheckIns = [];
      
      // Generate goals from last 2 weeks with varying dates
      const baseDate = new Date();
      for (let i = 0; i < 10; i++) {
        const randomDays = Math.floor(Math.random() * 14); // Last 14 days
        const goalDate = new Date(baseDate.getTime() - (randomDays * 24 * 60 * 60 * 1000));
        
        const goal = {
          id: `test-goal-${i}`,
          title: `Test Goal ${i + 1}`,
          description: `Sample goal for testing statistics`,
          userId: user?.id,
          completed: Math.random() > 0.7,
          createdAt: goalDate,
          deadline: new Date(goalDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        };
        
        testGoals.push(goal);
        await addDoc(collection(db, 'goals'), goal);
      }

      // Generate check-ins from last 2 weeks
      for (let i = 0; i < 12; i++) {
        const randomDays = Math.floor(Math.random() * 14); // Last 14 days
        const checkInDate = new Date(baseDate.getTime() - (randomDays * 24 * 60 * 60 * 1000));
        
        const checkIn = {
          id: `test-checkin-${i}`,
          date: checkInDate.toISOString().split('T')[0],
          rating: Math.floor(Math.random() * 5) + 1,
          notes: `Test check-in ${i + 1}`,
          userId: user?.id,
          mood: ['great', 'good', 'okay', 'poor'][Math.floor(Math.random() * 4)]
        };
        
        testCheckIns.push(checkIn);
        await addDoc(collection(db, 'checkins'), checkIn);
      }

      addToast({
        type: 'success',
        title: 'Test data generated!',
        description: `Created ${testGoals.length} test goals and ${testCheckIns.length} test check-ins with historical dates.`
      });
      
      // Reload user data to see the changes
      await loadUserData();
      
      console.log('✅ Test data generated:', {
        goals: testGoals.length,
        checkIns: testCheckIns.length
      });
      
    } catch (error) {
      console.error('Error generating test data:', error);
      addToast({
        type: 'error',
        title: 'Failed to generate test data',
        description: 'An error occurred while creating sample data.'
      });
    }
  };

  // Helper functions for admin data
  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      await Promise.all([
        fetchTotalUsers(),
        fetchTotalGoals(),
        fetchTotalCheckIns(),
        updateSystemMetrics()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchTotalUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for engaged users only for consistency
      const engagedUsers = users.filter((user: any) => user.hasEngaged === true);
      
      // Sort engaged users by creation date (most recent first)
      const sortedUsers = engagedUsers.sort((a: any, b: any) => {
        const aDate = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const bDate = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
      
      updateAdminData({
        totalUsers: engagedUsers.length, // Only count engaged users
        recentUsers: sortedUsers.slice(0, 10), // Get 10 most recent engaged users
        usersByTier: countUsersByTier(engagedUsers), // Only count engaged users by tier
        activeUsers: engagedUsers.filter((user: any) => {
          const lastSeen = user.lastSeen?.toDate?.() || user.lastActive?.toDate?.();
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          return lastSeen && lastSeen >= todayStart;
        }).length
      });
      
      console.log('👥 User Stats Debug:', {
        totalUsersAll: usersSnapshot.size,
        totalUsersEngaged: engagedUsers.length,
        recentUsersCount: sortedUsers.slice(0, 10).length,
        activeUsersToday: engagedUsers.filter((user: any) => {
          const lastSeen = user.lastSeen?.toDate?.() || user.lastActive?.toDate?.();
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          return lastSeen && lastSeen >= todayStart;
        }).length
      });
      
      if (usersSnapshot.size === 0) {
        // Add some mock data for demonstration when no real users exist
        const now = new Date();
        const mockUsers = [
          { 
            id: 'demo1', 
            name: 'Current User (You)', 
            email: user?.email || 'current@example.com', 
            tier: userTier,
            createdAt: { toDate: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            lastSeen: { toDate: () => now },
            lastActive: { toDate: () => now }
          },
          { 
            id: 'demo2', 
            name: 'Demo User 2', 
            email: 'demo2@example.com', 
            tier: 'standard',
            createdAt: { toDate: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            lastSeen: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) }
          }
        ];
        
        // Count active users for today (only current user should be active)
        const activeToday = mockUsers.filter((mockUser: any) => {
          const lastSeen = mockUser.lastSeen?.toDate?.() || mockUser.lastActive?.toDate?.();
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          return lastSeen && lastSeen >= todayStart;
        }).length;
        
        updateAdminData({
          totalUsers: mockUsers.length,
          recentUsers: mockUsers,
          usersByTier: countUsersByTier(mockUsers),
          activeUsers: activeToday // This should be 1 (just the current user)
        });
        
        addSystemLog(`No real users found - showing demo data (${activeToday} active today)`, 'info');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      addSystemLog(`Error fetching users: ${error}`, 'error');
    }
  };

  const fetchTotalGoals = async () => {
    try {
      const goalsSnapshot = await getDocs(collection(db, 'goals'));
      updateAdminData({ totalGoals: goalsSnapshot.size });
      
      if (goalsSnapshot.size === 0) {
        // Show mock data for demonstration
        updateAdminData({ totalGoals: 15 });
        addSystemLog('No real goals found - showing demo count', 'info');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      addSystemLog(`Error fetching goals: ${error}`, 'error');
    }
  };

  const fetchTotalCheckIns = async () => {
    try {
      const checkInsSnapshot = await getDocs(collection(db, 'checkIns'));
      updateAdminData({ totalCheckIns: checkInsSnapshot.size });
      
      if (checkInsSnapshot.size === 0) {
        // Show mock data for demonstration
        updateAdminData({ totalCheckIns: 42 });
        addSystemLog('No real check-ins found - showing demo count', 'info');
      }
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      addSystemLog(`Error fetching check-ins: ${error}`, 'error');
    }
  };

  const updateSystemMetrics = () => {
    // Simulate server metrics (in a real app, these would come from your backend)
    const cpuUsage = Math.floor(Math.random() * 40) + 20; // 20-60%
    const memoryUsage = Math.floor(Math.random() * 30) + 40; // 40-70%
    const serverLoad = Math.max(cpuUsage, memoryUsage);
    
    updateAdminData({
      serverLoad: `${serverLoad}%`,
      systemStatus: serverLoad > 80 ? 'warning' : 'online',
      lastUpdated: new Date()
    });
  };

  const countUsersByTier = (users: any[]) => {
    return users.reduce((counts: any, user: any) => {
      const tier = user.tier || 'free';
      counts[tier] = (counts[tier] || 0) + 1;
      return counts;
    }, { free: 0, standard: 0, premium: 0 });
  };

  const updateAdminData = (newData: any) => {
    setAdminData(prev => ({ ...prev, ...newData }));
  };

  // Admin actions
  const handleUserTierChange = async (userId: string, newTier: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { tier: newTier });
      // Update local state
      setAdminData(prev => ({
        ...prev,
        recentUsers: prev.recentUsers.map((user: any) => 
          user.id === userId ? { ...user, tier: newTier } : user
        )
      }));
      addSystemLog(`Updated user ${userId} tier to ${newTier}`, 'admin');
    } catch (error) {
      console.error('Error updating user tier:', error);
      addSystemLog(`Failed to update user ${userId} tier: ${error}`, 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone and will permanently remove their Firebase Authentication account and all associated data.')) {
      try {
        // Use the complete API endpoint with Firebase Admin SDK
        const response = await fetch('/api/admin/delete-user', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            adminUserId: user?.id
          }),
        });

        const result = await response.json();

        if (response.ok) {
          // Update local state
          setAdminData(prev => ({
            ...prev,
            recentUsers: prev.recentUsers.filter((user: any) => user.id !== userId),
            totalUsers: prev.totalUsers - 1
          }));
          
          addToast({
            type: 'success',
            title: 'User completely deleted',
            description: 'User and all associated data have been permanently removed from both Firebase Auth and database.'
          });
          
          addSystemLog(`Deleted user ${userId} data from Firestore`, 'admin');
        } else {
          throw new Error(result.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        addSystemLog(`Failed to delete user ${userId}: ${error}`, 'error');
        addToast({
          type: 'error',
          title: 'Failed to delete user',
          description: `Unable to delete the user. ${error instanceof Error ? error.message : 'Please try again.'}`
        });
      }
    }
  };

  const addSystemLog = (message: string, type = 'info') => {
    const log = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      user: user?.email || 'System'
    };
    
    setAdminData(prev => ({
      ...prev,
      systemLogs: [log, ...prev.systemLogs.slice(0, 49)] // Keep last 50 logs
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    // Clear any previous errors
    clearError();
    
    // Validate form data before making Firebase call
    if (!loginForm.email || !loginForm.password) {
      addToast({
        type: 'error',
        title: 'Missing information',
        description: 'Please enter both email and password to sign in.'
      });
      setSubmitLoading(false);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      addToast({
        type: 'error',
        title: 'Invalid email',
        description: 'Please enter a valid email address.'
      });
      setSubmitLoading(false);
      return;
    }
    
    try {
      console.log('🔐 Attempting login with:', loginForm.email);
      const result = await signIn(loginForm.email, loginForm.password);
      
      console.log('🔐 Login result:', result);
      
      if (result.success) {
        // Success - clear forms and show success message
        setLoginForm({ email: '', password: '' });
        addToast({
          type: 'success',
          title: 'Welcome back!',
          description: 'You have successfully signed in to your account.'
        });
        // Navigation will be handled by the useEffect when user state updates
      } else {
        // Handle Firebase auth errors
        const errorMessage = result.error || 'Sign in failed';
        let title = 'Sign in failed';
        let description = 'Please check your credentials and try again.';
        
        console.log('🔐 Login failed with error:', errorMessage);
        
        // Parse Firebase error codes
        if (errorMessage.includes('auth/user-not-found') || 
            errorMessage.includes('auth/invalid-email') ||
            errorMessage.includes('auth/invalid-credential')) {
          title = 'Account not found';
          description = 'No account exists with this email. Please check your email or create an account.';
        } else if (errorMessage.includes('auth/wrong-password') || 
                   errorMessage.includes('auth/invalid-password')) {
          title = 'Incorrect password';
          description = 'The password you entered is incorrect. Please try again.';
        } else if (errorMessage.includes('auth/too-many-requests')) {
          title = 'Too many attempts';
          description = 'Too many failed login attempts. Please wait a few minutes before trying again.';
        } else if (errorMessage.includes('auth/user-disabled')) {
          title = 'Account disabled';
          description = 'This account has been disabled. Please contact support.';
        } else if (errorMessage.includes('auth/network-request-failed')) {
          title = 'Connection error';
          description = 'Unable to connect to the authentication service. Please check your internet connection.';
        }
        
        addToast({
          type: 'error',
          title,
          description
        });
      }
    } catch (error: any) {
      console.error('🔐 Login error:', error);
      
      // Fallback error handling for unexpected errors
      addToast({
        type: 'error',
        title: 'Login failed',
        description: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    // Clear any previous errors
    clearError();
    
    // Validate form data before making Firebase call
    if (!signupForm.name || !signupForm.username || !signupForm.email || !signupForm.password) {
      addToast({
        type: 'error',
        title: 'Missing information',
        description: 'Please fill in all required fields to create your account.'
      });
      setSubmitLoading(false);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupForm.email)) {
      addToast({
        type: 'error',
        title: 'Invalid email',
        description: 'Please enter a valid email address.'
      });
      setSubmitLoading(false);
      return;
    }
    
    // Password strength validation
    if (signupForm.password.length < 6) {
      addToast({
        type: 'error',
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.'
      });
      setSubmitLoading(false);
      return;
    }
    
    // Username validation
    if (signupForm.username.length < 3) {
      addToast({
        type: 'error',
        title: 'Username too short',
        description: 'Username must be at least 3 characters long.'
      });
      setSubmitLoading(false);
      return;
    }
    
    try {
      console.log('🔐 Attempting signup with:', signupForm.email);
      
      // Check if username is already taken
      const usernameQuery = query(collection(db, 'users'), where('username', '==', signupForm.username.toLowerCase()));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        addToast({
          type: 'error',
          title: 'Username already taken',
          description: 'Please choose a different username.'
        });
        setSubmitLoading(false);
        return;
      }
      
      const result = await signUp(signupForm.email, signupForm.password, signupForm.name, signupForm.username);
      
      console.log('🔐 Signup result:', result);
      
      // Success - clear forms and show success message
      setSignupForm({ name: '', username: '', email: '', password: '' });
      addToast({
        type: 'success',
        title: 'Account created!',
        description: 'Welcome to Accountability On Autopilot! Your journey starts now.'
      });
      // Navigation will be handled by the useEffect when user state updates
    } catch (error: any) {
      console.error('🔐 Signup error:', error);
      
      let title = 'Account creation failed';
      let description = 'Please try again or use a different email address.';
      
      if (error.message?.includes('auth/email-already-in-use')) {
        title = 'Email already in use';
        description = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('auth/weak-password')) {
        title = 'Password too weak';
        description = 'Please choose a stronger password with at least 6 characters.';
      } else if (error.message?.includes('auth/network-request-failed')) {
        title = 'Connection error';
        description = 'Unable to connect to the authentication service. Please check your internet connection.';
      }
      
      addToast({
        type: 'error',
        title,
        description: error.message || description
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitLoading(true);
    
    // Clear any previous errors
    clearError();
    
    try {
      console.log('🔐 Attempting Google sign-in...');
      const result = await signInWithGoogle();
      
      console.log('🔐 Google sign-in result:', result);
      
      if (result.success) {
        // Mark that user has created/used an account (for first time Google users)
        localStorage.setItem('hasCreatedAccount', 'true');
        
        addToast({
          type: 'success',
          title: 'Welcome!',
          description: 'Successfully signed in with Google.'
        });
      } else {
        throw new Error(result.error || 'Google sign-in failed');
      }
    } catch (error: any) {
      console.error('🔐 Google sign-in error:', error);
      
      let title = 'Google sign-in failed';
      let description = 'Please try again or use email/password sign-in.';
      
      if (error.message?.includes('popup-closed-by-user')) {
        title = 'Sign-in cancelled';
        description = 'You cancelled the Google sign-in process.';
      } else if (error.message?.includes('network-request-failed')) {
        title = 'Connection error';
        description = 'Unable to connect to Google. Please check your internet connection.';
      } else if (error.message?.includes('auth/unauthorized-domain') || window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        title = 'Google Sign-In Not Available';
        description = 'Google sign-in is not available when accessing via IP address. Please use email/password login for mobile testing or access via localhost on desktop.';
      } else if (error.message?.includes('auth/popup-blocked')) {
        title = 'Popup blocked';
        description = 'Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.';
      }
      
      addToast({
        type: 'error',
        title,
        description
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Subscription management functions
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const handleSubscriptionChange = async (newTier: 'free' | 'standard' | 'premium') => {
    if (subscriptionLoading || newTier === userTier) return;
    
    setSubscriptionLoading(true);
    
    try {
      if (newTier === 'free') {
        // Handle downgrade/cancellation
        await handleCancelSubscription();
        return;
      }

      // For upgrades to paid plans, redirect to Stripe Checkout
      const priceId = newTier === 'standard' 
        ? process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID;

      if (!priceId) {
        addToast({
          type: 'error',
          title: 'Payment system unavailable',
          description: 'Payment system is not configured. Please contact support.'
        });
        return;
      }

      addToast({
        type: 'info',
        title: 'Redirecting to payment...',
        description: 'You will be redirected to complete your subscription upgrade.'
      });

      // Import Stripe dynamically to avoid SSR issues
      const { createCheckoutSession } = await import('@/lib/stripe');
      
      await createCheckoutSession(priceId, user?.id || '', user?.email || '');
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      addToast({
        type: 'error',
        title: 'Subscription update failed',
        description: 'Failed to process payment. Please try again.'
      });
      addSystemLog(`Failed to update subscription: ${error}`, 'error');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (userTier === 'free') return;
    
    const confirmed = window.confirm(
      `Cancel your ${userTier} subscription?\n\nYou'll retain access until the end of your billing period.\n\nYou can manage your subscription and billing in the customer portal.`
    );
    
    if (!confirmed) return;
    
    setSubscriptionLoading(true);
    
    try {
      // Redirect to Stripe Customer Portal for subscription management
      if (user?.stripeCustomerId) {
        const { createCustomerPortalSession } = await import('@/lib/stripe');
        await createCustomerPortalSession(user.stripeCustomerId);
        addToast({
          type: 'info',
          title: 'Redirecting to subscription portal',
          description: 'You will be redirected to manage your subscription and billing.'
        });
      } else {
        addToast({
          type: 'error',
          title: 'No active subscription found',
          description: 'Please contact support if you believe this is an error.'
        });
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      addToast({
        type: 'error',
        title: 'Unable to access subscription portal',
        description: 'Please contact support for assistance with your subscription.'
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSaveSettings = async (name: string) => {
    if (!user || !name.trim()) {
      addToast({
        type: 'error',
        title: 'Invalid input',
        description: 'Please enter a valid name.'
      });
      return;
    }
    
    try {
      await updateDoc(doc(db, 'users', user.id), {
        name: name.trim(),
        updatedAt: new Date()
      });
      
      addToast({
        type: 'success',
        title: 'Settings saved',
        description: 'Your profile has been updated successfully.'
      });
      addSystemLog(`User ${user.email} updated their profile name`, 'info');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast({
        type: 'error',
        title: 'Failed to save settings',
        description: 'Unable to update your profile. Please try again.'
      });
      addSystemLog(`Failed to save settings: ${error}`, 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      clearUserData(); // Clear user data before signing out
      await signOut();
      setCurrentScreen('welcome');
      addToast({
        type: 'success',
        title: 'Signed out successfully',
        description: 'You have been signed out of your account.'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      addToast({
        type: 'error',
        title: 'Sign out failed',
        description: 'There was an error signing you out. Please try again.'
      });
    }
  };

  const handlePaymentMethodUpdate = async () => {
    try {
      if (user?.stripeCustomerId) {
        const { createCustomerPortalSession } = await import('@/lib/stripe');
        await createCustomerPortalSession(user.stripeCustomerId);
        addToast({
          type: 'info',
          title: 'Redirecting to payment portal',
          description: 'You will be redirected to update your payment method.'
        });
      } else {
        addToast({
          type: 'warning',
          title: 'No payment method found',
          description: 'Please subscribe to a plan first to manage payment methods.'
        });
      }
    } catch (error) {
      console.error('Error accessing payment management:', error);
      addToast({
        type: 'error',
        title: 'Unable to access payment portal',
        description: 'Please contact support for assistance with payment management.'
      });
    }
  };

  const handleDownloadInvoices = async () => {
    try {
      if (user?.stripeCustomerId) {
        const { createCustomerPortalSession } = await import('@/lib/stripe');
        await createCustomerPortalSession(user.stripeCustomerId);
        addToast({
          type: 'info',
          title: 'Redirecting to billing portal',
          description: 'You will be redirected to view and download your invoices.'
        });
      } else {
        addToast({
          type: 'warning',
          title: 'No billing history found',
          description: 'Please subscribe to a plan first to access billing history.'
        });
      }
    } catch (error) {
      console.error('Error accessing billing history:', error);
      addToast({
        type: 'error',
        title: 'Unable to access billing portal',
        description: 'Please contact support for assistance with billing history.'
      });
    }
  };

  const handlePauseSubscription = async () => {
    try {
      if (user?.stripeCustomerId) {
        const { createCustomerPortalSession } = await import('@/lib/stripe');
        await createCustomerPortalSession(user.stripeCustomerId);
        addToast({
          type: 'info',
          title: 'Redirecting to subscription portal',
          description: 'You will be redirected to pause or manage your subscription.'
        });
      } else {
        addToast({
          type: 'warning',
          title: 'No active subscription found',
          description: 'Please subscribe to a plan first to manage your subscription.'
        });
      }
    } catch (error) {
      console.error('Error accessing subscription management:', error);
      addToast({
        type: 'error',
        title: 'Unable to access subscription portal',
        description: 'Please contact support for assistance with subscription management.'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-sm mx-4">
          {/* Brand Logo Container */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex items-center justify-center mx-auto relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 animate-pulse"></div>
              <div className="relative z-10">
                <LoadingSpinner size="lg" className="text-blue-600" />
              </div>
            </div>
            {/* Pulse ring animation */}
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-blue-500/20 animate-ping"></div>
          </div>
          
          {/* Brand Text */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              Accountability On Autopilot
            </h1>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              AI-Powered Discipline Coach
            </p>
          </div>
          
          {/* Loading Message */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Setting up your dashboard
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preparing your personalized experience...
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
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
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to continue your accountability journey</p>
          </div>
          
          {/* Mobile testing notification */}
          {window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    <strong>Mobile Testing Mode:</strong> Google Sign-In is disabled when accessing via IP address. Use email/password login for testing on mobile.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4 flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <FormField
              label="Email Address"
              type="email"
              value={loginForm.email}
              onChange={(value) => setLoginForm({ ...loginForm, email: value })}
              placeholder="Enter your email"
              required
              validation={{
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              }}
            />
            
            <FormField
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(value) => setLoginForm({ ...loginForm, password: value })}
              placeholder="Enter your password"
              required
              validation={{
                minLength: 6
              }}
            />
            
            <EnhancedButton
              type="submit"
              loading={submitLoading}
              disabled={submitLoading}
              variant="primary"
              fullWidth
              icon={<Lock size={18} />}
            >
              {submitLoading ? 'Signing In...' : 'Sign In'}
            </EnhancedButton>
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
            <div className="mt-3 space-y-2">
              <button
                onClick={handleGoogleSignIn}
                disabled={submitLoading}
                className="w-full px-6 py-3 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 text-gray-900 dark:text-white bg-white dark:bg-gray-800 flex items-center justify-center gap-2 hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
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
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Get Started</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create your account to begin your accountability journey</p>
          </div>
          
          {/* Mobile testing notification */}
          {window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    <strong>Mobile Testing Mode:</strong> Google Sign-In is disabled when accessing via IP address. Use email/password registration for testing on mobile.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4 flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <FormField
              label="Full Name"
              type="text"
              value={signupForm.name}
              onChange={(value) => setSignupForm({ ...signupForm, name: value })}
              placeholder="Enter your full name"
              required
              validation={{
                minLength: 2,
                maxLength: 50
              }}
            />
            
            <FormField
              label="Username"
              type="text"
              value={signupForm.username}
              onChange={(value) => setSignupForm({ ...signupForm, username: value })}
              placeholder="Choose a unique username"
              required
              validation={{
                minLength: 3,
                maxLength: 20,
                pattern: /^[a-zA-Z0-9_]+$/,
                customValidator: (value) => {
                  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    return 'Username can only contain letters, numbers, and underscores';
                  }
                  return null;
                }
              }}
            />
            
            <FormField
              label="Email Address"
              type="email"
              value={signupForm.email}
              onChange={(value) => setSignupForm({ ...signupForm, email: value })}
              placeholder="Enter your email"
              required
              validation={{
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              }}
            />
            
            <FormField
              label="Password"
              type="password"
              value={signupForm.password}
              onChange={(value) => setSignupForm({ ...signupForm, password: value })}
              placeholder="Create a strong password"
              required
              validation={{
                minLength: 6,
                customValidator: (value) => {
                  if (value.length < 6) return 'Password must be at least 6 characters';
                  if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
                  if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
                  if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
                  return null;
                }
              }}
            />
            
            <EnhancedButton
              type="submit"
              loading={submitLoading}
              disabled={submitLoading}
              variant="primary"
              fullWidth
              icon={<Star size={18} />}
            >
              {submitLoading ? 'Creating Account...' : 'Create Account'}
            </EnhancedButton>
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
            <div className="mt-3 space-y-2">
              <button
                onClick={handleGoogleSignIn}
                disabled={submitLoading}
                className="w-full px-6 py-3 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 text-gray-900 dark:text-white bg-white dark:bg-gray-800 flex items-center justify-center gap-2 hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>
            </div>
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
  // Helper function to mark user as engaged
  const markUserAsEngaged = async () => {
    if (user && !user.hasEngaged) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          hasEngaged: true,
          lastActive: new Date()
        });
        addSystemLog(`User ${user.email} marked as engaged`, 'info');
      } catch (error) {
        console.error('Error marking user as engaged:', error);
      }
    }
  };

  // Load user-specific data from Firestore
  const loadUserData = async () => {
    if (!user?.id) {
      console.log('No user ID available for loading data');
      return;
    }
    
    console.log(`Loading data for user: ${user.email} (${user.id})`);
    
    try {
      // Load user's goals with simplified query first
      let userGoals: any[] = [];
      try {
        const goalsQuery = query(
          collection(db, 'goals'), 
          where('userId', '==', user.id)
        );
        const goalsSnapshot = await getDocs(goalsQuery);
        userGoals = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        // Sort manually after fetching to avoid index requirements
        userGoals.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
      } catch (goalError) {
        console.warn('Failed to load goals with compound query, trying simple query:', goalError);
        // Fallback: load all user goals without ordering
        const simpleGoalsQuery = query(collection(db, 'goals'), where('userId', '==', user.id));
        const goalsSnapshot = await getDocs(simpleGoalsQuery);
        userGoals = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
      }
      
      setGoals(userGoals);
      console.log(`Loaded ${userGoals.length} goals for user ${user.email}`);

      // Load user's check-ins with simplified query
      let userCheckIns: any[] = [];
      try {
        const checkInsQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.id),
          limit(30)
        );
        const checkInsSnapshot = await getDocs(checkInsQuery);
        userCheckIns = checkInsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        // Sort manually by date
        userCheckIns.sort((a, b) => {
          const aDate = a.date || '';
          const bDate = b.date || '';
          return bDate.localeCompare(aDate);
        });
      } catch (checkInError) {
        console.warn('Failed to load check-ins with compound query, trying simple query:', checkInError);
        // Fallback: load all user check-ins without ordering
        const simpleCheckInsQuery = query(collection(db, 'checkIns'), where('userId', '==', user.id));
        const checkInsSnapshot = await getDocs(simpleCheckInsQuery);
        userCheckIns = checkInsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        // Take only the last 30 manually
        userCheckIns = userCheckIns.slice(0, 30);
      }
      
      setCheckIns(userCheckIns);
      console.log(`Loaded ${userCheckIns.length} check-ins for user ${user.email}`);

      // Check if user has checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIn = userCheckIns.find((checkIn: any) => checkIn.date === today);
      setHasCheckedInToday(!!todayCheckIn);
      console.log(`Today's check-in status: ${!!todayCheckIn ? 'completed' : 'pending'}`);

      addSystemLog(`Loaded data for user ${user.email}: ${userGoals.length} goals, ${userCheckIns.length} check-ins`, 'info');
      
      // Show success toast if we loaded data successfully
      if (userGoals.length > 0 || userCheckIns.length > 0) {
        addToast({
          type: 'success',
          title: 'Data loaded successfully',
          description: `Found ${userGoals.length} goals and ${userCheckIns.length} check-ins.`
        });
      } else {
        // Welcome message for new users
        addToast({
          type: 'info',
          title: 'Welcome to Accountability On Autopilot!',
          description: 'Start by adding your first goal or submitting a check-in.'
        });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      addToast({
        type: 'error',
        title: 'Failed to load your data',
        description: 'There was an issue loading your goals and check-ins. Please refresh the page.'
      });
      addSystemLog(`Failed to load user data: ${error}`, 'error');
    }
  };

  const handleAddGoal = async () => {
    if (!user?.id) {
      addToast({
        type: 'error',
        title: 'Authentication required',
        description: 'Please log in to add goals.'
      });
      return;
    }

    if (newGoal.title.trim() && newGoal.description.trim()) {
      try {
        const goalData = {
          userId: user.id,
          title: newGoal.title.trim(),
          description: newGoal.description.trim(),
          status: 'active' as const,
          progress: 0,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Save to Firestore
        const docRef = await addDoc(collection(db, 'goals'), goalData);
        
        // Update local state
        const newGoalWithId = {
          id: docRef.id,
          ...goalData
        };
        setGoals([...goals, newGoalWithId]);
        setNewGoal({ title: '', description: '' });
        setShowAddGoal(false);
        
        // Mark user as engaged when they create their first goal
        await markUserAsEngaged();
        
        addToast({
          type: 'success',
          title: 'Goal added!',
          description: `"${goalData.title}" has been added to your goals.`
        });
        
        addSystemLog(`User ${user.email} added goal: ${goalData.title}`, 'info');
      } catch (error) {
        console.error('Error adding goal:', error);
        addToast({
          type: 'error',
          title: 'Failed to add goal',
          description: 'Unable to save your goal. Please try again.'
        });
        addSystemLog(`Failed to add goal: ${error}`, 'error');
      }
    } else {
      addToast({
        type: 'warning',
        title: 'Missing information',
        description: 'Please fill in both the goal title and description.'
      });
    }
  };

  const handleDeleteGoal = async (goalId: string | number) => {
    if (!user?.id) return;

    try {
      const goalToDelete = goals.find(goal => goal.id === goalId);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'goals', goalId.toString()));
      
      // Update local state
      setGoals(goals.filter(goal => goal.id !== goalId));
      
      addToast({
        type: 'info',
        title: 'Goal deleted',
        description: `"${goalToDelete?.title}" has been removed from your goals.`
      });
      
      addSystemLog(`User ${user.email} deleted goal: ${goalToDelete?.title}`, 'info');
    } catch (error) {
      console.error('Error deleting goal:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete goal',
        description: 'Unable to delete the goal. Please try again.'
      });
      addSystemLog(`Failed to delete goal: ${error}`, 'error');
    }
  };

  const handleToggleGoal = async (goalId: string | number) => {
    if (!user?.id) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const isBeingCompleted = !goal.completed;
      const updatedGoal = {
        ...goal,
        completed: isBeingCompleted,
        progress: isBeingCompleted ? 100 : 0,
        updatedAt: new Date()
      };

      // Update in Firestore
      await updateDoc(doc(db, 'goals', goalId.toString()), {
        completed: updatedGoal.completed,
        progress: updatedGoal.progress,
        updatedAt: updatedGoal.updatedAt
      });

      // Update local state
      setGoals(goals.map(g => 
        g.id === goalId ? updatedGoal : g
      ));
      
      if (isBeingCompleted) {
        addToast({
          type: 'success',
          title: '🎉 Goal completed!',
          description: `Congratulations on completing "${goal.title}"!`
        });
        addSystemLog(`User ${user.email} completed goal: ${goal.title}`, 'info');
      } else {
        addToast({
          type: 'info',
          title: 'Goal reopened',
          description: `"${goal.title}" has been marked as incomplete.`
        });
        addSystemLog(`User ${user.email} reopened goal: ${goal.title}`, 'info');
      }
      
      // Optional: Add a small celebration effect for completing goals
      if (isBeingCompleted) {
        setTimeout(() => {
          // Any additional completion effects can be added here
        }, 1000); // Matches the animation duration
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      addToast({
        type: 'error',
        title: 'Failed to update goal',
        description: 'Unable to update the goal. Please try again.'
      });
      addSystemLog(`Failed to update goal: ${error}`, 'error');
    }
  };

  const handleSubmitCheckIn = async () => {
    if (!user?.id) {
      addToast({
        type: 'error',
        title: 'Authentication required',
        description: 'Please log in to submit check-ins.'
      });
      return;
    }

    if (todayCheckIn.reflection.trim() && !hasCheckedInToday) {
      try {
        const checkInData = {
          userId: user.id,
          date: new Date().toISOString().split('T')[0],
          rating: todayCheckIn.rating,
          reflection: todayCheckIn.reflection.trim(),
          completed: true,
          createdAt: new Date()
        };

        // Save to Firestore
        const docRef = await addDoc(collection(db, 'checkIns'), checkInData);
        
        // Update local state
        const newCheckIn = {
          id: docRef.id,
          ...checkInData
        };
        setCheckIns([newCheckIn, ...checkIns]);
        setTodayCheckIn({ rating: 5, reflection: '' });
        setHasCheckedInToday(true);
        
        // Mark user as engaged when they submit their first check-in
        await markUserAsEngaged();
        
        addToast({
          type: 'success',
          title: 'Check-in completed!',
          description: `Today's check-in saved with a ${todayCheckIn.rating}/10 rating.`
        });
        
        addSystemLog(`User ${user.email} submitted check-in with rating ${todayCheckIn.rating}`, 'info');
      } catch (error) {
        console.error('Error submitting check-in:', error);
        addToast({
          type: 'error',
          title: 'Failed to submit check-in',
          description: 'Unable to save your check-in. Please try again.'
        });
        addSystemLog(`Failed to submit check-in: ${error}`, 'error');
      }
    } else if (!todayCheckIn.reflection.trim()) {
      addToast({
        type: 'warning',
        title: 'Reflection required',
        description: 'Please add a reflection about your day before submitting.'
      });
    } else if (hasCheckedInToday) {
      addToast({
        type: 'info',
        title: 'Already checked in',
        description: 'You have already completed your check-in for today!'
      });
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
    
    addToast({
      description: 'Data exported successfully! Your accountability data has been downloaded.',
      type: 'success'
    });
  };

  // Dashboard with tiered features
  const renderDashboard = () => {
    const maxGoals = getFeatureLimit('goals') || 0;
    const currentGoals = goals.length; // Count all goals (active + completed)
    const canAddMoreGoals = maxGoals === -1 || currentGoals < maxGoals;
    const canUseAdvancedAnalytics = canAccessFeature('canUseAdvancedAnalytics');
    const canExportData = canAccessFeature('canExportData');

    // Handler to navigate to subscription page for upgrades
    const handleUpgradeClick = () => {
      setCurrentPage('subscription');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <SEO 
          title="Dashboard"
          description="Track your goals and progress with your personal accountability dashboard"
        />
        <ThemeDialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} />
        
        {/* Website Onboarding Prompt */}
        {showWebsitePrompt && (
          <WebsiteOnboardingPrompt
            onStartTour={handleWebsitePromptStartTour}
            onSkipTour={handleWebsitePromptSkipTour}
            onClose={handleWebsitePromptClose}
            userName={user?.name}
          />
        )}
        
        {/* Interactive App Tour */}
        <AppTour
          isOpen={showTour}
          onClose={handleTourClose}
          onComplete={handleTourComplete}
        />
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Accountability</h1>
            <div className="flex items-center gap-3">
              <TierBadge tier={userTier} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex relative">
          {/* Mobile Menu Backdrop */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden" 
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          )}
          
          {/* Sidebar - Fixed on mobile for proper overlay */}
          <div 
            className={`${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 fixed md:sticky top-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg h-screen overflow-y-auto z-50 md:z-auto transition-transform duration-300 ease-in-out md:transition-none`}
            data-tour="sidebar"
          >
            
            {/* Mobile menu header */}
            <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h1>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Desktop header */}
            <div className="hidden md:block p-6 border-b border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Accountability</h1>
                <div className="flex items-center gap-2">
                  <TierBadge tier={userTier} />
                </div>
              </div>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'goals', label: 'Goals', icon: Target },
                  { id: 'checkins', label: 'Check-ins', icon: CheckCircle2 },
                  { id: 'progress', label: 'Progress', icon: TrendingUp },
                  { id: 'subscription', label: 'Subscription', icon: Crown },
                  { id: 'settings', label: 'Settings', icon: Settings },
                  ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: Users }] : []),
                ].map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setMobileMenuOpen(false); // Close mobile menu on navigation
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center ${
                        currentPage === item.id 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-r-2 border-blue-500 text-blue-700 dark:text-blue-400 shadow-md' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                      }`}
                    >
                      <IconComponent size={20} className="mr-3 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
                {/* Theme selector item */}
                <button
                  onClick={() => setThemeDialogOpen(true)}
                  className="w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                  aria-label="Select theme"
                >
                  <Moon size={20} className="mr-3 flex-shrink-0 dark:hidden" />
                  <Sun size={20} className="mr-3 flex-shrink-0 hidden dark:block" />
                  <span className="font-medium">Theme</span>
                </button>

                {/* PWA Install button - only show when NOT running as PWA */}
                {showPWAInstall && !isRunningAsPWA && (
                  <button
                    onClick={handleInstallPWA}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center hover:shadow-sm ${
                      isPWAInstalled 
                        ? 'text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    aria-label="Install app"
                  >
                    <Plus size={20} className="mr-3 flex-shrink-0" />
                    <span className="font-medium">
                      {isPWAInstalled ? 'App Installed ✓' : deferredPrompt ? 'Install App' : 'Install App'}
                    </span>
                  </button>
                )}

                {/* Admin Tools - only visible to admins */}
                {isAdmin && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-3">Admin Tools</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => addToast({ 
                          type: 'success', 
                          title: 'Admin Test Notification!', 
                          description: 'Notification system is working correctly.' 
                        })}
                        className="w-full text-left p-2 text-xs rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                      >
                        🧪 Test Toast
                      </button>
                      <button
                        onClick={() => {
                          throw new Error('Test error boundary');
                        }}
                        className="w-full text-left p-2 text-xs rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      >
                        ⚠️ Test Error
                      </button>
                      <button
                        onClick={async () => {
                          const sessionAge = getSessionAge();
                          const ageInMinutes = sessionAge ? Math.floor(sessionAge / (1000 * 60)) : 0;
                          console.log('🧹 Clearing session from admin tools...');
                          clearUserData(); // Clear local state first
                          await clearSession(); // Then clear auth
                          addToast({
                            description: `🧹 Session cleared! (Was active for ${ageInMinutes} minutes)`,
                            type: 'success'
                          });
                          // Small delay before reload to show toast
                          setTimeout(() => {
                            window.location.reload();
                          }, 1000);
                        }}
                        className="w-full text-left p-2 text-xs rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                      >
                        🧹 Clear Session
                      </button>
                      <button
                        onClick={async () => {
                          await signOut();
                          setCurrentScreen('welcome');
                        }}
                        className="w-full text-left p-2 text-xs rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                      >
                        <LogOut size={14} className="inline mr-1" />
                        Admin Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Main Content - Responsive with proper spacing for mobile */}
          <div className="flex-1 w-full md:w-auto p-4 md:p-8 md:ml-0">
            <div className="transition-all duration-300 ease-in-out">
              {currentPage === 'dashboard' && (
                <div className="animate-in fade-in duration-300">
                  {(() => {
                    const weeklyStats = getWeeklyStats();
                    return (
                      <div data-tour="dashboard-header">
                        <DashboardHeader
                          title={`Welcome back, ${user?.name}!`}
                          subtitle="Ready to stay accountable today?"
                          stats={[
                          {
                            title: 'Total Goals',
                            value: goals.length,
                            change: weeklyStats.goalsChange,
                            icon: Target,
                            color: 'blue'
                          },
                          {
                            title: 'Check-ins',
                            value: checkIns.length,
                            change: weeklyStats.checkInsChange,
                            icon: CheckCircle2,
                            color: 'green'
                          },
                          {
                            title: 'Current Streak',
                            value: `${weeklyStats.currentStreak} day${weeklyStats.currentStreak !== 1 ? 's' : ''}`,
                            icon: Zap,
                            color: 'orange'
                          },
                          {
                            title: 'Plan',
                            value: userTier.charAt(0).toUpperCase() + userTier.slice(1),
                            icon: Crown,
                            color: userTier === 'free' ? 'blue' : 'purple'
                          }
                        ]}
                        action={{
                          label: 'Quick Check-in',
                          onClick: () => setCurrentPage('checkins'),
                          icon: Plus
                        }}
                      />
                      </div>
                    );
                  })()}

                {/* Spacing between stats and usage summary */}
                <div className="mb-8"></div>

                {/* Usage Summary for Free Users */}
                {userTier === 'free' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-400">Usage Summary</h3>
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

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6" data-tour="goals-section">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                      <Target size={24} className="mr-2 text-blue-500" />
                      Your Goals
                    </h2>
                    <div className="relative">
                      <EnhancedButton
                        onClick={() => setShowAddGoal(true)}
                        disabled={!canAddMoreGoals}
                        icon={<Plus size={20} />}
                        variant={canAddMoreGoals ? "primary" : "secondary"}
                      >
                        Add New Goal
                      </EnhancedButton>
                      {!canAddMoreGoals && userTier === 'free' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Goal Limit: {currentGoals}/{maxGoals}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Add Goal Form */}
                  {showAddGoal && (
                    <div className="mb-6 p-6 border border-blue-200 dark:border-blue-700 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 animate-in slide-in-from-top duration-300">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <Plus size={20} className="mr-2 text-blue-500" />
                        Add New Goal
                      </h3>
                      <div className="space-y-4">
                        <FormField
                          label="Goal Title"
                          type="text"
                          value={newGoal.title}
                          onChange={(value) => setNewGoal({ ...newGoal, title: value })}
                          placeholder="e.g., Exercise 30 minutes daily"
                          required
                          validation={{
                            minLength: 3,
                            maxLength: 100
                          }}
                        />
                        <FormField
                          label="Goal Description"
                          type="textarea"
                          value={newGoal.description}
                          onChange={(value) => setNewGoal({ ...newGoal, description: value })}
                          placeholder="Describe what success looks like and why this goal matters to you..."
                          validation={{
                            minLength: 10,
                            maxLength: 500
                          }}
                          rows={3}
                        />
                        <div className="flex gap-3">
                          <EnhancedButton
                            onClick={handleAddGoal}
                            disabled={!newGoal.title.trim() || !newGoal.description.trim()}
                            icon={<Save size={18} />}
                            variant="primary"
                          >
                            Add Goal
                          </EnhancedButton>
                          <EnhancedButton
                            onClick={() => setShowAddGoal(false)}
                            variant="secondary"
                          >
                            Cancel
                          </EnhancedButton>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {goals.length === 0 ? (
                      <EmptyState
                        icon={Target}
                        title="No goals yet"
                        description="Start your accountability journey by creating your first goal. Make it specific, measurable, and exciting!"
                        action={{
                          label: "Create Your First Goal",
                          onClick: () => setShowAddGoal(true)
                        }}
                      />
                    ) : (
                      goals.map((goal) => (
                        <div key={goal.id} className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-md ${goal.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
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
                                      className={`h-2 rounded-full transition-all duration-500 ease-out ${goal.completed ? 'bg-green-500 dark:bg-green-400' : 'bg-blue-600 dark:bg-blue-500'}`}
                                      style={{ width: `${goal.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{goal.progress}%</span>
                                  {goal.completed && (
                                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full flex items-center">
                                      <CheckCircle2 size={12} className="mr-1" />
                                      Completed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="ml-4 px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 ease-in-out transform hover:scale-110 flex items-center"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {userTier === 'free' && goals.length > 0 && (
                      <UpgradePrompt 
                        feature="Unlock More Goals"
                        description="You're currently limited to 2 goals. Upgrade to Standard for up to 10 goals, or Premium for unlimited goals."
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
                  {/* Enhanced Weekly Overview */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">📅 Weekly Progress</h2>
                    <div className="space-y-4">
                        {Array.from({ length: 7 }, (_, index) => {
                        // Show 4 days ago, 3 days ago, 2 days ago, 1 day ago, today, tomorrow, day after tomorrow
                        const dayDate = new Date();
                        dayDate.setDate(dayDate.getDate() + (index - 4)); // -4 to +2 range
                        const dateString = dayDate.toISOString().split('T')[0];
                        const dayCheckIn = checkIns.find(checkIn => checkIn.date === dateString);
                        const isToday = dateString === new Date().toISOString().split('T')[0];
                        const isFuture = dayDate > new Date();
                        const isMissed = !dayCheckIn && !isToday && !isFuture;
                        const hasGoals = goals.length > 0;
                        const completedGoals = goals.filter(g => g.completed).length;
                        
                        // Get day name
                        const dayName = dayDate.toLocaleDateString('en', { weekday: 'short' });
                        
                        return (
                          <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                            isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700' : 
                            isMissed ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' :
                            dayCheckIn ? 'bg-green-50 dark:bg-green-900/20' :
                            'bg-gray-50 dark:bg-gray-700/50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className={`font-medium ${
                                isToday ? 'text-blue-600 dark:text-blue-400' : 
                                isMissed ? 'text-red-600 dark:text-red-400' :
                                dayCheckIn ? 'text-green-600 dark:text-green-400' :
                                'text-gray-600 dark:text-gray-400'
                              }`}>
                                {dayName}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-500">
                                {dayDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                              </span>
                              {isToday && <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">Today</span>}
                              {isMissed && <span className="text-xs bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">Missed</span>}
                              {isFuture && !isToday && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">Future</span>}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Single Clean Status Indicator */}
                              <div className="flex items-center gap-3 flex-1">
                                {dayCheckIn ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">✓</span>
                                    </div>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                      {dayCheckIn.rating}/10
                                    </span>
                                  </div>
                                ) : isMissed ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">✗</span>
                                    </div>
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                      Missed
                                    </span>
                                  </div>
                                ) : isToday ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 animate-pulse flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">!</span>
                                    </div>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                      Pending
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                      <span className="text-gray-500 text-sm">○</span>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      Future
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Daily Score Emoji */}
                              <div className="text-right">
                                <div className="text-xl">
                                  {dayCheckIn ? (
                                    <span title={`Rating: ${dayCheckIn.rating}/10`}>
                                      {dayCheckIn.rating >= 8 ? '🔥' : 
                                       dayCheckIn.rating >= 6 ? '⚡' : 
                                       dayCheckIn.rating >= 4 ? '📈' : '😅'}
                                    </span>
                                  ) : isMissed ? (
                                    <span title="Missed day">💔</span>
                                  ) : isToday ? (
                                    <span title="Today - check in pending">⏰</span>
                                  ) : (
                                    <span className="text-gray-400">⭕</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Weekly Summary */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                        <h3 className="font-medium text-indigo-800 dark:text-indigo-400 mb-2">📊 This Week</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              {checkIns.filter(c => {
                                const checkInDate = new Date(c.date);
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                return checkInDate >= weekAgo;
                              }).length}/7
                            </div>
                            <div className="text-xs text-indigo-700 dark:text-indigo-400">Check-ins</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {goals.filter(g => g.completed).length}/{goals.length || 1}
                            </div>
                            <div className="text-xs text-purple-700 dark:text-purple-400">Goals Done</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
                              {checkIns.length > 0 ? 
                                Math.round(checkIns.filter(c => {
                                  const checkInDate = new Date(c.date);
                                  const weekAgo = new Date();
                                  weekAgo.setDate(weekAgo.getDate() - 7);
                                  return checkInDate >= weekAgo;
                                }).reduce((sum, c) => sum + c.rating, 0) / Math.max(checkIns.filter(c => {
                                  const checkInDate = new Date(c.date);
                                  const weekAgo = new Date();
                                  weekAgo.setDate(weekAgo.getDate() - 7);
                                  return checkInDate >= weekAgo;
                                }).length, 1)) : 0}/10
                            </div>
                            <div className="text-xs text-pink-700 dark:text-pink-400">Avg Rating</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Analytics */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Smart Analytics</h2>
                    {userTier === 'free' ? (
                      <UpgradePrompt 
                        feature="Smart Analytics Dashboard"
                        description="Unlock AI-powered insights, streak tracking, completion forecasts, and interactive progress charts with Standard or Premium plans."
                        size="large"
                        onUpgrade={handleUpgradeClick}
                      />
                    ) : (
                      <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {checkIns.length > 0 ? Math.round((checkIns.reduce((sum, checkIn) => sum + checkIn.rating, 0) / checkIns.length / 10) * 100) : 0}%
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-400">Avg Rating</div>
                            <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                              {checkIns.length > 0 && checkIns[0]?.rating >= 7 ? '📈 Trending up' : ''}
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{checkIns.length}</div>
                            <div className="text-sm text-blue-700 dark:text-blue-400">Total Check-ins</div>
                            <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                              {checkIns.length > 7 ? '🔥 Great momentum!' : ''}
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {goals.filter(g => g.completed).length}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-400">Goals Completed</div>
                            <div className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                              {goals.filter(g => g.completed).length > 0 ? '🎯 Well done!' : ''}
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {(() => {
                                const today = new Date().toISOString().split('T')[0];
                                let streak = 0;
                                const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                for (let i = 0; i < sortedCheckIns.length; i++) {
                                  const checkInDate = new Date(sortedCheckIns[i].date);
                                  const expectedDate = new Date();
                                  expectedDate.setDate(expectedDate.getDate() - i);
                                  if (checkInDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
                                    streak++;
                                  } else {
                                    break;
                                  }
                                }
                                return streak;
                              })()}
                            </div>
                            <div className="text-sm text-orange-700 dark:text-orange-400">Day Streak</div>
                            <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                              {(() => {
                                const streak = (() => {
                                  const today = new Date().toISOString().split('T')[0];
                                  let streak = 0;
                                  const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                  for (let i = 0; i < sortedCheckIns.length; i++) {
                                    const checkInDate = new Date(sortedCheckIns[i].date);
                                    const expectedDate = new Date();
                                    expectedDate.setDate(expectedDate.getDate() - i);
                                    if (checkInDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
                                      streak++;
                                    } else {
                                      break;
                                    }
                                  }
                                  return streak;
                                })();
                                return streak >= 7 ? '🔥 On fire!' : streak >= 3 ? '⚡ Building momentum' : '';
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Progress Visualization */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                          <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-4">📊 7-Day Progress Trend</h3>
                          <div className="flex items-end justify-between h-32 px-2">
                            {Array.from({ length: 7 }, (_, i) => {
                              const date = new Date();
                              date.setDate(date.getDate() - (6 - i));
                              const dateString = date.toISOString().split('T')[0];
                              const dayCheckIn = checkIns.find(c => c.date === dateString);
                              const height = dayCheckIn ? (dayCheckIn.rating / 10) * 100 : 0;
                              
                              return (
                                <div key={i} className="flex flex-col items-center flex-1">
                                  <div 
                                    className={`w-6 rounded-t-lg transition-all duration-500 ${
                                      height > 70 ? 'bg-green-500' : 
                                      height > 50 ? 'bg-yellow-500' : 
                                      height > 0 ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    style={{ height: `${Math.max(height, 4)}%` }}
                                  />
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {date.toLocaleDateString('en', { weekday: 'short' })}
                                  </span>
                                  {dayCheckIn && (
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                      {dayCheckIn.rating}/10
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* AI Insights - Actionable and Interactive */}
                        <div className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">🎯</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-purple-800 dark:text-purple-400 text-lg">Your Action Plan</h3>
                              <p className="text-sm text-purple-600 dark:text-purple-300">Things you can do right now to improve</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {(() => {
                              const actions = [];
                              const today = new Date().toISOString().split('T')[0];
                              const hasCheckedInToday = checkIns.find(c => c.date === today);
                              const incompleteGoals = goals.filter(g => !g.completed);
                              const avgRating = checkIns.length > 0 ? checkIns.reduce((sum, c) => sum + c.rating, 0) / checkIns.length : 0;
                              const recentCheckIns = checkIns.slice(0, 3);
                              const recentAvg = recentCheckIns.length > 0 ? recentCheckIns.reduce((sum, c) => sum + c.rating, 0) / recentCheckIns.length : 0;
                              
                              const missedDaysThisWeek = Array.from({ length: 7 }, (_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - (6 - i));
                                const dateString = date.toISOString().split('T')[0];
                                const isToday = dateString === today;
                                const isFuture = date > new Date();
                                return !checkIns.find(c => c.date === dateString) && !isToday && !isFuture;
                              }).filter(Boolean).length;
                              
                              // Priority 1: Today's check-in
                              if (!hasCheckedInToday) {
                                actions.push({
                                  icon: '⏰',
                                  type: 'urgent',
                                  title: 'Complete Today\'s Check-in',
                                  message: 'You haven\'t checked in today yet! This is your #1 priority to maintain your accountability habit.',
                                  action: 'Go to Check-ins tab and rate your day now',
                                  actionable: true,
                                  priority: 1
                                });
                              }
                              
                              // Priority 2: Incomplete goals
                              if (incompleteGoals.length > 0) {
                                const urgentGoals = incompleteGoals.slice(0, 2);
                                actions.push({
                                  icon: '🎯',
                                  type: 'action',
                                  title: 'Focus on Your Goals',
                                  message: `You have ${incompleteGoals.length} active goal${incompleteGoals.length > 1 ? 's' : ''}. Pick one to work on right now: "${urgentGoals[0].title}"`,
                                  action: 'Go to Goals tab and mark progress on this goal',
                                  actionable: true,
                                  priority: 2
                                });
                              }
                              
                              // Priority 3: Consistency issues
                              if (missedDaysThisWeek > 0 && checkIns.length > 0) {
                                actions.push({
                                  icon: '🔔',
                                  type: 'habit',
                                  title: 'Set a Daily Reminder',
                                  message: `You missed ${missedDaysThisWeek} day${missedDaysThisWeek > 1 ? 's' : ''} this week. Consistency beats perfection!`,
                                  action: 'Set a phone alarm for the same time daily to check in',
                                  actionable: true,
                                  priority: 3
                                });
                              }
                              
                              // Priority 4: Create goals if none exist
                              if (goals.length === 0) {
                                actions.push({
                                  icon: '🚀',
                                  type: 'setup',
                                  title: 'Create Your First Goal',
                                  message: 'Start your accountability journey by setting a clear, specific goal you want to achieve.',
                                  action: 'Go to Goals tab and create a goal that excites you',
                                  actionable: true,
                                  priority: 4
                                });
                              }
                              
                              // Priority 5: Improve low ratings
                              if (recentAvg < 6 && recentCheckIns.length >= 2) {
                                actions.push({
                                  icon: '📈',
                                  type: 'improvement',
                                  title: 'Boost Your Daily Score',
                                  message: `Your recent average is ${Math.round(recentAvg * 10)/10}/10. Let's identify what would make tomorrow better.`,
                                  action: 'Write down 3 specific things that would improve tomorrow',
                                  actionable: true,
                                  priority: 5
                                });
                              }
                              
                              // Priority 6: Celebrate wins
                              if (hasCheckedInToday && avgRating >= 7 && goals.filter(g => g.completed).length > 0) {
                                actions.push({
                                  icon: '🎉',
                                  type: 'celebrate',
                                  title: 'Celebrate Your Progress',
                                  message: `You're doing great! Average rating of ${Math.round(avgRating * 10)/10}/10 and completed goals. Time to acknowledge your success.`,
                                  action: 'Take 2 minutes to appreciate what you\'ve accomplished',
                                  actionable: true,
                                  priority: 6
                                });
                              }
                              
                              // Default action for new users
                              if (actions.length === 0) {
                                actions.push({
                                  icon: '💪',
                                  type: 'start',
                                  title: 'Start Building Your Habit',
                                  message: 'Every expert was once a beginner. Your accountability journey starts with one small step.',
                                  action: hasCheckedInToday ? 'Create your first goal in the Goals tab' : 'Complete your first check-in today',
                                  actionable: true,
                                  priority: 7
                                });
                              }
                              
                              // Sort by priority and show top 3
                              return actions
                                .sort((a, b) => a.priority - b.priority)
                                .slice(0, 3)
                                .map((action, index) => (
                                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                                  action.type === 'urgent' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                                  action.type === 'action' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                                  action.type === 'habit' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                                  action.type === 'celebrate' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                                  'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                                }`}>
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl">{action.icon}</span>
                                    <div className="flex-1">
                                      <h4 className={`font-semibold mb-1 ${
                                        action.type === 'urgent' ? 'text-red-800 dark:text-red-400' :
                                        action.type === 'action' ? 'text-blue-800 dark:text-blue-400' :
                                        action.type === 'habit' ? 'text-yellow-800 dark:text-yellow-400' :
                                        action.type === 'celebrate' ? 'text-green-800 dark:text-green-400' :
                                        'text-purple-800 dark:text-purple-400'
                                      }`}>
                                        {action.title}
                                      </h4>
                                      <p className={`text-sm mb-3 ${
                                        action.type === 'urgent' ? 'text-red-700 dark:text-red-300' :
                                        action.type === 'action' ? 'text-blue-700 dark:text-blue-300' :
                                        action.type === 'habit' ? 'text-yellow-700 dark:text-yellow-300' :
                                        action.type === 'celebrate' ? 'text-green-700 dark:text-green-300' :
                                        'text-purple-700 dark:text-purple-300'
                                      }`}>
                                        {action.message}
                                      </p>
                                      <button 
                                        onClick={() => {
                                          if (action.title.includes('Check-in')) {
                                            setCurrentPage('checkins');
                                          } else if (action.title.includes('Goal')) {
                                            setCurrentPage('goals');
                                          }
                                          addToast({
                                            title: 'Action Noted!',
                                            description: `Ready to: ${action.action}`,
                                            type: 'success'
                                          });
                                        }}
                                        className={`text-xs font-medium px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 ${
                                        action.type === 'urgent' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                        action.type === 'action' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                        action.type === 'habit' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                        action.type === 'celebrate' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                        'bg-purple-500 hover:bg-purple-600 text-white'
                                      }`}>
                                        🚀 {action.action}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                          
                          {/* Quick Action Buttons */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {!checkIns.find(c => c.date === new Date().toISOString().split('T')[0]) && (
                              <button 
                                onClick={() => setCurrentPage('checkins')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
                              >
                                ⚡ Quick Check-in
                              </button>
                            )}
                            {goals.filter(g => !g.completed).length === 0 && (
                              <button 
                                onClick={() => setCurrentPage('goals')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium"
                              >
                                🎯 Add Goal
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Goal Progress Overview */}
                        {goals.length > 0 && (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                            <h3 className="font-medium text-green-800 dark:text-green-400 mb-3">🎯 Goal Progress Overview</h3>
                            <div className="space-y-3">
                              {goals.slice(0, 3).map((goal, index) => (
                                <div key={goal.id} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                                      {goal.title}
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div 
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${goal.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="ml-4 text-sm font-medium text-green-600 dark:text-green-400">
                                    {goal.progress}%
                                  </div>
                                </div>
                              ))}
                              {goals.length > 3 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                                  And {goals.length - 3} more goals...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
                        onClick={canExportData ? handleExportData : undefined}
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
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const name = formData.get('name') as string;
                      handleSaveSettings(name);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input 
                          type="text" 
                          name="name"
                          className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          defaultValue={user?.name || ''}
                          required
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
                      <div className="flex space-x-3 pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('🎯 Starting manual app tour from settings');
                            startTour();
                          }}
                          className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300"
                          data-tour="settings-button"
                        >
                          View App Tour
                        </button>
                      </div>
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <button
                          type="button"
                          onClick={async () => {
                            console.log('🧹 Clearing session from settings...');
                            clearUserData(); // Clear local state first
                            await clearSession(); // Then clear auth
                            addToast({
                              description: '🧹 Session cleared for testing!',
                              type: 'success'
                            });
                            // Small delay before reload to show toast
                            setTimeout(() => {
                              window.location.reload();
                            }, 1000);
                          }}
                          className="w-full p-3 text-left text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-700 rounded-lg transition-colors"
                        >
                          🧹 Clear Session (Testing)
                        </button>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full p-3 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'checkins' && (
              <div>
                <DashboardHeader
                  title="Daily Check-ins"
                  subtitle="Track your daily accountability and reflect on your progress"
                  action={{
                    label: hasCheckedInToday ? "View Progress" : "Quick Check-in",
                    onClick: () => hasCheckedInToday ? setCurrentPage('progress') : null,
                    icon: hasCheckedInToday ? TrendingUp : CheckCircle2
                  }}
                />

                <div className="space-y-6 mt-8" data-tour="checkins-section">
                  {/* Today's Check-in */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300 ease-in-out hover:shadow-2xl">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      {hasCheckedInToday ? (
                        <>
                          <CheckCircle2 size={24} className="mr-3 text-green-500" />
                          Today's Check-in Complete
                        </>
                      ) : (
                        <>
                          <Calendar size={24} className="mr-3 text-blue-500" />
                          Today's Check-in
                        </>
                      )}
                    </h2>
                    {!hasCheckedInToday ? (
                      <div className="space-y-6">
                        <FormField
                          label="How did today go?"
                          type="textarea"
                          value={todayCheckIn.reflection}
                          onChange={(value) => setTodayCheckIn({ ...todayCheckIn, reflection: value })}
                          placeholder="Reflect on your progress, challenges, and wins today..."
                          required
                          validation={{
                            minLength: 10,
                            maxLength: 1000
                          }}
                          rows={4}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Rate your day: <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{todayCheckIn.rating}/10</span>
                          </label>
                          <div className="relative">
                            <input 
                              type="range" 
                              min="1" 
                              max="10" 
                              value={todayCheckIn.rating}
                              onChange={(e) => setTodayCheckIn({ ...todayCheckIn, rating: parseInt(e.target.value) })}
                              className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                              <span>Poor</span>
                              <span>Average</span>
                              <span>Excellent</span>
                            </div>
                          </div>
                        </div>
                        
                        <EnhancedButton 
                          onClick={handleSubmitCheckIn}
                          disabled={!todayCheckIn.reflection.trim()}
                          variant="primary"
                          size="lg"
                          icon={<Save size={20} />}
                          fullWidth
                        >
                          Submit Check-in
                        </EnhancedButton>
                      </div>
                    ) : (
                      <div className="text-center py-8 animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 size={40} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">All done for today!</h3>
                        <p className="text-gray-600 dark:text-gray-400">You've already checked in today. Come back tomorrow to continue your streak.</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Check-ins */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300 ease-in-out hover:shadow-2xl">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <Activity size={24} className="mr-3 text-purple-500" />
                      Recent Check-ins
                    </h2>
                    {checkIns.length === 0 ? (
                      <EmptyState
                        icon={Calendar}
                        title="No check-ins yet"
                        description="Start building your accountability habit by completing your first daily check-in above!"
                        action={!hasCheckedInToday ? {
                          label: "Complete Today's Check-in",
                          onClick: () => document.getElementById('check-in-form')?.scrollIntoView({ behavior: 'smooth' })
                        } : undefined}
                      />
                    ) : (
                      <div className="space-y-3">
                        {checkIns.slice(0, 5).map((checkIn, index) => (
                          <div key={checkIn.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/30"
                               style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800 dark:text-white flex items-center">
                                <Calendar size={16} className="mr-2 text-gray-500" />
                                {new Date(checkIn.date).toLocaleDateString('en', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                              <div className="flex items-center">
                                <Star 
                                  size={16} 
                                  className={`mr-1 ${
                                    checkIn.rating >= 8 ? 'text-green-500' : 
                                    checkIn.rating >= 6 ? 'text-yellow-500' : 
                                    'text-red-500'
                                  }`} 
                                />
                                <span className={`text-sm font-medium ${
                                  checkIn.rating >= 8 ? 'text-green-600 dark:text-green-400' : 
                                  checkIn.rating >= 6 ? 'text-yellow-600 dark:text-yellow-400' : 
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {checkIn.rating}/10
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{checkIn.reflection}</p>
                          </div>
                        ))}
                        
                        {checkIns.length > 5 && (
                          <div className="text-center pt-4">
                            <EnhancedButton
                              onClick={() => setCurrentPage('progress')}
                              variant="secondary"
                              icon={<Eye size={18} />}
                            >
                              View All Check-ins
                            </EnhancedButton>
                          </div>
                        )}
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
                           userTier === 'standard' ? '$9.99/month - Great for individuals' :
                           '$19.99/month - Perfect for power users'}
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
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">$9.99</div>
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
                        <button 
                          onClick={() => handleSubscriptionChange('standard')}
                          disabled={subscriptionLoading}
                          className={`w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${subscriptionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {subscriptionLoading ? 'Processing...' : '✨ Upgrade to Standard'}
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
                          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">$19.99</div>
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
                        <button 
                          onClick={() => handleSubscriptionChange('premium')}
                          disabled={subscriptionLoading}
                          className={`w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-500 dark:hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${subscriptionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {subscriptionLoading ? 'Processing...' : '✨ Upgrade to Premium'}
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
                            <div className="font-medium text-gray-800 dark:text-white">${userTier === 'standard' ? '9.99' : '19.99'}</div>
                            <div className="text-sm text-green-600 dark:text-green-400">Paid</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">June 2025</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-800 dark:text-white">${userTier === 'standard' ? '9.99' : '19.99'}</div>
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
                        <button 
                          onClick={handlePaymentMethodUpdate}
                          disabled={subscriptionLoading}
                          className={`px-4 py-2 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${subscriptionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Update Payment Method
                        </button>
                        <button 
                          onClick={handleDownloadInvoices}
                          disabled={subscriptionLoading}
                          className={`px-4 py-2 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${subscriptionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Download Invoices
                        </button>
                        <button 
                          onClick={handlePauseSubscription}
                          disabled={subscriptionLoading}
                          className={`px-4 py-2 border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${subscriptionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Pause Subscription
                        </button>
                        <button 
                          onClick={handleCancelSubscription}
                          disabled={subscriptionLoading}
                          className={`px-4 py-2 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${subscriptionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Admin Control Center</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Real-time system monitoring and user management</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TierBadge tier={userTier} />
                    <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs font-medium">
                      Admin Access
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated: {adminData.lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {adminLoading && (
                  <div className="mb-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading admin data...</p>
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {/* System Status Cards */}
                  <div className={`rounded-md p-3 text-white transition-all duration-300 ${
                    adminData.systemStatus === 'online' ? 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700' :
                    adminData.systemStatus === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700' :
                    'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-medium mb-1">System Status</h3>
                        <div className="text-lg font-bold capitalize">{adminData.systemStatus}</div>
                        <p className="text-green-100 dark:text-green-200 text-xs">
                          {adminData.systemStatus === 'online' ? 'All services operational' : 
                           adminData.systemStatus === 'warning' ? 'Some issues detected' : 'System down'}
                        </p>
                      </div>
                      <div className="text-xl opacity-80">
                        {adminData.systemStatus === 'online' ? '🟢' : 
                         adminData.systemStatus === 'warning' ? '🟡' : '🔴'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-md p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-medium mb-1">Total Users</h3>
                        <div className="text-lg font-bold">{adminData.totalUsers.toLocaleString()}</div>
                        <p className="text-blue-100 dark:text-blue-200 text-xs">{adminData.activeUsers} active today</p>
                      </div>
                      <div className="text-xl opacity-80">👥</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-md p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-medium mb-1">Server Load</h3>
                        <div className="text-lg font-bold">{adminData.serverLoad}</div>
                        <p className="text-purple-100 dark:text-purple-200 text-xs">
                          {parseInt(adminData.serverLoad) > 70 ? 'High usage' : 'Optimal performance'}
                        </p>
                      </div>
                      <div className="text-xl opacity-80">⚡</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-md p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-medium mb-1">Activity</h3>
                        <div className="text-lg font-bold">{adminData.totalGoals + adminData.totalCheckIns}</div>
                        <p className="text-indigo-100 dark:text-indigo-200 text-xs">
                          {adminData.totalGoals} goal{adminData.totalGoals !== 1 ? 's' : ''}, {adminData.totalCheckIns} check-in{adminData.totalCheckIns !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-xl opacity-80">📊</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                  {/* User Management */}
                  <div className="bg-white dark:bg-gray-800 rounded-md shadow p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Recent Users</h2>
                      <div className="flex gap-1 text-xs">
                        <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs">
                          Free: {adminData.usersByTier.free}
                        </span>
                        <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                          Standard: {adminData.usersByTier.standard}
                        </span>
                        <span className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded text-xs">
                          Premium: {adminData.usersByTier.premium}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 max-h-80 overflow-y-auto">
                      {adminData.recentUsers.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-xs">No users found</p>
                      ) : (
                        adminData.recentUsers.map((userItem: any) => (
                          <div key={userItem.id} className="p-2 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="font-medium text-gray-800 dark:text-white text-xs">
                                    {userItem.name || userItem.displayName || 'Unknown User'}
                                  </span>
                                  <TierBadge tier={userItem.tier || 'free'} />
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  <p className="truncate">{userItem.email}</p>
                                  {userItem.username && <p>@{userItem.username}</p>}
                                  <p>ID: {userItem.id.substring(0, 8)}...</p>
                                  <p>Joined: {userItem.createdAt ? 
                                    new Date(userItem.createdAt.toDate?.() || userItem.createdAt).toLocaleDateString() : 
                                    'Unknown'
                                  }</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <select
                                  value={userItem.tier || 'free'}
                                  onChange={(e) => handleUserTierChange(userItem.id, e.target.value)}
                                  className="text-xs px-1 py-0.5 border border-blue-200 dark:border-blue-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  <option value="free">Free</option>
                                  <option value="standard">Standard</option>
                                  <option value="premium">Premium</option>
                                </select>
                                <button
                                  onClick={() => handleDeleteUser(userItem.id)}
                                  className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* System Configuration */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Configuration</h2>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2 text-sm">Feature Limits</h3>
                        <div className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Max Goals (Free):</span>
                            <span>{getFeatureLimit('goals') === -1 ? 'Unlimited' : getFeatureLimit('goals')}</span>
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

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2 text-sm">Environment Info</h3>
                        <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
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
                            <span>{adminData.lastUpdated.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => {
                            fetchAdminData();
                            addSystemLog('Manual data refresh triggered', 'admin');
                          }}
                          className="p-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-xs font-medium"
                        >
                          🔄 Refresh Data
                        </button>
                        <button 
                          onClick={async () => {
                            // Update current user's activity and refresh data
                            if (user?.id) {
                              try {
                                await updateDoc(doc(db, 'users', user.id), {
                                  lastSeen: new Date(),
                                  lastActive: new Date()
                                });
                                await fetchAdminData();
                                addSystemLog('User activity updated and data refreshed', 'admin');
                              } catch (error) {
                                addSystemLog(`Error updating activity: ${error}`, 'error');
                              }
                            }
                          }}
                          className="p-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-xs font-medium"
                        >
                          ✅ Update Activity
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        <button 
                          onClick={() => {
                            setAdminData(prev => ({ ...prev, systemLogs: [] }));
                            addSystemLog('System logs cleared', 'admin');
                          }}
                          className="p-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors text-xs font-medium"
                        >
                          🗑️ Clear Logs
                        </button>
                        <button 
                          onClick={generateTestData}
                          className="p-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-xs font-medium"
                        >
                          📊 Generate Test Statistics Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Logs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Logs</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {adminData.systemLogs.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">No logs available</p>
                    ) : (
                      adminData.systemLogs.map((log: any) => (
                        <div key={log.id} className={`p-2 rounded-lg border-l-4 ${
                          log.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                          log.type === 'admin' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                          'bg-gray-50 dark:bg-gray-700/50 border-gray-500'
                        }`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-medium ${
                              log.type === 'error' ? 'text-red-800 dark:text-red-400' :
                              log.type === 'admin' ? 'text-blue-800 dark:text-blue-400' :
                              'text-gray-800 dark:text-gray-300'
                            }`}>
                              {log.message}
                            </span>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              <span>{log.user}</span>
                              <span className="ml-2">{log.timestamp.toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
    case 'onboarding':
      // Safety guard: never show onboarding if user is not logged in
      if (!user) {
        console.log('⚠️ Prevented onboarding from showing without user - redirecting to welcome');
        setCurrentScreen('welcome');
        return renderWelcomeScreen();
      }
      return <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />;
    case 'login':
      return renderLoginScreen();
    case 'signup':
      return renderSignupScreen();
    default:
      return renderWelcomeScreen();
  }
};

export default AccountabilityApp;
