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

  const originalNotification = window.Notification;
  const originalServiceWorker = navigator.serviceWorker;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'Notification', {
      value: originalNotification,
      writable: true
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      configurable: true
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if default', async () => {
      const requestPermissionMock = vi.fn();

      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: requestPermissionMock
        },
        writable: true
      });

      await requestNotificationPermission();
      expect(requestPermissionMock).toHaveBeenCalled();
    });

    it('should not request permission if already granted', async () => {
      const requestPermissionMock = vi.fn();

      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'granted',
          requestPermission: requestPermissionMock
        },
        writable: true
      });

      await requestNotificationPermission();
      expect(requestPermissionMock).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('should not send notification if permission is denied', async () => {
      const notificationConstructorMock = vi.fn();

      Object.defineProperty(window, 'Notification', {
        value: class {
          static permission = 'denied';
          constructor() { notificationConstructorMock(); }
        },
        writable: true
      });

      await sendNotification(mockTask);
      expect(notificationConstructorMock).not.toHaveBeenCalled();
    });

    it('should use ServiceWorker if available', async () => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'granted',
        },
        writable: true
      });

      const showNotificationMock = vi.fn();
      const serviceWorkerMock = {
        ready: Promise.resolve({
          showNotification: showNotificationMock
        })
      };

      Object.defineProperty(navigator, 'serviceWorker', {
        value: serviceWorkerMock,
        configurable: true
      });

      await sendNotification(mockTask);
      expect(showNotificationMock).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({ body: expect.stringContaining('Test Task') })
      );
    });

    it('should fallback to Notification API if ServiceWorker fails or missing', async () => {
      const notificationConstructorMock = vi.fn();

      Object.defineProperty(window, 'Notification', {
        value: class {
          static permission = 'granted';
          constructor(title: string, options: any) {
             notificationConstructorMock(title, options);
          }
        },
        writable: true
      });

      // Mock SW as undefined
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true
      });

      await sendNotification(mockTask);
      expect(notificationConstructorMock).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({ body: expect.stringContaining('Test Task') })
      );
    });
  });
});
