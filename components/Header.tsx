import React from 'react';
import { Navigation, Sun, Moon, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  locationError: string | null;
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ locationError, darkMode, toggleTheme }) => {
  return (
    <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm px-4 pb-3 pt-safe z-30 flex justify-between items-center transition-colors min-h-[56px]">
      <div className="flex items-center gap-2 min-w-0">
        <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0">
          <Navigation size={20} />
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">GeoTasker</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {locationError && (
          <>
            <div className="text-xs text-red-500 max-w-[200px] leading-tight text-right hidden sm:block">
              {locationError}
            </div>
            <div className="sm:hidden text-red-500 flex items-center justify-center cursor-help" title={locationError}>
              <AlertTriangle size={20} />
            </div>
          </>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Cambiar tema"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};
