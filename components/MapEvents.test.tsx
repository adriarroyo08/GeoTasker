import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MapEvents } from './MapEvents';

const onMock = vi.fn();
const offMock = vi.fn();

vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual as any,
    useMap: vi.fn(() => ({
      on: onMock,
      off: offMock
    }))
  };
});

describe('MapEvents', () => {
  it('should attach and detach click event listener', () => {
    const onClick = vi.fn();
    const { unmount } = render(<MapEvents onClick={onClick} />);

    expect(onMock).toHaveBeenCalledWith('click', expect.any(Function));

    // Simulate click
    const clickHandler = onMock.mock.calls[0][1];
    clickHandler({ latlng: { lat: 10, lng: 20 } });
    expect(onClick).toHaveBeenCalledWith(10, 20);

    unmount();
    expect(offMock).toHaveBeenCalledWith('click', expect.any(Function));
  });
});
