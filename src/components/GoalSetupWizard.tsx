import React, { useState } from 'react';
import { Target, Calendar, BarChart3, CheckCircle, ArrowRight, Sparkles, Clock, TrendingUp, Award } from 'lucide-react';
import ProfessionalButton from './ui/button-enhanced';
import ProfessionalCard from './ui/card-enhanced';
import ProfessionalInput from './ui/input-enhanced';

interface GoalSetupWizardProps {
  onComplete: (data: {
    goals: Array<{ 
      id: string;
      title: string; 
      description: string; 
      category: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      targetValue?: number;
      unit?: string;
    }>;
    preferences: {
      reminderTime: string;
      checkInFrequency: string;
      weeklyReviewDay: string;
    };
  }) => void;
  userTier: 'free' | 'standard' | 'premium';
  onSkip: () => void;
}

export const GoalSetupWizard: React.FC<GoalSetupWizardProps> = ({ 
  onComplete, 
  userTier, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState<Array<{ 
    id: string;
    title: string; 
    description: string; 
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    targetValue?: number;
    unit?: string;
  }>>([]);
  const [preferences, setPreferences] = useState({
    reminderTime: '18:00',
    checkInFrequency: 'daily',
    weeklyReviewDay: 'sunday'
  });
  const [customGoal, setCustomGoal] = useState({
    title: '',
    description: '',
    category: 'Personal',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    targetValue: undefined as number | undefined,
    unit: ''
  });

  const maxGoals = userTier === 'free' ? 2 : userTier === 'standard' ? 5 : 10;

  const goalTemplates = [
    {
      category: 'Health & Fitness',
      icon: '💪',
      color: 'from-green-500 to-emerald-600',
      examples: [
        { 
          title: 'Exercise for 30 minutes', 
          description: 'Build a consistent fitness habit with daily movement',
          frequency: 'daily' as const,
          targetValue: 30,
          unit: 'minutes'
        },
        { 
          title: 'Drink 8 glasses of water', 
          description: 'Stay hydrated throughout the day',
          frequency: 'daily' as const,
          targetValue: 8,
          unit: 'glasses'
        },
        { 
          title: 'Walk 10,000 steps', 
          description: 'Maintain an active lifestyle',
          frequency: 'daily' as const,
          targetValue: 10000,
          unit: 'steps'
        }
      ]
    },
    {
      category: 'Career & Learning',
      icon: '📚',
      color: 'from-blue-500 to-indigo-600',
      examples: [
        { 
          title: 'Learn a new skill', 
          description: 'Invest in your professional development',
          frequency: 'daily' as const,
          targetValue: 60,
          unit: 'minutes'
        },
        { 
          title: 'Read for learning', 
          description: 'Expand your knowledge through books',
          frequency: 'daily' as const,
          targetValue: 30,
          unit: 'minutes'
        },
        { 
          title: 'Complete course modules', 
          description: 'Make progress on online learning',
          frequency: 'weekly' as const,
          targetValue: 2,
          unit: 'modules'
        }
      ]
    },
    {
      category: 'Personal Development',
      icon: '🧘',
      color: 'from-purple-500 to-pink-600',
      examples: [
        { 
          title: 'Practice meditation', 
          description: 'Build mindfulness and reduce stress',
          frequency: 'daily' as const,
          targetValue: 10,
          unit: 'minutes'
        },
        { 
          title: 'Write in journal', 
          description: 'Reflect on your thoughts and experiences',
          frequency: 'daily' as const,
          targetValue: 1,
          unit: 'entry'
        },
        { 
          title: 'Practice gratitude', 
          description: 'Focus on positive aspects of your life',
          frequency: 'daily' as const,
          targetValue: 3,
          unit: 'items'
        }
      ]
    },
    {
      category: 'Creativity & Hobbies',
      icon: '🎨',
      color: 'from-orange-500 to-red-600',
      examples: [
        { 
          title: 'Creative writing', 
          description: 'Express yourself through words',
          frequency: 'daily' as const,
          targetValue: 500,
          unit: 'words'
        },
        { 
          title: 'Practice music instrument', 
          description: 'Develop your musical skills',
          frequency: 'daily' as const,
          targetValue: 30,
          unit: 'minutes'
        },
        { 
          title: 'Draw or sketch', 
          description: 'Improve your artistic abilities',
          frequency: 'daily' as const,
          targetValue: 15,
          unit: 'minutes'
        }
      ]
    }
  ];

  const steps = [
    {
      title: 'Welcome to Goal Setup',
      subtitle: 'Let\'s create your accountability system',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Target className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-900">Ready to achieve your goals?</h3>
            <p className="text-gray-600 max-w-lg mx-auto text-lg">
              Research shows that people who write down their goals are 42% more likely to achieve them. 
              Let&apos;s set you up for success with a personalized accountability system.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Smart Goals</h4>
                <p className="text-blue-700 text-sm">Set measurable, trackable objectives</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Progress Tracking</h4>
                <p className="text-green-700 text-sm">Visual insights into your growth</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Achievements</h4>
                <p className="text-purple-700 text-sm">Celebrate your wins and streaks</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-yellow-800 text-sm">
                <strong>Your plan:</strong> {userTier === 'free' ? 'Free' : userTier === 'standard' ? 'Standard' : 'Premium'} - 
                Up to {maxGoals} goals with {userTier === 'free' ? 'basic' : 'advanced'} tracking
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Choose Your Goals',
      subtitle: `Select up to ${maxGoals} goals to get started`,
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600 text-lg">
              Choose from proven goal templates or create your own. These goals will become your daily/weekly commitments.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 inline-block">
              {goals.length} / {maxGoals} goals selected
            </div>
          </div>

          <div className="space-y-8">
            {goalTemplates.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-xl`}>
                    {category.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">{category.category}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.examples.map((example, exampleIndex) => {
                    const goalId = `${category.category}-${exampleIndex}`;
                    const isSelected = goals.some(g => g.id === goalId);
                    const canSelect = goals.length < maxGoals || isSelected;
                    
                    return (
                      <ProfessionalCard
                        key={exampleIndex}
                        className={`p-4 cursor-pointer transition-all border-2 hover:shadow-lg ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : canSelect 
                              ? 'border-gray-200 hover:border-blue-300' 
                              : 'border-gray-100 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (!canSelect) return;
                          
                          if (isSelected) {
                            setGoals(goals.filter(g => g.id !== goalId));
                          } else {
                            setGoals([...goals, { 
                              id: goalId,
                              ...example, 
                              category: category.category 
                            }]);
                          }
                        }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">{example.frequency}</div>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1">{example.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{example.description}</p>
                            
                            {example.targetValue && (
                              <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                                Target: {example.targetValue} {example.unit}
                              </div>
                            )}
                          </div>
                        </div>
                      </ProfessionalCard>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Custom goal creator */}
          <div className="border-t pt-8">
            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Create Your Own Goal</span>
            </h4>
            
            <ProfessionalCard className="p-6 border-2 border-dashed border-gray-300 hover:border-blue-300 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfessionalInput
                  label="Goal title"
                  placeholder="e.g., Write 500 words daily"
                  value={customGoal.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomGoal({ ...customGoal, title: e.target.value })}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={customGoal.category}
                    onChange={(e) => setCustomGoal({ ...customGoal, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Career & Learning">Career & Learning</option>
                    <option value="Creativity & Hobbies">Creativity & Hobbies</option>
                    <option value="Relationships">Relationships</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={customGoal.frequency}
                    onChange={(e) => setCustomGoal({ ...customGoal, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <ProfessionalInput
                    label="Target (optional)"
                    type="number"
                    placeholder="30"
                    value={customGoal.targetValue?.toString() || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomGoal({ 
                      ...customGoal, 
                      targetValue: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                  <ProfessionalInput
                    label="Unit (optional)"
                    placeholder="minutes"
                    value={customGoal.unit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomGoal({ ...customGoal, unit: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <ProfessionalInput
                  label="Description (optional)"
                  placeholder="What will this goal help you achieve?"
                  value={customGoal.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomGoal({ ...customGoal, description: e.target.value })}
                />
              </div>
              
              <ProfessionalButton
                variant="outline"
                onClick={() => {
                  if (customGoal.title.trim() && goals.length < maxGoals) {
                    const newGoal = {
                      id: `custom-${Date.now()}`,
                      title: customGoal.title.trim(),
                      description: customGoal.description || 'Custom goal',
                      category: customGoal.category,
                      frequency: customGoal.frequency,
                      targetValue: customGoal.targetValue,
                      unit: customGoal.unit || undefined
                    };
                    setGoals([...goals, newGoal]);
                    setCustomGoal({
                      title: '',
                      description: '',
                      category: 'Personal',
                      frequency: 'daily',
                      targetValue: undefined,
                      unit: ''
                    });
                  }
                }}
                disabled={!customGoal.title.trim() || goals.length >= maxGoals}
                className="mt-4"
              >
                Add Custom Goal
              </ProfessionalButton>
            </ProfessionalCard>
          </div>
        </div>
      )
    },
    {
      title: 'Set Your Preferences',
      subtitle: 'Customize your accountability experience',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfessionalCard className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Daily Reminders</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily check-in reminder time
                  </label>
                  <select
                    value={preferences.reminderTime}
                    onChange={(e) => setPreferences({ ...preferences, reminderTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="09:00">9:00 AM - Start strong</option>
                    <option value="12:00">12:00 PM - Midday reflection</option>
                    <option value="18:00">6:00 PM - Evening review</option>
                    <option value="21:00">9:00 PM - Before bed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in frequency
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'daily', label: 'Daily', description: 'Best for building consistent habits' },
                      { value: 'weekly', label: 'Weekly', description: 'Good for longer-term goals' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="frequency"
                          value={option.value}
                          checked={preferences.checkInFrequency === option.value}
                          onChange={(e) => setPreferences({ ...preferences, checkInFrequency: e.target.value })}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">Weekly Reviews</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly review day
                </label>
                <select
                  value={preferences.weeklyReviewDay}
                  onChange={(e) => setPreferences({ ...preferences, weeklyReviewDay: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="sunday">Sunday - Plan the week ahead</option>
                  <option value="friday">Friday - End of work week</option>
                  <option value="saturday">Saturday - Weekend reflection</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  We&apos;ll send you a comprehensive weekly progress summary
                </p>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">Weekly Review Includes:</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Goal completion rates</li>
                  <li>• Streak analysis</li>
                  <li>• Areas for improvement</li>
                  <li>• Next week&apos;s focus areas</li>
                </ul>
              </div>
            </ProfessionalCard>
          </div>
        </div>
      )
    },
    {
      title: 'You\'re All Set!',
      subtitle: 'Ready to start your accountability journey',
      content: (
        <div className="text-center space-y-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold text-gray-900">Congratulations!</h3>
            <p className="text-gray-600 max-w-lg mx-auto text-lg">
              You&apos;ve successfully set up your accountability system. Here&apos;s what happens next:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Your Goals Are Ready</h4>
                <p className="text-sm text-gray-600">You&apos;ve selected {goals.length} goals to track</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Check-ins Activated</h4>
                <p className="text-sm text-gray-600">Daily reminders at {preferences.reminderTime}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Progress Tracking</h4>
                <p className="text-sm text-gray-600">Watch your streaks and analytics grow</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
            <h5 className="font-semibold text-blue-900 mb-3">🎯 Your First Steps:</h5>
            <div className="text-left space-y-2 text-blue-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm">Complete your first check-in today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm">Build a 7-day streak to establish momentum</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm">Review your progress weekly on {preferences.weeklyReviewDay}s</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({ goals, preferences });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return goals.length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-blue-600 scale-125' 
                    : index < currentStep 
                      ? 'bg-blue-400' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors text-sm"
          >
            Skip setup
          </button>
        </div>

        {/* Main content */}
        <ProfessionalCard className="p-8 lg:p-12">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h2>
              <p className="text-xl text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <ProfessionalButton
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </ProfessionalButton>

            <ProfessionalButton
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </ProfessionalButton>
          </div>
        </ProfessionalCard>
      </div>
    </div>
  );
};
