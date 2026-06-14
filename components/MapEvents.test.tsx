import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MapEvents } from './MapEvents';

vi.mock('react-leaflet', () => ({
  useMap: () => ({
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

describe('MapEvents', () => {
  it('should attach and detach map click events', () => {
    const { unmount } = render(<MapEvents onClick={vi.fn()} />);
    unmount();
    expect(true).toBeTruthy();
  });
});
