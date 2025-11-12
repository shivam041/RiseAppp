import { useState, useEffect, useRef, useCallback } from 'react';

export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number | null;
  totalTime: number; // in seconds
  interruptions: Interruption[];
  isActive: boolean;
}

export interface Interruption {
  id: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
}

const FOCUS_SESSIONS_KEY = 'focus-sessions';
const CURRENT_SESSION_KEY = 'current-focus-session';
const FOCUS_STATS_KEY = 'focus-stats';

export interface FocusStats {
  totalFocusTime: number; // total seconds
  totalInterruptions: number;
  longestStreak: number; // longest uninterrupted session in seconds
  currentStreak: number; // current uninterrupted time in seconds
  sessionsCompleted: number;
  averageSessionLength: number; // in seconds
}

export const useFocusTracking = () => {
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [isAppVisible, setIsAppVisible] = useState(true);
  const [timeAway, setTimeAway] = useState(0); // seconds away from app
  const [stats, setStats] = useState<FocusStats>(() => {
    const saved = localStorage.getItem(FOCUS_STATS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultStats();
      }
    }
    return getDefaultStats();
  });

  const sessionStartTimeRef = useRef<number | null>(null);
  const interruptionStartTimeRef = useRef<number | null>(null);
  const visibilityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastVisibilityChangeRef = useRef<number>(Date.now());

  const getDefaultStats = (): FocusStats => ({
    totalFocusTime: 0,
    totalInterruptions: 0,
    longestStreak: 0,
    currentStreak: 0,
    sessionsCompleted: 0,
    averageSessionLength: 0,
  });

  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsAppVisible(isVisible);
      const now = Date.now();

      if (isFocusModeActive && currentSession) {
        if (!isVisible) {
          // App went to background - start tracking interruption
          interruptionStartTimeRef.current = now;
          lastVisibilityChangeRef.current = now;
          
          // Log interruption
          if (currentSession) {
            const interruption: Interruption = {
              id: crypto.randomUUID(),
              startTime: now,
              endTime: null,
              duration: 0,
            };
            setCurrentSession((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                interruptions: [...prev.interruptions, interruption],
              };
            });
          }

          // Send notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Interrupted', {
              body: 'You left the app. Return to continue your focus session.',
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'focus-interruption',
            });
          }
        } else {
          // App came to foreground - end interruption
          if (interruptionStartTimeRef.current) {
            const interruptionDuration = Math.floor((now - interruptionStartTimeRef.current) / 1000);
            setTimeAway((prev) => prev + interruptionDuration);
            interruptionStartTimeRef.current = null;

            // Update current interruption
            setCurrentSession((prev) => {
              if (!prev) return null;
              const updatedInterruptions = [...prev.interruptions];
              const lastInterruption = updatedInterruptions[updatedInterruptions.length - 1];
              if (lastInterruption && !lastInterruption.endTime) {
                lastInterruption.endTime = now;
                lastInterruption.duration = interruptionDuration;
              }
              return {
                ...prev,
                interruptions: updatedInterruptions,
              };
            });

            // Send reminder notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Welcome Back!', {
                body: 'You were away for ' + formatDuration(interruptionDuration) + '. Continue focusing!',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'focus-reminder',
              });
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isFocusModeActive, currentSession]);

  // Update time away counter
  useEffect(() => {
    if (isFocusModeActive && !isAppVisible && interruptionStartTimeRef.current) {
      visibilityCheckIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const awayDuration = Math.floor((now - interruptionStartTimeRef.current!) / 1000);
        setTimeAway((prev) => {
          const baseTime = prev - (prev % 60); // Round down to minute
          return baseTime + awayDuration;
        });
      }, 1000);
    } else {
      if (visibilityCheckIntervalRef.current) {
        clearInterval(visibilityCheckIntervalRef.current);
        visibilityCheckIntervalRef.current = null;
      }
    }

    return () => {
      if (visibilityCheckIntervalRef.current) {
        clearInterval(visibilityCheckIntervalRef.current);
      }
    };
  }, [isFocusModeActive, isAppVisible]);

  const startFocusSession = useCallback(() => {
    const now = Date.now();
    const session: FocusSession = {
      id: crypto.randomUUID(),
      startTime: now,
      endTime: null,
      totalTime: 0,
      interruptions: [],
      isActive: true,
    };

    setCurrentSession(session);
    setIsFocusModeActive(true);
    sessionStartTimeRef.current = now;
    setTimeAway(0);
    interruptionStartTimeRef.current = null;

    // Save to localStorage
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  }, []);

  const endFocusSession = useCallback(() => {
    if (!currentSession || !sessionStartTimeRef.current) return;

    const now = Date.now();
    const totalTime = Math.floor((now - sessionStartTimeRef.current) / 1000);
    
    // Calculate total interruption time from all interruptions
    const totalInterruptionTime = currentSession.interruptions.reduce((sum, int) => {
      if (int.endTime) {
        return sum + int.duration;
      } else {
        // If interruption is still in progress, calculate its duration
        return sum + Math.floor((now - int.startTime) / 1000);
      }
    }, 0);
    
    const focusTime = Math.max(0, totalTime - totalInterruptionTime); // Actual focus time minus interruptions

    const completedSession: FocusSession = {
      ...currentSession,
      endTime: now,
      totalTime: focusTime,
      isActive: false,
    };

    // Update stats
    setStats((prev) => {
      const newStats: FocusStats = {
        totalFocusTime: prev.totalFocusTime + focusTime,
        totalInterruptions: prev.totalInterruptions + completedSession.interruptions.length,
        longestStreak: Math.max(prev.longestStreak, focusTime),
        currentStreak: focusTime, // Reset or continue based on logic
        sessionsCompleted: prev.sessionsCompleted + 1,
        averageSessionLength:
          prev.sessionsCompleted > 0
            ? (prev.averageSessionLength * prev.sessionsCompleted + focusTime) / (prev.sessionsCompleted + 1)
            : focusTime,
      };
      localStorage.setItem(FOCUS_STATS_KEY, JSON.stringify(newStats));
      return newStats;
    });

    // Save completed session
    const savedSessions = localStorage.getItem(FOCUS_SESSIONS_KEY);
    const sessions: FocusSession[] = savedSessions ? JSON.parse(savedSessions) : [];
    sessions.push(completedSession);
    localStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(sessions.slice(-50))); // Keep last 50 sessions

    // Clear current session
    setCurrentSession(null);
    setIsFocusModeActive(false);
    sessionStartTimeRef.current = null;
    interruptionStartTimeRef.current = null;
    setTimeAway(0);
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }, [currentSession, timeAway]);

  const getCurrentFocusTime = useCallback((): number => {
    if (!sessionStartTimeRef.current || !isFocusModeActive) return 0;
    const now = Date.now();
    const totalTime = Math.floor((now - sessionStartTimeRef.current) / 1000);
    // Calculate interruption time from current session
    const interruptionTime = currentSession?.interruptions.reduce((sum, int) => {
      if (int.endTime) {
        return sum + int.duration;
      } else {
        // If interruption is still in progress
        return sum + Math.floor((now - int.startTime) / 1000);
      }
    }, 0) || 0;
    return Math.max(0, totalTime - interruptionTime);
  }, [isFocusModeActive, currentSession]);

  // Load session on mount
  useEffect(() => {
    const saved = localStorage.getItem(CURRENT_SESSION_KEY);
    if (saved) {
      try {
        const session: FocusSession = JSON.parse(saved);
        if (session.isActive) {
          setCurrentSession(session);
          setIsFocusModeActive(true);
          sessionStartTimeRef.current = session.startTime;
        }
      } catch (error) {
        console.error('Error loading focus session:', error);
      }
    }
  }, []);

  // Update current session in localStorage
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(currentSession));
    }
  }, [currentSession]);

  return {
    isFocusModeActive,
    currentSession,
    isAppVisible,
    timeAway,
    stats,
    startFocusSession,
    endFocusSession,
    getCurrentFocusTime,
  };
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

