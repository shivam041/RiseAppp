import React, { useEffect, useState } from 'react';
import './App.css';
import SimpleTracker from './components/SimpleTracker';
import StreakCalendar from './components/StreakCalendar';
import ReminderManager from './components/ReminderManager';
import HabitsBoard, { HabitItem } from './components/HabitsBoard';
import HabitNotes, { HabitNote } from './components/HabitNotes';

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
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
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

  useEffect(() => {
    saveStore(store);
  }, [store]);

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
  const deleteHabit = (id: string) => setStore((prev) => ({
    habits: prev.habits.filter((h) => h.id !== id),
    selectedId: prev.selectedId === id ? null : prev.selectedId,
    notesByHabit: Object.fromEntries(Object.entries(prev.notesByHabit).filter(([k]) => k !== id)),
  }));

  const handleCheckIn = (dateIso: string) => {
    setStore((prev) => {
      if (!prev.selectedId) return prev;
      const habits = prev.habits.map((h) =>
        h.id === prev.selectedId && !h.completedDates.includes(dateIso)
          ? { ...h, completedDates: [...h.completedDates, dateIso] }
          : h
      );
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
    <div className="min-h-screen bg-gray-50">
      <ReminderManager
        reminders={[
          ...store.habits.map((h) => ({ id: `habit-${h.id}`, title: `Time for: ${h.action}`, time: h.reminderTime })),
          ...Object.entries(store.notesByHabit).flatMap(([hid, notes]) =>
            notes.filter((n) => n.reminderTime).map((n) => ({ id: `note-${hid}-${n.id}`, title: n.content, time: n.reminderTime as string }))
          ),
        ]}
      />

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rise: 66-Day Habits</h1>
            <p className="text-gray-600">Create multiple focused habits. Track each streak.</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <HabitsBoard
          habits={store.habits}
          selectedId={store.selectedId}
          onSelect={selectHabit}
          onAdd={addHabit}
          onDelete={deleteHabit}
        />

        {selectedHabit ? (
          <>
            <SimpleTracker startDate={selectedHabit.startDate} completedDates={[...selectedHabit.completedDates].sort()} onCheckIn={handleCheckIn} />
            <StreakCalendar startDate={selectedHabit.startDate} completedDates={[...selectedHabit.completedDates].sort()} />
            <HabitNotes
              notes={store.notesByHabit[selectedHabit.id] || []}
              onAdd={(n) => addNote(selectedHabit.id, n)}
              onDelete={(id) => deleteNote(selectedHabit.id, id)}
            />
          </>
        ) : (
          <div className="p-6 bg-white rounded-lg border text-gray-600">Select a habit to track its streak and notes.</div>
        )}
      </main>
    </div>
  );
};

export default App;
