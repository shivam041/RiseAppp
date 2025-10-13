import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DayManager from './DayManager';
import Calendar from './Calendar';
import DailyGoals from './DailyGoals';
import QuickNotes from './QuickNotes';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentDay, setCurrentDay] = useState(user?.current_day || 1);

  useEffect(() => {
    if (user) {
      setCurrentDay(user.current_day);
    }
  }, [user]);

  const handleDayUpdate = (newDay: number) => {
    setCurrentDay(newDay);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rise Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name || user.email}!</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Day Manager */}
        <div className="mb-8">
          <DayManager onDayUpdate={handleDayUpdate} />
        </div>

        {/* Calendar and Daily Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Calendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
          </div>

          {/* Daily Goals and Quick Notes */}
          <div className="lg:col-span-2 space-y-6">
            <DailyGoals selectedDate={selectedDate} />
            <QuickNotes selectedDate={selectedDate} />
          </div>
        </div>

        {/* Additional Stats or Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Journey Progress</h3>
            <div className="text-3xl font-bold text-indigo-600">{currentDay}</div>
            <p className="text-gray-600">Days completed</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remaining Days</h3>
            <div className="text-3xl font-bold text-orange-600">{66 - currentDay}</div>
            <p className="text-gray-600">Days to go</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion</h3>
            <div className="text-3xl font-bold text-green-600">{Math.round(user.progress_percentage)}%</div>
            <p className="text-gray-600">Overall progress</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;