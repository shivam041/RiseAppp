export interface User {
  id: number;
  email: string;
  name: string;
  gender?: string;
  goal_reason?: string;
  daily_water_goal: number;
  daily_exercise_goal: number;
  start_date: string;
  current_day: number;
  is_onboarding_complete: boolean;
  is_admin: boolean;
  date_joined: string;
  days_completed: number;
  days_remaining: number;
  progress_percentage: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  name: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: number;
  name: string;
  description: string;
  icon: string;
  difficulty: number;
  frequency: string;
  is_active: boolean;
  created_at: string;
}

export interface UserHabit {
  id: number;
  habit: Habit;
  is_enabled: boolean;
  custom_frequency: string;
  created_at: string;
}

export interface DailyTask {
  id: number;
  habit: Habit;
  date: string;
  status: 'pending' | 'completed' | 'skipped';
  completed_at?: string;
  notes: string;
}

export interface Progress {
  id: number;
  date: string;
  water_intake: number;
  exercise_minutes: number;
  tasks_completed: number;
  total_tasks: number;
  streak_days: number;
  xp_earned: number;
  level: number;
}

export interface JourneyEntry {
  id: number;
  date: string;
  title: string;
  mood: string;
  text_content: string;
  media_files: string[];
  created_at: string;
}

export interface OnboardingData {
  name: string;
  gender: string;
  goal_reason: string;
  daily_water_goal: number;
  daily_exercise_goal: number;
}

export interface DailyGoal {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  date: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickNote {
  id: number;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarData {
  [date: string]: {
    goals: Array<{
      id: number;
      title: string;
      priority: string;
      is_completed: boolean;
    }>;
    completed_count: number;
    total_count: number;
  };
}
