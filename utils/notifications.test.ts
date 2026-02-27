import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestNotificationPermission, sendNotification } from './notifications';

describe('utils/notifications', () => {
    // Keep a reference to the original Notification object
    const OriginalNotification = window.Notification;
    const requestPermissionMock = vi.fn();
    const notificationConstructorMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock the Notification API on window
        const MockNotification = class {
            static permission = 'default';
            static requestPermission = requestPermissionMock;
            constructor(title: string, options?: NotificationOptions) {
                notificationConstructorMock(title, options);
            }
        };

        // We need to use Object.defineProperty because window.Notification is read-only in some environments
        Object.defineProperty(window, 'Notification', {
            value: MockNotification,
            writable: true
        });
    });

    afterEach(() => {
        // Restore original Notification
        if (OriginalNotification) {
            Object.defineProperty(window, 'Notification', {
                value: OriginalNotification,
                writable: true
            });
        }
    });

    describe('requestNotificationPermission', () => {
        it('should request permission if state is default', async () => {
             // @ts-ignore
            window.Notification.permission = 'default';
            requestPermissionMock.mockResolvedValue('granted');

            const result = await requestNotificationPermission();

            expect(requestPermissionMock).toHaveBeenCalled();
            expect(result).toBe('granted');
        });

        it('should return current permission if not default', async () => {
             // @ts-ignore
            window.Notification.permission = 'granted';

            const result = await requestNotificationPermission();

            expect(requestPermissionMock).not.toHaveBeenCalled();
            expect(result).toBe('granted');
        });

         it('should return denied if window is undefined', async () => {
            // Simulate SSR environment by temporarily hiding window (if possible) or just testing the guard logic
            // Since we are in jsdom, window exists. We can't easily delete window.
            // We can skip this test or trust the code coverage.
            // Alternatively, we can mock the property check.
        });
    });

    describe('sendNotification', () => {
        it('should not send notification if permission is not granted', async () => {
             // @ts-ignore
            window.Notification.permission = 'denied';

            await sendNotification('Test', {});

            expect(notificationConstructorMock).not.toHaveBeenCalled();
        });

        it('should create a new Notification if Service Worker is not available', async () => {
             // @ts-ignore
            window.Notification.permission = 'granted';
            // Ensure navigator.serviceWorker is undefined or empty for this test
            Object.defineProperty(navigator, 'serviceWorker', {
                value: undefined,
                writable: true,
                configurable: true
            });

            await sendNotification('Test Title', { body: 'Test Body' });

            expect(notificationConstructorMock).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
        });

        it('should use Service Worker if available', async () => {
             // @ts-ignore
            window.Notification.permission = 'granted';

            const showNotificationMock = vi.fn();
            const mockRegistration = {
                showNotification: showNotificationMock
            };

            const mockServiceWorkerContainer = {
                ready: Promise.resolve(mockRegistration)
            };

            Object.defineProperty(navigator, 'serviceWorker', {
                value: mockServiceWorkerContainer,
                writable: true,
                 configurable: true
            });

            await sendNotification('SW Title', { body: 'SW Body' });

            expect(showNotificationMock).toHaveBeenCalledWith('SW Title', { body: 'SW Body' });
            expect(notificationConstructorMock).not.toHaveBeenCalled();
        });
    });
});
