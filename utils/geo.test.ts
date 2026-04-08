import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDistance, formatDistance, getCurrentPositionWithFallback } from './geo';

describe('calculateDistance', () => {
  it('should return 0 for the same coordinates', () => {
    const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
    expect(distance).toBe(0);
  });

  it('should calculate distance between New York and London (~5570 km)', () => {
    // New York: 40.7128°N, 74.0060°W
    // London: 51.5074°N, 0.1278°W
    const distance = calculateDistance(40.7128, -74.006, 51.5074, -0.1278);
    // Approximately 5570 km
    expect(distance).toBeGreaterThan(5_500_000);
    expect(distance).toBeLessThan(5_650_000);
  });

  it('should calculate a short distance (~111 km per degree of latitude)', () => {
    // 1 degree of latitude ≈ 111.195 km
    const distance = calculateDistance(0, 0, 1, 0);
    expect(distance).toBeGreaterThan(111_000);
    expect(distance).toBeLessThan(112_000);
  });

  it('should calculate distance symmetrically (A→B equals B→A)', () => {
    const d1 = calculateDistance(48.8566, 2.3522, 40.4168, -3.7038);
    const d2 = calculateDistance(40.4168, -3.7038, 48.8566, 2.3522);
    expect(d1).toBeCloseTo(d2, 0);
  });

  it('should return a positive value for distinct coordinates', () => {
    const distance = calculateDistance(10, 10, 20, 20);
    expect(distance).toBeGreaterThan(0);
  });

  it('should handle negative coordinates (southern hemisphere)', () => {
    // Buenos Aires: -34.6037°S, 58.3816°W
    // Cape Town: -33.9249°S, 18.4241°E
    const distance = calculateDistance(-34.6037, -58.3816, -33.9249, 18.4241);
    expect(distance).toBeGreaterThan(6_000_000);
    expect(distance).toBeLessThan(7_000_000);
  });

  it('should calculate small distances accurately (~200 meters)', () => {
    // Move about 0.002 degrees latitude ≈ 222 meters
    const distance = calculateDistance(40.0, 0.0, 40.002, 0.0);
    expect(distance).toBeGreaterThan(150);
    expect(distance).toBeLessThan(300);
  });
});

describe('formatDistance', () => {
  it('should format distances under 1000m in meters', () => {
    expect(formatDistance(0)).toBe('0m');
    expect(formatDistance(50)).toBe('50m');
    expect(formatDistance(500)).toBe('500m');
    expect(formatDistance(999)).toBe('999m');
  });

  it('should format distances of exactly 1000m as kilometers', () => {
    expect(formatDistance(1000)).toBe('1.0km');
  });

  it('should format distances over 1000m in kilometers with one decimal', () => {
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(2000)).toBe('2.0km');
    expect(formatDistance(10000)).toBe('10.0km');
    expect(formatDistance(12345)).toBe('12.3km');
  });

  it('should round meters to the nearest integer', () => {
    expect(formatDistance(99.4)).toBe('99m');
    expect(formatDistance(99.5)).toBe('100m');
    expect(formatDistance(100.9)).toBe('101m');
  });

  it('should handle fractional kilometer values correctly', () => {
    expect(formatDistance(1050)).toBe('1.1km');
    expect(formatDistance(1999)).toBe('2.0km');
  });
});

describe('getCurrentPositionWithFallback', () => {
  let getCurrentPositionMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentPositionMock = vi.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: getCurrentPositionMock },
      configurable: true,
      writable: true,
    });
  });

  it('should reject if geolocation is not supported', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await expect(getCurrentPositionWithFallback()).rejects.toThrow("Geolocalización no soportada en este navegador.");
  });

  it('should resolve with position on high accuracy success', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } };

    // First call succeeds
    getCurrentPositionMock.mockImplementationOnce((success: any) => {
      success(mockPosition);
    });

    const pos = await getCurrentPositionWithFallback();
    expect(pos).toEqual(mockPosition);
    expect(getCurrentPositionMock).toHaveBeenCalledTimes(1);
    expect(getCurrentPositionMock.mock.calls[0][2].enableHighAccuracy).toBe(true);
  });

  it('should retry with low accuracy if high accuracy fails with timeout', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } };
    const timeoutError = { code: 3, message: 'Timeout' };

    // First call fails with timeout
    getCurrentPositionMock.mockImplementationOnce((_, errorCb: any) => {
      errorCb(timeoutError);
    });

    // Second call succeeds
    getCurrentPositionMock.mockImplementationOnce((successCb: any) => {
      successCb(mockPosition);
    });

    const pos = await getCurrentPositionWithFallback();

    expect(pos).toEqual(mockPosition);
    expect(getCurrentPositionMock).toHaveBeenCalledTimes(2);
    expect(getCurrentPositionMock.mock.calls[0][2].enableHighAccuracy).toBe(true);
    expect(getCurrentPositionMock.mock.calls[1][2].enableHighAccuracy).toBe(false);
  });

  it('should reject if both high and low accuracy fail', async () => {
    const timeoutError = { code: 3, message: 'Timeout' };
    const lowAccuracyError = { code: 1, message: 'Permission Denied' };

    // First call fails with timeout
    getCurrentPositionMock.mockImplementationOnce((_, errorCb: any) => {
      errorCb(timeoutError);
    });

    // Second call fails with another error
    getCurrentPositionMock.mockImplementationOnce((_, errorCb: any) => {
      errorCb(lowAccuracyError);
    });

    await expect(getCurrentPositionWithFallback()).rejects.toEqual(lowAccuracyError);
    expect(getCurrentPositionMock).toHaveBeenCalledTimes(2);
  });

  it('should reject immediately if high accuracy fails with permission denied', async () => {
    const permissionError = { code: 1, message: 'Permission Denied' };

    // First call fails with permission denied
    getCurrentPositionMock.mockImplementationOnce((_, errorCb: any) => {
      errorCb(permissionError);
    });

    await expect(getCurrentPositionWithFallback()).rejects.toEqual(permissionError);
    expect(getCurrentPositionMock).toHaveBeenCalledTimes(1);
  });
});
