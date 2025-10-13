import React from 'react';
import { HabitItem } from './HabitsBoard';

interface DailyTaskViewProps {
  date: string;
  habits: HabitItem[];
  onToggleComplete: (habitId: string, date: string) => void;
}

const DailyTaskView: React.FC<DailyTaskViewProps> = ({ date, habits, onToggleComplete }) => {
  const dayOfWeek = new Date(date).getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Filter habits that are scheduled for this weekday
  const scheduledHabits = habits.filter(habit => habit.weekdays.includes(dayOfWeek));
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isCompleted = (habit: HabitItem) => {
    return habit.completedDates.includes(date);
  };

  const handleToggleComplete = (habitId: string) => {
    onToggleComplete(habitId, date);
  };

  if (scheduledHabits.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Tasks for {formatDate(date)}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No habits scheduled for {dayNames[dayOfWeek]}s.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Tasks for {formatDate(date)}
      </h3>
      
      <div className="space-y-3">
        {scheduledHabits.map((habit) => {
          const completed = isCompleted(habit);
          return (
            <div
              key={habit.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-medium ${completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {habit.name}
                    </h4>
                    {completed && (
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Completed</span>
                    )}
                  </div>
                  
                  <p className={`text-sm ${completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                    {habit.action}
                  </p>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Reminders: {habit.reminderTimes.join(', ')}
                    {habit.isRepeatable && ' • Repeatable'}
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => handleToggleComplete(habit.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      completed 
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-500' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {completed ? 'Undo' : 'Complete'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progress</span>
          <span>
            {scheduledHabits.filter(h => isCompleted(h)).length}/{scheduledHabits.length} completed
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${scheduledHabits.length > 0 
                ? (scheduledHabits.filter(h => isCompleted(h)).length / scheduledHabits.length) * 100 
                : 0}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DailyTaskView;
