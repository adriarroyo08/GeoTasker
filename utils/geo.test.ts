import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDistance, formatDistance, getCurrentPositionWithFallback } from './geo';

describe('geo utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance correctly between two points', () => {
      // New York
      const lat1 = 40.7128;
      const lon1 = -74.0060;
      // Los Angeles
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Distance should be ~3940km (allow some margin due to Earth radius variations in formula)
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });

    it('should return 0 for the same coordinates', () => {
      const distance = calculateDistance(10, 10, 10, 10);
      expect(distance).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format kilometers correctly', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(2050)).toBe('2.0km'); // (2050 / 1000).toFixed(1) === '2.0' (2.05 rounds down to 2.0 in JS toFixed)
    });
  });

  describe('getCurrentPositionWithFallback', () => {
    let mockGeolocation: any;

    beforeEach(() => {
      mockGeolocation = {
        getCurrentPosition: vi.fn()
      };

      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true
      });

      vi.clearAllMocks();
    });

    it('should reject if geolocation is not supported', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true
      });

      await expect(getCurrentPositionWithFallback()).rejects.toThrow('Geolocation is not supported by your browser.');
    });

    it('should resolve with high accuracy position if successful', async () => {
      const mockPosition = { coords: { latitude: 10, longitude: 20 } };
      mockGeolocation.getCurrentPosition.mockImplementationOnce((successCb: any) => {
        successCb(mockPosition);
      });

      const result = await getCurrentPositionWithFallback();
      expect(result).toEqual(mockPosition);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });

    it('should fallback to low accuracy if high accuracy fails with timeout (code 3)', async () => {
      const mockPosition = { coords: { latitude: 10, longitude: 20 } };

      // First call fails with timeout
      mockGeolocation.getCurrentPosition.mockImplementationOnce((successCb: any, errorCb: any) => {
        errorCb({ code: 3, message: 'Timeout' });
      });

      // Second call (fallback) succeeds
      mockGeolocation.getCurrentPosition.mockImplementationOnce((successCb: any) => {
        successCb(mockPosition);
      });

      const result = await getCurrentPositionWithFallback();

      expect(result).toEqual(mockPosition);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);

      // Check that fallback was called with enableHighAccuracy: false
      const fallbackOptions = mockGeolocation.getCurrentPosition.mock.calls[1][2];
      expect(fallbackOptions.enableHighAccuracy).toBe(false);
    });

    it('should reject if fallback also fails', async () => {
      // First call fails with timeout
      mockGeolocation.getCurrentPosition.mockImplementationOnce((successCb: any, errorCb: any) => {
        errorCb({ code: 3, message: 'Timeout' });
      });

      // Second call (fallback) fails with permission denied
      mockGeolocation.getCurrentPosition.mockImplementationOnce((successCb: any, errorCb: any) => {
        errorCb({ code: 1, message: 'Permission Denied' });
      });

      await expect(getCurrentPositionWithFallback()).rejects.toEqual({ code: 1, message: 'Permission Denied' });
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    });

    it('should reject immediately if high accuracy fails with permission denied (code 1)', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce((successCb: any, errorCb: any) => {
        errorCb({ code: 1, message: 'Permission Denied' });
      });

      await expect(getCurrentPositionWithFallback()).rejects.toEqual({ code: 1, message: 'Permission Denied' });
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });
  });
});