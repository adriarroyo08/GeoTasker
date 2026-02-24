import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';
import { Task } from '../types';

describe('utils/notifications', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    radius: 100,
    isCompleted: false,
    createdAt: Date.now(),
    location: { lat: 0, lng: 0 }
  };

  const notificationMock = vi.fn();
  const requestPermissionMock = vi.fn();

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
      configurable: true // Important for re-defining
    });

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if default', async () => {
      // @ts-ignore
      window.Notification.permission = 'default';
      await requestNotificationPermission();
      expect(requestPermissionMock).toHaveBeenCalled();
    });

    it('should NOT request permission if already granted', async () => {
      // @ts-ignore
      window.Notification.permission = 'granted';
      await requestNotificationPermission();
      expect(requestPermissionMock).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('should send window notification if service worker is not available', async () => {
      // @ts-ignore
      window.Notification.permission = 'granted';

      await sendNotification(mockTask);

      expect(notificationMock).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({ body: expect.stringContaining('Test Task') })
      );
    });

    it('should use service worker notification if available', async () => {
       // @ts-ignore
       window.Notification.permission = 'granted';

       const showNotificationMock = vi.fn();
       const serviceWorkerMock = {
           ready: Promise.resolve({
               showNotification: showNotificationMock
           })
       };

       Object.defineProperty(navigator, 'serviceWorker', {
           value: serviceWorkerMock,
           writable: true,
           configurable: true
       });

       await sendNotification(mockTask);

       expect(showNotificationMock).toHaveBeenCalledWith(
           expect.stringContaining('Llegaste'),
           expect.objectContaining({ body: expect.stringContaining('Test Task') })
       );
       expect(notificationMock).not.toHaveBeenCalled();
    });

    it('should fallback to window notification if service worker fails', async () => {
        // @ts-ignore
        window.Notification.permission = 'granted';

        const serviceWorkerMock = {
            ready: Promise.reject('SW Error')
        };

        Object.defineProperty(navigator, 'serviceWorker', {
            value: serviceWorkerMock,
            writable: true,
            configurable: true
        });

        await sendNotification(mockTask);

        expect(notificationMock).toHaveBeenCalled();
    });

    it('should NOT send notification if permission not granted', async () => {
        // @ts-ignore
        window.Notification.permission = 'denied';

        await sendNotification(mockTask);

        expect(notificationMock).not.toHaveBeenCalled();
    });
  });
});
