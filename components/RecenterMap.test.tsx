import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecenterMap } from './RecenterMap';
import * as ReactLeaflet from 'react-leaflet';

vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual as any,
    useMap: vi.fn(),
  };
});

describe('RecenterMap', () => {
  it('should center the map on initial render', () => {
    const setView = vi.fn();
    const getZoom = vi.fn().mockReturnValue(15);
    (ReactLeaflet.useMap as any).mockReturnValue({ setView, getZoom });

    render(<RecenterMap center={[40, -3]} />);

    expect(setView).toHaveBeenCalledTimes(1);
    expect(setView).toHaveBeenCalledWith([40, -3], 15);
  });
});
