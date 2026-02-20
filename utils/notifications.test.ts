import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';

describe('utils/notifications', () => {
  const originalNotification = global.Notification;
  const originalNavigatorServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  beforeEach(() => {
    // Mock Notification
    global.Notification = vi.fn() as any;
    global.Notification.requestPermission = vi.fn();
    global.Notification.permission = 'default';

    // Mock Service Worker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          showNotification: vi.fn(),
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    global.Notification = originalNotification;
    if (originalNavigatorServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalNavigatorServiceWorker);
    } else {
      // If it didn't exist, we can't fully restore undefined in strict mode easily,
      // but usually jsdom has it. If not, we can just leave the mock or try to delete.
      // For safety in jsdom environment, checking if it was configurable is good.
    }
    vi.clearAllMocks();
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if default', async () => {
      global.Notification.permission = 'default';
      (global.Notification.requestPermission as any).mockResolvedValue('granted');

      const result = await requestNotificationPermission();

      expect(global.Notification.requestPermission).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return current permission if already granted or denied', async () => {
      global.Notification.permission = 'granted';

      const result = await requestNotificationPermission();

      expect(global.Notification.requestPermission).not.toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return denied if Notification API is undefined', async () => {
      const globalAny = global as any;
      const temp = globalAny.Notification;
      delete globalAny.Notification;

      const result = await requestNotificationPermission();
      expect(result).toBe('denied');

      globalAny.Notification = temp;
    });
  });

  describe('sendNotification', () => {
    it('should not send notification if permission not granted', async () => {
      global.Notification.permission = 'denied';
      const showNotificationMock = vi.fn();

      // Setup mock
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve({ showNotification: showNotificationMock }),
        },
        configurable: true
      });

      await sendNotification('Test');

      expect(showNotificationMock).not.toHaveBeenCalled();
      expect(global.Notification).not.toHaveBeenCalled();
    });

    it('should use Service Worker if available', async () => {
      global.Notification.permission = 'granted';
      const showNotificationMock = vi.fn();

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve({ showNotification: showNotificationMock }),
        },
        configurable: true
      });

      await sendNotification('Test Title', { body: 'Test Body' });

      expect(showNotificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
      expect(global.Notification).not.toHaveBeenCalled();
    });

    it('should fallback to Notification API if Service Worker fails', async () => {
      global.Notification.permission = 'granted';

      // Mock SW to throw or not have showNotification
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.reject('SW Error'),
        },
        configurable: true
      });

      await sendNotification('Test Title', { body: 'Test Body' });

      expect(global.Notification).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    });

    it('should fallback to Notification API if Service Worker is undefined', async () => {
      global.Notification.permission = 'granted';

      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true
      });

      await sendNotification('Test Title');

      expect(global.Notification).toHaveBeenCalledWith('Test Title', {});
    });
  });
});
