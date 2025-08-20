import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Smartphone, 
  Download, 
  Shield, 
  Zap, 
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Wifi,
  Apple,
  PlayCircle
} from 'lucide-react';
import ProfessionalButton from '@/components/ui/button-enhanced';
import ProfessionalCard from '@/components/ui/card-enhanced';
import PWAInstallInstructions from '@/components/ui/pwa-install-instructions';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AppDownloadPage: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      window.location.href = '/app';
    }

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
      // Show beautiful instructions modal instead of alert
      setShowInstructions(true);
    }
  };

  const handleAppStoreDownload = () => {
    // For now, show coming soon message for native apps
    alert('Native iOS app coming soon! For now, you can install the PWA version using the "Install App" button above.');
  };

  const handleGooglePlayDownload = () => {
    // For now, show coming soon message for native apps
    alert('Native Android app coming soon! For now, you can install the PWA version using the "Install App" button above.');
  };

  const appBenefits = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Instant loading with app-like performance"
    },
    {
      icon: <Wifi className="w-6 h-6 text-blue-500" />,
      title: "Works Offline",
      description: "Track goals even without internet connection"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "Secure & Private",
      description: "Your data stays safe and private"
    },
    {
      icon: <Star className="w-6 h-6 text-purple-500" />,
      title: "App Experience",
      description: "Install like a real app, works like one too"
    }
  ];

  const features = [
    "Real-time goal tracking",
    "Offline functionality", 
    "App-like experience",
    "Advanced analytics",
    "Custom themes",
    "Data export",
    "Quick access",
    "No app store needed"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AccountabilityApp
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Smartphone className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Install the <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">App</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get the full app experience! Install our Progressive Web App for fast, reliable access to all your accountability tools.
            </p>
          </div>

          {/* App Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {appBenefits.map((benefit, index) => (
              <ProfessionalCard key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </ProfessionalCard>
            ))}
          </div>

          {/* Install Button */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <ProfessionalButton 
                variant="primary" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={handleInstallPWA}
              >
                <Download className="w-5 h-5 mr-2" />
                {isInstallable ? 'Install App Now' : 'Get App'}
              </ProfessionalButton>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Works on all devices • No app store required • Instant installation
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <p className="text-sm text-gray-500">Coming soon to:</p>
                <div className="flex gap-3">
                  <ProfessionalButton 
                    variant="outline" 
                    size="sm" 
                    className="text-sm px-4 py-2"
                    onClick={handleAppStoreDownload}
                  >
                    <Apple className="w-4 h-4 mr-1" />
                    App Store
                  </ProfessionalButton>
                  <ProfessionalButton 
                    variant="outline" 
                    size="sm" 
                    className="text-sm px-4 py-2"
                    onClick={handleGooglePlayDownload}
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Google Play
                  </ProfessionalButton>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link href="/app/demo">
                <ProfessionalButton variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Globe className="w-5 h-5 mr-2" />
                  Try Limited Web Version
                </ProfessionalButton>
              </Link>
              <p className="text-sm text-gray-500 mt-2">
                For the full experience, install the app above.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Free to install • Works on all devices • No app store required
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose the App Over Web?
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* App Version */}
            <ProfessionalCard className="p-8 border-2 border-blue-200 bg-blue-50">
              <div className="text-center mb-6">
                <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">📱 Installed App (PWA)</h3>
                <p className="text-blue-600 font-semibold">Complete Experience</p>
              </div>
              
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <ProfessionalButton 
                  variant="primary" 
                  className="w-full"
                  onClick={handleInstallPWA}
                >
                  {isInstallable ? 'Install App Now' : 'Get App'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </ProfessionalButton>
              </div>
            </ProfessionalCard>

            {/* Web Version */}
            <ProfessionalCard className="p-8 border border-gray-200">
              <div className="text-center mb-6">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🌐 Web Version</h3>
                <p className="text-gray-500 font-semibold">Limited Preview</p>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center space-x-3 opacity-50">
                  <CheckCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">Basic goal viewing</span>
                </li>
                <li className="flex items-center space-x-3 opacity-50">
                  <CheckCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">Simple check-ins</span>
                </li>
                <li className="flex items-center space-x-3 opacity-30">
                  <span className="w-5 h-5 flex-shrink-0 text-red-400">✗</span>
                  <span className="text-gray-400 line-through">Offline access</span>
                </li>
                <li className="flex items-center space-x-3 opacity-30">
                  <span className="w-5 h-5 flex-shrink-0 text-red-400">✗</span>
                  <span className="text-gray-400 line-through">Push notifications</span>
                </li>
                <li className="flex items-center space-x-3 opacity-30">
                  <span className="w-5 h-5 flex-shrink-0 text-red-400">✗</span>
                  <span className="text-gray-400 line-through">Advanced analytics</span>
                </li>
                <li className="flex items-center space-x-3 opacity-30">
                  <span className="w-5 h-5 flex-shrink-0 text-red-400">✗</span>
                  <span className="text-gray-400 line-through">Premium features</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link href="/app/demo">
                  <ProfessionalButton variant="outline" className="w-full">
                    Try Limited Version
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </ProfessionalButton>
                </Link>
              </div>
            </ProfessionalCard>
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How to Install
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Click Install</h3>
              <p className="text-gray-600">Tap the &quot;Install App Now&quot; button above</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Confirm Install</h3>
              <p className="text-gray-600">Your browser will ask for permission</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enjoy Full Access</h3>
              <p className="text-gray-600">Launch from your home screen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for the Complete Experience?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who&apos;ve unlocked their potential with our full app experience
          </p>
          <ProfessionalButton 
            variant="secondary" 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={handleInstallPWA}
          >
            <Download className="w-5 h-5 mr-2" />
            Install App - It&apos;s Free!
          </ProfessionalButton>
        </div>
      </section>

      {/* PWA Install Instructions Modal */}
      <PWAInstallInstructions 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </div>
  );
};

export default AppDownloadPage;
