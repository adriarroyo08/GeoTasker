// Extended NotificationOptions to support renotify and other PWA features
export interface ExtendedNotificationOptions extends NotificationOptions {
  renotify?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

/**
 * Requests permission for notifications if not already granted or denied.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

/**
 * Sends a notification using the Service Worker if available, falling back to the Notification API.
 */
export const sendNotification = async (title: string, options: ExtendedNotificationOptions = {}) => {
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted.');
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

  // Fallback to standard Notification API
  // Note: We cast options to any because standard Notification constructor might complain about PWA-specific fields
  // depending on the TypeScript lib configuration, but browsers generally ignore unknown fields.
  new Notification(title, options as any);
};
