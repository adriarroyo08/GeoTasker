import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotifications } from './useNotifications';

// Mock Notification
const notificationMock = vi.fn();
const requestPermissionMock = vi.fn().mockResolvedValue('granted');
Object.defineProperty(window, 'Notification', {
  value: class Notification {
    static permission = 'granted';
    static requestPermission = requestPermissionMock;
    constructor(title: string, options: any) {
      notificationMock(title, options);
    }
  },
  writable: true,
  configurable: true // Important for re-mocking
});

// Mock Service Worker
const showNotificationMock = vi.fn();
const serviceWorkerMock = {
  ready: Promise.resolve({
    showNotification: showNotificationMock
  })
};

Object.defineProperty(global.navigator, 'serviceWorker', {
  value: serviceWorkerMock,
  writable: true,
  configurable: true // Important for re-mocking
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    window.Notification.permission = 'granted';
  });

  it('should request permission if default', async () => {
    // @ts-ignore
    window.Notification.permission = 'default';
    const { result } = renderHook(() => useNotifications());

    await result.current.requestNotificationPermission();
    expect(requestPermissionMock).toHaveBeenCalled();
  });

  it('should not request permission if already granted', async () => {
    // @ts-ignore
    window.Notification.permission = 'granted';
    const { result } = renderHook(() => useNotifications());

    await result.current.requestNotificationPermission();
    expect(requestPermissionMock).not.toHaveBeenCalled();
  });

  it('should trigger Service Worker notification if available', async () => {
    const { result } = renderHook(() => useNotifications());

    await result.current.triggerNotification('Test Title', { body: 'Test Body' });

    expect(showNotificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    expect(notificationMock).not.toHaveBeenCalled();
  });

  it('should fall back to window Notification if SW is unavailable', async () => {
    // Remove SW from navigator
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: undefined,
      writable: true
    });

    const { result } = renderHook(() => useNotifications());

    await result.current.triggerNotification('Test Title', { body: 'Test Body' });

    expect(notificationMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
  });

  it('should not trigger notification if permission is not granted', async () => {
    // @ts-ignore
    window.Notification.permission = 'denied';
    const { result } = renderHook(() => useNotifications());

    await result.current.triggerNotification('Test Title');

    expect(showNotificationMock).not.toHaveBeenCalled();
    expect(notificationMock).not.toHaveBeenCalled();
  });
});
