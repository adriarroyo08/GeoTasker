import { Task } from '../types';

/**
 * Requests notification permission from the user if not already granted.
 */
export const requestNotificationPermission = async (): Promise<void> => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

/**
 * Sends a notification for a task, prioritizing Service Worker if available.
 * @param task The task for which to send the notification.
 */
export const sendTaskNotification = async (task: Task): Promise<void> => {
  if (Notification.permission !== 'granted') return;

  const title = `📍 ¡Llegaste a tu destino!`;
  const options: NotificationOptions & { data?: any } = {
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
        // serviceWorker.ready resolves to ServiceWorkerRegistration which has showNotification
        await registration.showNotification(title, options);
        return;
      }
    }
  } catch (err) {
    console.warn('SW notification failed, falling back to window Notification', err);
  }

  // Fallback
  new Notification(title, options);
};
