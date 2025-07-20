import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions for the app
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatStreak = (streak: number): string => {
  if (streak === 0) return 'No streak';
  if (streak === 1) return '1 day streak';
  return `${streak} day streak`;
};

export const calculateXP = (checkins: number, streaks: number): number => {
  return checkins * 10 + streaks * 25;
};

export const getLevel = (xp: number): number => {
  return Math.floor(xp / 1000) + 1;
};

export const getNextLevelXP = (currentLevel: number): number => {
  return currentLevel * 1000;
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};
