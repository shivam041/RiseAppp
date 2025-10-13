import React, { useState, useEffect } from 'react';

export interface HabitConfig {
  name: string;
  action: string; // e.g., "Meditate 10 minutes"
  reminderTime: string; // HH:MM (24h)
  startDate: string; // ISO date string (YYYY-MM-DD)
}

interface HabitSetupProps {
  initial?: HabitConfig | null;
  onSave: (config: HabitConfig) => void;
}

const HabitSetup: React.FC<HabitSetupProps> = ({ initial, onSave }) => {
  const [name, setName] = useState(initial?.name || '');
  const [action, setAction] = useState(initial?.action || '');
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime || '09:00');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setAction(initial.action);
      setReminderTime(initial.reminderTime);
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !action.trim()) return;
    const today = new Date();
    const isoDate = today.toISOString().split('T')[0];
    onSave({ name: name.trim(), action: action.trim(), reminderTime, startDate: initial?.startDate || isoDate });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title gradient-text">Start Your 66-Day Rise</h2>
        <p className="auth-subtitle">Pick one habit. Keep it simple. Don’t break the chain.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label" htmlFor="habitName">Habit Name</label>
            <input id="habitName" className="form-input" placeholder="e.g., Meditation" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="habitAction">Daily Action</label>
            <input id="habitAction" className="form-input" placeholder="e.g., Meditate for 10 minutes" value={action} onChange={(e) => setAction(e.target.value)} required />
            <p className="text-xs text-gray-500 mt-1">Keep it minimal and crystal clear.</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reminder">Daily Reminder Time</label>
            <input id="reminder" type="time" className="form-input" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary">Start 66-Day Journey</button>
        </form>
      </div>
    </div>
  );
};

export default HabitSetup;


