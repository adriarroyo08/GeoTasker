import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';
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

  const originalServiceWorker = navigator.serviceWorker;

  beforeEach(() => {
    // Mock Notification API
    const requestPermissionMock = vi.fn();

    // We create a mock class for Notification
    const MockNotification = vi.fn();
    // @ts-ignore
    MockNotification.requestPermission = requestPermissionMock;
    // @ts-ignore
    MockNotification.permission = 'default';

    vi.stubGlobal('Notification', MockNotification);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      configurable: true
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if current permission is default', async () => {
      // @ts-ignore
      Notification.permission = 'default';
      await requestNotificationPermission();
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it('should not request permission if current permission is granted', async () => {
      // @ts-ignore
      Notification.permission = 'granted';
      await requestNotificationPermission();
      expect(Notification.requestPermission).not.toHaveBeenCalled();
    });

    it('should not crash if Notification is not available', async () => {
      vi.stubGlobal('Notification', undefined);
      await requestNotificationPermission();
    });
  });

  describe('sendNotification', () => {
    it('should not send notification if permission is not granted', async () => {
      // @ts-ignore
      Notification.permission = 'default';
      await sendNotification(mockTask);
      expect(Notification).not.toHaveBeenCalled();
    });

    it('should try service worker first', async () => {
      // @ts-ignore
      Notification.permission = 'granted';

      const showNotificationMock = vi.fn();
      const registrationMock = {
        showNotification: showNotificationMock
      };

      // Mock navigator.serviceWorker
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve(registrationMock)
        },
        configurable: true
      });

      await sendNotification(mockTask);
      expect(showNotificationMock).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
            body: expect.stringContaining('Test Task'),
            data: { taskId: '123' }
        })
      );
    });

    it('should fallback to window.Notification if SW fails', async () => {
      // @ts-ignore
      Notification.permission = 'granted';

      // Mock navigator.serviceWorker as undefined
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true
      });

      await sendNotification(mockTask);
      expect(Notification).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
            body: expect.stringContaining('Test Task')
        })
      );
    });
  });
});
