export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
}

export interface UserProfile {
  name: string;
  description: string;
  image: string;
  notificationsEnabled: boolean;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  inCharge: string;
  subordinates: string[];
  subtasks: Subtask[];
  createdAt: number;
}

export interface SubGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  period: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  subGoals: SubGoal[];
  createdAt: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
}
