import React from 'react';
import { List, Map as MapIcon } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavProps {
  view: AppView;
  setView: (view: AppView) => void;
  isSelectingLocation: boolean;
  cancelLocation: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  view,
  setView,
  isSelectingLocation,
  cancelLocation
}) => {
  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex justify-around items-center z-20 transition-colors">
      <button
        onClick={() => {
          setView(AppView.LIST);
          if (isSelectingLocation) cancelLocation();
        }}
        className={`flex flex-col items-center gap-1 text-xs font-medium ${view === AppView.LIST ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        aria-label="List View"
      >
        <List size={24} />
        Lista
      </button>

      <button
         onClick={() => setView(AppView.MAP)}
         className={`flex flex-col items-center gap-1 text-xs font-medium ${view === AppView.MAP ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
         aria-label="Map View"
      >
        <MapIcon size={24} />
        Mapa
      </button>
    </nav>
  );
};
