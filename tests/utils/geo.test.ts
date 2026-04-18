import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentPositionWithFallback } from '../../utils/geo';

describe('getCurrentPositionWithFallback', () => {
  const originalGeolocation = global.navigator.geolocation;

  beforeEach(() => {
    global.navigator = {
      ...global.navigator,
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      }
    } as any;
  });

  afterEach(() => {
    global.navigator.geolocation = originalGeolocation;
  });

  it('resolves on first try with high accuracy', async () => {
    const mockPos = { coords: { latitude: 10, longitude: 20 } };
    const mockGetCurrentPosition = vi.fn((successCb, errorCb, options) => {
      successCb(mockPos);
    });
    global.navigator.geolocation.getCurrentPosition = mockGetCurrentPosition;

    const result = await getCurrentPositionWithFallback();

    expect(result).toEqual(mockPos);
    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: true })
    );
  });

  it('falls back to low accuracy on error code 3', async () => {
    const mockPos = { coords: { latitude: 10, longitude: 20 } };
    const mockError = { code: 3, message: 'timeout' };

    const mockGetCurrentPosition = vi.fn();
    mockGetCurrentPosition.mockImplementationOnce((successCb, errorCb, options) => {
      errorCb(mockError);
    });
    mockGetCurrentPosition.mockImplementationOnce((successCb, errorCb, options) => {
      successCb(mockPos);
    });

    global.navigator.geolocation.getCurrentPosition = mockGetCurrentPosition;

    const result = await getCurrentPositionWithFallback();

    expect(result).toEqual(mockPos);
    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2);
    expect(mockGetCurrentPosition).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: false })
    );
  });

  it('rejects on fatal error (code 1)', async () => {
    const mockError = { code: 1, message: 'permission denied' };
    const mockGetCurrentPosition = vi.fn((successCb, errorCb, options) => {
      errorCb(mockError);
    });
    global.navigator.geolocation.getCurrentPosition = mockGetCurrentPosition;

    await expect(getCurrentPositionWithFallback()).rejects.toEqual(mockError);
    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
  });
});
