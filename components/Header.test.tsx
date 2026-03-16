import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('should render the app title', () => {
    render(<Header locationError={null} darkMode={false} toggleTheme={vi.fn()} />);
    expect(screen.getByText('GeoTasker')).toBeTruthy();
  });

  it('should show Sun icon when in dark mode', () => {
    const { container } = render(
      <Header locationError={null} darkMode={true} toggleTheme={vi.fn()} />
    );
    // In dark mode, button shows Sun icon (to switch to light)
    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    // Sun icon has a circle element in its SVG, Moon has a path
    const svgPaths = button!.querySelectorAll('circle');
    expect(svgPaths.length).toBeGreaterThan(0);
  });

  it('should show Moon icon when in light mode', () => {
    const { container } = render(
      <Header locationError={null} darkMode={false} toggleTheme={vi.fn()} />
    );
    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    // Moon icon doesn't have circle but has crescent path
    const circles = button!.querySelectorAll('circle');
    expect(circles.length).toBe(0);
  });

  it('should call toggleTheme when button is clicked', () => {
    const toggleTheme = vi.fn();
    render(<Header locationError={null} darkMode={false} toggleTheme={toggleTheme} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should display location error message when provided', () => {
    const errorMsg = 'Location access denied';
    render(<Header locationError={errorMsg} darkMode={false} toggleTheme={vi.fn()} />);
    expect(screen.getByText(errorMsg)).toBeTruthy();
  });

  it('should not display error element when locationError is null', () => {
    render(<Header locationError={null} darkMode={false} toggleTheme={vi.fn()} />);
    expect(screen.queryByText('Location access denied')).toBeNull();
  });
});
