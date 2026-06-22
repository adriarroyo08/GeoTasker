import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocateControl } from './LocateControl';
import * as reactLeaflet from 'react-leaflet';
import { vi } from 'vitest';

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(),
}));

describe('LocateControl', () => {
  let originalGeolocation: any;

  beforeEach(() => {
    originalGeolocation = navigator.geolocation;
    (navigator as any).geolocation = {
      getCurrentPosition: vi.fn(),
    };
  });

  afterEach(() => {
    (navigator as any).geolocation = originalGeolocation;
    vi.clearAllMocks();
  });

  it('should call geolocation API and set map view on success', async () => {
    const mockSetView = vi.fn();
    (reactLeaflet.useMap as any).mockReturnValue({
      setView: mockSetView,
    });
    const mockOnFound = vi.fn();

    (navigator.geolocation.getCurrentPosition as any).mockImplementation((success: any) => {
      success({ coords: { latitude: 15, longitude: 25 } });
    });

    render(<LocateControl onFound={mockOnFound} />);

    const button = screen.getByRole('button', { name: /Usar mi ubicación actual/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
    });
    expect(mockSetView).toHaveBeenCalledWith([15, 25], 16);
    expect(mockOnFound).toHaveBeenCalledWith(15, 25);
  });
});
