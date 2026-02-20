import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BottomNav } from './BottomNav';
import { AppView } from '../types';

describe('BottomNav', () => {
  it('renders correctly', () => {
    render(
      <BottomNav
        view={AppView.LIST}
        setView={() => {}}
        isSelectingLocation={false}
        cancelLocation={() => {}}
      />
    );
    expect(screen.getByText('Lista')).toBeTruthy();
    expect(screen.getByText('Mapa')).toBeTruthy();
  });

  it('calls setView when buttons are clicked', () => {
    const setView = vi.fn();
    render(
      <BottomNav
        view={AppView.LIST}
        setView={setView}
        isSelectingLocation={false}
        cancelLocation={() => {}}
      />
    );

    fireEvent.click(screen.getByLabelText('Map View'));
    expect(setView).toHaveBeenCalledWith(AppView.MAP);
  });

  it('cancels location selection when switching to list view', () => {
    const setView = vi.fn();
    const cancelLocation = vi.fn();

    render(
      <BottomNav
        view={AppView.MAP}
        setView={setView}
        isSelectingLocation={true}
        cancelLocation={cancelLocation}
      />
    );

    fireEvent.click(screen.getByLabelText('List View'));
    expect(setView).toHaveBeenCalledWith(AppView.LIST);
    expect(cancelLocation).toHaveBeenCalled();
  });
});
