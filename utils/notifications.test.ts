import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';

describe('utils/notifications', () => {
  const requestPermissionMock = vi.fn();
  const showNotificationMock = vi.fn();
  const notificationConstructorMock = vi.fn();
  let originalServiceWorker: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global Notification
    global.Notification = class {
      static permission: NotificationPermission = 'default';
      static requestPermission = requestPermissionMock;
      constructor(title: string, options: any) {
        notificationConstructorMock(title, options);
      }
    } as any;

    // Mock console.warn to keep output clean
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Save original serviceWorker
    originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as any).Notification;

    // Restore serviceWorker
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    } else {
        // If it didn't exist or wasn't configurable, try to delete if we added it
        // Check if we can delete it
        try {
             // @ts-ignore
            delete navigator.serviceWorker;
        } catch (e) {
            // ignore
        }
    }
  });

  describe('requestNotificationPermission', () => {
    it('should return "denied" if Notification is not supported', async () => {
      // Temporarily remove Notification
      const originalNotification = global.Notification;
      delete (global as any).Notification;

      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
      expect(console.warn).toHaveBeenCalledWith('This browser does not support notifications.');

      global.Notification = originalNotification;
    });

    it('should request permission if current permission is "default"', async () => {
      requestPermissionMock.mockResolvedValue('granted');
      const result = await requestNotificationPermission();
      expect(requestPermissionMock).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return current permission if not "default"', async () => {
      // @ts-ignore
      Notification.permission = 'granted';
      const result = await requestNotificationPermission();
      // Should not call requestPermission
      expect(requestPermissionMock).not.toHaveBeenCalled();
      expect(result).toBe('granted');
    });
  });

  describe('sendNotification', () => {
    it('should warn and return if permission is not granted', async () => {
        // @ts-ignore
        Notification.permission = 'denied';
        await sendNotification('Test');
        expect(console.warn).toHaveBeenCalledWith('Notification permission not granted.');
        expect(showNotificationMock).not.toHaveBeenCalled();
        expect(notificationConstructorMock).not.toHaveBeenCalled();
    });

    it('should use Service Worker if available', async () => {
        // @ts-ignore
        Notification.permission = 'granted';

        const mockServiceWorker = {
            ready: Promise.resolve({
                showNotification: showNotificationMock
            })
        };

        Object.defineProperty(navigator, 'serviceWorker', {
            value: mockServiceWorker,
            configurable: true,
            writable: true
        });

        await sendNotification('Test Title', { body: 'Test Body' });

        expect(showNotificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
        expect(notificationConstructorMock).not.toHaveBeenCalled();
    });

    it('should fall back to standard Notification if SW is not available', async () => {
        // @ts-ignore
        Notification.permission = 'granted';

        // Remove serviceWorker from navigator
        Object.defineProperty(navigator, 'serviceWorker', {
            value: undefined,
            configurable: true,
            writable: true
        });

        await sendNotification('Test Title', { body: 'Test Body' });

        expect(notificationConstructorMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    });

    it('should fall back to standard Notification if SW throws error', async () => {
        // @ts-ignore
        Notification.permission = 'granted';

         const mockServiceWorker = {
            ready: Promise.reject(new Error('SW Error'))
        };

        Object.defineProperty(navigator, 'serviceWorker', {
            value: mockServiceWorker,
            configurable: true,
            writable: true
        });

        await sendNotification('Test Title', { body: 'Test Body' });

        expect(console.warn).toHaveBeenCalledWith(
            'SW notification failed, falling back to window Notification',
            expect.any(Error)
        );
        expect(notificationConstructorMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    });
  });
});
