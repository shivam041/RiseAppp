import React, { useState } from 'react';

export interface HabitItem {
  id: string;
  name: string;
  action: string;
  reminderTime: string; // daily HH:MM
  startDate: string; // YYYY-MM-DD
  completedDates: string[]; // ISO dates
}

interface HabitsBoardProps {
  habits: HabitItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (habit: Omit<HabitItem, 'id' | 'completedDates'>) => void;
  onDelete: (id: string) => void;
}

const HabitsBoard: React.FC<HabitsBoardProps> = ({ habits, selectedId, onSelect, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [action, setAction] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !action.trim()) return;
    const isoDate = new Date().toISOString().split('T')[0];
    onAdd({ name: name.trim(), action: action.trim(), reminderTime, startDate: isoDate });
    setName('');
    setAction('');
    setReminderTime('09:00');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Habits</h3>
      {habits.length === 0 ? (
        <p className="text-gray-500 mb-4">No habits yet. Create your first one below.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {habits.map((h) => (
            <div key={h.id} className={`flex items-center justify-between p-3 rounded border ${selectedId === h.id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
              <div>
                <div className="font-medium text-gray-900">{h.name}</div>
                <div className="text-sm text-gray-600">{h.action} • reminder {h.reminderTime}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onSelect(h.id)} className={`px-3 py-1 rounded ${selectedId === h.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-100'}`}>{selectedId === h.id ? 'Selected' : 'Select'}</button>
                <button onClick={() => onDelete(h.id)} className="px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addHabit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="form-input" placeholder="Habit name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="form-input" placeholder="Daily action" value={action} onChange={(e) => setAction(e.target.value)} required />
        <input type="time" className="form-input" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} required />
        <button type="submit" className="btn-primary">Add Habit</button>
      </form>
    </div>
  );
};

export default HabitsBoard;


