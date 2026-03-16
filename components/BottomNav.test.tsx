import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from './BottomNav';
import { AppView } from '../types';

describe('BottomNav', () => {
  it('should render Lista and Mapa buttons', () => {
    render(
      <BottomNav
        view={AppView.LIST}
        setView={vi.fn()}
        isSelectingLocation={false}
        cancelLocation={vi.fn()}
      />
    );
    expect(screen.getByText('Lista')).toBeTruthy();
    expect(screen.getByText('Mapa')).toBeTruthy();
  });

  it('should call setView with LIST when Lista button is clicked', () => {
    const setView = vi.fn();
    render(
      <BottomNav
        view={AppView.MAP}
        setView={setView}
        isSelectingLocation={false}
        cancelLocation={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Lista'));
    expect(setView).toHaveBeenCalledWith(AppView.LIST);
  });

  it('should call setView with MAP when Mapa button is clicked', () => {
    const setView = vi.fn();
    render(
      <BottomNav
        view={AppView.LIST}
        setView={setView}
        isSelectingLocation={false}
        cancelLocation={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Mapa'));
    expect(setView).toHaveBeenCalledWith(AppView.MAP);
  });

  it('should call cancelLocation when Lista is clicked and isSelectingLocation is true', () => {
    const cancelLocation = vi.fn();
    const setView = vi.fn();
    render(
      <BottomNav
        view={AppView.MAP}
        setView={setView}
        isSelectingLocation={true}
        cancelLocation={cancelLocation}
      />
    );
    fireEvent.click(screen.getByText('Lista'));
    expect(cancelLocation).toHaveBeenCalledTimes(1);
  });

  it('should NOT call cancelLocation when Lista is clicked and isSelectingLocation is false', () => {
    const cancelLocation = vi.fn();
    render(
      <BottomNav
        view={AppView.MAP}
        setView={vi.fn()}
        isSelectingLocation={false}
        cancelLocation={cancelLocation}
      />
    );
    fireEvent.click(screen.getByText('Lista'));
    expect(cancelLocation).not.toHaveBeenCalled();
  });

  it('should apply active style to Lista button when view is LIST', () => {
    render(
      <BottomNav
        view={AppView.LIST}
        setView={vi.fn()}
        isSelectingLocation={false}
        cancelLocation={vi.fn()}
      />
    );
    const listaButton = screen.getByText('Lista').closest('button');
    expect(listaButton?.className).toContain('text-blue-600');
  });

  it('should apply active style to Mapa button when view is MAP', () => {
    render(
      <BottomNav
        view={AppView.MAP}
        setView={vi.fn()}
        isSelectingLocation={false}
        cancelLocation={vi.fn()}
      />
    );
    const mapaButton = screen.getByText('Mapa').closest('button');
    expect(mapaButton?.className).toContain('text-blue-600');
  });

  it('should not apply active style to Mapa button when view is LIST', () => {
    render(
      <BottomNav
        view={AppView.LIST}
        setView={vi.fn()}
        isSelectingLocation={false}
        cancelLocation={vi.fn()}
      />
    );
    const mapaButton = screen.getByText('Mapa').closest('button');
    expect(mapaButton?.className).not.toContain('text-blue-600');
  });
});
