import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-real';
import { detectPlatform } from '@/lib/platform-detection';

// App Layout Components
import AppShell from './app/AppShell';
import SplashScreen from './app/SplashScreen';
import OnboardingFlow from './app/OnboardingFlow';
import AuthScreen from './app/AuthScreen';

const AccountabilityAppNative: React.FC = () => {
  const { user, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [platformInfo, setPlatformInfo] = useState(detectPlatform());

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      // Check if user needs onboarding
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      
      if (!hasSeenOnboarding && user) {
        setShowOnboarding(true);
      }

      // Simulate app initialization time for native feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsInitializing(false);
    };

    initializeApp();
  }, [user]);

  // Update platform info on changes
  useEffect(() => {
    const updatePlatform = () => setPlatformInfo(detectPlatform());
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', updatePlatform);
    
    return () => mediaQuery.removeEventListener('change', updatePlatform);
  }, []);

  // Show splash screen during initialization
  if (isInitializing || loading) {
    return <SplashScreen />;
  }

  // Show onboarding for new users
  if (showOnboarding && user) {
    return (
      <OnboardingFlow 
        onComplete={() => {
          localStorage.setItem('hasSeenOnboarding', 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Show auth screen for non-authenticated users
  if (!user) {
    return <AuthScreen />;
  }

  // Main app experience
  return (
    <AppShell 
      user={user}
      platformInfo={platformInfo}
    />
  );
};

export default AccountabilityAppNative;
