import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MapView } from './MapView';
import { Task } from '../types';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  Circle: () => <div data-testid="circle" />,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn().mockReturnValue(15),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

describe('MapView', () => {
  const mockTasks: Task[] = [];
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  it('LocateControl handles permission denied (code 1) gracefully', async () => {
    const onFound = vi.fn();
    render(<MapView tasks={mockTasks} userLocation={null} onUserLocationUpdate={onFound} selectingLocation={true} />);

    // Find the locate button
    const locateButton = screen.getByTitle('Usar mi ubicación actual');

    // Click to trigger getCurrentPosition
    fireEvent.click(locateButton);

    // Assert getCurrentPosition was called
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();

    const errorCallback = mockGeolocation.getCurrentPosition.mock.calls[0][1];

    // Simulate error code 1 (Permission denied)
    act(() => {
      errorCallback({ code: 1, message: 'Permission denied' });
    });

    // Since it early returns on code 1, it should not throw or trigger onFound
    expect(onFound).not.toHaveBeenCalled();
  });
});
