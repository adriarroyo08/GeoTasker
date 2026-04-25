import { describe, it, expect } from 'vitest';
import { calculateDistance, formatDistance, getCurrentPositionWithFallback } from './geo';
import { vi } from 'vitest';

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
  let originalGeolocation: any;

  beforeEach(() => {
    originalGeolocation = global.navigator.geolocation;

    // Explicitly define global.navigator if missing
    if (!global.navigator) {
      (global as any).navigator = {};
    }
  });

  afterEach(() => {
    global.navigator.geolocation = originalGeolocation;
    vi.clearAllMocks();
  });

  it('should reject if geolocation is not supported', async () => {
    global.navigator.geolocation = undefined as any;
    await expect(getCurrentPositionWithFallback()).rejects.toThrow('Geolocalización no soportada en este navegador.');
  });

  it('should resolve using high accuracy if it succeeds immediately', async () => {
    const mockPosition = { coords: { latitude: 10, longitude: 20 } };
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((successCb) => successCb(mockPosition)),
    } as any;

    const pos = await getCurrentPositionWithFallback();
    expect(pos).toEqual(mockPosition);
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);

    const callArgs = (global.navigator.geolocation.getCurrentPosition as any).mock.calls[0];
    expect(callArgs[2]).toEqual({ enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });
  });

  it('should fallback to low accuracy if high accuracy fails', async () => {
    const mockPositionLow = { coords: { latitude: 30, longitude: 40 } };

    let callCount = 0;
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((successCb, errorCb, options) => {
        callCount++;
        if (callCount === 1) {
          // Fail high accuracy
          errorCb({ code: 3, message: 'Timeout' });
        } else if (callCount === 2) {
          // Succeed low accuracy
          successCb(mockPositionLow);
        }
      }),
    } as any;

    const pos = await getCurrentPositionWithFallback();
    expect(pos).toEqual(mockPositionLow);

    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2);

    const secondCallArgs = (global.navigator.geolocation.getCurrentPosition as any).mock.calls[1];
    expect(secondCallArgs[2]).toEqual({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
  });

  it('should reject if both high and low accuracy fail', async () => {
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((successCb, errorCb) => {
        errorCb({ code: 1, message: 'Denied' });
      }),
    } as any;

    await expect(getCurrentPositionWithFallback()).rejects.toEqual({ code: 1, message: 'Denied' });
  });
});
