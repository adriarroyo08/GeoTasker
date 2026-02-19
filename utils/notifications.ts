
export interface ExtendedNotificationOptions extends NotificationOptions {
  renotify?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

export const triggerNotification = async (title: string, options: ExtendedNotificationOptions) => {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    // Check for service worker support explicitly
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        // Cast options to any because showNotification expects standard NotificationOptions
        // but browsers support extended properties
        await registration.showNotification(title, options as any);
        return;
      }
    }
  } catch (err) {
    console.warn('SW notification failed, falling back to window Notification', err);
  }

  try {
    new Notification(title, options);
  } catch (err) {
    console.error('Notification API failed', err);
  }
};
