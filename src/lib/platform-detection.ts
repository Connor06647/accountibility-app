/**
 * Platform detection utilities for distinguishing between App (PWA) and Website usage
 */

export interface PlatformInfo {
  isApp: boolean;
  isWebsite: boolean;
  platformType: 'app' | 'website';
  displayMode: 'standalone' | 'browser' | 'minimal-ui' | 'fullscreen';
}

/**
 * Detects if the app is running as an installed PWA (App) or in a browser (Website)
 */
export const detectPlatform = (): PlatformInfo => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      isApp: false,
      isWebsite: true,
      platformType: 'website',
      displayMode: 'browser'
    };
  }

  // Check if running in standalone mode (PWA installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Additional checks for different PWA contexts
  const isInStandaloneMode = isStandalone || 
                             (window.navigator as any)?.standalone || 
                             document.referrer.includes('android-app://');

  // Determine display mode
  let displayMode: 'standalone' | 'browser' | 'minimal-ui' | 'fullscreen' = 'browser';
  if (window.matchMedia('(display-mode: standalone)').matches) {
    displayMode = 'standalone';
  } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    displayMode = 'minimal-ui';
  } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
    displayMode = 'fullscreen';
  }

  const isApp = isInStandaloneMode;
  const isWebsite = !isApp;

  return {
    isApp,
    isWebsite,
    platformType: isApp ? 'app' : 'website',
    displayMode
  };
};

/**
 * Hook to get platform information with reactive updates
 */
export const usePlatformDetection = () => {
  const [platformInfo, setPlatformInfo] = React.useState<PlatformInfo>(() => detectPlatform());

  React.useEffect(() => {
    const updatePlatformInfo = () => {
      setPlatformInfo(detectPlatform());
    };

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', updatePlatformInfo);

    return () => {
      mediaQuery.removeEventListener('change', updatePlatformInfo);
    };
  }, []);

  return platformInfo;
};

// For components that need React import
import React from 'react';
