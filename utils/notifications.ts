import { Task } from "../types";
export interface ExtendedNotificationOptions extends NotificationOptions {
    actions?: NotificationAction[];
    vibrate?: number[];
    renotify?: boolean;
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'denied';
    }

    if (Notification.permission === 'default') {
        return await Notification.requestPermission();
    }

    return Notification.permission;
};

export const triggerGeofenceNotification = (task: Task) => {
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
  sendNotification(title, options);
};

export const sendNotification = async (title: string, options: ExtendedNotificationOptions) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
    }

    if (Notification.permission !== 'granted') {
        return;
    }

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
