import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusTracking } from '../hooks/useFocusTracking';

type TimerMode = 'work' | 'rest' | 'idle';

interface PomodoroSettings {
  workMinutes: number;
  restMinutes: number;
}

interface TimerState {
  mode: TimerMode;
  timerEndTimestamp: number | null;
  isPaused: boolean;
  pausedTimeRemaining: number | null;
}

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_REST_MINUTES = 5;
const TIMER_STATE_KEY = 'pomodoro-timer-state';

const PomodoroPage: React.FC = () => {
  const { isFocusModeActive, startFocusSession, endFocusSession } = useFocusTracking();
  const [mode, setMode] = useState<TimerMode>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(DEFAULT_WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCount, setSessionCount] = useState(() => {
    const saved = localStorage.getItem('pomodoro-session-count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('pomodoro-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { workMinutes: DEFAULT_WORK_MINUTES, restMinutes: DEFAULT_REST_MINUTES };
      }
    }
    return { workMinutes: DEFAULT_WORK_MINUTES, restMinutes: DEFAULT_REST_MINUTES };
  });
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationPermissionRef = useRef<NotificationPermission>('default');
  const handleTimerCompleteRef = useRef<() => void>();
  const timerEndTimestampRef = useRef<number | null>(null);
  const clearTimerStateRef = useRef<() => void>();
  const handleTimerCompleteFromStateRef = useRef<(mode: TimerMode) => void>();
  const timeRemainingRef = useRef<number>(DEFAULT_WORK_MINUTES * 60);

  // Open IndexedDB for Pomodoro timer
  const openPomodoroDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('rise-app-db', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pomodoro-timer')) {
          db.createObjectStore('pomodoro-timer', { keyPath: 'id' });
        }
      };
    });
  }, []);

  const clearTimerState = useCallback(async () => {
    localStorage.removeItem(TIMER_STATE_KEY);
    timerEndTimestampRef.current = null;
    
    // Also clear from IndexedDB
    if ('indexedDB' in window) {
      try {
        const db = await openPomodoroDB();
        const transaction = db.transaction(['pomodoro-timer'], 'readwrite');
        const store = transaction.objectStore('pomodoro-timer');
        
        await new Promise<void>((resolve, reject) => {
          const request = store.delete('current');
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Error clearing Pomodoro timer from IndexedDB:', error);
      }
    }
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'POMODORO_TIMER_CLEAR',
      });
    }
  }, [openPomodoroDB]);

  // Keep ref updated
  useEffect(() => {
    clearTimerStateRef.current = clearTimerState;
  }, [clearTimerState]);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(TIMER_STATE_KEY);
    if (savedState) {
      try {
        const state: TimerState = JSON.parse(savedState);
        if (state.mode !== 'idle' && state.timerEndTimestamp) {
          const now = Date.now();
          const endTime = state.timerEndTimestamp;
          
          if (state.isPaused && state.pausedTimeRemaining !== null) {
            // Restore paused state
            setMode(state.mode);
            setTimeRemaining(state.pausedTimeRemaining);
            setIsPaused(true);
            setIsRunning(false);
            timerEndTimestampRef.current = null;
          } else if (endTime > now) {
            // Timer is still running - restore it
            const remaining = Math.ceil((endTime - now) / 1000);
            setMode(state.mode);
            setTimeRemaining(remaining);
            setIsRunning(true);
            setIsPaused(false);
            timerEndTimestampRef.current = endTime;
          } else {
            // Timer has completed while app was closed
            handleTimerCompleteFromStateRef.current?.(state.mode);
            clearTimerStateRef.current?.();
          }
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
        clearTimerStateRef.current?.();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save timer state to localStorage and IndexedDB
  const saveTimerState = useCallback(async () => {
    const state: TimerState = {
      mode,
      timerEndTimestamp: timerEndTimestampRef.current,
      isPaused,
      pausedTimeRemaining: isPaused ? timeRemaining : null,
    };
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    
    // Also save to IndexedDB for service worker access
    if ('indexedDB' in window) {
      try {
        const db = await openPomodoroDB();
        const transaction = db.transaction(['pomodoro-timer'], 'readwrite');
        const store = transaction.objectStore('pomodoro-timer');
        
        const timerData = {
          id: 'current',
          ...state,
          settings,
        };
        
        await new Promise<void>((resolve, reject) => {
          const request = store.put(timerData);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Error saving Pomodoro timer to IndexedDB:', error);
      }
    }
    
    // Also sync to service worker for background notifications
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'POMODORO_TIMER_UPDATE',
        state: {
          ...state,
          settings,
        },
      });
    }
  }, [mode, isPaused, timeRemaining, settings, openPomodoroDB]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission;
      });
    } else if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission;
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Save session count
  useEffect(() => {
    localStorage.setItem('pomodoro-session-count', sessionCount.toString());
  }, [sessionCount]);

  // Handle visibility change (app goes to background/foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused && timerEndTimestampRef.current) {
        // Recalculate time remaining based on stored end timestamp
        const now = Date.now();
        const endTime = timerEndTimestampRef.current;
        const remaining = Math.ceil((endTime - now) / 1000);
        
        if (remaining <= 0) {
          handleTimerCompleteRef.current?.();
        } else {
          setTimeRemaining(remaining);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused]);

  // Keep timeRemaining ref updated
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      // Calculate end timestamp if not set
      if (!timerEndTimestampRef.current) {
        const now = Date.now();
        timerEndTimestampRef.current = now + (timeRemainingRef.current * 1000);
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const endTime = timerEndTimestampRef.current;
        
        if (endTime) {
          const remaining = Math.ceil((endTime - now) / 1000);
          
          if (remaining <= 0) {
            handleTimerCompleteRef.current?.();
          } else {
            setTimeRemaining(remaining);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Save state whenever it changes
    if (mode !== 'idle') {
      saveTimerState();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, mode, saveTimerState]);

  const sendNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && notificationPermissionRef.current === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'pomodoro-timer',
        requireInteraction: false,
        silent: false,
      });
    }
    
    // Also send via service worker for background notifications
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'POMODORO_NOTIFICATION',
        title,
        body,
      });
    }
  }, []);

  const handleTimerCompleteFromState = useCallback((completedMode: TimerMode) => {
    if (completedMode === 'work') {
      setMode('rest');
      setTimeRemaining(settings.restMinutes * 60);
      setIsRunning(true);
      setIsPaused(false);
      setSessionCount((prev) => prev + 1);
      sendNotification('Work Session Complete!', 'Time for a break. Rest timer starting now.');
    } else if (completedMode === 'rest') {
      setMode('idle');
      setIsRunning(false);
      setIsPaused(false);
      setTimeRemaining(settings.workMinutes * 60);
      sendNotification('Break Complete!', 'Ready to work again. Start a new work session when ready.');
    }
  }, [settings, sendNotification]);

  // Keep ref updated
  useEffect(() => {
    handleTimerCompleteFromStateRef.current = handleTimerCompleteFromState;
  }, [handleTimerCompleteFromState]);

  const handleTimerComplete = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setMode((currentMode) => {
      if (currentMode === 'work') {
        // Work timer completed - start rest timer
        timerEndTimestampRef.current = Date.now() + (settings.restMinutes * 60 * 1000);
        setTimeRemaining(settings.restMinutes * 60);
        setIsRunning(true);
        setIsPaused(false);
        setSessionCount((prev) => prev + 1);
        sendNotification('Work Session Complete!', 'Time for a break. Rest timer starting now.');
        return 'rest';
      } else if (currentMode === 'rest') {
        // Rest timer completed - stop
        clearTimerState();
        setIsRunning(false);
        setIsPaused(false);
        setTimeRemaining(settings.workMinutes * 60);
        // End focus session when rest timer completes
        if (isFocusModeActive) {
          endFocusSession();
        }
        sendNotification('Break Complete!', 'Ready to work again. Start a new work session when ready.');
        return 'idle';
      }
      return currentMode;
    });
  }, [settings, sendNotification, clearTimerState, isFocusModeActive, endFocusSession]);

  // Keep ref updated
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  const startTimer = () => {
    if (mode === 'idle') {
      setMode('work');
      setTimeRemaining(settings.workMinutes * 60);
      // Auto-start focus session when starting work timer
      if (!isFocusModeActive) {
        startFocusSession();
      }
    }
    setIsRunning(true);
    setIsPaused(false);
    timerEndTimestampRef.current = Date.now() + (timeRemaining * 1000);
    saveTimerState();
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setIsRunning(false);
    timerEndTimestampRef.current = null;
    saveTimerState();
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setIsRunning(true);
    timerEndTimestampRef.current = Date.now() + (timeRemaining * 1000);
    saveTimerState();
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    clearTimerState();
    setMode('idle');
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(settings.workMinutes * 60);
    timerEndTimestampRef.current = null;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = mode === 'work' ? settings.workMinutes * 60 : settings.restMinutes * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    if (mode === 'idle' || (!isRunning && !isPaused)) {
      setTimeRemaining(newSettings.workMinutes * 60);
    }
  };

  const circumference = 2 * Math.PI * 120; // radius = 120
  const progress = getProgress();
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isWorkMode = mode === 'work';
  const isRestMode = mode === 'rest';

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Pomodoro Timer</h2>
            {sessionCount > 0 && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Session {sessionCount} {sessionCount === 1 ? 'completed' : 'completed'}
              </p>
            )}
            {isRunning && !isPaused && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                Timer continues in background
              </p>
            )}
            {isFocusModeActive && mode === 'work' && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                🔒 Focus Mode Active - Stay focused!
              </p>
            )}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {showSettings && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Timer Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0 && value <= 60) {
                      updateSettings({ ...settings, workMinutes: value });
                    }
                  }}
                  className="form-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rest Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.restMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0 && value <= 60) {
                      updateSettings({ ...settings, restMinutes: value });
                    }
                  }}
                  className="form-input w-full"
                />
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        <div className="flex flex-col items-center justify-center">
          {/* Progress Ring */}
          <div className="relative mb-8">
            <svg className="transform -rotate-90 w-64 h-64">
              {/* Background circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke={isWorkMode ? '#E0E7FF' : '#D1FAE5'}
                strokeWidth="8"
                fill="none"
                className="dark:opacity-20"
              />
              {/* Progress circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke={isWorkMode ? '#4F46E5' : '#10B981'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-6xl font-bold ${isWorkMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className={`mt-2 text-lg font-medium ${isWorkMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-green-600 dark:text-green-400'}`}>
                {isWorkMode ? 'Work Time' : isRestMode ? 'Rest Time' : 'Ready'}
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4">
            {!isRunning && !isPaused && (
              <button
                onClick={startTimer}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-lg transition-colors shadow-lg"
              >
                Start
              </button>
            )}
            {isRunning && !isPaused && (
              <button
                onClick={pauseTimer}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-lg transition-colors shadow-lg"
              >
                Pause
              </button>
            )}
            {isPaused && (
              <button
                onClick={resumeTimer}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-lg transition-colors shadow-lg"
              >
                Resume
              </button>
            )}
            {(isRunning || isPaused || mode !== 'idle') && (
              <button
                onClick={resetTimer}
                className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium text-lg transition-colors shadow-lg"
              >
                Reset
              </button>
            )}
          </div>

          {/* Status Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'idle' && 'Click Start to begin your work session'}
              {isWorkMode && isRunning && 'Focus time! Stay productive.'}
              {isWorkMode && isPaused && 'Work session paused'}
              {isRestMode && isRunning && 'Take a well-deserved break!'}
              {isRestMode && isPaused && 'Break paused'}
            </p>
            {isFocusModeActive && mode === 'work' && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ⚠️ Focus Mode is tracking interruptions. Stay in the app!
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Notifications will appear on your lock screen when the timer completes
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PomodoroPage;
