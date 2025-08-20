import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Download, 
  AlertCircle, 
  Eye, 
  Clock,
  Smartphone,
  ArrowRight,
  Lock,
  Wifi
} from 'lucide-react';
import ProfessionalButton from '@/components/ui/button-enhanced';
import ProfessionalCard from '@/components/ui/card-enhanced';

const WebAppDemo: React.FC = () => {
  const [demoTime, setDemoTime] = useState(300); // 5 minutes demo
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Demo countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoTime(prev => {
        if (prev <= 1) {
          setShowUpgradePrompt(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show upgrade prompt every 60 seconds
  useEffect(() => {
    const upgradeTimer = setInterval(() => {
      setShowUpgradePrompt(true);
    }, 60000);

    return () => clearInterval(upgradeTimer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const demoGoals = [
    { id: 1, title: 'Exercise 30 minutes', completed: true, streak: 5 },
    { id: 2, title: 'Read for 20 minutes', completed: false, streak: 3 },
    { id: 3, title: 'Drink 8 glasses of water', completed: true, streak: 2 },
  ];

  const lockedFeatures = [
    'Unlimited goals',
    'Advanced analytics', 
    'Offline access',
    'Push notifications',
    'Custom themes',
    'Data export',
    'Goal sharing',
    'Progress history'
  ];

  if (demoTime === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <ProfessionalCard className="max-w-md w-full p-8 text-center">
          <Clock className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo Time Expired</h2>
          <p className="text-gray-600 mb-6">
            Ready to experience the full power of accountability? Install the app for unlimited access!
          </p>
          <div className="space-y-3">
            <Link href="/download">
              <ProfessionalButton variant="primary" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Install Full App
              </ProfessionalButton>
            </Link>
            <ProfessionalButton 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Try Demo Again
            </ProfessionalButton>
          </div>
        </ProfessionalCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                AccountabilityApp
              </Link>
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Eye className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">DEMO MODE</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-mono">{formatTime(demoTime)}</span>
              </div>
              <Link href="/download">
                <ProfessionalButton variant="primary" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Install App
                </ProfessionalButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <strong>Limited Demo:</strong> This is a preview version with restricted features. Install the app for the complete experience.
            </p>
          </div>
          <Link href="/download" className="text-sm text-yellow-800 underline hover:text-yellow-900">
            Get Full Version →
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProfessionalCard className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Today&apos;s Goals</h2>
              
              <div className="space-y-4">
                {demoGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {goal.completed && <span className="text-white text-sm">✓</span>}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-500">{goal.streak} day streak</p>
                      </div>
                    </div>
                    <ProfessionalButton 
                      variant="outline" 
                      size="sm"
                      disabled={goal.completed}
                    >
                      {goal.completed ? 'Done' : 'Mark Complete'}
                    </ProfessionalButton>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Lock className="w-5 h-5" />
                  <span>Add more goals available in full app</span>
                </div>
              </div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">67%</div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-500">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">--</div>
                  <div className="text-sm text-gray-500">Locked</div>
                </div>
              </div>
            </ProfessionalCard>
          </div>

          {/* Upgrade Sidebar */}
          <div className="space-y-6">
            <ProfessionalCard className="p-6 border-2 border-blue-200 bg-blue-50">
              <div className="text-center mb-4">
                <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">Unlock Full Power</h3>
                <p className="text-sm text-gray-600">Install the app for unlimited features</p>
              </div>
              
              <Link href="/download">
                <ProfessionalButton variant="primary" className="w-full mb-4">
                  <Download className="w-4 h-4 mr-2" />
                  Install App Now
                </ProfessionalButton>
              </Link>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">App-Only Features:</h4>
                <ul className="space-y-1">
                  {lockedFeatures.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Lock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">+ 4 more features</p>
              </div>
            </ProfessionalCard>

            <ProfessionalCard className="p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Why Install the App?</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Wifi className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Works Offline</div>
                    <div className="text-sm text-gray-600">Track goals anywhere</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">No Time Limits</div>
                    <div className="text-sm text-gray-600">Use as much as you want</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Push Notifications</div>
                    <div className="text-sm text-gray-600">Never miss a goal</div>
                  </div>
                </li>
              </ul>
            </ProfessionalCard>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ProfessionalCard className="max-w-md w-full p-6">
            <div className="text-center">
              <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enjoying the Demo?</h3>
              <p className="text-gray-600 mb-6">
                Install the full app to unlock unlimited goals, offline access, and advanced features!
              </p>
              <div className="space-y-3">
                <Link href="/download">
                  <ProfessionalButton variant="primary" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Install Full App
                  </ProfessionalButton>
                </Link>
                <ProfessionalButton 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowUpgradePrompt(false)}
                >
                  Continue Demo
                </ProfessionalButton>
              </div>
            </div>
          </ProfessionalCard>
        </div>
      )}
    </div>
  );
};

export default WebAppDemo;
