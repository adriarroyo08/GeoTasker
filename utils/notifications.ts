
export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
  actions?: NotificationAction[]; // Added actions for better PWA support
}

/**
 * Requests notification permission from the user.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

/**
 * Triggers a system notification, prioritizing Service Worker if available.
 */
export const sendNotification = async (title: string, options: ExtendedNotificationOptions = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  // Ensure we have permission
  if (Notification.permission === 'default') {
      await requestNotificationPermission();
  }

  if (Notification.permission !== 'granted') return;

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

  // Fallback to standard Notification API
  try {
    new Notification(title, options);
  } catch (e) {
     console.error("Notification API failed", e);
  }
};
