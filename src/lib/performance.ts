// Performance monitoring utilities
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== 'undefined';
    
    if (this.isEnabled) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      this.observeMetric('largest-contentful-paint', (entry: any) => {
        this.recordMetric('LCP', entry.startTime);
      });

      // First Input Delay (FID)
      this.observeMetric('first-input', (entry: any) => {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      });

      // Cumulative Layout Shift (CLS)
      this.observeMetric('layout-shift', (entry: any) => {
        if (!entry.hadRecentInput) {
          this.recordMetric('CLS', entry.value);
        }
      });
    }

    // Page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.recordMetric('TTFB', navigation.responseStart - navigation.fetchStart);
          this.recordMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.fetchStart);
        }
      }, 0);
    });
  }

  private observeMetric(type: string, callback: (entry: any) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type, buffered: true });
    } catch (e) {
      console.warn(`Failed to observe ${type}:`, e);
    }
  }

  private recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} = ${value.toFixed(2)}ms`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to your analytics service
    if ((window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        custom_parameter: 'performance'
      });
    }
  }

  // Manual performance tracking
  startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime);
    };
  }

  // Component render time tracking
  trackComponentRender(componentName: string, renderTime: number) {
    this.recordMetric(`Component_${componentName}`, renderTime);
  }

  // API call tracking
  trackAPICall(endpoint: string, duration: number, success: boolean) {
    this.recordMetric(`API_${endpoint}_${success ? 'Success' : 'Error'}`, duration);
  }

  // Get performance report
  getReport(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }
}

// Export singleton
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
import { useEffect, useRef } from 'react';

export const usePerformanceTracking = (componentName: string) => {
  const renderStartTime = useRef<number>();

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    }
  });

  const trackAsyncOperation = (operationName: string) => {
    return performanceMonitor.startTimer(`${componentName}_${operationName}`);
  };

  return { trackAsyncOperation };
};

// HOC for automatic component performance tracking
import React from 'react';

export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const ComponentWithPerformanceTracking: React.FC<P> = (props: P) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    usePerformanceTracking(name);
    
    return React.createElement(WrappedComponent, props);
  };

  ComponentWithPerformanceTracking.displayName = `withPerformanceTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithPerformanceTracking;
};
