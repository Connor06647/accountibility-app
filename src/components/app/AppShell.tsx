import React, { useState } from 'react';
import { 
  Home, 
  Target, 
  BarChart3, 
  User, 
  Settings,
  Plus,
  Bell
} from 'lucide-react';
import { PlatformInfo } from '@/lib/platform-detection';

// Screen Components
import DashboardScreen from './screens/DashboardScreen';
import GoalsScreen from './screens/GoalsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ProfileScreen from './screens/ProfileScreen';

interface AppShellProps {
  user: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
  platformInfo: PlatformInfo;
}

type ScreenType = 'dashboard' | 'goals' | 'analytics' | 'profile';

const AppShell: React.FC<AppShellProps> = ({ user }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');

  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: Home, screen: DashboardScreen },
    { id: 'goals', label: 'Goals', icon: Target, screen: GoalsScreen },
    { id: 'analytics', label: 'Stats', icon: BarChart3, screen: AnalyticsScreen },
    { id: 'profile', label: 'Profile', icon: User, screen: ProfileScreen },
  ];

  const CurrentScreenComponent = navigationItems.find(item => item.id === currentScreen)?.screen || DashboardScreen;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* App Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between safe-area-top">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            {navigationItems.find(item => item.id === currentScreen)?.label || 'Dashboard'}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <CurrentScreenComponent user={user} />
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-200 hover:scale-105 z-10">
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
        <div className="flex justify-around">
          {navigationItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id as ScreenType)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
