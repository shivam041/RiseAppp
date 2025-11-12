import React, { useState } from 'react';
import { useFocusTracking, formatDuration } from '../hooks/useFocusTracking';

const FocusModePage: React.FC = () => {
  const {
    isFocusModeActive,
    currentSession,
    isAppVisible,
    timeAway,
    stats,
    startFocusSession,
    endFocusSession,
    getCurrentFocusTime,
  } = useFocusTracking();

  const [showStats, setShowStats] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Update current time display
  React.useEffect(() => {
    if (isFocusModeActive) {
      const interval = setInterval(() => {
        setCurrentTime(getCurrentFocusTime());
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCurrentTime(0);
    }
  }, [isFocusModeActive, getCurrentFocusTime]);

  const handleStart = () => {
    startFocusSession();
  };

  const handleEnd = () => {
    if (window.confirm('Are you sure you want to end this focus session?')) {
      endFocusSession();
    }
  };

  // Calculate focus percentage
  const focusPercentage = React.useMemo(() => {
    if (!currentSession || currentTime === 0) return 100;
    const totalTime = currentTime + timeAway;
    if (totalTime === 0) return 100;
    return (currentTime / totalTime) * 100;
  }, [currentSession, currentTime, timeAway]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Focus Mode</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your focus time and minimize distractions
            </p>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Statistics"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>

        {showStats && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Focus Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatDuration(stats.totalFocusTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Focus Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.sessionsCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.totalInterruptions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Interruptions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatDuration(stats.longestStreak)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDuration(stats.currentStreak)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {formatDuration(Math.floor(stats.averageSessionLength))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Session</div>
              </div>
            </div>
          </div>
        )}

        {!isFocusModeActive ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-8">
              <svg className="w-32 h-32 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to Focus?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              Start a focus session to track your time and minimize distractions. 
              We'll notify you if you switch away from the app.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-lg transition-colors shadow-lg"
            >
              Start Focus Session
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {/* Status Indicator */}
            <div className={`mb-8 p-4 rounded-lg ${isAppVisible ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${isAppVisible ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`font-medium ${isAppVisible ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  {isAppVisible ? 'Focused' : 'Away from App'}
                </span>
              </div>
            </div>

            {/* Timer Display */}
            <div className="mb-8 text-center">
              <div className="text-7xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                {formatDuration(currentTime)}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                Focus Time
              </div>
            </div>

            {/* Interruption Info */}
            {timeAway > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-center">
                  <div className="text-sm text-yellow-800 dark:text-yellow-300 mb-1">Time Away</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatDuration(timeAway)}
                  </div>
                </div>
              </div>
            )}

            {/* Interruptions List */}
            {currentSession && currentSession.interruptions.length > 0 && (
              <div className="mb-6 w-full">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Interruptions ({currentSession.interruptions.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentSession.interruptions.map((interruption) => (
                    <div
                      key={interruption.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(interruption.startTime).toLocaleTimeString()}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {interruption.duration > 0
                            ? formatDuration(interruption.duration)
                            : 'In progress...'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Focus Percentage */}
            <div className="mb-8 w-full">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Focus Rate</span>
                <span>{Math.round(focusPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, focusPercentage))}%` }}
                ></div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleEnd}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-lg transition-colors shadow-lg"
              >
                End Session
              </button>
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-indigo-800 dark:text-indigo-300 text-center">
                💡 Tip: Keep the app open to maintain your focus streak. We'll track when you switch away.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default FocusModePage;

