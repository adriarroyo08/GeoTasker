import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotifications } from './useNotifications';

// Mock Notification
const notificationMock = vi.fn();
const requestPermissionMock = vi.fn().mockResolvedValue('granted');

Object.defineProperty(window, 'Notification', {
  value: class Notification {
    static permission = 'default';
    static requestPermission = requestPermissionMock;
    constructor(title: string, options: any) {
      notificationMock(title, options);
    }
  },
  writable: true
});

// Mock Service Worker
const showNotificationMock = vi.fn().mockResolvedValue(undefined);
const swRegistrationMock = {
  showNotification: showNotificationMock
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    ready: Promise.resolve(swRegistrationMock)
  },
  writable: true,
  configurable: true
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    window.Notification.permission = 'default';
  });

  it('should request permission if default', async () => {
    const { result } = renderHook(() => useNotifications());
    await result.current.requestPermission();
    expect(requestPermissionMock).toHaveBeenCalled();
  });

  it('should trigger SW notification if permission granted and SW available', async () => {
    // @ts-ignore
    window.Notification.permission = 'granted';
    const { result } = renderHook(() => useNotifications());

    await result.current.notify('Test Title', { body: 'Test Body' });

    expect(showNotificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    expect(notificationMock).not.toHaveBeenCalled();
  });

  it('should fallback to window.Notification if SW fails', async () => {
    // @ts-ignore
    window.Notification.permission = 'granted';
    // Mock SW failure
    showNotificationMock.mockRejectedValueOnce(new Error('SW failed'));

    const { result } = renderHook(() => useNotifications());

    await result.current.notify('Test Title', { body: 'Test Body' });

    expect(notificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
  });

  it('should fallback to window.Notification if SW not available', async () => {
      // @ts-ignore
      window.Notification.permission = 'granted';

      const originalSW = navigator.serviceWorker;
      // @ts-ignore
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined });

      const { result } = renderHook(() => useNotifications());
      await result.current.notify('Test Title', { body: 'Test Body' });

      expect(notificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });

      // Restore SW
      // @ts-ignore
      Object.defineProperty(navigator, 'serviceWorker', { value: originalSW });
  });

  it('should NOT notify if permission not granted', async () => {
    // @ts-ignore
    window.Notification.permission = 'denied';
    const { result } = renderHook(() => useNotifications());

    await result.current.notify('Test Title', {});

    expect(showNotificationMock).not.toHaveBeenCalled();
    expect(notificationMock).not.toHaveBeenCalled();
  });
});
