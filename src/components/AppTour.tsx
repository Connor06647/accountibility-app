'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Target, CheckCircle, BarChart3, Settings, Play } from 'lucide-react';

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
    description: 'This is where you\'ll create and manage your goals. Click "Add New Goal" to set up your first accountability goal and start tracking your progress.',
    target: '[data-tour="goals-section"]',
    position: 'top',
    icon: <Target className="w-5 h-5" />,
    action: 'Try clicking "Add New Goal" to create your first goal!'
  },
  {
    id: 'checkins-section',
    title: 'Daily Check-ins ✅',
    description: 'Your daily check-ins are the heart of accountability. Rate your progress, write reflections, and build your consistency streak. The more honest you are, the better your results!',
    target: '[data-tour="checkins-section"]',
    position: 'top',
    icon: <CheckCircle className="w-5 h-5" />,
    action: 'Complete a check-in to start building your streak!'
  },
  {
    id: 'sidebar-navigation',
    title: 'Easy Navigation 🧭',
    description: 'Use the sidebar to navigate between Dashboard, Goals, Check-ins, Progress tracking, and Settings. Everything is just one click away!',
    target: '[data-tour="sidebar"]',
    position: 'right',
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 'settings-menu',
    title: 'Customize Your Experience ⚙️',
    description: 'In Settings, you can customize themes, manage notifications, upgrade your plan, and access this tour again anytime. Make the app work perfectly for you!',
    target: '[data-tour="settings-button"]',
    position: 'left',
    icon: <Settings className="w-5 h-5" />,
    action: 'You can always find "View App Tour" in Settings!'
  }
];

export const AppTour: React.FC<AppTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

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
        
        // Tooltip dimensions (approximate)
        const tooltipWidth = 384; // max-w-sm = 24rem = 384px
        const tooltipHeight = 200; // approximate height
        const margin = 20; // minimum margin from viewport edge

        // Calculate initial position based on desired position
        let top = 0;
        let left = 0;

        // Calculate base positions
        const positions = {
          bottom: {
            top: rect.bottom + scrollTop + 15,
            left: rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2)
          },
          top: {
            top: rect.top + scrollTop - tooltipHeight - 15,
            left: rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2)
          },
          right: {
            top: rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2),
            left: rect.right + scrollLeft + 15
          },
          left: {
            top: rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2),
            left: rect.left + scrollLeft - tooltipWidth - 15
          }
        };

        // Start with preferred position
        const position = positions[currentStepData.position];
        top = position.top;
        left = position.left;

        // Check if tooltip would go off-screen and adjust
        // Check horizontal bounds
        if (left < margin) {
          left = margin;
        } else if (left + tooltipWidth > viewportWidth - margin) {
          left = viewportWidth - tooltipWidth - margin;
        }

        // Check vertical bounds and switch position if needed
        if (currentStepData.position === 'top' && top < scrollTop + margin) {
          // Switch to bottom if top position goes above viewport
          top = positions.bottom.top;
        } else if (currentStepData.position === 'bottom' && top + tooltipHeight > scrollTop + viewportHeight - margin) {
          // Switch to top if bottom position goes below viewport
          top = positions.top.top;
        }

        // Final vertical bounds check
        if (top < scrollTop + margin) {
          top = scrollTop + margin;
        } else if (top + tooltipHeight > scrollTop + viewportHeight - margin) {
          top = scrollTop + viewportHeight - tooltipHeight - margin;
        }

        setTooltipPosition({ top, left });

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

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour completed
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay with precise cutout for highlighted element */}
      <div className="fixed inset-0 z-[100] transition-opacity duration-300 pointer-events-none">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/75" />
        
        {/* Clear spotlight for current target - no blur, perfect cutout */}
        {targetElement && (
          <div
            className="absolute transition-all duration-500 ease-in-out"
            style={{
              top: targetElement.getBoundingClientRect().top + window.pageYOffset - 12,
              left: targetElement.getBoundingClientRect().left + window.pageXOffset - 12,
              width: targetElement.getBoundingClientRect().width + 24,
              height: targetElement.getBoundingClientRect().height + 24,
              background: 'transparent',
              borderRadius: '16px',
              boxShadow: `
                0 0 0 4px rgba(59, 130, 246, 0.6),
                0 0 0 8px rgba(59, 130, 246, 0.3),
                0 0 0 5000px rgba(0, 0, 0, 0.75)
              `,
              zIndex: 101
            }}
          />
        )}
      </div>

      {/* Tour Tooltip */}
      <div
        className="fixed z-[102] w-96 max-w-[calc(100vw-2rem)]"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 p-6 relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                {currentStepData.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {currentStepData.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Step {currentStep + 1} of {tourSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={skipTour}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-500 dark:text-gray-400" />
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

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={skipTour}
                className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Skip Tour
              </button>
              <button
                onClick={nextStep}
                className="flex items-center space-x-1 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
