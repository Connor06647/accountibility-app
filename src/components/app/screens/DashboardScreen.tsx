import React, { useState, useEffect } from 'react';
import { 
  Target, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  Flame,
  Plus
} from 'lucide-react';
import ProfessionalCard from '../../ui/card-enhanced';
import ProfessionalButton from '../../ui/button-enhanced';

interface DashboardScreenProps {
  user: {
    displayName?: string;
    email?: string;
  };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
  const [greeting, setGreeting] = useState('');
  const [todayGoals, setTodayGoals] = useState([
    { id: 1, title: 'Morning Exercise', completed: true, streak: 7 },
    { id: 2, title: 'Read 20 minutes', completed: false, streak: 3 },
    { id: 3, title: 'Drink 8 glasses water', completed: true, streak: 5 },
  ]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const completedGoals = todayGoals.filter(goal => goal.completed).length;
  const completionRate = Math.round((completedGoals / todayGoals.length) * 100);

  const toggleGoal = (goalId: number) => {
    setTodayGoals(goals => 
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {greeting}, {user?.displayName?.split(' ')[0] || 'Champion'}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to crush your goals today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <ProfessionalCard className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
          <div className="text-sm text-gray-600">Today&apos;s Progress</div>
        </ProfessionalCard>

        <ProfessionalCard className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </ProfessionalCard>
      </div>

      {/* Today's Goals */}
      <ProfessionalCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Goals</h2>
          <span className="text-sm text-gray-500">
            {completedGoals}/{todayGoals.length} completed
          </span>
        </div>

        <div className="space-y-3">
          {todayGoals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    goal.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {goal.completed && <CheckCircle className="w-4 h-4" />}
                </button>
                <div>
                  <div className={`font-medium ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {goal.title}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Flame className="w-3 h-3" />
                    <span>{goal.streak} day streak</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ProfessionalButton variant="ghost" className="w-full mt-4 border-2 border-dashed border-gray-300">
          <Plus className="w-4 h-4 mr-2" />
          Add New Goal
        </ProfessionalButton>
      </ProfessionalCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <ProfessionalCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Daily Check-in</div>
              <div className="text-sm text-gray-500">Reflect on today</div>
            </div>
          </div>
        </ProfessionalCard>

        <ProfessionalCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">View Progress</div>
              <div className="text-sm text-gray-500">See your growth</div>
            </div>
          </div>
        </ProfessionalCard>
      </div>

      {/* Motivation Quote */}
      <ProfessionalCard className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="text-center">
          <h3 className="font-semibold mb-2">💪 Daily Motivation</h3>
          <p className="text-blue-100 italic">
            &quot;Success is the sum of small efforts repeated day in and day out.&quot;
          </p>
          <p className="text-blue-200 text-sm mt-2">- Robert Collier</p>
        </div>
      </ProfessionalCard>
    </div>
  );
};

export default DashboardScreen;
