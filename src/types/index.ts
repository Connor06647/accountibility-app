export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  subscription: SubscriptionTier;
  preferences: UserPreferences;
}

export interface UserPreferences {
  timezone: string;
  notificationTime: string;
  coachingTone: 'empathetic' | 'firm' | 'balanced';
  reminderFrequency: 'daily' | 'weekly' | 'custom';
  focusAreas: FocusArea[];
}

export type SubscriptionTier = 'free' | 'standard' | 'premium';

export type FocusArea = 'fitness' | 'education' | 'habits' | 'mental-health' | 'custom';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: FocusArea;
  targetValue?: number;
  unit?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckIn {
  id: string;
  userId: string;
  goalId: string;
  date: Date;
  completed: boolean;
  value?: number;
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  aiResponse?: string;
  createdAt: Date;
}

export interface Streak {
  id: string;
  userId: string;
  goalId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: {
    type: 'streak' | 'total_checkins' | 'goals_created' | 'days_active';
    value: number;
  };
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  isDisplayed: boolean;
}

export interface AccountabilityPartner {
  id: string;
  userId1: string;
  userId2: string;
  status: 'pending' | 'active' | 'paused' | 'ended';
  createdAt: Date;
  sharedGoals: string[];
}

export interface NotificationSettings {
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  dailyReminder: boolean;
  weeklyReport: boolean;
  streakAlerts: boolean;
  partnerUpdates: boolean;
}
