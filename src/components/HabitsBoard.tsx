import React, { useState } from 'react';

export interface HabitItem {
  id: string;
  name: string;
  action: string;
  reminderTimes: string[]; // multiple times per day HH:MM
  weekdays: number[]; // 0=Sun, 1=Mon, etc.
  isRepeatable: boolean;
  startDate: string; // YYYY-MM-DD
  completedDates: string[]; // ISO dates
}

interface HabitsBoardProps {
  habits: HabitItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (habit: Omit<HabitItem, 'id' | 'completedDates'>) => void;
  onEdit: (id: string, habit: Omit<HabitItem, 'id' | 'completedDates'>) => void;
  onDelete: (id: string) => void;
}

const HabitsBoard: React.FC<HabitsBoardProps> = ({ habits, selectedId, onSelect, onAdd, onEdit, onDelete }) => {
  const [name, setName] = useState('');
  const [action, setAction] = useState('');
  const [reminderTimes, setReminderTimes] = useState(['09:00']);
  const [weekdays, setWeekdays] = useState([1, 2, 3, 4, 5]); // Mon-Fri by default
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addReminderTime = () => {
    setReminderTimes([...reminderTimes, '09:00']);
  };

  const removeReminderTime = (index: number) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(reminderTimes.filter((_, i) => i !== index));
    }
  };

  const updateReminderTime = (index: number, time: string) => {
    const newTimes = [...reminderTimes];
    newTimes[index] = time;
    setReminderTimes(newTimes);
  };

  const toggleWeekday = (day: number) => {
    if (weekdays.includes(day)) {
      setWeekdays(weekdays.filter(d => d !== day));
    } else {
      setWeekdays([...weekdays, day].sort());
    }
  };

  const startEdit = (habit: HabitItem) => {
    setEditingId(habit.id);
    setName(habit.name);
    setAction(habit.action);
    setReminderTimes(habit.reminderTimes);
    setWeekdays(habit.weekdays);
    setIsRepeatable(habit.isRepeatable);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setAction('');
    setReminderTimes(['09:00']);
    setWeekdays([1, 2, 3, 4, 5]);
    setIsRepeatable(false);
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !action.trim() || weekdays.length === 0) return;
    const isoDate = new Date().toISOString().split('T')[0];
    onAdd({ 
      name: name.trim(), 
      action: action.trim(), 
      reminderTimes, 
      weekdays,
      isRepeatable,
      startDate: isoDate 
    });
    setName('');
    setAction('');
    setReminderTimes(['09:00']);
    setWeekdays([1, 2, 3, 4, 5]);
    setIsRepeatable(false);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !action.trim() || weekdays.length === 0 || !editingId) return;
    
    onEdit(editingId, { 
      name: name.trim(), 
      action: action.trim(), 
      reminderTimes, 
      weekdays,
      isRepeatable,
      startDate: habits.find(h => h.id === editingId)?.startDate || new Date().toISOString().split('T')[0]
    });
    cancelEdit();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Habits</h3>
      {habits.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 mb-4">No habits yet. Create your first one below.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {habits.map((h) => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const selectedDays = h.weekdays.map(d => dayNames[d]).join(', ');
            return (
              <div key={h.id} className={`flex items-center justify-between p-3 rounded border ${selectedId === h.id ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'}`}>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{h.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{h.action}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Days: {selectedDays} • Times: {h.reminderTimes.join(', ')}
                    {h.isRepeatable && ' • Repeatable'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onSelect(h.id)} className={`px-3 py-1 rounded ${selectedId === h.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'}`}>{selectedId === h.id ? 'Selected' : 'Select'}</button>
                  <button onClick={() => startEdit(h)} className="px-3 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30">Edit</button>
                  <button onClick={() => onDelete(h.id)} className="px-3 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={editingId ? saveEdit : addHabit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="form-input" placeholder="Habit name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="form-input" placeholder="Daily action" value={action} onChange={(e) => setAction(e.target.value)} required />
        </div>

        {/* Weekday Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Days of the week</label>
          <div className="flex flex-wrap gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(index)}
                className={`px-3 py-1 rounded text-sm ${
                  weekdays.includes(index)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Times */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reminder Times</label>
          <div className="space-y-2">
            {reminderTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  className="form-input flex-1"
                  value={time}
                  onChange={(e) => updateReminderTime(index, e.target.value)}
                  required
                />
                {reminderTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReminderTime(index)}
                    className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addReminderTime}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-sm"
            >
              + Add Time
            </button>
          </div>
        </div>

        {/* Repeatable Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isRepeatable"
            checked={isRepeatable}
            onChange={(e) => setIsRepeatable(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="isRepeatable" className="text-sm text-gray-700 dark:text-gray-300">
            This habit can be repeated multiple times per day
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">
            {editingId ? 'Save Changes' : 'Add Habit'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default HabitsBoard;


