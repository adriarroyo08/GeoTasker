import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('requestNotificationPermission', () => {
    it('should request permission if state is default', async () => {
      const requestPermissionMock = vi.fn();

      // Mock window.Notification
      const MockNotification = class {
        static permission = 'default';
        static requestPermission = requestPermissionMock;
      };
      vi.stubGlobal('Notification', MockNotification);

      await requestNotificationPermission();

      expect(requestPermissionMock).toHaveBeenCalled();
    });

    it('should NOT request permission if state is granted', async () => {
      const requestPermissionMock = vi.fn();

      const MockNotification = class {
        static permission = 'granted';
        static requestPermission = requestPermissionMock;
      };
      vi.stubGlobal('Notification', MockNotification);

      await requestNotificationPermission();

      expect(requestPermissionMock).not.toHaveBeenCalled();
    });
  });

  describe('sendTaskNotification', () => {
    it('should do nothing if permission is not granted', async () => {
      const MockNotification = class {
        static permission = 'denied';
      };
      vi.stubGlobal('Notification', MockNotification);

      // Mock Navigator without SW
      vi.stubGlobal('navigator', {});

      await sendTaskNotification(mockTask);

      // No assertions needed as we expect no side effects,
      // but execution without error is the test here.
    });

    it('should use Service Worker if available', async () => {
       const showNotificationMock = vi.fn();
       const serviceWorker = {
         ready: Promise.resolve({
           showNotification: showNotificationMock
         })
       };

       const MockNotification = class {
         static permission = 'granted';
       };
       vi.stubGlobal('Notification', MockNotification);

       vi.stubGlobal('navigator', {
         serviceWorker: serviceWorker
       });

       await sendTaskNotification(mockTask);

       expect(showNotificationMock).toHaveBeenCalledWith(
         expect.stringContaining('Llegaste'),
         expect.objectContaining({ body: expect.stringContaining('Test Task') })
       );
    });

    it('should fallback to window.Notification if SW fails/missing', async () => {
       // Mock Navigator without SW
       vi.stubGlobal('navigator', {});

       const notificationConstructorMock = vi.fn();

       const MockNotification = class {
         static permission = 'granted';
         constructor(title: string, options: any) {
           notificationConstructorMock(title, options);
         }
       };

       vi.stubGlobal('Notification', MockNotification);

       await sendTaskNotification(mockTask);

       expect(notificationConstructorMock).toHaveBeenCalledWith(
         expect.stringContaining('Llegaste'),
         expect.objectContaining({ body: expect.stringContaining('Test Task') })
       );
    });
  });
});
