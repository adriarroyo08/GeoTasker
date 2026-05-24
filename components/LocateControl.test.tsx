import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LocateControl } from './LocateControl';

const setViewMock = vi.fn();

vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual as any,
    useMap: vi.fn(() => ({
      setView: setViewMock
    }))
  };
});

describe('LocateControl', () => {
  let getCurrentPositionMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentPositionMock = vi.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: getCurrentPositionMock },
      writable: true,
    });
  });

  it('should call geolocation API and map.setView on click', () => {
    const onFound = vi.fn();
    render(<LocateControl onFound={onFound} />);

    const button = screen.getByRole('button');
    act(() => {
      fireEvent.click(button);
    });

    expect(getCurrentPositionMock).toHaveBeenCalled();

    const successCallback = getCurrentPositionMock.mock.calls[0][0];
    act(() => {
      successCallback({ coords: { latitude: 50, longitude: 60 } });
    });

    expect(setViewMock).toHaveBeenCalledWith([50, 60], 16);
    expect(onFound).toHaveBeenCalledWith(50, 60);
  });
});
