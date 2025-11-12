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

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_HABITS') {
    syncHabitsToDB(event.data.habits);
  }
});

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

