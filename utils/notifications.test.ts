import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, triggerNotification } from './notifications';
import { Task } from '../types';

describe('notifications', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    radius: 100,
    createdAt: Date.now()
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock Notification as a class with static properties
    const MockNotification = vi.fn();
    // @ts-ignore
    MockNotification.permission = 'default';
    // @ts-ignore
    MockNotification.requestPermission = vi.fn();

    global.Notification = MockNotification as any;

    // Mock Navigator ServiceWorker
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          showNotification: vi.fn(),
        }),
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if permission is default', async () => {
      await requestNotificationPermission();
      expect(global.Notification.requestPermission).toHaveBeenCalled();
    });

    it('should not request permission if Notification API is missing', async () => {
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;

      await requestNotificationPermission();

      // Restore
      global.Notification = originalNotification;
    });
  });

  describe('triggerNotification', () => {
    it('should not trigger notification if permission is not granted', async () => {
      // @ts-ignore
      global.Notification.permission = 'denied';
      await triggerNotification(mockTask);

      const registration = await navigator.serviceWorker.ready;
      expect(registration.showNotification).not.toHaveBeenCalled();
      expect(global.Notification).not.toHaveBeenCalled();
    });

    it('should trigger notification via Service Worker if available', async () => {
      // @ts-ignore
      global.Notification.permission = 'granted';

      await triggerNotification(mockTask);

      const registration = await navigator.serviceWorker.ready;
      expect(registration.showNotification).toHaveBeenCalledWith(
        '📍 ¡Llegaste a tu destino!',
        expect.objectContaining({
          body: expect.stringContaining(mockTask.title),
          tag: `geofence-${mockTask.id}`
        })
      );
      // Should not fall back to new Notification
      expect(global.Notification).not.toHaveBeenCalled();
    });

    it('should fall back to window.Notification if Service Worker fails', async () => {
      // @ts-ignore
      global.Notification.permission = 'granted';

      // Mock SW failure
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          ready: Promise.reject(new Error('SW Error')),
        },
        writable: true,
        configurable: true
      });

      await triggerNotification(mockTask);

      expect(global.Notification).toHaveBeenCalledWith(
        '📍 ¡Llegaste a tu destino!',
        expect.objectContaining({
          body: expect.stringContaining(mockTask.title),
          tag: `geofence-${mockTask.id}`
        })
      );
    });

    it('should fall back to window.Notification if Service Worker is missing', async () => {
        // @ts-ignore
        global.Notification.permission = 'granted';

        // Remove Service Worker
        Object.defineProperty(global.navigator, 'serviceWorker', {
          value: undefined,
          writable: true,
          configurable: true
        });

        await triggerNotification(mockTask);

        expect(global.Notification).toHaveBeenCalledWith(
          '📍 ¡Llegaste a tu destino!',
          expect.objectContaining({
            body: expect.stringContaining(mockTask.title),
            tag: `geofence-${mockTask.id}`
          })
        );
      });
  });
});
