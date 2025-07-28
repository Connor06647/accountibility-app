import React from 'react';
import { useTheme } from '@/lib/theme-context';

export const ThemeDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { theme, toggleTheme } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Select Theme</h2>
        <div className="space-y-4">
          <button
            className={`w-full p-3 rounded-lg border transition-colors text-left ${theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => { if (theme !== 'light') toggleTheme(); onClose(); }}
          >
            Light
          </button>
          <button
            className={`w-full p-3 rounded-lg border transition-colors text-left ${theme === 'dark' ? 'border-blue-500 bg-blue-900/20 text-blue-400' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => { if (theme !== 'dark') toggleTheme(); onClose(); }}
          >
            Dark
          </button>
        </div>
        <button className="mt-6 w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};
