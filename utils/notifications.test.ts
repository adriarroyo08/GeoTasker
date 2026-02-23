import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';

describe('Notification Utils', () => {
  const requestPermissionMock = vi.fn();
  const showNotificationMock = vi.fn();
  const notificationConstructorMock = vi.fn();

  // Save original descriptors
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Notification
    vi.stubGlobal('Notification', class {
        static permission = 'default';
        static requestPermission = requestPermissionMock;
        constructor(title: string, options: any) {
            notificationConstructorMock(title, options);
        }
    });

    // Mock Service Worker
    Object.defineProperty(navigator, 'serviceWorker', {
        value: {
            ready: Promise.resolve({
                showNotification: showNotificationMock
            }),
        },
        configurable: true,
        writable: true
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    // Restore serviceWorker
    if (originalServiceWorker) {
        Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    } else {
        // If it didn't exist (e.g. in some jsdom setups), delete it?
        // Or just leave it undefined if that was the state.
        // Usually jsdom has navigator but maybe not serviceWorker.
        // Safe to just set it to undefined if we can't restore descriptor.
        // But defineProperty with undefined value is fine if we make it configurable.
    }
  });

  it('requestNotificationPermission should request permission if default', async () => {
    // @ts-ignore
    Notification.permission = 'default';
    await requestNotificationPermission();
    expect(requestPermissionMock).toHaveBeenCalled();
  });

  it('requestNotificationPermission should NOT request permission if already granted', async () => {
    // @ts-ignore
    Notification.permission = 'granted';
    await requestNotificationPermission();
    expect(requestPermissionMock).not.toHaveBeenCalled();
  });

  it('sendNotification should use Service Worker if available', async () => {
    // @ts-ignore
    Notification.permission = 'granted';
    await sendNotification('Test Title', { body: 'Test Body' });

    expect(showNotificationMock).toHaveBeenCalledWith('Test Title', expect.objectContaining({ body: 'Test Body' }));
    expect(notificationConstructorMock).not.toHaveBeenCalled();
  });

  it('sendNotification should fallback to Notification API if SW fails/missing', async () => {
    // @ts-ignore
    Notification.permission = 'granted';

    // Mock SW missing/undefined
    Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true
    });

    await sendNotification('Test Title', { body: 'Test Body' });

    expect(showNotificationMock).not.toHaveBeenCalled();
    expect(notificationConstructorMock).toHaveBeenCalledWith('Test Title', expect.objectContaining({ body: 'Test Body' }));
  });
});
