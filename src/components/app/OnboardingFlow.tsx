import React, { useState } from 'react';
import { ArrowRight, Target, CheckCircle, Star, Zap } from 'lucide-react';
import ProfessionalButton from '../ui/button-enhanced';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Target className="w-16 h-16 text-blue-600" />,
      title: "Welcome to Your Journey",
      description: "Transform your goals into achievements with our proven accountability system.",
      features: [
        "Set meaningful goals",
        "Track daily progress", 
        "Build lasting habits"
      ]
    },
    {
      icon: <CheckCircle className="w-16 h-16 text-green-600" />,
      title: "Daily Check-ins",
      description: "Stay accountable with quick daily reflections that keep you on track.",
      features: [
        "5-minute daily check-ins",
        "Progress tracking",
        "Habit building"
      ]
    },
    {
      icon: <Star className="w-16 h-16 text-purple-600" />,
      title: "Achieve More",
      description: "Join thousands who've transformed their lives through consistent accountability.",
      features: [
        "Proven success system",
        "Data-driven insights",
        "Community support"
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

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center text-white">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
                index <= currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            {currentStepData.icon}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">
            {currentStepData.title}
          </h1>
          
          <p className="text-lg text-white/90 mb-8">
            {currentStepData.description}
          </p>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className={`text-white/70 hover:text-white transition-colors ${
              currentStep === 0 ? 'invisible' : ''
            }`}
          >
            Back
          </button>

          <ProfessionalButton
            onClick={nextStep}
            variant="secondary"
            size="lg"
            className="px-8"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </ProfessionalButton>

          <button
            onClick={onComplete}
            className="text-white/70 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
