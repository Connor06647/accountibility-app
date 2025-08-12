import React from 'react';
import { X, Play, SkipForward } from 'lucide-react';

interface WebsiteOnboardingPromptProps {
  onStartTour: () => void;
  onSkipTour: () => void;
  onClose: () => void;
  userName?: string;
}

export const WebsiteOnboardingPrompt: React.FC<WebsiteOnboardingPromptProps> = ({
  onStartTour,
  onSkipTour,
  onClose,
  userName
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome{userName ? `, ${userName}` : ''}! 👋
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                First time using our accountability app?
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-2">
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>Learn how to set up your accountability goals</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <span>Discover daily check-ins and progress tracking</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                <span>Explore premium features and settings</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStartTour}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Play size={16} />
              <span>Start Tour</span>
            </button>
            <button
              onClick={onSkipTour}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <SkipForward size={16} />
              <span>Skip for Now</span>
            </button>
          </div>

          {/* Footer note */}
          <div className="px-6 pb-6 pt-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              You can always access the tour later from Settings → View App Tour
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
