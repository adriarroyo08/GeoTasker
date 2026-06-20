import React from 'react';
import { List, Map as MapIcon } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavProps {
  view: AppView;
  setView: (view: AppView) => void;
  isSelectingLocation: boolean;
  cancelLocation: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ view, setView, isSelectingLocation, cancelLocation }) => {
  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 pt-2 pb-safe flex justify-around items-center z-20 transition-colors shrink-0">
      <button
        onClick={() => {
          setView(AppView.LIST);
          if (isSelectingLocation) cancelLocation();
        }}
        className={`flex flex-col items-center gap-1 text-xs font-medium min-w-[44px] min-h-[44px] justify-center px-4 rounded-lg transition-colors ${view === AppView.LIST ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <List size={24} />
        Lista
      </button>

      <button
         onClick={() => setView(AppView.MAP)}
         className={`flex flex-col items-center gap-1 text-xs font-medium min-w-[44px] min-h-[44px] justify-center px-4 rounded-lg transition-colors ${view === AppView.MAP ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <MapIcon size={24} />
        Mapa
      </button>
    </nav>
  );
};
