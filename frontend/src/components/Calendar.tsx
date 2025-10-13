import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { CalendarData } from '../types';

interface CalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(false);

  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authAPI.getCalendarData(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );
      setCalendarData(data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateSelect(today.toISOString().split('T')[0]);
  };

  const formatDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    const dateKey = formatDateKey(day);
    return dateKey === selectedDate;
  };

  const getDayData = (day: number) => {
    const dateKey = formatDateKey(day);
    return calendarData[dateKey] || { goals: [], completed_count: 0, total_count: 0 };
  };

  const getCompletionPercentage = (day: number) => {
    const dayData = getDayData(day);
    if (dayData.total_count === 0) return 0;
    return (dayData.completed_count / dayData.total_count) * 100;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-12"></div>;
          }

          const dayData = getDayData(day);
          const completionPercentage = getCompletionPercentage(day);
          const isCurrentDay = isToday(day);
          const isSelectedDay = isSelected(day);

          return (
            <button
              key={day}
              onClick={() => onDateSelect(formatDateKey(day))}
              className={`
                h-12 p-1 rounded-lg text-sm font-medium transition-all relative
                ${isSelectedDay 
                  ? 'bg-indigo-600 text-white' 
                  : isCurrentDay 
                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{day}</span>
                
                {/* Progress indicator */}
                {dayData.total_count > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        completionPercentage === 100 ? 'bg-green-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                )}
                
                {/* Goal count indicator */}
                {dayData.total_count > 0 && (
                  <div className="absolute top-1 right-1">
                    <div className={`
                      w-2 h-2 rounded-full text-xs
                      ${completionPercentage === 100 
                        ? 'bg-green-500' 
                        : completionPercentage > 0 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-400'
                      }
                    `}></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>No goals</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Complete</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
