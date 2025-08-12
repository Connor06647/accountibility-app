import React from 'react';
import { Smartphone, Monitor, Download } from 'lucide-react';

interface PWAInstallInstructionsProps {
  onClose?: () => void;
}

export const PWAInstallInstructions: React.FC<PWAInstallInstructionsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Install App
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Chrome/Edge</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Look for the install icon (⊕) in the address bar, or use the menu → "Install app"
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Mobile Safari</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tap the share button and select "Add to Home Screen"
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Other Browsers</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Check your browser menu for "Install" or "Add to Home Screen" options
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Installing the app gives you a faster experience and works offline!
              </p>
            </div>
          </div>

          {onClose && (
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Got it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
