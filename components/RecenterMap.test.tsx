import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { RecenterMap } from './RecenterMap';
import * as ReactLeaflet from 'react-leaflet';

const setViewMock = vi.fn();
const getZoomMock = vi.fn(() => 15);

vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual as any,
    useMap: vi.fn(() => ({
      setView: setViewMock,
      getZoom: getZoomMock
    }))
  };
});

describe('RecenterMap', () => {
  it('should recenter map on initial mount', () => {
    render(<RecenterMap center={[10, 20]} />);
    expect(setViewMock).toHaveBeenCalledWith([10, 20], 15);
  });
});
