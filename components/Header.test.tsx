import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('renders correctly', () => {
    render(
      <Header
        locationError={null}
        darkMode={false}
        toggleTheme={() => {}}
      />
    );
    expect(screen.getByText('GeoTasker')).toBeTruthy();
  });

  it('displays location error when provided', () => {
    const errorMsg = 'GPS Failed';
    render(
      <Header
        locationError={errorMsg}
        darkMode={false}
        toggleTheme={() => {}}
      />
    );
    expect(screen.getByText(errorMsg)).toBeTruthy();
  });

  it('calls toggleTheme when button is clicked', () => {
    const toggleTheme = vi.fn();
    render(
      <Header
        locationError={null}
        darkMode={false}
        toggleTheme={toggleTheme}
      />
    );

    const button = screen.getByLabelText('Toggle theme');
    fireEvent.click(button);
    expect(toggleTheme).toHaveBeenCalled();
  });
});
