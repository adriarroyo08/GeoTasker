import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentPositionWithFallback } from './geo';

describe('getCurrentPositionWithFallback', () => {
  const originalGeolocation = global.navigator.geolocation;

  beforeEach(() => {
    // Mock navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn(),
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('rejects if geolocation is not supported', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await expect(getCurrentPositionWithFallback()).rejects.toThrow('Geolocation is not supported by this browser.');
  });

  it('resolves with high accuracy position if successful', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } } as GeolocationPosition;

    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce((successCb: any) => {
      successCb(mockPosition);
    });

    const position = await getCurrentPositionWithFallback();
    expect(position).toEqual(mockPosition);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  });

  it('falls back to low accuracy and resolves if high accuracy fails', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } } as GeolocationPosition;

    (global.navigator.geolocation.getCurrentPosition as any)
      .mockImplementationOnce((successCb: any, errorCb: any) => {
        errorCb(new Error('High accuracy timeout'));
      })
      .mockImplementationOnce((successCb: any) => {
        successCb(mockPosition);
      });

    const position = await getCurrentPositionWithFallback();
    expect(position).toEqual(mockPosition);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
    );
  });

  it('rejects if both high and low accuracy fail', async () => {
    const error = new Error('Low accuracy failed');

    (global.navigator.geolocation.getCurrentPosition as any)
      .mockImplementationOnce((successCb: any, errorCb: any) => {
        errorCb(new Error('High accuracy failed'));
      })
      .mockImplementationOnce((successCb: any, errorCb: any) => {
        errorCb(error);
      });

    await expect(getCurrentPositionWithFallback()).rejects.toThrow('Low accuracy failed');
  });
});
