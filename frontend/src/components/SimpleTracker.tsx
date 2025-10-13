import React, { useMemo } from 'react';

export interface TrackerState {
  // ISO date strings for completed days
  completedDates: string[];
  totalCompleted: number;
  longestStreak: number;
}

interface SimpleTrackerProps {
  startDate: string; // YYYY-MM-DD
  completedDates: string[];
  onCheckIn: (dateIso: string) => void;
}

function daysBetween(startIso: string, endIso: string): number {
  const s = new Date(startIso + 'T00:00:00Z');
  const e = new Date(endIso + 'T00:00:00Z');
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function calcDayOf66(startIso: string): number {
  const todayIso = new Date().toISOString().split('T')[0];
  return Math.min(66, Math.max(1, daysBetween(startIso, todayIso) + 1));
}

const SimpleTracker: React.FC<SimpleTrackerProps> = ({ startDate, completedDates, onCheckIn }) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const dayOf66 = useMemo(() => calcDayOf66(startDate), [startDate]);
  const isTodayCompleted = completedDates.includes(todayIso);

  const totalCompleted = completedDates.length;

  // Longest streak (simple calculation over sorted dates)
  const longestStreak = useMemo(() => {
    const sorted = [...completedDates].sort();
    let best = 0;
    let current = 0;
    let prev: Date | null = null;
    for (const d of sorted) {
      const cur = new Date(d + 'T00:00:00Z');
      if (prev) {
        const diff = Math.floor((cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          current += 1;
        } else if (diff === 0) {
          // same day duplicate; ignore
        } else {
          current = 1;
        }
      } else {
        current = 1;
      }
      best = Math.max(best, current);
      prev = cur;
    }
    return best;
  }, [completedDates]);

  const handleCheckIn = () => {
    if (!isTodayCompleted) {
      onCheckIn(todayIso);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Day {dayOf66} of 66</h3>
          <p className="text-gray-600">Don’t break the chain.</p>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={isTodayCompleted}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${isTodayCompleted ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          {isTodayCompleted ? 'Completed Today' : '✅ Completed Today'}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-indigo-600">{totalCompleted}</div>
          <div className="text-gray-600">Total Days Completed</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{longestStreak}</div>
          <div className="text-gray-600">Longest Streak</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">{66 - dayOf66}</div>
          <div className="text-gray-600">Days Remaining</div>
        </div>
      </div>

      {dayOf66 === 66 && (
        <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
          🎉 Congratulations! You’ve completed 66 days!
        </div>
      )}
    </div>
  );
};

export default SimpleTracker;


