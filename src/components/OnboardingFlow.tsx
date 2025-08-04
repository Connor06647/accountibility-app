import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon
} from '@heroicons/react/24/solid';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Accountability On Autopilot",
      subtitle: "Your personal growth companion",
      description: "Transform your daily habits and achieve your goals with our intelligent accountability system designed to keep you motivated and on track.",
      icon: <SparklesIcon className="w-16 h-16 text-blue-500" />,
      features: [
        "Set meaningful goals that matter to you",
        "Track your daily progress automatically", 
        "Get insights into your growth patterns"
      ]
    },
    {
      title: "Smart Goal Tracking",
      subtitle: "Progress made simple",
      description: "Create goals that adapt to your lifestyle. Our system helps you break down big dreams into manageable daily actions.",
      icon: <TrophyIcon className="w-16 h-16 text-yellow-500" />,
      features: [
        "Visual progress tracking with completion animations",
        "Flexible goal categories for all areas of life",
        "Smart reminders that actually help (not annoy)"
      ]
    },
    {
      title: "Daily Check-ins & Reflection",
      subtitle: "Build self-awareness",
      description: "Take a moment each day to reflect on your progress. Our guided check-ins help you stay mindful and motivated.",
      icon: <CheckCircleIcon className="w-16 h-16 text-green-500" />,
      features: [
        "Quick daily rating system (1-10 scale)",
        "Reflection prompts to deepen insights",
        "Streak tracking to build momentum"
      ]
    },
    {
      title: "Analytics & Insights",
      subtitle: "Understand your patterns",
      description: "Discover what works for you with detailed analytics. See your progress trends and identify your peak performance times.",
      icon: <ChartBarIcon className="w-16 h-16 text-purple-500" />,
      features: [
        "Weekly and monthly progress summaries",
        "Goal completion trends and patterns",
        "Personal insights to optimize your routine"
      ]
    },
    {
      title: "Ready to Start Your Journey?",
      subtitle: "Join thousands improving daily",
      description: "Take the first step towards a more accountable, purposeful life. Your future self will thank you for starting today.",
      icon: <BoltIcon className="w-16 h-16 text-orange-500" />,
      features: [
        "Free plan includes 2 goals and basic tracking",
        "Upgrade anytime for unlimited goals and advanced features",
        "Your data is secure and private - always"
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header with Skip button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-blue-600 scale-125' 
                    : index < currentStep 
                      ? 'bg-blue-400' 
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Skip intro
          </button>
        </div>

        {/* Main content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {currentStepData.icon}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {currentStepData.title}
            </h1>
            <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
              {currentStepData.subtitle}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4 mb-12">
            {currentStepData.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep + 1} of {steps.length}
              </span>
            </div>

            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              {!isLastStep && <ChevronRightIcon className="w-5 h-5" />}
              {isLastStep && <BoltIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
