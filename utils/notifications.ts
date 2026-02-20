
export interface ExtendedNotificationOptions extends NotificationOptions {
  renotify?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof Notification === 'undefined') {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

export const sendNotification = async (title: string, options: ExtendedNotificationOptions = {}) => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
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
  } catch (error) {
    console.warn('Service Worker notification failed, falling back to Notification API', error);
  }

  // Fallback to Notification API
  try {
    new Notification(title, options);
  } catch (e) {
    console.error('Notification API failed:', e);
  }
};
