import React, { useEffect } from 'react';

interface ReminderManagerProps {
  reminders: Array<{ id: string; title: string; time: string }>;
}

function scheduleNextTimeout(reminderTime: string, cb: () => void) {
  const now = new Date();
  const [hh, mm] = reminderTime.split(':').map((v) => parseInt(v, 10));
  const next = new Date();
  next.setHours(hh, mm, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  const ms = next.getTime() - now.getTime();
  return window.setTimeout(cb, ms);
}

const ReminderManager: React.FC<ReminderManagerProps> = ({ reminders }) => {
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const ensurePermission = async () => {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
      return false;
    };

    const scheduleAll = async () => {
      const ok = await ensurePermission();
      const makeFire = (title: string, time: string) => {
        const fire = () => {
          if (!cancelled && ok && 'Notification' in window) {
            try {
              new Notification('Rise Reminder', { body: title });
            } catch {}
          }
          const t = scheduleNextTimeout(time, fire);
          timers.push(t);
        };
        return fire;
      };
      for (const r of reminders) {
        const fire = makeFire(r.title, r.time);
        const t = scheduleNextTimeout(r.time, fire);
        timers.push(t);
      }
    };

    scheduleAll();
    return () => {
      cancelled = true;
      for (const t of timers) window.clearTimeout(t);
    };
  }, [reminders]);

  return null;
};

export default ReminderManager;


