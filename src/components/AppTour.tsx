'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Target, CheckCircle, BarChart3, Settings, Play, TrendingUp } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ReactNode;
  action?: string; // Optional action text
}

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Accountability Dashboard! 👋',
    description: 'This is your personal command center for building better habits and achieving your goals. Let\'s take a quick tour to get you started!',
    target: '[data-tour="dashboard-header"]',
    position: 'bottom',
    icon: <Play className="w-5 h-5" />
  },
  {
    id: 'stats-overview',
    title: 'Your Progress at a Glance 📊',
    description: 'These cards show your key metrics: active goals, total check-ins, current streak, and weekly progress. They update in real-time as you use the app!',
    target: '[data-tour="stats-cards"]',
    position: 'bottom',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: 'goals-section',
    title: 'Your Accountability Goals 🎯',
    description: 'This is where you\'ll create and manage your goals. Click "Goals" in the sidebar to access this powerful feature and start tracking your progress!',
    target: '[data-tour="nav-goals"]',
    position: 'right',
    icon: <Target className="w-5 h-5" />,
    action: 'Try clicking "Goals" to see your goal management page!'
  },
  {
    id: 'checkins-section',
    title: 'Daily Check-ins ✅',
    description: 'Your daily check-ins are the heart of accountability. Click "Check-ins" in the sidebar to rate your progress, write reflections, and build your consistency streak!',
    target: '[data-tour="nav-checkins"]',
    position: 'right',
    icon: <CheckCircle className="w-5 h-5" />,
    action: 'Click "Check-ins" to start building your streak!'
  },
  {
    id: 'progress-section',
    title: 'Track Your Progress 📈',
    description: 'Monitor your journey with detailed analytics and insights. Click "Progress" in the sidebar to see charts, trends, and your improvement over time!',
    target: '[data-tour="nav-progress"]',
    position: 'right',
    icon: <TrendingUp className="w-5 h-5" />,
    action: 'Click "Progress" to see your analytics!'
  },
  {
    id: 'settings-menu',
    title: 'Customize Your Experience ⚙️',
    description: 'In Settings, you can customize themes, manage notifications, upgrade your plan, and access this tour again anytime. Click "Settings" to make the app work perfectly for you!',
    target: '[data-tour="nav-settings"]',
    position: 'right',
    icon: <Settings className="w-5 h-5" />,
    action: 'Click "Settings" to personalize your experience!'
  }
];

export const AppTour: React.FC<AppTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStepData = tourSteps[currentStep];

  // Update target element and position when step changes
  useEffect(() => {
    if (!isOpen) return;

    const updateTargetElement = () => {
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      setTargetElement(element);

      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Dynamic tooltip dimensions based on content
        const tooltipWidth = Math.min(400, viewportWidth - 40); // Responsive width
        const tooltipHeight = 250; // Approximate height with padding
        const margin = 20; // minimum margin from viewport edge

        // Calculate initial position based on desired position
        let top = 0;
        let left = 0;

        // Calculate base positions
        const positions = {
          bottom: {
            top: rect.bottom + scrollTop + 20,
            left: rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2)
          },
          top: {
            top: rect.top + scrollTop - tooltipHeight - 20,
            left: rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2)
          },
          right: {
            top: rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2),
            left: rect.right + scrollLeft + 20
          },
          left: {
            top: rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2),
            left: rect.left + scrollLeft - tooltipWidth - 20
          }
        };

        // Start with preferred position
        const position = positions[currentStepData.position];
        top = position.top;
        left = position.left;

        // Smart position adjustment - check all bounds and find best fit
        const wouldGoOffScreen = {
          top: top < scrollTop + margin,
          bottom: top + tooltipHeight > scrollTop + viewportHeight - margin,
          left: left < margin,
          right: left + tooltipWidth > viewportWidth - margin
        };

        // If horizontal bounds are violated, adjust
        if (wouldGoOffScreen.left) {
          left = margin;
        } else if (wouldGoOffScreen.right) {
          left = viewportWidth - tooltipWidth - margin;
        }

        // If vertical bounds are violated, try switching position
        if (wouldGoOffScreen.top && currentStepData.position === 'top') {
          top = positions.bottom.top;
        } else if (wouldGoOffScreen.bottom && currentStepData.position === 'bottom') {
          top = positions.top.top;
        }

        // Final bounds check with fallback
        if (top < scrollTop + margin) {
          top = scrollTop + margin;
        } else if (top + tooltipHeight > scrollTop + viewportHeight - margin) {
          top = scrollTop + viewportHeight - tooltipHeight - margin;
        }

        // Final vertical bounds check
        if (top < scrollTop + margin) {
          top = scrollTop + margin;
        } else if (top + tooltipHeight > scrollTop + viewportHeight - margin) {
          top = scrollTop + viewportHeight - tooltipHeight - margin;
        }

        setTooltipPosition({ top, left });

        // Determine arrow direction based on tooltip's intended position relative to target
        // The arrow should point FROM the tooltip TOWARD the highlighted element
        let finalArrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
        
        // Use the original intended position, but reverse the arrow logic
        if (currentStepData.position === 'top') {
          finalArrowPosition = 'bottom'; // Tooltip above element, arrow points down to element
        } else if (currentStepData.position === 'bottom') {
          finalArrowPosition = 'top'; // Tooltip below element, arrow points up to element
        } else if (currentStepData.position === 'left') {
          finalArrowPosition = 'right'; // Tooltip left of element, arrow points right to element
        } else if (currentStepData.position === 'right') {
          finalArrowPosition = 'left'; // Tooltip right of element, arrow points left to element
        }

        // If tooltip had to be repositioned due to screen bounds, adjust arrow accordingly
        if (top + tooltipHeight < rect.top + scrollTop && currentStepData.position !== 'top') {
          finalArrowPosition = 'bottom'; // Tooltip ended up above element
        } else if (top > rect.bottom + scrollTop && currentStepData.position !== 'bottom') {
          finalArrowPosition = 'top'; // Tooltip ended up below element
        } else if (left + tooltipWidth < rect.left + scrollLeft && currentStepData.position !== 'left') {
          finalArrowPosition = 'right'; // Tooltip ended up left of element
        } else if (left > rect.right + scrollLeft && currentStepData.position !== 'right') {
          finalArrowPosition = 'left'; // Tooltip ended up right of element
        }

        setArrowPosition(finalArrowPosition);

        // Scroll element into view with better positioning
        const elementTop = rect.top + scrollTop;
        const elementCenter = elementTop + (rect.height / 2);
        const viewportCenter = scrollTop + (viewportHeight / 2);
        
        // Only scroll if element is significantly off-center
        if (Math.abs(elementCenter - viewportCenter) > viewportHeight * 0.3) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    };

    updateTargetElement();
    window.addEventListener('resize', updateTargetElement);
    window.addEventListener('scroll', updateTargetElement);

    return () => {
      window.removeEventListener('resize', updateTargetElement);
      window.removeEventListener('scroll', updateTargetElement);
    };
  }, [currentStep, isOpen, currentStepData.target, currentStepData.position]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && currentStep < tourSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentStep, onClose]);

  // Disable scrolling when tour is active
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.overflow = originalStyle;
        document.documentElement.style.overflow = '';
      };
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      // Add smooth transition effect
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    } else {
      // Tour completed with celebration
      setIsTransitioning(true);
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Add smooth transition effect
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay with rectangular cut-out spotlight */}
      <div className="fixed inset-0 z-[100] transition-opacity duration-300 pointer-events-none">
        {/* Cut-out overlay that lets content show through at full brightness */}
        {targetElement && (
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              clipPath: `polygon(
                0% 0%, 
                0% 100%, 
                ${targetElement.getBoundingClientRect().left + window.pageXOffset - 20}px 100%, 
                ${targetElement.getBoundingClientRect().left + window.pageXOffset - 20}px ${targetElement.getBoundingClientRect().top + window.pageYOffset - 20}px, 
                ${targetElement.getBoundingClientRect().right + window.pageXOffset + 20}px ${targetElement.getBoundingClientRect().top + window.pageYOffset - 20}px, 
                ${targetElement.getBoundingClientRect().right + window.pageXOffset + 20}px ${targetElement.getBoundingClientRect().bottom + window.pageYOffset + 20}px, 
                ${targetElement.getBoundingClientRect().left + window.pageXOffset - 20}px ${targetElement.getBoundingClientRect().bottom + window.pageYOffset + 20}px, 
                ${targetElement.getBoundingClientRect().left + window.pageXOffset - 20}px 100%, 
                100% 100%, 
                100% 0%
              )`
            }}
          />
        )}
        
        {/* Clean blue border highlight around highlighted area */}
        {targetElement && (
          <div
            className="absolute transition-all duration-300 ease-in-out pointer-events-none"
            style={{
              top: targetElement.getBoundingClientRect().top + window.pageYOffset - 10,
              left: Math.max(10, targetElement.getBoundingClientRect().left + window.pageXOffset - 10),
              width: Math.min(
                targetElement.getBoundingClientRect().width + 20,
                window.innerWidth - Math.max(10, targetElement.getBoundingClientRect().left + window.pageXOffset - 10) - 10
              ),
              height: targetElement.getBoundingClientRect().height + 20,
              borderRadius: '12px',
              border: '3px solid #3B82F6',
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.15), rgba(147, 197, 253, 0.25))',
              boxShadow: `
                0 0 30px rgba(59, 130, 246, 0.6),
                0 0 60px rgba(59, 130, 246, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.2)
              `,
              zIndex: 101
            }}
          />
        )}
      </div>

      {/* Enhanced Tour Tooltip */}
      <div
        className="fixed z-[102] w-full max-w-md mx-4"
        style={{
          top: tooltipPosition.top,
          left: Math.max(20, Math.min(tooltipPosition.left, window.innerWidth - 400 - 20))
        }}
      >
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 p-6 relative backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
          {/* Arrows pointing to the center of the highlighted element */}
          {targetElement && arrowPosition === 'top' && (
            <div 
              className="absolute -top-3"
              style={{
                left: Math.max(12, Math.min(
                  (targetElement.getBoundingClientRect().left + targetElement.getBoundingClientRect().width / 2) - 
                  Math.max(20, Math.min(tooltipPosition.left, window.innerWidth - 400 - 20)),
                  400 - 32 - 12 // tooltip width - padding - arrow width
                ))
              }}
            >
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800 drop-shadow-lg"></div>
            </div>
          )}
          {targetElement && arrowPosition === 'bottom' && (
            <div 
              className="absolute -bottom-3"
              style={{
                left: Math.max(12, Math.min(
                  (targetElement.getBoundingClientRect().left + targetElement.getBoundingClientRect().width / 2) - 
                  Math.max(20, Math.min(tooltipPosition.left, window.innerWidth - 400 - 20)),
                  400 - 32 - 12 // tooltip width - padding - arrow width
                ))
              }}
            >
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800 drop-shadow-lg"></div>
            </div>
          )}
          {targetElement && arrowPosition === 'left' && (
            <div 
              className="absolute -left-3"
              style={{
                top: Math.max(12, Math.min(
                  (targetElement.getBoundingClientRect().top + targetElement.getBoundingClientRect().height / 2) - tooltipPosition.top,
                  250 - 24 - 12 // approximate tooltip height - padding - arrow height
                ))
              }}
            >
              <div className="w-0 h-0 border-t-[12px] border-b-[12px] border-r-[12px] border-t-transparent border-b-transparent border-r-white dark:border-r-gray-800 drop-shadow-lg"></div>
            </div>
          )}
          {targetElement && arrowPosition === 'right' && (
            <div 
              className="absolute -right-3"
              style={{
                top: Math.max(12, Math.min(
                  (targetElement.getBoundingClientRect().top + targetElement.getBoundingClientRect().height / 2) - tooltipPosition.top,
                  250 - 24 - 12 // approximate tooltip height - padding - arrow height
                ))
              }}
            >
              <div className="w-0 h-0 border-t-[12px] border-b-[12px] border-l-[12px] border-t-transparent border-b-transparent border-l-white dark:border-l-gray-800 drop-shadow-lg"></div>
            </div>
          )}
          
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                {currentStepData.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                  {currentStepData.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Step {currentStep + 1} of {tourSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={skipTour}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors flex-shrink-0"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {currentStepData.description}
            </p>
            {currentStepData.action && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  💡 {currentStepData.action}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Progress Bar with Step Indicators */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Tour Progress</span>
              <span className="font-medium">{Math.round(((currentStep + 1) / tourSteps.length) * 100)}% Complete</span>
            </div>
            
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-blue-500 scale-110'
                      : index === currentStep
                      ? 'bg-blue-400 scale-125 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'bg-gray-300 dark:bg-gray-600 scale-100'
                  }`}
                />
              ))}
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || isTransitioning}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={skipTour}
                disabled={isTransitioning}
                className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Skip Tour
              </button>
              <button
                onClick={nextStep}
                disabled={isTransitioning}
                className="flex items-center space-x-1 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:transform-none"
              >
                {isTransitioning ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{currentStep === tourSteps.length - 1 ? 'Complete Tour! 🎉' : 'Next'}</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
