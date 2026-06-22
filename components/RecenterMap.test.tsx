import React from 'react';
import { render } from '@testing-library/react';
import { RecenterMap } from './RecenterMap';
import * as reactLeaflet from 'react-leaflet';
import { vi } from 'vitest';

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(),
}));

describe('RecenterMap', () => {
  it('should call setView with the correct center', () => {
    const mockSetView = vi.fn();
    const mockGetZoom = vi.fn().mockReturnValue(15);
    (reactLeaflet.useMap as any).mockReturnValue({
      setView: mockSetView,
      getZoom: mockGetZoom,
    });

    render(<RecenterMap center={[40.4168, -3.7038]} />);

    expect(mockSetView).toHaveBeenCalledWith([40.4168, -3.7038], 15);
  });

  it('should not call setView on subsequent renders', () => {
    const mockSetView = vi.fn();
    const mockGetZoom = vi.fn().mockReturnValue(15);
    (reactLeaflet.useMap as any).mockReturnValue({
      setView: mockSetView,
      getZoom: mockGetZoom,
    });

    const { rerender } = render(<RecenterMap center={[40.4168, -3.7038]} />);

    expect(mockSetView).toHaveBeenCalledTimes(1);

    rerender(<RecenterMap center={[40.4168, -3.7038]} />);

    expect(mockSetView).toHaveBeenCalledTimes(1);
  });
});
