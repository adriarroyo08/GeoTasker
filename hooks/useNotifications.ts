import { useCallback } from 'react';

export const useNotifications = () => {
  // Function to request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const notify = useCallback(async (title: string, options: NotificationOptions) => {
    if (Notification.permission !== 'granted') return;

    try {
      if ('serviceWorker' in navigator) {
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
  }, []);

  return { requestPermission, notify };
};
