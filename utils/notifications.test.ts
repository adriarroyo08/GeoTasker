import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';

describe('utils/notifications', () => {
  // Save original globals
  const originalNotification = window.Notification;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Notification class
    const NotificationMock = vi.fn();
    // @ts-ignore
    NotificationMock.permission = 'default';
    // @ts-ignore
    NotificationMock.requestPermission = vi.fn().mockResolvedValue('granted');

    Object.defineProperty(window, 'Notification', {
      value: NotificationMock,
      writable: true,
      configurable: true
    });

    // Mock navigator.serviceWorker as undefined by default
    Object.defineProperty(window.navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
        configurable: true
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if status is default', async () => {
      // @ts-ignore
      window.Notification.permission = 'default';
      const result = await requestNotificationPermission();
      expect(window.Notification.requestPermission).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return current permission if not default', async () => {
      // @ts-ignore
      window.Notification.permission = 'granted';
      const result = await requestNotificationPermission();
      expect(window.Notification.requestPermission).not.toHaveBeenCalled();
      expect(result).toBe('granted');
    });
  });

  describe('sendNotification', () => {
    it('should use Service Worker if available', async () => {
       // @ts-ignore
       window.Notification.permission = 'granted';
       const showNotificationMock = vi.fn();

       const mockServiceWorker = {
           ready: Promise.resolve({
               showNotification: showNotificationMock
           })
       };

       Object.defineProperty(window.navigator, 'serviceWorker', {
           value: mockServiceWorker,
           writable: true,
           configurable: true
       });

       await sendNotification('Test Title', { body: 'Test Body' });

       expect(showNotificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    });

    it('should fallback to Notification API if Service Worker is missing', async () => {
        // @ts-ignore
        window.Notification.permission = 'granted';

        await sendNotification('Fallback Title', { body: 'Fallback Body' });

        expect(window.Notification).toHaveBeenCalledWith('Fallback Title', { body: 'Fallback Body' });
    });

    it('should request permission if default before sending', async () => {
        // @ts-ignore
        window.Notification.permission = 'default';

        await sendNotification('Test', {});

        expect(window.Notification.requestPermission).toHaveBeenCalled();
    });
  });
});
