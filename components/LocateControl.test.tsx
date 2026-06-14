import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LocateControl } from './LocateControl';

vi.mock('react-leaflet', () => ({
  useMap: () => ({
    setView: vi.fn(),
  }),
}));

describe('LocateControl', () => {
  it('should render the control button', () => {
    const { getByTitle } = render(<LocateControl onFound={vi.fn()} />);
    expect(getByTitle('Usar mi ubicación actual')).toBeTruthy();
  });
});
