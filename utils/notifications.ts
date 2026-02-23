
export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
  actions?: NotificationAction[];
}

export const requestNotificationPermission = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const sendNotification = async (
  title: string,
  options?: ExtendedNotificationOptions
): Promise<void> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
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
  new Notification(title, options);
};
