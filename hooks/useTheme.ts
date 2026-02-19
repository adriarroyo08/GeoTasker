import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    // Select the meta tag or create it if it doesn't exist (robustness)
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      metaThemeColor.setAttribute('content', '#111827');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      metaThemeColor.setAttribute('content', '#ffffff');
    }
  }, [darkMode]);

  const toggleTheme = useCallback(() => setDarkMode(prev => !prev), []);

  return { darkMode, toggleTheme };
};
