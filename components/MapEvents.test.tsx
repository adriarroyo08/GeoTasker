import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MapEvents } from './MapEvents';
import * as ReactLeaflet from 'react-leaflet';

vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual as any,
    useMap: vi.fn(),
  };
});

describe('MapEvents', () => {
  it('should register click event on map', () => {
    const on = vi.fn();
    const off = vi.fn();
    (ReactLeaflet.useMap as any).mockReturnValue({ on, off });

    const onClick = vi.fn();
    const { unmount } = render(<MapEvents onClick={onClick} />);

    expect(on).toHaveBeenCalledWith('click', expect.any(Function));

    unmount();

    expect(off).toHaveBeenCalledWith('click', expect.any(Function));
  });
});
