import { Task } from '../types';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const triggerNotification = async (task: Task) => {
  if (Notification.permission !== 'granted') return;

  const title = `📍 ¡Llegaste a tu destino!`;
  // Using 'any' for options to support non-standard properties like 'vibrate' without complex type augmentation
  const options: any = {
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
