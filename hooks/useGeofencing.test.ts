import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeofencing } from './useGeofencing';
import { Task } from '../types';
import * as Notifications from '../utils/notifications';

// Mock the Notifications module
vi.mock('../utils/notifications', () => ({
  requestNotificationPermission: vi.fn(),
  sendNotification: vi.fn(),
  triggerGeofenceNotification: vi.fn(),
}));

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
    (Notifications.requestNotificationPermission as any).mockResolvedValue('granted');
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and request notification permission', () => {
    renderHook(() => useGeofencing([]));
    expect(Notifications.requestNotificationPermission).toHaveBeenCalled();
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

    expect(Notifications.triggerGeofenceNotification).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', title: 'Pharmacy' })
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

    expect(Notifications.sendNotification).not.toHaveBeenCalled();
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

  it('should NOT trigger notification for completed tasks', () => {
    const completedTasks = [{ ...mockTasks[0], isCompleted: true }];
    renderHook(() => useGeofencing(completedTasks));
    const successCallback = watchPositionMock.mock.calls[0][0];

    act(() => {
      vi.setSystemTime(new Date(3000));
      successCallback({
        coords: { latitude: 40.7128, longitude: -74.0060 }
      } as GeolocationPosition);
    });

    expect(Notifications.triggerGeofenceNotification).not.toHaveBeenCalled();
  });

  it('should NOT trigger notification for tasks without location', () => {
    const tasksNoLocation = [{ ...mockTasks[0], location: undefined }];
    renderHook(() => useGeofencing(tasksNoLocation));
    const successCallback = watchPositionMock.mock.calls[0][0];

    act(() => {
      vi.setSystemTime(new Date(3000));
      successCallback({
        coords: { latitude: 40.7128, longitude: -74.0060 }
      } as GeolocationPosition);
    });

    expect(Notifications.triggerGeofenceNotification).not.toHaveBeenCalled();
  });

  it('should set location error on permission denied (code 1)', () => {
    const { result } = renderHook(() => useGeofencing([]));
    const errorCallback = watchPositionMock.mock.calls[0][1];

    act(() => {
      errorCallback({ code: 1, message: 'Permission denied' } as GeolocationPositionError);
    });

    expect(result.current.locationError).toBe('Permiso de ubicación denegado.');
  });

  it('should use the latest user location when handling location error (prevent stale closure)', () => {
    const { result } = renderHook(() => useGeofencing([]));
    const successCallback = watchPositionMock.mock.calls[0][0];
    const errorCallback = watchPositionMock.mock.calls[0][1];

    act(() => {
      vi.setSystemTime(new Date(3000));
      successCallback({
        coords: { latitude: 40.7128, longitude: -74.0060 }
      } as GeolocationPosition);
    });

    // At this point, userLocation is NOT null (it's 40.7128, -74.0060)
    expect(result.current.userLocation).not.toBeNull();

    act(() => {
      // Simulate an error like Timeout (code 3).
      // In the old code with the stale closure, !userLocation would be true
      // because the callback would close over the initial null userLocation.
      errorCallback({ code: 1, message: 'Permission denied' } as GeolocationPositionError);
    });

    // Because userLocationRef.current is updated, the error message should NOT be set
    // if the user already has a known location
    expect(result.current.locationError).toBeNull();
  });

  it('should throttle location updates within 2000ms', () => {
    const { result } = renderHook(() => useGeofencing([]));
    const successCallback = watchPositionMock.mock.calls[0][0];

    act(() => {
      vi.setSystemTime(new Date(3000));
      successCallback({ coords: { latitude: 10, longitude: 20 } } as GeolocationPosition);
    });

    expect(result.current.userLocation).toEqual({ lat: 10, lng: 20 });

    act(() => {
      // Only 500ms later — should be throttled
      vi.setSystemTime(new Date(3500));
      successCallback({ coords: { latitude: 50, longitude: 60 } } as GeolocationPosition);
    });

    // Should still be the first location
    expect(result.current.userLocation).toEqual({ lat: 10, lng: 20 });
  });

  it('should update location via updateLocation helper', () => {
    const { result } = renderHook(() => useGeofencing([]));

    act(() => {
      result.current.updateLocation(48.8566, 2.3522);
    });

    expect(result.current.userLocation).toEqual({ lat: 48.8566, lng: 2.3522 });
  });

  it('should not trigger the same geofence notification twice', () => {
    renderHook(() => useGeofencing(mockTasks));
    const successCallback = watchPositionMock.mock.calls[0][0];

    act(() => {
      vi.setSystemTime(new Date(3000));
      successCallback({ coords: { latitude: 40.7128, longitude: -74.0060 } } as GeolocationPosition);
    });

    act(() => {
      vi.setSystemTime(new Date(6000));
      successCallback({ coords: { latitude: 40.7128, longitude: -74.0060 } } as GeolocationPosition);
    });

    // Notification should only fire once despite two position updates
    expect(Notifications.triggerGeofenceNotification).toHaveBeenCalledTimes(1);
  });
});
