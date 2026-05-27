import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocateControl } from './LocateControl';
import * as ReactLeaflet from 'react-leaflet';

vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual as any,
    useMap: vi.fn(),
  };
});

describe('LocateControl', () => {
  let originalGeolocation: any;

  beforeEach(() => {
    originalGeolocation = global.navigator.geolocation;
    (global.navigator as any).geolocation = {
      getCurrentPosition: vi.fn(),
    };
    (ReactLeaflet.useMap as any).mockReturnValue({ setView: vi.fn() });
  });

  afterEach(() => {
    (global.navigator as any).geolocation = originalGeolocation;
  });

  it('should render the control button', () => {
    render(<LocateControl onFound={vi.fn()} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should call geolocation.getCurrentPosition on click', () => {
    render(<LocateControl onFound={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
  });
});
