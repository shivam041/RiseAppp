import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DayManagerProps {
  onDayUpdate: (newDay: number) => void;
}

const DayManager: React.FC<DayManagerProps> = ({ onDayUpdate }) => {
  const { user } = useAuth();
  const [lastCheckedDate, setLastCheckedDate] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  const checkForNewDay = useCallback(async () => {
    const today = new Date().toDateString();
    
    // Only check if we haven't checked today yet
    if (lastCheckedDate === today) return;
    
    setIsChecking(true);
    try {
      const response = await authAPI.checkNewDay();
      
      if (response.new_day) {
        // New day detected - update the user's day
        onDayUpdate(response.current_day);
        
        // Show notification
        showNewDayNotification(response.message);
      }
      
      setLastCheckedDate(today);
    } catch (error) {
      console.error('Error checking for new day:', error);
    } finally {
      setIsChecking(false);
    }
  }, [lastCheckedDate, onDayUpdate]);

  useEffect(() => {
    // Check for new day on component mount
    checkForNewDay();
    
    // Set up interval to check every minute
    const interval = setInterval(checkForNewDay, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkForNewDay]);

  const showNewDayNotification = (message: string) => {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 bg-indigo-600 text-white px-6 py-4 rounded-lg shadow-lg
      transform transition-all duration-300 ease-in-out
    `;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        </div>
        <div>
          <p class="font-medium">New Day!</p>
          <p class="text-sm opacity-90">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, 5000);
  };

  const manualCheckNewDay = async () => {
    setIsChecking(true);
    try {
      const response = await authAPI.checkNewDay();
      
      if (response.new_day) {
        onDayUpdate(response.current_day);
        showNewDayNotification(response.message);
      } else {
        // Show message that it's still the same day
        const notification = document.createElement('div');
        notification.className = `
          fixed top-4 right-4 z-50 bg-gray-600 text-white px-6 py-4 rounded-lg shadow-lg
          transform transition-all duration-300 ease-in-out
        `;
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p class="font-medium">Same Day</p>
              <p class="text-sm opacity-90">${response.message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
              notification.remove();
            }, 300);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error manually checking for new day:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Day {user.current_day} of 66
          </h3>
          <p className="text-sm text-gray-600">
            {user.days_remaining} days remaining
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${user.progress_percentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {Math.round(user.progress_percentage)}%
              </span>
            </div>
          </div>
          
          <button
            onClick={manualCheckNewDay}
            disabled={isChecking}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isChecking ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Checking...</span>
              </div>
            ) : (
              'Check New Day'
            )}
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{user.days_completed}/66 days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${user.progress_percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DayManager;
