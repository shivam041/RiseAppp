import React from 'react';

interface StreakCalendarProps {
  startDate: string; // YYYY-MM-DD
  completedDates: string[];
  onDateClick?: (date: string) => void;
}

function getMonthMatrix(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  const startWeekday = first.getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ startDate, completedDates, onDateClick }) => {
  const [viewDate, setViewDate] = React.useState(new Date());

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const matrix = getMonthMatrix(viewDate);

  const isCompleted = (year: number, month: number, day: number) => {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return completedDates.includes(iso);
  };

  const isBeforeStart = (year: number, month: number, day: number) => {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return new Date(iso) < new Date(startDate);
  };

  const prevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };

  const nextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Streak Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">◀</button>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
          <button onClick={nextMonth} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {matrix.map((cell, idx) => {
          if (cell === null) return <div key={idx} className="h-10" />;
          const y = viewDate.getFullYear();
          const m = viewDate.getMonth();
          const completed = isCompleted(y, m, cell);
          const disabled = isBeforeStart(y, m, cell);
          const dateIso = `${y}-${String(m + 1).padStart(2, '0')}-${String(cell).padStart(2, '0')}`;
          
          return (
            <button
              key={idx}
              onClick={() => onDateClick?.(dateIso)}
              disabled={disabled}
              className={`h-10 rounded flex items-center justify-center text-sm font-medium border transition-colors ${
                disabled 
                  ? 'bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-600 cursor-not-allowed' 
                  : completed 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50'
              }`}
              title={completed ? 'Completed' : disabled ? 'Before start' : 'Missed - Click to view tasks'}
            >
              {cell}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StreakCalendar;


