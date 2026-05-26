import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LocateControl } from './LocateControl';
import { useMap } from 'react-leaflet';

// Mock react-leaflet
vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual,
    useMap: vi.fn(),
  };
});

describe('LocateControl', () => {
  const mockSetView = vi.fn();
  const mockOnFound = vi.fn();

  let originalGeolocation: Geolocation;

  beforeEach(() => {
    vi.clearAllMocks();
    (useMap as any).mockReturnValue({
      setView: mockSetView,
    });

    originalGeolocation = global.navigator.geolocation;

    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn()
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true
    });

    // Spy on console.error and console.warn
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true
    });
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<LocateControl onFound={mockOnFound} />);
    expect(screen.getByTitle('Usar mi ubicación actual')).toBeTruthy();
  });

  it('handles successful geolocation', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    };

    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce((success: any) => {
      success(mockPosition);
    });

    render(<LocateControl onFound={mockOnFound} />);

    const button = screen.getByTitle('Usar mi ubicación actual');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
    expect(mockSetView).toHaveBeenCalledWith([40.7128, -74.0060], 16);
    expect(mockOnFound).toHaveBeenCalledWith(40.7128, -74.0060);
  });

  it('handles geolocation error correctly', async () => {
    const mockError = { code: 1, message: 'Permission denied' };

    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce((success: any, error: any) => {
      error(mockError);
    });

    render(<LocateControl onFound={mockOnFound} />);

    const button = screen.getByTitle('Usar mi ubicación actual');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(mockError);
    expect(console.warn).toHaveBeenCalledWith('No se pudo obtener la ubicación actual.');
    expect(mockSetView).not.toHaveBeenCalled();
    expect(mockOnFound).not.toHaveBeenCalled();
  });

  it('handles timeout error correctly', async () => {
    const mockError = { code: 3, message: 'Timeout' };

    (global.navigator.geolocation.getCurrentPosition as any).mockImplementationOnce((success: any, error: any) => {
      error(mockError);
    });

    render(<LocateControl onFound={mockOnFound} />);

    const button = screen.getByTitle('Usar mi ubicación actual');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(mockError);
    expect(console.warn).toHaveBeenCalledWith('El GPS tardó demasiado. Intenta moverte a un lugar despejado o espera un momento.');
    expect(mockSetView).not.toHaveBeenCalled();
    expect(mockOnFound).not.toHaveBeenCalled();
  });
});
