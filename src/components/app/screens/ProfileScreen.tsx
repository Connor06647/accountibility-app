import React from 'react';
import { User, Mail, Calendar, Award, Settings, LogOut } from 'lucide-react';
import ProfessionalCard from '../../ui/card-enhanced';
import ProfessionalButton from '../../ui/button-enhanced';
import { useAuth } from '@/lib/auth-context-real';

interface ProfileScreenProps {
  user: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <ProfessionalCard className="p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user?.displayName?.charAt(0)?.toUpperCase() || 'U'
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {user?.displayName || 'User'}
        </h2>
        <p className="text-gray-600 mb-4">{user?.email}</p>
        <div className="flex justify-center space-x-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-gray-900">12</div>
            <div className="text-gray-600">Goals</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">87%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">45</div>
            <div className="text-gray-600">Days Active</div>
          </div>
        </div>
      </ProfessionalCard>

      {/* Achievements */}
      <ProfessionalCard className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Achievements
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {['🏆', '🔥', '⭐', '💪', '🎯', '👑'].map((emoji, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-xs text-gray-600">Achievement</div>
            </div>
          ))}
        </div>
      </ProfessionalCard>

      {/* Account Settings */}
      <div className="space-y-3">
        <ProfessionalCard className="p-4">
          <button className="w-full flex items-center space-x-3 text-left">
            <User className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Edit Profile</span>
          </button>
        </ProfessionalCard>

        <ProfessionalCard className="p-4">
          <button className="w-full flex items-center space-x-3 text-left">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Notifications</span>
          </button>
        </ProfessionalCard>

        <ProfessionalCard className="p-4">
          <button className="w-full flex items-center space-x-3 text-left">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Reminder Settings</span>
          </button>
        </ProfessionalCard>

        <ProfessionalCard className="p-4">
          <button className="w-full flex items-center space-x-3 text-left">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">App Settings</span>
          </button>
        </ProfessionalCard>
      </div>

      {/* Sign Out */}
      <ProfessionalButton 
        variant="danger" 
        className="w-full" 
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sign Out
      </ProfessionalButton>
    </div>
  );
};

export default ProfileScreen;
