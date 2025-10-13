import axios from 'axios';
import { AuthResponse, LoginData, RegisterData, User, Habit, UserHabit, DailyTask, Progress, JourneyEntry, Note, OnboardingData, DailyGoal, QuickNote, CalendarData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    console.log('API: Making login request to:', `${API_BASE_URL}/auth/login/`);
    console.log('API: Login data:', data);
    const response = await api.post('/auth/login/', data);
    console.log('API: Login response:', response.data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    console.log('API: Making registration request to:', `${API_BASE_URL}/auth/register/`);
    console.log('API: Registration data:', data);
    const response = await api.post('/auth/register/', data);
    console.log('API: Registration response:', response.data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout/');
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/update/', data);
    return response.data;
  },

  // Onboarding
  completeOnboarding: async (data: OnboardingData): Promise<User> => {
    const response = await api.post('/auth/onboarding/complete/', data);
    return response.data;
  },

  // Habits
  getHabits: async (): Promise<Habit[]> => {
    const response = await api.get('/auth/habits/');
    return response.data;
  },

  getUserHabits: async (): Promise<UserHabit[]> => {
    const response = await api.get('/auth/user-habits/');
    return response.data;
  },

  addUserHabit: async (habitId: number): Promise<UserHabit> => {
    const response = await api.post('/auth/user-habits/', { habit_id: habitId });
    return response.data;
  },

  // Daily Tasks
  getDailyTasks: async (): Promise<DailyTask[]> => {
    const response = await api.get('/auth/daily-tasks/');
    return response.data;
  },

  completeTask: async (taskId: number): Promise<DailyTask> => {
    const response = await api.post('/auth/complete-task/', { task_id: taskId });
    return response.data;
  },

  skipTask: async (taskId: number): Promise<DailyTask> => {
    const response = await api.post('/auth/skip-task/', { task_id: taskId });
    return response.data;
  },

  // Progress
  getUserProgress: async (): Promise<Progress> => {
    const response = await api.get('/auth/progress/');
    return response.data;
  },

  updateWaterIntake: async (glasses: number): Promise<Progress> => {
    const response = await api.post('/auth/update-water/', { glasses });
    return response.data;
  },

  updateExercise: async (minutes: number): Promise<Progress> => {
    const response = await api.post('/auth/update-exercise/', { minutes });
    return response.data;
  },

  // Journey
  getJourneyEntries: async (): Promise<JourneyEntry[]> => {
    const response = await api.get('/auth/journey/');
    return response.data;
  },

  createJourneyEntry: async (data: Partial<JourneyEntry>): Promise<JourneyEntry> => {
    const response = await api.post('/auth/journey/', data);
    return response.data;
  },

  // Notes
  getNotes: async (): Promise<Note[]> => {
    const response = await api.get('/auth/notes/');
    return response.data;
  },

  createNote: async (data: Partial<Note>): Promise<Note> => {
    const response = await api.post('/auth/notes/', data);
    return response.data;
  },

  updateNote: async (noteId: number, data: Partial<Note>): Promise<Note> => {
    const response = await api.put(`/auth/notes/${noteId}/`, data);
    return response.data;
  },

  deleteNote: async (noteId: number): Promise<void> => {
    await api.delete(`/auth/notes/${noteId}/`);
  },

  // Daily Goals
  getDailyGoals: async (date?: string): Promise<DailyGoal[]> => {
    const params = date ? { date } : {};
    const response = await api.get('/auth/daily-goals/', { params });
    return response.data;
  },

  createDailyGoal: async (data: Partial<DailyGoal>): Promise<DailyGoal> => {
    const response = await api.post('/auth/daily-goals/', data);
    return response.data;
  },

  updateDailyGoal: async (goalId: number, data: Partial<DailyGoal>): Promise<DailyGoal> => {
    const response = await api.put(`/auth/daily-goals/${goalId}/`, data);
    return response.data;
  },

  deleteDailyGoal: async (goalId: number): Promise<void> => {
    await api.delete(`/auth/daily-goals/${goalId}/`);
  },

  completeDailyGoal: async (goalId: number): Promise<DailyGoal> => {
    const response = await api.post(`/auth/daily-goals/${goalId}/complete/`);
    return response.data;
  },

  // Quick Notes
  getQuickNotes: async (date?: string): Promise<QuickNote[]> => {
    const params = date ? { date } : {};
    const response = await api.get('/auth/quick-notes/', { params });
    return response.data;
  },

  createQuickNote: async (data: Partial<QuickNote>): Promise<QuickNote> => {
    const response = await api.post('/auth/quick-notes/', data);
    return response.data;
  },

  updateQuickNote: async (noteId: number, data: Partial<QuickNote>): Promise<QuickNote> => {
    const response = await api.put(`/auth/quick-notes/${noteId}/`, data);
    return response.data;
  },

  deleteQuickNote: async (noteId: number): Promise<void> => {
    await api.delete(`/auth/quick-notes/${noteId}/`);
  },

  // Day Management
  checkNewDay: async (): Promise<{ new_day: boolean; current_day: number; message: string }> => {
    const response = await api.post('/auth/check-new-day/');
    return response.data;
  },

  getCalendarData: async (year?: number, month?: number): Promise<CalendarData> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get('/auth/calendar-data/', { params });
    return response.data;
  },
};

    export default api;
