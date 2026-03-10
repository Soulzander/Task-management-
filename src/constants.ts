import { UserProfile } from './types';

export const DIFFICULTY_COLORS = {
  easy: '#10b981', // emerald-500
  medium: '#f59e0b', // amber-500
  hard: '#ef4444', // red-500
};

export const DIFFICULTY_WEIGHTS = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Kim',
  description: 'Productivity Architect',
  image: 'https://picsum.photos/seed/user/200/200',
  notificationsEnabled: false,
};

export const STORAGE_KEYS = {
  TASKS: 'tasks',
  USER_PROFILE: 'userProfile',
  PROJECTS: 'projects',
  GOALS: 'strategic_goals',
  JOURNAL_ENTRIES: 'journal_entries',
  NOTIFIED_PROJECTS: 'notifiedProjects',
  NOTIFIED_TASKS_DATE: 'notifiedTasksDate',
};
