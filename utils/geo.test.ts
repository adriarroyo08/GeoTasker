import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentPositionWithFallback } from './geo';

describe('getCurrentPositionWithFallback', () => {
  const originalGeolocation = global.navigator.geolocation;

  beforeEach(() => {
    // Reset vi mocks
    vi.clearAllMocks();

    // Mock navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn(),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
    });
  });

  it('should return position if high accuracy succeeds on the first try', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } };

    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
      (successCallback: any) => {
        successCallback(mockPosition);
      }
    );

    const position = await getCurrentPositionWithFallback();
    expect(position).toEqual(mockPosition);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);

    const callArgs = (global.navigator.geolocation.getCurrentPosition as any).mock.calls[0];
    expect(callArgs[2].enableHighAccuracy).toBe(true);
  });

  it('should fallback to low accuracy if high accuracy times out', async () => {
    const mockPosition = { coords: { latitude: 30, longitude: 40 } };
    const timeoutError = { code: 3, TIMEOUT: 3 }; // Mock GeolocationPositionError for timeout

    (global.navigator.geolocation.getCurrentPosition as any)
      .mockImplementationOnce((success: any, errorCallback: any) => {
        // High accuracy fails with timeout
        errorCallback(timeoutError);
      })
      .mockImplementationOnce((successCallback: any) => {
        // Low accuracy fallback succeeds
        successCallback(mockPosition);
      });

    const position = await getCurrentPositionWithFallback();
    expect(position).toEqual(mockPosition);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2);

    const secondCallArgs = (global.navigator.geolocation.getCurrentPosition as any).mock.calls[1];
    expect(secondCallArgs[2].enableHighAccuracy).toBe(false);
  });

  it('should fallback to low accuracy if position is unavailable', async () => {
    const mockPosition = { coords: { latitude: 50, longitude: 60 } };
    const unavailableError = { code: 2, POSITION_UNAVAILABLE: 2 }; // Mock GeolocationPositionError for position unavailable

    (global.navigator.geolocation.getCurrentPosition as any)
      .mockImplementationOnce((success: any, errorCallback: any) => {
        // High accuracy fails with unavailable
        errorCallback(unavailableError);
      })
      .mockImplementationOnce((successCallback: any) => {
        // Low accuracy fallback succeeds
        successCallback(mockPosition);
      });

    const position = await getCurrentPositionWithFallback();
    expect(position).toEqual(mockPosition);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2);

    const secondCallArgs = (global.navigator.geolocation.getCurrentPosition as any).mock.calls[1];
    expect(secondCallArgs[2].enableHighAccuracy).toBe(false);
  });

  it('should reject if high accuracy fails with a different error (e.g., permission denied)', async () => {
    const permissionError = { code: 1, PERMISSION_DENIED: 1 };

    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
      (success: any, errorCallback: any) => {
        errorCallback(permissionError);
      }
    );

    await expect(getCurrentPositionWithFallback()).rejects.toEqual(permissionError);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('should reject if browser does not support geolocation', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    await expect(getCurrentPositionWithFallback()).rejects.toThrow('Geolocation is not supported by your browser');
  });
});
