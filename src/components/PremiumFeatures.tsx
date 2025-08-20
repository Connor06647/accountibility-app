import React, { useState } from 'react';
import { 
  Crown, 
  Users, 
  Calendar, 
  BarChart3, 
  Zap, 
  Shield, 
  Smartphone,
  Star,
  CheckCircle,
  Lock
} from 'lucide-react';
import ProfessionalButton from './ui/button-enhanced';
import ProfessionalCard from './ui/card-enhanced';

interface PremiumFeaturesProps {
  userTier: 'free' | 'standard' | 'premium';
  onUpgrade: (tier: 'standard' | 'premium') => void;
  onClose?: () => void;
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ 
  onUpgrade, 
  onClose 
}) => {
  const [selectedTier, setSelectedTier] = useState<'standard' | 'premium'>('standard');

  const features = {
    free: {
      goals: 2,
      analytics: 'Basic',
      support: 'Community',
      features: [
        'Basic goal tracking',
        'Simple check-ins',
        'Basic progress view',
        'Community support'
      ]
    },
    standard: {
      goals: 5,
      analytics: 'Advanced',
      support: 'Email',
      features: [
        'Up to 5 goals',
        'Advanced analytics & insights',
        'Custom goal categories',
        'Weekly progress reports',
        'Email support',
        'Goal templates library',
        'Streak achievements',
        'Export data (CSV)'
      ]
    },
    premium: {
      goals: 'Unlimited',
      analytics: 'Pro + AI Insights',
      support: 'Priority',
      features: [
        'Unlimited goals',
        'AI-powered insights & recommendations',
        'Habit correlation analysis',
        'Social accountability features',
        'Custom reminder schedules',
        'Advanced reporting & charts',
        'Mobile app access',
        'Priority support',
        'Team/family sharing',
        'Integration with fitness apps',
        'Personalized coaching tips',
        'White-label options'
      ]
    }
  };

  const pricing = {
    standard: { monthly: 9.99, yearly: 99.99 },
    premium: { monthly: 19.99, yearly: 199.99 }
  };

  const testimonials = [
    {
      name: "Sarah M.",
      tier: "Premium",
      text: "The AI insights helped me identify patterns I never noticed. I've achieved more in 3 months than in the past year!",
      achievement: "Lost 25 lbs, learned Spanish"
    },
    {
      name: "Mike R.",
      tier: "Standard", 
      text: "The advanced analytics keep me motivated. Seeing my progress trends makes all the difference.",
      achievement: "Read 52 books this year"
    },
    {
      name: "Lisa K.",
      tier: "Premium",
      text: "Social accountability changed everything. My family keeps me on track and celebrates my wins!",
      achievement: "Morning routine for 180 days"
    }
  ];

  const exclusiveFeatures = [
    {
      title: "AI-Powered Insights",
      description: "Get personalized recommendations based on your patterns and successful users like you",
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      tier: "premium",
      benefit: "Increase success rate by 40%"
    },
    {
      title: "Social Accountability",
      description: "Share goals with friends, family, or accountability partners for extra motivation",
      icon: <Users className="w-8 h-8 text-blue-500" />,
      tier: "premium", 
      benefit: "3x more likely to achieve goals"
    },
    {
      title: "Advanced Analytics",
      description: "Deep insights into your habits, correlations, and optimal timing for maximum success",
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      tier: "standard",
      benefit: "Spot patterns 10x faster"
    },
    {
      title: "Mobile App Access",
      description: "Track on-the-go with our native mobile app, offline sync, and push notifications",
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
      tier: "premium",
      benefit: "Never miss a check-in"
    },
    {
      title: "Custom Schedules",
      description: "Set unique reminder times and frequencies for each goal to match your lifestyle",
      icon: <Calendar className="w-8 h-8 text-orange-500" />,
      tier: "standard",
      benefit: "Perfect timing, every time"
    },
    {
      title: "Priority Support",
      description: "Get help when you need it with priority email and chat support",
      icon: <Shield className="w-8 h-8 text-red-500" />,
      tier: "premium",
      benefit: "Responses within 4 hours"
    }
  ];

  const ComparisonTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 font-semibold text-gray-900">Features</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-500">Free</th>
            <th className="text-center py-4 px-4 font-semibold text-blue-600">Standard</th>
            <th className="text-center py-4 px-4 font-semibold text-purple-600">Premium</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="py-3 px-4 font-medium text-gray-900">Active Goals</td>
            <td className="py-3 px-4 text-center text-gray-600">2</td>
            <td className="py-3 px-4 text-center text-blue-600">5</td>
            <td className="py-3 px-4 text-center text-purple-600">Unlimited</td>
          </tr>
          <tr>
            <td className="py-3 px-4 font-medium text-gray-900">Analytics</td>
            <td className="py-3 px-4 text-center text-gray-600">Basic</td>
            <td className="py-3 px-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
            <td className="py-3 px-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
          </tr>
          <tr>
            <td className="py-3 px-4 font-medium text-gray-900">AI Insights</td>
            <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-400 mx-auto" /></td>
            <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-400 mx-auto" /></td>
            <td className="py-3 px-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
          </tr>
          <tr>
            <td className="py-3 px-4 font-medium text-gray-900">Social Features</td>
            <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-400 mx-auto" /></td>
            <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-400 mx-auto" /></td>
            <td className="py-3 px-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
          </tr>
          <tr>
            <td className="py-3 px-4 font-medium text-gray-900">Mobile App</td>
            <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-400 mx-auto" /></td>
            <td className="py-3 px-4 text-center"><Lock className="w-4 h-4 text-gray-400 mx-auto" /></td>
            <td className="py-3 px-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
          </tr>
          <tr>
            <td className="py-3 px-4 font-medium text-gray-900">Support</td>
            <td className="py-3 px-4 text-center text-gray-600">Community</td>
            <td className="py-3 px-4 text-center text-blue-600">Email</td>
            <td className="py-3 px-4 text-center text-purple-600">Priority</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">Unlock Your Full Potential</h2>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join thousands of high achievers who&apos;ve supercharged their accountability with premium features
        </p>
      </div>

      {/* Success Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-blue-600">73%</div>
          <div className="text-sm text-gray-600">Higher goal completion</div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-600">2.5x</div>
          <div className="text-sm text-gray-600">Longer streaks</div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-purple-600">91%</div>
          <div className="text-sm text-gray-600">User satisfaction</div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-orange-600">42%</div>
          <div className="text-sm text-gray-600">Faster progress</div>
        </div>
      </div>

      {/* Premium Features Grid */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-gray-900 text-center">Exclusive Premium Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exclusiveFeatures.map((feature, index) => (
            <ProfessionalCard 
              key={index} 
              className={`p-6 border-2 ${
                feature.tier === 'premium' 
                  ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' 
                  : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {feature.icon}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    feature.tier === 'premium' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {feature.tier.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                  <div className={`text-sm font-medium ${
                    feature.tier === 'premium' ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    ✨ {feature.benefit}
                  </div>
                </div>
              </div>
            </ProfessionalCard>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-gray-900 text-center">Choose Your Plan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Standard Plan */}
          <ProfessionalCard 
            className={`p-6 border-2 transition-all cursor-pointer ${
              selectedTier === 'standard' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedTier('standard')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">Standard</h4>
                  <p className="text-gray-600">Perfect for serious goal-setters</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  {selectedTier === 'standard' && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">${pricing.standard.monthly}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <div className="text-sm text-green-600">
                  Save 17% with yearly: ${pricing.standard.yearly}/year
                </div>
              </div>

              <ul className="space-y-2">
                {features.standard.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ProfessionalCard>

          {/* Premium Plan */}
          <ProfessionalCard 
            className={`p-6 border-2 transition-all cursor-pointer relative ${
              selectedTier === 'premium' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => setSelectedTier('premium')}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <span>Premium</span>
                    <Crown className="w-5 h-5 text-yellow-500" />
                  </h4>
                  <p className="text-gray-600">For maximum achievement</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-purple-500 flex items-center justify-center">
                  {selectedTier === 'premium' && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">${pricing.premium.monthly}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <div className="text-sm text-green-600">
                  Save 17% with yearly: ${pricing.premium.yearly}/year
                </div>
              </div>

              <ul className="space-y-2">
                {features.premium.features.slice(0, 8).map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="text-xs text-gray-500 italic">+ 4 more premium features</li>
              </ul>
            </div>
          </ProfessionalCard>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 text-center">Feature Comparison</h3>
        <ProfessionalCard className="p-6">
          <ComparisonTable />
        </ProfessionalCard>
      </div>

      {/* Testimonials */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-gray-900 text-center">What Our Users Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <ProfessionalCard key={index} className="p-6 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    testimonial.tier === 'Premium' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {testimonial.tier}
                  </span>
                </div>
                <p className="text-gray-700 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <div className="font-medium text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-green-600">{testimonial.achievement}</div>
                </div>
              </div>
            </ProfessionalCard>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900">
            Ready to Accelerate Your Success?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join the thousands who&apos;ve transformed their lives with our premium accountability system. 
            Start your 14-day free trial today - no credit card required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ProfessionalButton
            variant="primary"
            size="lg"
            onClick={() => onUpgrade(selectedTier)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
          >
            Start Free Trial - {selectedTier === 'standard' ? 'Standard' : 'Premium'}
          </ProfessionalButton>
          
          {onClose && (
            <ProfessionalButton
              variant="outline"
              onClick={onClose}
              className="px-6 py-2"
            >
              Maybe Later
            </ProfessionalButton>
          )}
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            ✓ 14-day free trial ✓ Cancel anytime ✓ No setup fees
          </p>
          <p className="text-xs text-gray-400">
            Over 10,000 goals achieved this month
          </p>
        </div>
      </div>

      {/* Money-back guarantee */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Shield className="w-6 h-6 text-green-600" />
          <span className="font-semibold text-green-900">30-Day Money-Back Guarantee</span>
        </div>
        <p className="text-green-700 text-sm">
          Not seeing results? Get a full refund within 30 days, no questions asked.
        </p>
      </div>
    </div>
  );
};
