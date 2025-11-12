const CACHE_NAME = 'rise-app-v1';
const NOTIFICATION_TIMES = ['08:00', '14:00', '20:00']; // 8 AM, 2 PM, 8 PM

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Check for notification times
function checkNotificationTimes() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Check if current time matches any notification time
  if (NOTIFICATION_TIMES.includes(currentTime)) {
    // Get habits from IndexedDB or postMessage
    getHabitsAndSendNotifications(currentDay);
  }
}

// Get habits and send notifications
async function getHabitsAndSendNotifications(currentDay) {
  try {
    // Try to get habits from IndexedDB
    const db = await openDB();
    const habits = await getHabitsFromDB(db);
    
    if (habits && habits.length > 0) {
      const activeHabits = habits.filter(habit => {
        // Check if habit is scheduled for today
        return habit.weekdays && habit.weekdays.includes(currentDay);
      });

      if (activeHabits.length > 0) {
        // Send notification for each active habit
        for (const habit of activeHabits) {
          await self.registration.showNotification('Rise Reminder', {
            body: `Time for: ${habit.action}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `habit-${habit.id}`,
            requireInteraction: false,
            vibrate: [200, 100, 200],
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rise-app-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
    };
  });
}

// Get habits from IndexedDB
function getHabitsFromDB(db) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['habits'], 'readonly');
      const store = transaction.objectStore('habits');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    } catch (error) {
      reject(error);
    }
  });
}

// Pomodoro timer state
let pomodoroTimerState = null;
let pomodoroCheckInterval = null;

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_HABITS') {
    syncHabitsToDB(event.data.habits);
  } else if (event.data && event.data.type === 'POMODORO_TIMER_UPDATE') {
    pomodoroTimerState = event.data.state;
    startPomodoroTimerCheck();
  } else if (event.data && event.data.type === 'POMODORO_TIMER_CLEAR') {
    pomodoroTimerState = null;
    stopPomodoroTimerCheck();
  } else if (event.data && event.data.type === 'POMODORO_NOTIFICATION') {
    // Send notification immediately
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'pomodoro-timer',
      requireInteraction: false,
      vibrate: [200, 100, 200],
    });
  }
});

// Start checking Pomodoro timer
function startPomodoroTimerCheck() {
  if (pomodoroCheckInterval) {
    clearInterval(pomodoroCheckInterval);
  }
  
  pomodoroCheckInterval = setInterval(() => {
    checkPomodoroTimer();
  }, 1000); // Check every second
}

// Stop checking Pomodoro timer
function stopPomodoroTimerCheck() {
  if (pomodoroCheckInterval) {
    clearInterval(pomodoroCheckInterval);
    pomodoroCheckInterval = null;
  }
}

// Check if Pomodoro timer has completed
function checkPomodoroTimer() {
  if (!pomodoroTimerState) {
    return;
  }

  const now = Date.now();
  
  // If paused, don't check
  if (pomodoroTimerState.isPaused) {
    return;
  }

  // Check if timer has completed
  if (pomodoroTimerState.timerEndTimestamp && now >= pomodoroTimerState.timerEndTimestamp) {
    const mode = pomodoroTimerState.mode;
    
    if (mode === 'work') {
      // Work timer completed
      self.registration.showNotification('Work Session Complete!', {
        body: 'Time for a break. Rest timer starting now.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'pomodoro-work-complete',
        requireInteraction: false,
        vibrate: [200, 100, 200],
      });
      
      // Start rest timer
      if (pomodoroTimerState.settings) {
        const restMinutes = pomodoroTimerState.settings.restMinutes || 5;
        pomodoroTimerState.mode = 'rest';
        pomodoroTimerState.timerEndTimestamp = now + (restMinutes * 60 * 1000);
        pomodoroTimerState.isPaused = false;
      }
    } else if (mode === 'rest') {
      // Rest timer completed
      self.registration.showNotification('Break Complete!', {
        body: 'Ready to work again. Start a new work session when ready.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'pomodoro-rest-complete',
        requireInteraction: false,
        vibrate: [200, 100, 200],
      });
      
      // Clear timer
      pomodoroTimerState = null;
      stopPomodoroTimerCheck();
    }
  }
}

// Sync habits to IndexedDB
async function syncHabitsToDB(habits) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['habits'], 'readwrite');
    const store = transaction.objectStore('habits');
    
    // Clear existing habits
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
    
    // Add new habits
    for (const habit of habits) {
      await new Promise((resolve, reject) => {
        const addRequest = store.add(habit);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }
  } catch (error) {
    console.error('Error syncing habits to DB:', error);
  }
}

// Check every minute for notification times
setInterval(checkNotificationTimes, 60000);

// Check immediately on activation
checkNotificationTimes();

