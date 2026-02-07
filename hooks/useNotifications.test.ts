import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  const requestPermissionMock = vi.fn();
  const showNotificationMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Notification API
    global.Notification = vi.fn() as any;
    global.Notification.requestPermission = requestPermissionMock;
    // @ts-ignore
    global.Notification.permission = 'default';

    // Mock Service Worker
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          showNotification: showNotificationMock
        })
      },
      writable: true,
      configurable: true
    });
  });

  it('should request permission on mount if default', async () => {
    renderHook(() => useNotifications());
    expect(requestPermissionMock).toHaveBeenCalled();
  });

  it('should not request permission if already granted', async () => {
    // @ts-ignore
    global.Notification.permission = 'granted';
    renderHook(() => useNotifications());
    expect(requestPermissionMock).not.toHaveBeenCalled();
  });

  it('should send notification via Service Worker if available', async () => {
    // @ts-ignore
    global.Notification.permission = 'granted';
    const { result } = renderHook(() => useNotifications());

    await result.current.sendNotification('Test Title', { body: 'Test Body' });

    expect(showNotificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    expect(global.Notification).not.toHaveBeenCalled();
  });

  it('should fallback to window Notification if Service Worker fails', async () => {
    // @ts-ignore
    global.Notification.permission = 'granted';

    // Mock SW failure (or missing showNotification)
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: {
        ready: Promise.reject('SW Error')
      },
      writable: true,
      configurable: true
    });

    const { result } = renderHook(() => useNotifications());

    await result.current.sendNotification('Test Title', { body: 'Test Body' });

    expect(global.Notification).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
  });

  it('should do nothing if permission is not granted', async () => {
    // @ts-ignore
    global.Notification.permission = 'denied';
    const { result } = renderHook(() => useNotifications());

    await result.current.sendNotification('Test Title', {});

    expect(showNotificationMock).not.toHaveBeenCalled();
    expect(global.Notification).not.toHaveBeenCalled();
  });
});
