import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentPositionWithFallback } from './geolocation';

describe('geolocation utility', () => {
  let originalGeolocation: Geolocation;

  beforeEach(() => {
    originalGeolocation = global.navigator.geolocation;
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    } as unknown as Geolocation;
  });

  afterEach(() => {
    global.navigator.geolocation = originalGeolocation;
    vi.clearAllMocks();
  });

  it('should resolve with high accuracy position on success', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } } as GeolocationPosition;

    vi.mocked(global.navigator.geolocation.getCurrentPosition).mockImplementationOnce(
      (successCallback) => {
        successCallback(mockPosition);
      }
    );

    const position = await getCurrentPositionWithFallback();
    expect(position).toEqual(mockPosition);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: true })
    );
  });

  it('should reject immediately if permission is denied (code 1)', async () => {
    const mockError = { code: 1, message: 'Permission denied' } as GeolocationPositionError;

    vi.mocked(global.navigator.geolocation.getCurrentPosition).mockImplementationOnce(
      (_, errorCallback) => {
        if (errorCallback) errorCallback(mockError);
      }
    );

    await expect(getCurrentPositionWithFallback()).rejects.toEqual(mockError);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('should fallback to low accuracy if high accuracy fails with code 3 (timeout)', async () => {
    const mockError = { code: 3, message: 'Timeout' } as GeolocationPositionError;
    const mockFallbackPosition = { coords: { latitude: 30, longitude: 40 } } as GeolocationPosition;

    vi.mocked(global.navigator.geolocation.getCurrentPosition)
      .mockImplementationOnce((_, errorCallback) => {
        // First call fails with timeout
        if (errorCallback) errorCallback(mockError);
      })
      .mockImplementationOnce((successCallback) => {
        // Second call (fallback) succeeds
        successCallback(mockFallbackPosition);
      });

    const position = await getCurrentPositionWithFallback();
    expect(position).toEqual(mockFallbackPosition);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: true })
    );
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: false })
    );
  });

  it('should reject if both high and low accuracy fail', async () => {
    const mockErrorHigh = { code: 3, message: 'Timeout' } as GeolocationPositionError;
    const mockErrorLow = { code: 2, message: 'Position unavailable' } as GeolocationPositionError;

    vi.mocked(global.navigator.geolocation.getCurrentPosition)
      .mockImplementationOnce((_, errorCallback) => {
        if (errorCallback) errorCallback(mockErrorHigh);
      })
      .mockImplementationOnce((_, errorCallback) => {
        if (errorCallback) errorCallback(mockErrorLow);
      });

    await expect(getCurrentPositionWithFallback()).rejects.toEqual(mockErrorLow);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
  });
});
