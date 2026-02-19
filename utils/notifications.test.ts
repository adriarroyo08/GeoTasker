import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendTaskNotification } from './notifications';
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

  const originalNotification = global.Notification;
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.Notification = originalNotification;
    // We can't easily restore navigator if we modified it deeply, but we can try to restore the property if we used defineProperty.
    // However, defining it on the instance might shadow the prototype.
    // For safety, let's just use defineProperty with configurable: true and restore it.
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if default', async () => {
      const requestPermissionSpy = vi.fn().mockResolvedValue('granted');

      global.Notification = {
        permission: 'default',
        requestPermission: requestPermissionSpy,
      } as any;

      await requestNotificationPermission();
      expect(requestPermissionSpy).toHaveBeenCalled();
    });

    it('should return current permission if not default', async () => {
      const requestPermissionSpy = vi.fn();

      global.Notification = {
        permission: 'granted',
        requestPermission: requestPermissionSpy,
      } as any;

      const result = await requestNotificationPermission();
      expect(result).toBe('granted');
      expect(requestPermissionSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendTaskNotification', () => {
    it('should send standard notification if SW is not available', async () => {
      global.Notification = vi.fn() as any;
      global.Notification.permission = 'granted';

      // Mock navigator to not have serviceWorker
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: undefined,
        configurable: true
      });

      await sendTaskNotification(mockTask);

      expect(global.Notification).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
            body: expect.stringContaining(mockTask.title)
        })
      );
    });

    it('should send SW notification if available', async () => {
      const showNotificationSpy = vi.fn();
      const swRegistration = {
        showNotification: showNotificationSpy
      };

      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve(swRegistration)
        },
        configurable: true
      });

      global.Notification = vi.fn() as any;
      global.Notification.permission = 'granted';

      await sendTaskNotification(mockTask);

      expect(showNotificationSpy).toHaveBeenCalledWith(
        expect.stringContaining('Llegaste'),
        expect.objectContaining({
             body: expect.stringContaining(mockTask.title),
             data: { taskId: mockTask.id }
        })
      );
      expect(global.Notification).not.toHaveBeenCalled();
    });

    it('should fallback to standard notification if SW fails', async () => {
       Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          ready: Promise.reject('SW Error')
        },
        configurable: true
      });

      global.Notification = vi.fn() as any;
      global.Notification.permission = 'granted';

      await sendTaskNotification(mockTask);

      expect(global.Notification).toHaveBeenCalled();
    });

    it('should do nothing if permission not granted', async () => {
        global.Notification = vi.fn() as any;
        global.Notification.permission = 'denied';

        await sendTaskNotification(mockTask);
        expect(global.Notification).not.toHaveBeenCalled();
    });
  });
});
