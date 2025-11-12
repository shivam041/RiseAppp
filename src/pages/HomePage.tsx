import React from 'react';
import SimpleTracker from '../components/SimpleTracker';
import HabitsBoard, { HabitItem } from '../components/HabitsBoard';
import HabitNotes, { HabitNote } from '../components/HabitNotes';

type Store = {
  habits: HabitItem[];
  selectedId: string | null;
  notesByHabit: Record<string, HabitNote[]>;
};

interface HomePageProps {
  store: Store;
  onStoreChange: (store: Store) => void;
}

const HomePage: React.FC<HomePageProps> = ({ store, onStoreChange }) => {
  const selectHabit = (id: string) => {
    onStoreChange({ ...store, selectedId: id });
  };

  const addHabit = (base: Omit<HabitItem, 'id' | 'completedDates'>) => {
    const id = crypto.randomUUID();
    const newHabit: HabitItem = { id, ...base, completedDates: [] };
    onStoreChange({
      habits: [...store.habits, newHabit],
      selectedId: id,
      notesByHabit: { ...store.notesByHabit, [id]: [] },
    });
  };

  const editHabit = (id: string, updatedHabit: Omit<HabitItem, 'id' | 'completedDates'>) => {
    onStoreChange({
      ...store,
      habits: store.habits.map((h) =>
        h.id === id ? { ...h, ...updatedHabit } : h
      ),
    });
  };

  const deleteHabit = (id: string) => {
    onStoreChange({
      habits: store.habits.filter((h) => h.id !== id),
      selectedId: store.selectedId === id ? null : store.selectedId,
      notesByHabit: Object.fromEntries(Object.entries(store.notesByHabit).filter(([k]) => k !== id)),
    });
  };

  const handleToggleComplete = (habitId: string, dateIso: string) => {
    const habits = store.habits.map((h) => {
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
    onStoreChange({ ...store, habits });
  };

  const addNote = (habitId: string, note: Omit<HabitNote, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    onStoreChange({
      ...store,
      notesByHabit: {
        ...store.notesByHabit,
        [habitId]: [...(store.notesByHabit[habitId] || []), { id, content: note.content, reminderTime: note.reminderTime, createdAt }],
      },
    });
  };

  const deleteNote = (habitId: string, id: string) => {
    onStoreChange({
      ...store,
      notesByHabit: {
        ...store.notesByHabit,
        [habitId]: (store.notesByHabit[habitId] || []).filter((n) => n.id !== id),
      },
    });
  };

  const selectedHabit = store.habits.find((h) => h.id === store.selectedId) || null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
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
          <SimpleTracker 
            startDate={selectedHabit.startDate} 
            completedDates={[...selectedHabit.completedDates].sort()} 
            onCheckIn={(date) => handleToggleComplete(selectedHabit.id, date)} 
          />
          <HabitNotes
            notes={store.notesByHabit[selectedHabit.id] || []}
            onAdd={(n) => addNote(selectedHabit.id, n)}
            onDelete={(id) => deleteNote(selectedHabit.id, id)}
          />
        </>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
          Select a habit to track its streak and notes.
        </div>
      )}
    </main>
  );
};

export default HomePage;

