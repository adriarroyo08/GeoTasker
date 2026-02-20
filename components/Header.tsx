import React from 'react';
import { Navigation, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  locationError: string | null;
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ locationError, darkMode, toggleTheme }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] z-10 flex justify-between items-center transition-colors">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Navigation size={20} />
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">GeoTasker</h1>
      </div>

      <div className="flex items-center gap-3">
        {locationError && (
          <div className="text-xs text-red-500 max-w-[150px] leading-tight text-right hidden sm:block">
            {locationError}
          </div>
        )}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};
