import React from 'react';

interface StreakCalendarProps {
  startDate: string; // YYYY-MM-DD
  completedDates: string[];
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

const StreakCalendar: React.FC<StreakCalendarProps> = ({ startDate, completedDates }) => {
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Streak Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 text-gray-600 hover:bg-gray-100 rounded">◀</button>
          <div className="text-sm font-medium text-gray-800">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
          <button onClick={nextMonth} className="p-2 text-gray-600 hover:bg-gray-100 rounded">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {matrix.map((cell, idx) => {
          if (cell === null) return <div key={idx} className="h-10" />;
          const y = viewDate.getFullYear();
          const m = viewDate.getMonth();
          const completed = isCompleted(y, m, cell);
          const disabled = isBeforeStart(y, m, cell);
          return (
            <div
              key={idx}
              className={`h-10 rounded flex items-center justify-center text-sm font-medium border ${
                disabled ? 'bg-gray-50 text-gray-300 border-gray-100' : completed ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
              }`}
              title={completed ? 'Completed' : disabled ? 'Before start' : 'Missed'}
            >
              {cell}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreakCalendar;


