import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

// Mock Navigator ServiceWorker
const showNotificationMock = vi.fn();
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    ready: Promise.resolve({
      showNotification: showNotificationMock
    })
  },
  configurable: true
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset permission
    // @ts-ignore
    window.Notification.permission = 'default';

    // Restore serviceWorker mock
    Object.defineProperty(navigator, 'serviceWorker', {
        value: {
            ready: Promise.resolve({
            showNotification: showNotificationMock
            })
        },
        configurable: true
    });
  });

  it('should request permission if not granted', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(requestPermissionMock).toHaveBeenCalled();
  });

  it('should NOT request permission if already granted', async () => {
    // @ts-ignore
    window.Notification.permission = 'granted';
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(requestPermissionMock).not.toHaveBeenCalled();
  });

  it('should send notification via Service Worker if available', async () => {
    // @ts-ignore
    window.Notification.permission = 'granted';
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.sendNotification('Test Title', { body: 'Test Body' });
    });

    expect(showNotificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    expect(notificationMock).not.toHaveBeenCalled(); // Should prefer SW
  });

  it('should fallback to window.Notification if Service Worker fails or is missing', async () => {
     // @ts-ignore
    window.Notification.permission = 'granted';

    // Remove serviceWorker mock for this test
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true
    });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.sendNotification('Test Title', { body: 'Test Body' });
    });

    expect(notificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
  });
});
