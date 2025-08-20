import React from 'react';
import { Target, Plus, Flame } from 'lucide-react';
import ProfessionalCard from '../../ui/card-enhanced';
import ProfessionalButton from '../../ui/button-enhanced';

interface GoalsScreenProps {
  user: {
    displayName?: string;
    email?: string;
  };
}

const GoalsScreen: React.FC<GoalsScreenProps> = () => {
  const goals = [
    { 
      id: 1, 
      title: 'Exercise Daily', 
      description: 'Complete 30 minutes of physical activity',
      streak: 7,
      category: 'Health',
      progress: 85,
      target: 30
    },
    { 
      id: 2, 
      title: 'Read More', 
      description: 'Read for 20 minutes each day',
      streak: 3,
      category: 'Learning',
      progress: 65,
      target: 21
    },
    { 
      id: 3, 
      title: 'Hydration Goal', 
      description: 'Drink 8 glasses of water daily',
      streak: 5,
      category: 'Health',
      progress: 90,
      target: 8
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Goals</h1>
        <p className="text-gray-600">Track and achieve what matters most</p>
      </div>

      {/* Add Goal Button */}
      <ProfessionalButton variant="primary" className="w-full">
        <Plus className="w-5 h-5 mr-2" />
        Create New Goal
      </ProfessionalButton>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <ProfessionalCard key={goal.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {goal.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{goal.description}</p>
              </div>
              <div className="flex items-center space-x-1 text-orange-600">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">{goal.streak}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <ProfessionalButton variant="primary" size="sm" className="flex-1">
                Mark Complete
              </ProfessionalButton>
              <ProfessionalButton variant="ghost" size="sm">
                Edit
              </ProfessionalButton>
            </div>
          </ProfessionalCard>
        ))}
      </div>

      {/* Goal Categories */}
      <ProfessionalCard className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Goal Categories</h3>
        <div className="grid grid-cols-2 gap-3">
          {['Health', 'Learning', 'Career', 'Personal'].map((category) => (
            <div key={category} className="p-3 bg-gray-50 rounded-lg text-center">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">{category}</span>
            </div>
          ))}
        </div>
      </ProfessionalCard>
    </div>
  );
};

export default GoalsScreen;
