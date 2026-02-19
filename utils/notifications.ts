import { Task } from '../types';

export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: VibratePattern;
  actions?: NotificationAction[];
  renotify?: boolean;
}

export const requestNotificationPermission = async (): Promise<NotificationPermission | void> => {
  if (typeof Notification === 'undefined') return;

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
};

export const sendTaskNotification = async (task: Task) => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const title = `📍 ¡Llegaste a tu destino!`;
  const options: ExtendedNotificationOptions = {
    body: `Estás cerca de: ${task.title}\n${task.description || ''}`,
    icon: '/images/marker-icon.png',
    badge: '/images/marker-icon.png',
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
