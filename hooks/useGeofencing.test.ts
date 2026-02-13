import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeofencing } from './useGeofencing';
import { Task } from '../types';

// Mock Notification
const notificationMock = vi.fn();
const requestPermissionMock = vi.fn().mockResolvedValue('granted');
Object.defineProperty(window, 'Notification', {
  value: class Notification {
    static permission = 'granted';
    static requestPermission = requestPermissionMock;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(title: string, options: any) {
      notificationMock(title, options);
    }
  },
  writable: true
});

// Mock Geolocation
const watchPositionMock = vi.fn();
const clearWatchMock = vi.fn();

const mockGeolocation = {
  watchPosition: watchPositionMock,
  clearWatch: clearWatchMock,
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('useGeofencing', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Pharmacy',
      description: 'Buy meds',
      radius: 200,
      isCompleted: false,
      createdAt: Date.now(),
      location: { lat: 40.7128, lng: -74.0060 } // NYC coordinates
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    watchPositionMock.mockReturnValue(123); // Mock watch ID
    // @ts-expect-error - mocking read-only property
    window.Notification.permission = 'granted';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and request notification permission', () => {
    // @ts-expect-error - mocking read-only property
    window.Notification.permission = 'default';
    renderHook(() => useGeofencing([]));
    expect(requestPermissionMock).toHaveBeenCalled();
  });

  it('should update user location on success', () => {
    const { result } = renderHook(() => useGeofencing([]));

    // Get the success callback passed to watchPosition
    const successCallback = watchPositionMock.mock.calls[0][0];

    act(() => {
      // Advance time to ensure throttle allows update (initial lastUpdateRef is 0)
      vi.setSystemTime(new Date(3000));

      successCallback({
        coords: { latitude: 40.7128, longitude: -74.0060 }
      } as GeolocationPosition);
    });

    expect(result.current.userLocation).toEqual({ lat: 40.7128, lng: -74.0060 });
    expect(result.current.locationError).toBeNull();
  });

  it('should trigger notification when entering task radius', () => {
    renderHook(() => useGeofencing(mockTasks));
    const successCallback = watchPositionMock.mock.calls[0][0];

    act(() => {
      vi.setSystemTime(new Date(3000));
      successCallback({
        coords: { latitude: 40.7128, longitude: -74.0060 } // Exact location
      } as GeolocationPosition);
    });

    expect(notificationMock).toHaveBeenCalledWith(
      expect.stringContaining('Llegaste'),
      expect.objectContaining({ body: expect.stringContaining('Pharmacy') })
    );
  });

  it('should NOT trigger notification if outside radius', () => {
    renderHook(() => useGeofencing(mockTasks));
    const successCallback = watchPositionMock.mock.calls[0][0];

    act(() => {
      vi.setSystemTime(new Date(3000));
      // Location far away
      successCallback({
        coords: { latitude: 40.8000, longitude: -74.0060 }
      } as GeolocationPosition);
    });

    expect(notificationMock).not.toHaveBeenCalled();
  });

  it('should handle geolocation errors and fallback to low accuracy', () => {
     renderHook(() => useGeofencing(mockTasks));

     // First call (High Accuracy defaults to true)
     expect(watchPositionMock).toHaveBeenLastCalledWith(
       expect.any(Function),
       expect.any(Function),
       expect.objectContaining({ enableHighAccuracy: true })
     );

     const errorCallback = watchPositionMock.mock.calls[0][1];

     act(() => {
       // Simulate Timeout (code 3)
       errorCallback({ code: 3, message: 'Timeout' } as GeolocationPositionError);
     });

     // Should restart watcher with Low Accuracy
     expect(watchPositionMock).toHaveBeenCalledTimes(2);
     expect(watchPositionMock).toHaveBeenLastCalledWith(
       expect.any(Function),
       expect.any(Function),
       expect.objectContaining({ enableHighAccuracy: false })
     );
  });
});
