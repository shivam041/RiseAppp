import React, { useEffect, useState } from 'react';
import './App.css';
import SimpleTracker from './components/SimpleTracker';
import StreakCalendar from './components/StreakCalendar';
import ReminderManager from './components/ReminderManager';
import HabitsBoard, { HabitItem } from './components/HabitsBoard';
import HabitNotes, { HabitNote } from './components/HabitNotes';
import DailyTaskView from './components/DailyTaskView';

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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

  const addHabit = (base: Omit<HabitItem, 'id' | 'completedDates'>) => {
    const id = crypto.randomUUID();
    const newHabit: HabitItem = { id, ...base, completedDates: [] };
    setStore((prev) => ({
      habits: [...prev.habits, newHabit],
      selectedId: id,
      notesByHabit: { ...prev.notesByHabit, [id]: [] },
    }));
  };

  const selectHabit = (id: string) => setStore((prev) => ({ ...prev, selectedId: id }));
  const editHabit = (id: string, updatedHabit: Omit<HabitItem, 'id' | 'completedDates'>) => {
    setStore((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === id ? { ...h, ...updatedHabit } : h
      ),
    }));
  };

  const deleteHabit = (id: string) => setStore((prev) => ({
    habits: prev.habits.filter((h) => h.id !== id),
    selectedId: prev.selectedId === id ? null : prev.selectedId,
    notesByHabit: Object.fromEntries(Object.entries(prev.notesByHabit).filter(([k]) => k !== id)),
  }));

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

  const addNote = (habitId: string, note: Omit<HabitNote, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      notesByHabit: {
        ...prev.notesByHabit,
        [habitId]: [...(prev.notesByHabit[habitId] || []), { id, content: note.content, reminderTime: note.reminderTime, createdAt }],
      },
    }));
  };

  const deleteNote = (habitId: string, id: string) => {
    setStore((prev) => ({
      ...prev,
      notesByHabit: {
        ...prev.notesByHabit,
        [habitId]: (prev.notesByHabit[habitId] || []).filter((n) => n.id !== id),
      },
    }));
  };

  const selectedHabit = store.habits.find((h) => h.id === store.selectedId) || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ReminderManager
        reminders={[
          ...store.habits.flatMap((h) => 
            h.reminderTimes.map((time, index) => ({ 
              id: `habit-${h.id}-${index}`, 
              title: `Time for: ${h.action}`, 
              time 
            }))
          ),
          ...Object.entries(store.notesByHabit).flatMap(([hid, notes]) =>
            notes.filter((n) => n.reminderTime).map((n) => ({ id: `note-${hid}-${n.id}`, title: n.content, time: n.reminderTime as string }))
          ),
        ]}
      />

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rise: 66-Day Habits</h1>
            <p className="text-gray-600 dark:text-gray-400">Create multiple focused habits. Track each streak.</p>
          </div>
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
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <HabitsBoard
          habits={store.habits}
          selectedId={store.selectedId}
          onSelect={selectHabit}
          onAdd={addHabit}
          onEdit={editHabit}
          onDelete={deleteHabit}
        />

        {selectedHabit ? (
          <>
            <SimpleTracker startDate={selectedHabit.startDate} completedDates={[...selectedHabit.completedDates].sort()} onCheckIn={(date) => handleToggleComplete(selectedHabit.id, date)} />
            <StreakCalendar startDate={selectedHabit.startDate} completedDates={[...selectedHabit.completedDates].sort()} onDateClick={setSelectedDate} />
            <HabitNotes
              notes={store.notesByHabit[selectedHabit.id] || []}
              onAdd={(n) => addNote(selectedHabit.id, n)}
              onDelete={(id) => deleteNote(selectedHabit.id, id)}
            />
          </>
        ) : (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Select a habit to track its streak and notes.</div>
        )}

        {selectedDate && (
          <DailyTaskView
            date={selectedDate}
            habits={store.habits}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </main>
    </div>
  );
};

export default App;
