import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDistance, formatDistance } from './geo';

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
  let originalGeolocation: Geolocation;

  beforeEach(() => {
    originalGeolocation = global.navigator.geolocation;
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    } as any;
  });

  afterEach(() => {
    global.navigator.geolocation = originalGeolocation;
    vi.restoreAllMocks();
  });

  it('should resolve with position when high-accuracy is successful', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } };
    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
      (successCallback: any) => successCallback(mockPosition)
    );

    const { getCurrentPositionWithFallback } = await import('./geo');
    const position = await getCurrentPositionWithFallback();
    expect(position).toEqual(mockPosition);
  });

  it('should fall back to low-accuracy when high-accuracy fails', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } };
    const mockError = { code: 3, message: 'Timeout' };

    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
      (successCallback: any, errorCallback: any) => errorCallback(mockError)
    ).mockImplementationOnce(
      (successCallback: any) => successCallback(mockPosition)
    );

    const { getCurrentPositionWithFallback } = await import('./geo');
    const position = await getCurrentPositionWithFallback();

    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(position).toEqual(mockPosition);
  });

  it('should reject when both high-accuracy and low-accuracy fail', async () => {
    const mockErrorHigh = { code: 3, message: 'Timeout' };
    const mockErrorLow = { code: 1, message: 'Permission Denied' };

    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
      (successCallback: any, errorCallback: any) => errorCallback(mockErrorHigh)
    ).mockImplementationOnce(
      (successCallback: any, errorCallback: any) => errorCallback(mockErrorLow)
    );

    const { getCurrentPositionWithFallback } = await import('./geo');
    await expect(getCurrentPositionWithFallback()).rejects.toEqual(mockErrorLow);
  });
});
