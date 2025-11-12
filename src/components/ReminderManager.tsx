import React, { useEffect } from 'react';
import { HabitItem } from './HabitsBoard';
import { HabitNote } from './HabitNotes';

interface ReminderManagerProps {
  habits: HabitItem[];
  notesByHabit: Record<string, HabitNote[]>;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({ habits, notesByHabit }) => {
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Sync habits to service worker via IndexedDB
    if ('serviceWorker' in navigator && 'indexedDB' in window) {
      syncHabitsToServiceWorker(habits);
    }
  }, [habits]);

  const syncHabitsToServiceWorker = async (habits: HabitItem[]) => {
    try {
      // Store habits in IndexedDB for service worker access
      const db = await openIndexedDB();
      const transaction = db.transaction(['habits'], 'readwrite');
      const store = transaction.objectStore('habits');
      
      // Clear existing
      await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });
      
      // Add all habits
      for (const habit of habits) {
        await new Promise<void>((resolve, reject) => {
          const addRequest = store.add(habit);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        });
      }

      // Also send message to service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_HABITS',
          habits: habits,
        });
      }
    } catch (error) {
      console.error('Error syncing habits to service worker:', error);
    }
  };

  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('rise-app-db', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
      };
    });
  };

  return null;
};

export default ReminderManager;
