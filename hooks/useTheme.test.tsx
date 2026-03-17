import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useTheme', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    // Default: system prefers light
    matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, 'matchMedia', { value: matchMediaMock, writable: true });
    // Ensure the html element starts clean
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize to light mode when localStorage is "light"', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.darkMode).toBe(false);
  });

  it('should initialize to dark mode when localStorage is "dark"', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.darkMode).toBe(true);
  });

  it('should initialize to dark mode when system prefers dark and no localStorage entry', () => {
    matchMediaMock.mockReturnValue({ matches: true });
    const { result } = renderHook(() => useTheme());
    expect(result.current.darkMode).toBe(true);
  });

  it('should initialize to light mode when system prefers light and no localStorage entry', () => {
    matchMediaMock.mockReturnValue({ matches: false });
    const { result } = renderHook(() => useTheme());
    expect(result.current.darkMode).toBe(false);
  });

  it('should add "dark" class to documentElement when darkMode is true', () => {
    localStorage.setItem('theme', 'dark');
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove "dark" class from documentElement when darkMode is false', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'light');
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should persist theme to localStorage on change', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should toggle darkMode from false to true', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());

    expect(result.current.darkMode).toBe(false);
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.darkMode).toBe(true);
  });

  it('should toggle darkMode from true to false', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());

    expect(result.current.darkMode).toBe(true);
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.darkMode).toBe(false);
  });

  it('should update meta theme-color when switching to dark mode', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);

    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(meta.getAttribute('content')).toBe('#111827');
    document.head.removeChild(meta);
  });

  it('should update meta theme-color when switching to light mode', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);

    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(meta.getAttribute('content')).toBe('#ffffff');
    document.head.removeChild(meta);
  });
});
