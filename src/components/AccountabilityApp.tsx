'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Target, 
  MessageCircle, 
  TrendingUp, 
  Award, 
  Users, 
  ArrowRight,
  ArrowLeft,
  Zap,
  Heart,
  BookOpen,
  Dumbbell,
  Brain,
  Star,
  Flame,
  Crown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Play,
  Pause,
  ChevronRight,
  Shield,
  Smartphone,
  Calendar,
  AlertCircle,
  CheckSquare,
  RefreshCw
} from 'lucide-react';

type ScreenType = 'splash' | 'welcome' | 'onboarding' | 'signup' | 'login' | 'planSelection';

interface OnboardingStep {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  features: string[];
}

interface LoginForm {
  email: string;
  password: string;
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
}

const AccountabilityApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState<SignupForm>({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-advance splash screen
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('welcome'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const onboardingSteps: OnboardingStep[] = [
    {
      title: "Set Your Goals",
      subtitle: "Choose what matters most to you",
      icon: Target,
      color: "from-purple-600 to-blue-600",
      description: "Track fitness, education, habits, and mental health goals with personalized targets.",
      features: ["Daily goal tracking", "Custom categories", "Flexible scheduling"]
    },
    {
      title: "AI Coach Support", 
      subtitle: "Your personal accountability partner",
      icon: MessageCircle,
      color: "from-blue-600 to-teal-600",
      description: "Get daily check-ins, motivational messages, and insights via WhatsApp or SMS.",
      features: ["Smart check-ins", "Pattern recognition", "Empathetic responses"]
    },
    {
      title: "Build Streaks & Level Up",
      subtitle: "Gamify your progress",
      icon: Flame,
      color: "from-orange-600 to-red-600", 
      description: "Earn XP, unlock badges, and maintain streaks that keep you motivated every day.",
      features: ["XP & levels", "Streak tracking", "Achievement badges"]
    },
    {
      title: "Track Your Growth",
      subtitle: "See your transformation",
      icon: TrendingUp,
      color: "from-green-600 to-emerald-600",
      description: "Visual analytics show your patterns, progress, and areas for improvement.",
      features: ["Progress charts", "Behavioral insights", "Success metrics"]
    }
  ];

  const renderSplashScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-16 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500"></div>
      </div>
      
      <div className="text-center z-10 px-8">
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-3xl mb-8 animate-bounce">
          <Target className="w-16 h-16 text-white mx-auto" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
          Accountability
        </h1>
        <h2 className="text-3xl font-bold text-white/90 mb-2 animate-fade-in delay-300">
          On Autopilot
        </h2>
        <p className="text-white/80 text-lg animate-fade-in delay-500">
          Your AI-powered discipline coach
        </p>
        
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <div 
                key={i}
                className={`w-2 h-2 bg-white/60 rounded-full animate-pulse`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl mb-8">
          <Target className="w-12 h-12 text-white mx-auto" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Your
          <br />
          Accountability Journey
        </h1>
        
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Transform your goals into habits with AI-powered coaching and daily accountability
        </p>

        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={() => setCurrentScreen('onboarding')}
            className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all flex items-center justify-center group"
          >
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => setCurrentScreen('login')}
            className="w-full border-2 border-white/30 text-white py-4 px-6 rounded-xl font-semibold hover:bg-white/10 transition-all"
          >
            I Already Have an Account
          </button>
        </div>

        <div className="mt-8 flex items-center space-x-8 text-white/80">
          <div className="text-center">
            <div className="text-2xl font-bold">50K+</div>
            <div className="text-sm">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">4.8⭐</div>
            <div className="text-sm">App Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOnboardingScreen = () => {
    const step = onboardingSteps[onboardingStep];
    const IconComponent = step.icon;
    
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Progress bar */}
        <div className="bg-gray-100 h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 transition-all duration-500 ease-out"
            style={{ width: `${((onboardingStep + 1) / onboardingSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col px-8 py-12">
          <div className="text-center mb-8">
            <div className={`bg-gradient-to-r ${step.color} p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {step.title}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {step.subtitle}
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">
              {step.description}
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4 mb-12">
            {step.features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => onboardingStep > 0 ? setOnboardingStep(onboardingStep - 1) : setCurrentScreen('welcome')}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              
              <div className="flex space-x-2">
                {onboardingSteps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === onboardingStep ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <span className="text-gray-500 text-sm">
                {onboardingStep + 1} of {onboardingSteps.length}
              </span>
            </div>

            <button
              onClick={() => {
                if (onboardingStep < onboardingSteps.length - 1) {
                  setOnboardingStep(onboardingStep + 1);
                } else {
                  setCurrentScreen('signup');
                }
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center group"
            >
              {onboardingStep < onboardingSteps.length - 1 ? 'Continue' : 'Get Started'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSignupScreen = () => (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-8 py-12">
        <button 
          onClick={() => setCurrentScreen('onboarding')}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Join thousands achieving their goals</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={signupForm.name}
              onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={signupForm.email}
                onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={signupForm.password}
                onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentScreen('planSelection')}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity mb-6"
        >
          Create Account
        </button>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Or continue with</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50">
              <div className="w-5 h-5 bg-blue-600 rounded mr-2"></div>
              <span className="font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50">
              <div className="w-5 h-5 bg-black rounded mr-2"></div>
              <span className="font-medium">Apple</span>
            </button>
          </div>

          <p className="text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => setCurrentScreen('login')}
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderLoginScreen = () => (
    <div className="min-h-screen bg-white flex flex-col justify-center">
      <div className="px-8">
        <button 
          onClick={() => setCurrentScreen('welcome')}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue your journey</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button className="text-sm text-purple-600 hover:underline">
              Forgot password?
            </button>
          </div>
        </div>

        <button
          onClick={() => alert('Login successful! (This would connect to your Firebase auth)')}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity mb-6"
        >
          Sign In
        </button>

        <div className="text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <button 
              onClick={() => setCurrentScreen('signup')}
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderPlanSelection = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <button 
          onClick={() => setCurrentScreen('signup')}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
          <p className="text-gray-600">Start free, upgrade anytime</p>
        </div>

        <div className="space-y-4 mb-8">
          {[
            {
              name: 'Free',
              price: '£0',
              period: 'Forever',
              features: ['Basic habit tracking', 'Streaks & XP', 'Simple reminders'],
              color: 'border-gray-200',
              popular: false
            },
            {
              name: 'Standard',
              price: '£4.99',
              period: 'per month',
              features: ['Everything in Free', 'Daily AI WhatsApp check-ins', 'Weekly progress reports', 'Smart insights'],
              color: 'border-blue-500 ring-2 ring-blue-100',
              popular: true
            },
            {
              name: 'Premium',
              price: '£14.99',
              period: 'per month',
              features: ['Everything in Standard', 'Custom AI coaching', 'Voice notes', 'Human coach support'],
              color: 'border-purple-500',
              popular: false
            }
          ].map((plan, idx) => (
            <div key={idx} className={`relative bg-white rounded-2xl p-6 border-2 ${plan.color}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="text-2xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
                  </div>
                </div>
                <button 
                  onClick={() => alert(`Selected ${plan.name} plan! This would connect to payment processing.`)}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {idx === 0 ? 'Start Free' : 'Choose Plan'}
                </button>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Free 7-day trial for paid plans • Cancel anytime</p>
        </div>
      </div>
    </div>
  );

  // Screen routing
  switch (currentScreen) {
    case 'splash':
      return renderSplashScreen();
    case 'welcome':
      return renderWelcomeScreen();
    case 'onboarding':
      return renderOnboardingScreen();
    case 'signup':
      return renderSignupScreen();
    case 'login':
      return renderLoginScreen();
    case 'planSelection':
      return renderPlanSelection();
    default:
      return renderSplashScreen();
  }
};

export default AccountabilityApp;
