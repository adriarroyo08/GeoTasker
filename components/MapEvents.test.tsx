import React from 'react';
import { render } from '@testing-library/react';
import { MapEvents } from './MapEvents';
import * as reactLeaflet from 'react-leaflet';
import { vi } from 'vitest';

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(),
}));

describe('MapEvents', () => {
  it('should register and unregister click events', () => {
    const mockOn = vi.fn();
    const mockOff = vi.fn();
    (reactLeaflet.useMap as any).mockReturnValue({
      on: mockOn,
      off: mockOff,
    });

    const onClick = vi.fn();

    const { unmount } = render(<MapEvents onClick={onClick} />);

    expect(mockOn).toHaveBeenCalledWith('click', expect.any(Function));

    unmount();

    expect(mockOff).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('should correctly call onClick prop with lat and lng', () => {
    const mockOn = vi.fn();
    (reactLeaflet.useMap as any).mockReturnValue({
      on: mockOn,
      off: vi.fn(),
    });

    const onClick = vi.fn();

    render(<MapEvents onClick={onClick} />);

    const handler = mockOn.mock.calls[0][1];
    handler({ latlng: { lat: 10, lng: 20 } });

    expect(onClick).toHaveBeenCalledWith(10, 20);
  });
});
