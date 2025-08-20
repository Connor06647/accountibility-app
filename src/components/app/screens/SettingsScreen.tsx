import React from 'react';
import ProfessionalCard from '../../ui/card-enhanced';

interface SettingsScreenProps {
  user: {
    displayName?: string;
    email?: string;
  };
}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  return (
    <div className="p-4 space-y-6">
      <ProfessionalCard className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
        <p className="text-gray-600">Settings screen content coming soon...</p>
      </ProfessionalCard>
    </div>
  );
};

export default SettingsScreen;
