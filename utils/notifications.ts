
export interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: any[];
  vibrate?: number[];
  renotify?: boolean;
}

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'default'> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this environment.');
    return 'default';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

export const sendNotification = async (title: string, options: ExtendedNotificationOptions = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted.');
    return;
  }

  try {
    // Try Service Worker first (required for Android/PWA in some contexts)
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
  } catch (err) {
    console.warn('Service Worker notification failed, falling back to window.Notification:', err);
  }

  // Fallback
  try {
    new Notification(title, options);
  } catch (err) {
     console.error('Notification API failed:', err);
  }
};
