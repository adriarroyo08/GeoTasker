import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';

describe('utils/notifications', () => {
  let originalNotification: any;
  let originalNavigatorDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalNotification = global.Notification;
    originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(global, 'navigator');

    // Mock Notification
    global.Notification = {
      permission: 'default',
      requestPermission: vi.fn(),
    } as any;
  });

  afterEach(() => {
    global.Notification = originalNotification;

    if (originalNavigatorDescriptor) {
      Object.defineProperty(global, 'navigator', originalNavigatorDescriptor);
    }
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if state is default', async () => {
      await requestNotificationPermission();
      expect(global.Notification.requestPermission).toHaveBeenCalled();
    });

    it('should not request permission if Notification is undefined', async () => {
      // @ts-ignore
      global.Notification = undefined;
      await requestNotificationPermission();
      // Expect no error
    });
  });

  describe('sendNotification', () => {
    it('should not send if permission is not granted', async () => {
      // @ts-ignore
      global.Notification.permission = 'denied';

      // Mock SW
      const showNotification = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: {
          serviceWorker: {
            ready: Promise.resolve({ showNotification })
          }
        },
        configurable: true
      });

      await sendNotification('Test');
      expect(showNotification).not.toHaveBeenCalled();
    });

    it('should use ServiceWorker if available', async () => {
      // @ts-ignore
      global.Notification.permission = 'granted';

      const showNotification = vi.fn();
      Object.defineProperty(global, 'navigator', {
        value: {
          serviceWorker: {
            ready: Promise.resolve({ showNotification })
          }
        },
        configurable: true
      });

      await sendNotification('Test', { body: 'foo' });
      expect(showNotification).toHaveBeenCalledWith('Test', expect.objectContaining({ body: 'foo' }));
    });

    it('should fallback to window.Notification if SW is missing', async () => {
      // Mock Notification constructor
      const notificationConstructor = vi.fn();
      // @ts-ignore
      global.Notification = notificationConstructor;
      // @ts-ignore
      global.Notification.permission = 'granted';

      // Mock Navigator without serviceWorker
      Object.defineProperty(global, 'navigator', {
        value: {},
        configurable: true
      });

      await sendNotification('TestFallback', { body: 'bar' });
      expect(notificationConstructor).toHaveBeenCalledWith('TestFallback', expect.objectContaining({ body: 'bar' }));
    });
  });
});
