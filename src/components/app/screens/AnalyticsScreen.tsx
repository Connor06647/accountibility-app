import React from 'react';
import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react';
import ProfessionalCard from '../../ui/card-enhanced';

interface AnalyticsScreenProps {
  user: {
    displayName?: string;
    email?: string;
  };
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Analytics</h1>
        <p className="text-gray-600">Track your progress and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <ProfessionalCard className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">87%</div>
          <div className="text-sm text-gray-600">Weekly Average</div>
        </ProfessionalCard>

        <ProfessionalCard className="p-4 text-center">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Active Days</div>
        </ProfessionalCard>

        <ProfessionalCard className="p-4 text-center">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Goals Achieved</div>
        </ProfessionalCard>

        <ProfessionalCard className="p-4 text-center">
          <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">23</div>
          <div className="text-sm text-gray-600">Best Streak</div>
        </ProfessionalCard>
      </div>

      {/* Progress Chart */}
      <ProfessionalCard className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Progress</h3>
        <div className="space-y-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const progress = [85, 92, 78, 95, 88, 90, 82][index];
            return (
              <div key={day} className="flex items-center space-x-3">
                <div className="w-12 text-sm text-gray-600">{day}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-900 font-medium">{progress}%</div>
              </div>
            );
          })}
        </div>
      </ProfessionalCard>

      {/* Achievements */}
      <ProfessionalCard className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {[
            { title: '7-Day Streak!', description: 'Completed goals for a full week', icon: '🔥' },
            { title: 'Early Bird', description: 'Completed morning routine 5 days', icon: '🌅' },
            { title: 'Consistency King', description: 'No missed days this month', icon: '👑' },
          ].map((achievement, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{achievement.title}</div>
                <div className="text-sm text-gray-600">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </ProfessionalCard>
    </div>
  );
};

export default AnalyticsScreen;
