// Simple analytics utility for tracking user events
// Replace with your preferred analytics service (Google Analytics, PostHog, etc.)

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

class Analytics {
  private isEnabled: boolean;
  private userId?: string;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'production';
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: AnalyticsEvent) {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', event);
      return;
    }

    // Add your analytics tracking here
    // Example for Google Analytics 4:
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, {
        user_id: this.userId,
        ...event.properties
      });
    }

    // Example for PostHog:
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(event.name, event.properties);
    }
  }

  // Common tracking methods
  trackPageView(page: string) {
    this.track({
      name: 'page_view',
      properties: { page }
    });
  }

  trackGoalCreated() {
    this.track({
      name: 'goal_created',
      properties: { timestamp: new Date().toISOString() }
    });
  }

  trackGoalCompleted(goalId: string) {
    this.track({
      name: 'goal_completed',
      properties: { goal_id: goalId, timestamp: new Date().toISOString() }
    });
  }

  trackCheckInSubmitted(rating: number) {
    this.track({
      name: 'check_in_submitted',
      properties: { rating, timestamp: new Date().toISOString() }
    });
  }

  trackSubscriptionUpgrade(tier: string) {
    this.track({
      name: 'subscription_upgrade',
      properties: { tier, timestamp: new Date().toISOString() }
    });
  }

  trackFeatureUsed(feature: string) {
    this.track({
      name: 'feature_used',
      properties: { feature, timestamp: new Date().toISOString() }
    });
  }

  trackError(error: string, context?: string) {
    this.track({
      name: 'error_occurred',
      properties: { error, context, timestamp: new Date().toISOString() }
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// React hook for easy usage
import { useEffect } from 'react';

export const useAnalytics = () => {
  const trackPageView = (page: string) => {
    analytics.trackPageView(page);
  };

  return {
    trackPageView,
    trackGoalCreated: analytics.trackGoalCreated.bind(analytics),
    trackGoalCompleted: analytics.trackGoalCompleted.bind(analytics),
    trackCheckInSubmitted: analytics.trackCheckInSubmitted.bind(analytics),
    trackSubscriptionUpgrade: analytics.trackSubscriptionUpgrade.bind(analytics),
    trackFeatureUsed: analytics.trackFeatureUsed.bind(analytics),
    trackError: analytics.trackError.bind(analytics)
  };
};

// Page view tracking hook
export const usePageTracking = (page: string) => {
  useEffect(() => {
    analytics.trackPageView(page);
  }, [page]);
};
