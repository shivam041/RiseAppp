import React, { useState } from 'react';
import StreakCalendar from '../components/StreakCalendar';
import DailyTaskView from '../components/DailyTaskView';
import { HabitItem } from '../components/HabitsBoard';

interface CalendarPageProps {
  habits: HabitItem[];
  onToggleComplete: (habitId: string, date: string) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ habits, onToggleComplete }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(
    habits.length > 0 ? habits[0].id : null
  );

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Calendar View</h2>
        
        {habits.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No habits yet. Create a habit on the home page to see your calendar.</p>
        ) : (
          <>
            {habits.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Habit to View:
                </label>
                <select
                  value={selectedHabitId || ''}
                  onChange={(e) => setSelectedHabitId(e.target.value)}
                  className="form-input w-full md:w-auto"
                >
                  {habits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.name} - {habit.action}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedHabit && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedHabit.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedHabit.action}</p>
                <StreakCalendar
                  startDate={selectedHabit.startDate}
                  completedDates={[...selectedHabit.completedDates].sort()}
                  onDateClick={setSelectedDate}
                />
              </div>
            )}
          </>
        )}
      </div>

      {selectedDate && (
        <DailyTaskView
          date={selectedDate}
          habits={habits}
          onToggleComplete={onToggleComplete}
        />
      )}
    </main>
  );
};

export default CalendarPage;

