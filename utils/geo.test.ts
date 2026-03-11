import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDistance, formatDistance, getCurrentPositionWithFallback, HIGH_ACCURACY_OPTIONS, LOW_ACCURACY_OPTIONS } from './geo';

describe('geo utils', () => {
  describe('calculateDistance', () => {
    it('calculates the Haversine distance correctly between two points', () => {
      // New York (40.7128, -74.0060) to London (51.5074, -0.1278)
      // distance is approx 5570 km
      const distance = calculateDistance(40.7128, -74.0060, 51.5074, -0.1278);
      // Let's use an approximate range to avoid precision errors
      expect(distance).toBeGreaterThan(5500000);
      expect(distance).toBeLessThan(5600000);
    });

    it('returns 0 for the same point', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('formats distances less than 1000m as meters', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
      expect(formatDistance(999.9)).toBe('1000m');
    });

    it('formats distances greater than or equal to 1000m as kilometers with 1 decimal place', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(1550)).toBe('1.6km');
    });
  });

  describe('getCurrentPositionWithFallback', () => {
    let mockGeolocation: any;

    beforeEach(() => {
      mockGeolocation = {
        getCurrentPosition: vi.fn(),
      };

      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });
    });

    it('rejects if geolocation is not supported', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });

      await expect(getCurrentPositionWithFallback()).rejects.toThrow('Geolocalización no soportada en este navegador.');
    });

    it('resolves with position if high accuracy succeeds', async () => {
      const mockPosition = { coords: { latitude: 10, longitude: 20 } };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success: any) => {
        success(mockPosition);
      });

      const position = await getCurrentPositionWithFallback();
      expect(position).toEqual(mockPosition);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        HIGH_ACCURACY_OPTIONS
      );
    });

    it('falls back to low accuracy and resolves if high accuracy fails with timeout (code 3)', async () => {
      const mockPosition = { coords: { latitude: 10, longitude: 20 } };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success: any, error: any) => {
        error({ code: 3, message: 'Timeout' });
      }).mockImplementationOnce((success: any) => {
        success(mockPosition);
      });

      const position = await getCurrentPositionWithFallback();
      expect(position).toEqual(mockPosition);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenNthCalledWith(
        2,
        expect.any(Function),
        expect.any(Function),
        LOW_ACCURACY_OPTIONS
      );
    });

    it('falls back to low accuracy and resolves if high accuracy fails with position unavailable (code 2)', async () => {
      const mockPosition = { coords: { latitude: 10, longitude: 20 } };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success: any, error: any) => {
        error({ code: 2, message: 'Position unavailable' });
      }).mockImplementationOnce((success: any) => {
        success(mockPosition);
      });

      const position = await getCurrentPositionWithFallback();
      expect(position).toEqual(mockPosition);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    });

    it('rejects without fallback if high accuracy fails with other error (e.g. code 1 permission denied)', async () => {
      const mockError = { code: 1, message: 'Permission denied' };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success: any, error: any) => {
        error(mockError);
      });

      await expect(getCurrentPositionWithFallback()).rejects.toEqual(mockError);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });
  });
});