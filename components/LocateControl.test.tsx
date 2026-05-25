import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LocateControl } from './LocateControl';

// Mock react-leaflet
vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual,
    useMap: vi.fn(() => ({ setView: vi.fn() }))
  };
});

describe('LocateControl', () => {
  let getCurrentPositionMock: any;
  let originalGeolocation: any;

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentPositionMock = vi.fn();

    // Save original and mock geolocation
    originalGeolocation = global.navigator.geolocation;
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: getCurrentPositionMock },
      writable: true,
    });

    // Mock console messages
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('renders the locate button', () => {
    render(<LocateControl onFound={vi.fn()} />);
    const button = screen.getByTitle('Usar mi ubicación actual');
    expect(button).toBeTruthy();
  });

  it('calls navigator.geolocation.getCurrentPosition when clicked and shows loading state', () => {
    render(<LocateControl onFound={vi.fn()} />);
    const button = screen.getByTitle('Usar mi ubicación actual');

    fireEvent.click(button);

    expect(getCurrentPositionMock).toHaveBeenCalled();
    // In actual DOM, testing for Loader2 visually might be tricky, but we know it's rendered if state is loading
    // Since we didn't mock the callback to resolve immediately, loading state should remain active
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('calls onFound callback on successful geolocation', () => {
    const onFoundMock = vi.fn();

    // Setup mock to call the success callback immediately
    getCurrentPositionMock.mockImplementation((success: any) => {
      success({ coords: { latitude: 10, longitude: 20 } });
    });

    render(<LocateControl onFound={onFoundMock} />);
    const button = screen.getByTitle('Usar mi ubicación actual');

    act(() => {
      fireEvent.click(button);
    });

    expect(onFoundMock).toHaveBeenCalledWith(10, 20);
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('handles geolocation errors gracefully and logs warning', () => {
    // Setup mock to call the error callback immediately with code 3 (timeout)
    getCurrentPositionMock.mockImplementation((_, error: any) => {
      error({ code: 3, message: 'Timeout' });
    });

    render(<LocateControl onFound={vi.fn()} />);
    const button = screen.getByTitle('Usar mi ubicación actual');

    act(() => {
      fireEvent.click(button);
    });

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("El GPS tardó demasiado"));
    expect(document.querySelector('.animate-spin')).toBeNull();
  });
});
