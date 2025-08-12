/**
 * Onboarding state management - Simplified unified flow for all users
 * 
 * All users (website and PWA) now get the same onboarding experience:
 * - Single tour prompt after login (one-time per user)
 * - No platform-specific flows for simplicity
 * - Consistent user experience across all platforms
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { detectPlatform } from './platform-detection';

interface OnboardingState {
  hasCompletedAppOnboarding: boolean;
  hasSeenWebsitePrompt: boolean;
  lastOnboardingDate?: string;
  platformType: 'app' | 'website';
}

const ONBOARDING_LOCAL_KEY = 'accountability_onboarding_state';

/**
 * Get onboarding state from both localStorage and Firebase
 */
export const getOnboardingState = async (userId?: string): Promise<OnboardingState> => {
  const platform = detectPlatform();
  
  // Default state
  const defaultState: OnboardingState = {
    hasCompletedAppOnboarding: false,
    hasSeenWebsitePrompt: false,
    platformType: platform.platformType
  };

  try {
    // Create user-specific localStorage key
    const userSpecificKey = userId ? `${ONBOARDING_LOCAL_KEY}_${userId}` : ONBOARDING_LOCAL_KEY;
    
    // Get from localStorage first (immediate access)
    const localState = localStorage.getItem(userSpecificKey);
    const parsedLocalState = localState ? JSON.parse(localState) : defaultState;

    // If user is logged in, try to get from Firebase and sync
    if (userId) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firebaseOnboardingState = userData.onboardingState || defaultState;
        
        // Merge states (Firebase takes precedence for completion flags)
        const mergedState: OnboardingState = {
          ...defaultState,
          ...parsedLocalState,
          ...firebaseOnboardingState,
          platformType: platform.platformType
        };

        // Update localStorage with merged state
        localStorage.setItem(userSpecificKey, JSON.stringify(mergedState));
        
        return mergedState;
      } else {
        // New user - no Firebase doc exists yet, return default state
        console.log('📱 New user detected - no Firebase doc exists');
        return {
          ...defaultState,
          platformType: platform.platformType
        };
      }
    }

    return {
      ...defaultState,
      ...parsedLocalState,
      platformType: platform.platformType
    };
  } catch (error) {
    console.error('Error getting onboarding state:', error);
    return defaultState;
  }
};

/**
 * Update onboarding state in both localStorage and Firebase
 */
export const updateOnboardingState = async (
  updates: Partial<OnboardingState>, 
  userId?: string
): Promise<void> => {
  try {
    // Get current state
    const currentState = await getOnboardingState(userId);
    
    // Merge updates
    const newState: OnboardingState = {
      ...currentState,
      ...updates,
      lastOnboardingDate: new Date().toISOString()
    };

    // Create user-specific localStorage key
    const userSpecificKey = userId ? `${ONBOARDING_LOCAL_KEY}_${userId}` : ONBOARDING_LOCAL_KEY;

    // Update localStorage
    localStorage.setItem(userSpecificKey, JSON.stringify(newState));

    // Update Firebase if user is logged in
    if (userId) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        onboardingState: newState
      }, { merge: true });
    }

    console.log('📱 Onboarding state updated:', newState);
  } catch (error) {
    console.error('Error updating onboarding state:', error);
  }
};

/**
 * Check if onboarding should be shown based on platform and user state
 */
export const shouldShowOnboarding = async (userId?: string): Promise<{
  showAppOnboarding: boolean;
  showWebsitePrompt: boolean;
  platform: 'app' | 'website';
}> => {
  const platform = detectPlatform();
  const state = await getOnboardingState(userId);

  // Simplified: All users get the same experience (website prompt)
  // No platform-specific flows, just one consistent onboarding prompt
  return {
    showAppOnboarding: false, // Never show the old app onboarding flow
    showWebsitePrompt: !state.hasSeenWebsitePrompt, // All users get the prompt once
    platform: platform.platformType
  };
};

/**
 * Mark app onboarding as completed
 */
export const completeAppOnboarding = async (userId?: string): Promise<void> => {
  await updateOnboardingState(
    { hasCompletedAppOnboarding: true },
    userId
  );
};

/**
 * Mark website prompt as seen
 */
export const markWebsitePromptSeen = async (userId?: string): Promise<void> => {
  await updateOnboardingState(
    { hasSeenWebsitePrompt: true },
    userId
  );
};

/**
 * Reset onboarding state (for testing or user preference)
 */
export const resetOnboardingState = async (userId?: string): Promise<void> => {
  await updateOnboardingState(
    {
      hasCompletedAppOnboarding: false,
      hasSeenWebsitePrompt: false
    },
    userId
  );
};
