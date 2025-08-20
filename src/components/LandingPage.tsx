import React, { useState, useEffect } from 'react';
import { CheckCircle, Target, Star, ArrowRight, Play, BarChart3, Calendar, Award, Smartphone } from 'lucide-react';
import ProfessionalButton from './ui/button-enhanced';
import ProfessionalCard from './ui/card-enhanced';
import PWAInstallInstructions from './ui/pwa-install-instructions';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const LandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      // Show beautiful instructions modal instead of navigating
      setShowInstructions(true);
    }
  };

  const handleTryDemo = () => {
    router.push('/app/demo');
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Manager", 
      avatar: "SC",
      text: "I've tried countless goal-tracking apps, but this one actually keeps me accountable. The daily check-ins make all the difference!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Fitness Coach",
      avatar: "MR", 
      text: "My clients love the progress tracking. It's helped them achieve their fitness goals 3x faster than before.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Student",
      avatar: "EW",
      text: "Finally hit my study goals consistently! The streak feature is so motivating.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Goal Setting",
      description: "Create meaningful goals with AI-powered suggestions and proven frameworks"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Daily Check-ins",
      description: "Build consistency with reflective daily check-ins that track your progress"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Visualize your progress with detailed charts and insights"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Achievement System",
      description: "Stay motivated with streaks, badges, and celebration milestones"
    }
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "2 active goals",
        "Basic progress tracking", 
        "Daily check-ins",
        "7-day history"
      ],
      cta: "Get Started Free",
      highlighted: false
    },
    {
      name: "Standard", 
      price: "$9.99",
      period: "/month",
      description: "For serious goal achievers",
      features: [
        "Unlimited goals",
        "Advanced analytics",
        "30-day history",
        "Goal templates",
        "Email reminders"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Premium",
      price: "$19.99", 
      period: "/month",
      description: "For maximum accountability",
      features: [
        "Everything in Standard",
        "AI-powered insights",
        "Social features",
        "Data export",
        "Priority support"
      ],
      cta: "Start Free Trial",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Accountability On Autopilot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <ProfessionalButton variant="primary" size="sm" onClick={handleInstallPWA}>
                {isInstallable ? 'Install App' : 'Get App'}
              </ProfessionalButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Achieve Your Goals
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {" "}3x Faster
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The only accountability app that combines daily check-ins, progress tracking, and AI-powered insights 
                to help you build lasting habits and achieve meaningful goals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ProfessionalButton variant="primary" size="lg" className="text-lg px-8 py-4" onClick={handleInstallPWA}>
                <span className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span>{isInstallable ? 'Install App Free' : 'Get the App Free'}</span>
                  <ArrowRight className="w-5 h-5" />
                </span>
              </ProfessionalButton>
              <ProfessionalButton variant="outline" size="lg" className="text-lg px-8 py-4" onClick={handleTryDemo}>
                <span className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Try Web Demo</span>
                </span>
              </ProfessionalButton>
            </div>

            <div className="pt-8">
              <p className="text-sm text-gray-500 mb-4">Trusted by goal achievers worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                {/* Social proof stats */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">89%</div>
                  <div className="text-sm text-gray-600">Goal Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you stay accountable and achieve your most important goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ProfessionalCard key={index} className="text-center p-8 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </ProfessionalCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How it works</h2>
            <p className="text-lg text-gray-600">Simple, proven steps to achieve your goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Set Your Goals",
                description: "Define clear, measurable goals with our smart goal-setting framework"
              },
              {
                step: "2", 
                title: "Daily Check-ins",
                description: "Rate your progress and reflect on your journey with quick daily check-ins"
              },
              {
                step: "3",
                title: "Track & Achieve",
                description: "Monitor your progress with detailed analytics and celebrate your wins"
              }
            ].map((step, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-16">What our users say</h2>
          
          <div className="space-y-8">
            <ProfessionalCard className="p-8">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-gray-700 mb-6">
                &ldquo;{testimonials[currentTestimonial].text}&rdquo;
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </ProfessionalCard>

            <div className="flex justify-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-600">Choose the plan that&apos;s right for your goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <ProfessionalCard 
                key={index} 
                className={`p-8 relative ${tier.highlighted ? 'ring-2 ring-blue-500 scale-105' : ''}`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-gray-900">
                      {tier.price}<span className="text-lg text-gray-600">{tier.period}</span>
                    </div>
                    <p className="text-gray-600">{tier.description}</p>
                  </div>
                  
                  <ul className="space-y-3 text-left">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <ProfessionalButton 
                    variant={tier.highlighted ? "primary" : "outline"} 
                    size="lg" 
                    className="w-full"
                    onClick={handleInstallPWA}
                  >
                    {tier.cta}
                  </ProfessionalButton>
                </div>
              </ProfessionalCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to achieve your goals?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of people who are already crushing their goals with accountability.
          </p>
          <ProfessionalButton variant="secondary" size="lg" className="text-lg px-8 py-4" onClick={handleInstallPWA}>
            <span className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>{isInstallable ? 'Install App - Free' : 'Get App - Free'}</span>
              <ArrowRight className="w-5 h-5" />
            </span>
          </ProfessionalButton>
          <p className="text-sm mt-4 opacity-75">Free to install • Works on all devices • No app store required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-semibold">Accountability On Autopilot</span>
              </div>
              <p className="text-gray-400">
                The most effective way to achieve your goals through daily accountability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/download" className="hover:text-white transition-colors">Get App</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Accountability On Autopilot. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* PWA Install Instructions Modal */}
      <PWAInstallInstructions 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </div>
  );
};

export default LandingPage;
