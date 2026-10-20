import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
          (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch { /* Private browsing or storage full */ }
    return false;
  });

  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch { /* quota exceeded */ }
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#111827');
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch { /* quota exceeded */ }
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#ffffff');
    }
  }, [darkMode]);

  const toggleTheme = useCallback(() => setDarkMode(prev => !prev), []);

  return { darkMode, toggleTheme };
};
