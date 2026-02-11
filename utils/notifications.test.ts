import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendTaskNotification } from './notifications';
import { Task } from '../types';

describe('utils/notifications', () => {
  const mockTask: Task = {
    id: '123',
    title: 'Test Task',
    description: 'Test Description',
    radius: 100,
    isCompleted: false,
    createdAt: Date.now(),
    location: { lat: 0, lng: 0 }
  };

  const notificationMock = vi.fn();
  const requestPermissionMock = vi.fn().mockResolvedValue('granted');
  const showNotificationMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global Notification
    Object.defineProperty(window, 'Notification', {
      value: class Notification {
        static permission = 'default';
        static requestPermission = requestPermissionMock;
        constructor(title: string, options: any) {
          notificationMock(title, options);
        }
      },
      writable: true,
      configurable: true // essential for repeated definitions
    });

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          showNotification: showNotificationMock
        })
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Restore if needed, or rely on beforeEach to reset
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if default', async () => {
      // @ts-ignore
      window.Notification.permission = 'default';
      await requestNotificationPermission();
      expect(requestPermissionMock).toHaveBeenCalled();
    });

    it('should not request permission if already granted', async () => {
      // @ts-ignore
      window.Notification.permission = 'granted';
      await requestNotificationPermission();
      expect(requestPermissionMock).not.toHaveBeenCalled();
    });

    it('should not request permission if denied', async () => {
      // @ts-ignore
      window.Notification.permission = 'denied';
      await requestNotificationPermission();
      expect(requestPermissionMock).not.toHaveBeenCalled();
    });
  });

  describe('sendTaskNotification', () => {
    it('should do nothing if permission is not granted', async () => {
      // @ts-ignore
      window.Notification.permission = 'denied';
      await sendTaskNotification(mockTask);
      expect(showNotificationMock).not.toHaveBeenCalled();
      expect(notificationMock).not.toHaveBeenCalled();
    });

    it('should use Service Worker if available', async () => {
      // @ts-ignore
      window.Notification.permission = 'granted';

      await sendTaskNotification(mockTask);

      expect(showNotificationMock).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
          body: expect.stringContaining('Test Task'),
          tag: 'geofence-123'
        })
      );
      expect(notificationMock).not.toHaveBeenCalled();
    });

    it('should fallback to window.Notification if Service Worker fails', async () => {
       // @ts-ignore
       window.Notification.permission = 'granted';

       // Mock SW failure
       Object.defineProperty(navigator, 'serviceWorker', {
         value: {
           ready: Promise.reject(new Error('SW Error'))
         },
         writable: true,
         configurable: true
       });

       const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

       await sendTaskNotification(mockTask);

       expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SW notification failed'), expect.any(Error));
       expect(notificationMock).toHaveBeenCalledWith(
         expect.stringContaining('Llegaste'),
         expect.objectContaining({
           body: expect.stringContaining('Test Task')
         })
       );

       consoleSpy.mockRestore();
    });

    it('should fallback to window.Notification if Service Worker is not supported', async () => {
       // @ts-ignore
       window.Notification.permission = 'granted';

       // Delete serviceWorker from navigator
       // In JSDOM, properties are configurable by default usually, but let's try to redefine
       Object.defineProperty(navigator, 'serviceWorker', {
         value: undefined,
         writable: true,
         configurable: true
       });

       await sendTaskNotification(mockTask);

       expect(notificationMock).toHaveBeenCalled();
    });
  });
});
