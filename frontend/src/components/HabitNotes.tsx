import React, { useState } from 'react';

export interface HabitNote {
  id: string;
  content: string;
  reminderTime?: string; // optional HH:MM
  createdAt: string; // ISO
}

interface HabitNotesProps {
  notes: HabitNote[];
  onAdd: (note: Omit<HabitNote, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const HabitNotes: React.FC<HabitNotesProps> = ({ notes, onAdd, onDelete }) => {
  const [content, setContent] = useState('');
  const [reminderTime, setReminderTime] = useState<string>('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd({ content: content.trim(), reminderTime: reminderTime || undefined });
    setContent('');
    setReminderTime('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Side Notes & Reminders</h3>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <input className="form-input md:col-span-4" placeholder="Note..." value={content} onChange={(e) => setContent(e.target.value)} />
        <input type="time" className="form-input md:col-span-1" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} placeholder="HH:MM" />
        <button type="submit" className="btn-primary md:col-span-1">Add</button>
      </form>

      {notes.length === 0 ? (
        <p className="text-gray-500">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-gray-800 whitespace-pre-wrap">{n.content}</div>
                <div className="text-xs text-gray-500 mt-1">Created {new Date(n.createdAt).toLocaleString()} {n.reminderTime ? `• Reminder ${n.reminderTime}` : ''}</div>
              </div>
              <button onClick={() => onDelete(n.id)} className="px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitNotes;


