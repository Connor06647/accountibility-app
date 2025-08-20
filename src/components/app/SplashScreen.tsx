import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation before component unmounts
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center text-white">
        {/* App Logo */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-white/20 rounded-3xl backdrop-blur-sm flex items-center justify-center mb-4 animate-pulse">
            <Target className="w-12 h-12 text-white" />
          </div>
          
          {/* Loading indicator */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          AccountabilityApp
        </h1>
        
        {/* Tagline */}
        <p className="text-lg text-white/80 font-medium">
          Transform Goals Into Achievements
        </p>

        {/* Loading bar */}
        <div className="mt-8 w-48 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/60 rounded-full animate-pulse" style={{
              animation: 'loadingBar 1.5s ease-in-out forwards'
            }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
