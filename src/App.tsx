import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import ReminderManager from './components/ReminderManager';
import { HabitItem } from './components/HabitsBoard';
import { HabitNote } from './components/HabitNotes';
import BottomNav from './components/BottomNav';
import NavMenu from './components/NavMenu';
import FocusModeIndicator from './components/FocusModeIndicator';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import QuotesPage from './pages/QuotesPage';
import PomodoroPage from './pages/PomodoroPage';
import FocusModePage from './pages/FocusModePage';

type Store = {
  habits: HabitItem[];
  selectedId: string | null;
  notesByHabit: Record<string, HabitNote[]>;
};

const STORAGE_KEY = 'rise_multi_habits_v1';

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { habits: [], selectedId: null, notesByHabit: {} };
    const parsed = JSON.parse(raw);
    
    // Migrate old habits to new schema
    const migratedHabits = Array.isArray(parsed.habits) ? parsed.habits.map((habit: any) => {
      // If it's already migrated, return as is
      if (habit.reminderTimes && habit.weekdays !== undefined) {
        return habit;
      }
      
      // Migrate old format to new format
      return {
        ...habit,
        reminderTimes: habit.reminderTime ? [habit.reminderTime] : ['09:00'],
        weekdays: habit.weekdays || [0, 1, 2, 3, 4, 5, 6], // All days by default
        isRepeatable: habit.isRepeatable || false,
      };
    }) : [];
    
    return {
      habits: migratedHabits,
      selectedId: parsed.selectedId || null,
      notesByHabit: parsed.notesByHabit || {},
    };
  } catch {
    return { habits: [], selectedId: null, notesByHabit: {} };
  }
}

function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

const App: React.FC = () => {
  const [store, setStore] = useState<Store>(() => loadStore());
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('rise_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    saveStore(store);
  }, [store]);

  useEffect(() => {
    localStorage.setItem('rise_dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  const handleToggleComplete = (habitId: string, dateIso: string) => {
    setStore((prev) => {
      const habits = prev.habits.map((h) => {
        if (h.id === habitId) {
          const isCompleted = h.completedDates.includes(dateIso);
          if (isCompleted) {
            return { ...h, completedDates: h.completedDates.filter(d => d !== dateIso) };
          } else {
            return { ...h, completedDates: [...h.completedDates, dateIso] };
          }
        }
        return h;
      });
      return { ...prev, habits };
    });
  };

  const testNotification = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'denied') {
      alert('Notification permission was denied. Please enable it in your browser settings.');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission was denied.');
        return;
      }
    }

    new Notification('Rise: Test Notification', {
      body: 'This is a test notification. Your notifications are working!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'rise-test',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ReminderManager
        habits={store.habits}
        notesByHabit={store.notesByHabit}
      />

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rise: 66-Day Habits</h1>
            <p className="text-gray-600 dark:text-gray-400">Create multiple focused habits. Track each streak.</p>
          </div>
          <div className="flex items-center gap-2">
            <NavMenu />
            <button
              onClick={testNotification}
              className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/30 transition-colors"
              title="Test Notification"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <FocusModeIndicator />

      <Routes>
        <Route
          path="/"
          element={<HomePage store={store} onStoreChange={setStore} />}
        />
        <Route
          path="/calendar"
          element={
            <CalendarPage
              habits={store.habits}
              onToggleComplete={handleToggleComplete}
            />
          }
        />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/focus" element={<FocusModePage />} />
      </Routes>

      <BottomNav />
    </div>
  );
};

export default App;
