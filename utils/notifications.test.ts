import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';
import { Task } from '../types';

describe('utils/notifications', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Pharmacy',
    description: 'Buy meds',
    radius: 200,
    isCompleted: false,
    createdAt: Date.now(),
    location: { lat: 0, lng: 0 }
  };

  const notificationMock = vi.fn();
  const requestPermissionMock = vi.fn().mockResolvedValue('granted');
  const showNotificationMock = vi.fn();

  const originalNotification = global.Notification;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Notification API
    global.Notification = class {
      static permission = 'granted';
      static requestPermission = requestPermissionMock;
      constructor(title: string, options: any) {
        notificationMock(title, options);
      }
    } as any;

    // Mock Navigator ServiceWorker
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          showNotification: showNotificationMock
        })
      },
      writable: true,
      configurable: true // Important for re-mocking
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.Notification = originalNotification;
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if default', async () => {
      // @ts-ignore
      global.Notification.permission = 'default';
      await requestNotificationPermission();
      expect(requestPermissionMock).toHaveBeenCalled();
    });

    it('should NOT request permission if already granted', async () => {
      // @ts-ignore
      global.Notification.permission = 'granted';
      await requestNotificationPermission();
      expect(requestPermissionMock).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('should use Service Worker if available', async () => {
      await sendNotification(mockTask);

      expect(showNotificationMock).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
          body: expect.stringContaining('Pharmacy'),
          data: { taskId: '1' }
        })
      );
      expect(notificationMock).not.toHaveBeenCalled();
    });

    it('should fallback to Notification API if Service Worker fails/missing', async () => {
      // Remove Service Worker mock
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: undefined,
        writable: true
      });

      await sendNotification(mockTask);

      expect(notificationMock).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
          body: expect.stringContaining('Pharmacy')
        })
      );
    });

    it('should not send notification if permission not granted', async () => {
      // @ts-ignore
      global.Notification.permission = 'denied';
      await sendNotification(mockTask);
      expect(showNotificationMock).not.toHaveBeenCalled();
      expect(notificationMock).not.toHaveBeenCalled();
    });
  });
});
