import { Task } from '../types';
import { DEFAULT_ICON } from '../constants';

// Extended options interface to include PWA specific properties not always present in standard TS lib
export interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: any[];
  vibrate?: number[];
  renotify?: boolean;
}

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const sendNotification = async (task: Task) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const title = `📍 ¡Llegaste a tu destino!`;
  const iconUrl = DEFAULT_ICON.options.iconUrl || '/images/marker-icon.png';

  const options: ExtendedNotificationOptions = {
    body: `Estás cerca de: ${task.title}\n${task.description || ''}`,
    icon: iconUrl,
    badge: iconUrl,
    tag: `geofence-${task.id}`,
    renotify: true,
    vibrate: [200, 100, 200],
    data: { taskId: task.id }
  };

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
  } catch (err) {
    console.warn('SW notification failed, falling back to window Notification', err);
  }

  new Notification(title, options);
};
