import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, triggerNotification } from './notifications';
import { Task } from '../types';

describe('Notifications Utility', () => {
  const originalNotification = window.Notification;
  // Use Object.getOwnPropertyDescriptor to properly capture original navigator state if needed,
  // but saving reference is usually enough if we restore the whole property.
  const originalNavigator = window.navigator;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Notification
    const MockNotification = vi.fn();
    Object.defineProperty(MockNotification, 'permission', {
        value: 'default',
        writable: true
    });
    MockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
    window.Notification = MockNotification as any;

    // Mock Navigator ServiceWorker
    // We define a mock navigator object
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'node',
        serviceWorker: {
          ready: Promise.resolve({
            showNotification: vi.fn(),
          }),
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    window.Notification = originalNotification;
    Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if permission is default', async () => {
      await requestNotificationPermission();
      expect(window.Notification.requestPermission).toHaveBeenCalled();
    });

    it('should not request permission if permission is already granted', async () => {
      // @ts-ignore
      window.Notification.permission = 'granted';
      await requestNotificationPermission();
      expect(window.Notification.requestPermission).not.toHaveBeenCalled();
    });
  });

  describe('triggerNotification', () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      radius: 100,
      isCompleted: false,
      createdAt: Date.now(),
      location: { lat: 0, lng: 0 }
    };

    it('should do nothing if permission is not granted', async () => {
      // @ts-ignore
      window.Notification.permission = 'denied';
      await triggerNotification(mockTask);

      const sw = await navigator.serviceWorker.ready;
      expect(sw.showNotification).not.toHaveBeenCalled();
      expect(window.Notification).not.toHaveBeenCalled();
    });

    it('should use ServiceWorker notification if available', async () => {
      // @ts-ignore
      window.Notification.permission = 'granted';
      await triggerNotification(mockTask);

      const sw = await navigator.serviceWorker.ready;
      expect(sw.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
          body: expect.stringContaining('Test Task'),
          data: { taskId: '1' }
        })
      );
      // Should not call window.Notification constructor if SW succeeded
      expect(window.Notification).not.toHaveBeenCalled();
    });

    it('should fallback to window.Notification if ServiceWorker is missing', async () => {
       // @ts-ignore
       window.Notification.permission = 'granted';

       // Remove SW
       Object.defineProperty(window, 'navigator', {
        value: {
            ...originalNavigator,
            serviceWorker: undefined
        },
        writable: true,
        configurable: true
      });

      await triggerNotification(mockTask);

      expect(window.Notification).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
            body: expect.stringContaining('Test Task')
        })
      );
    });
  });
});
