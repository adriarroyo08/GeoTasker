import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, triggerNotification } from './notifications';
import { Task } from '../types';

describe('utils/notifications', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    radius: 200,
    isCompleted: false,
    createdAt: Date.now(),
    location: { lat: 0, lng: 0 }
  };

  const notificationMock = vi.fn();
  const requestPermissionMock = vi.fn();
  const showNotificationMock = vi.fn();

  // Save original descriptors
  const originalNotification = window.Notification;
  // In JSDOM, navigator.serviceWorker might be undefined on the instance
  const originalServiceWorkerDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'serviceWorker');

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Notification
    // @ts-ignore
    window.Notification = class {
      static permission = 'default';
      static requestPermission = requestPermissionMock;
      constructor(title: string, options: any) {
        notificationMock(title, options);
      }
    } as any;
  });

  afterEach(() => {
    // Restore Notification
    window.Notification = originalNotification;

    // Restore ServiceWorker
    if (originalServiceWorkerDescriptor) {
      Object.defineProperty(window.navigator, 'serviceWorker', originalServiceWorkerDescriptor);
    } else {
      // If it wasn't on the instance (e.g. from prototype or non-existent), try to delete it from instance
      try {
        delete (window.navigator as any).serviceWorker;
      } catch (e) {
        // If we can't delete, maybe we can set it to undefined?
        // But usually in tests we just want to ensure we don't leak mocks.
      }
    }
  });

  it('requestNotificationPermission should request permission if default', async () => {
    // @ts-ignore
    window.Notification.permission = 'default';
    await requestNotificationPermission();
    expect(requestPermissionMock).toHaveBeenCalled();
  });

  it('requestNotificationPermission should NOT request permission if already granted', async () => {
    // @ts-ignore
    window.Notification.permission = 'granted';
    await requestNotificationPermission();
    expect(requestPermissionMock).not.toHaveBeenCalled();
  });

  it('triggerNotification should use Service Worker if available', async () => {
    // @ts-ignore
    window.Notification.permission = 'granted';

    // Mock Service Worker
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          showNotification: showNotificationMock,
        }),
      },
      configurable: true,
      writable: true
    });

    await triggerNotification(mockTask);

    expect(showNotificationMock).toHaveBeenCalledWith(
      expect.stringContaining('Llegaste'),
      expect.objectContaining({
        body: expect.stringContaining('Test Task'),
        data: { taskId: '1' }
      })
    );
    expect(notificationMock).not.toHaveBeenCalled();
  });

  it('triggerNotification should fallback to window.Notification if Service Worker fails or missing', async () => {
    // @ts-ignore
    window.Notification.permission = 'granted';

    // Mock Service Worker as undefined explicitly
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
      writable: true
    });

    await triggerNotification(mockTask);

    expect(notificationMock).toHaveBeenCalledWith(
      expect.stringContaining('Llegaste'),
      expect.objectContaining({
        body: expect.stringContaining('Test Task')
      })
    );
  });

  it('triggerNotification should do nothing if permission not granted', async () => {
    // @ts-ignore
    window.Notification.permission = 'denied';

    await triggerNotification(mockTask);

    expect(notificationMock).not.toHaveBeenCalled();
    expect(showNotificationMock).not.toHaveBeenCalled();
  });
});
