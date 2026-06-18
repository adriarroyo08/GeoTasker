import React from 'react';
import { Check, X } from 'lucide-react';

interface LocationConfirmOverlayProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const LocationConfirmOverlay: React.FC<LocationConfirmOverlayProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-3 animate-in slide-in-from-bottom-4">
      <button
        onClick={onCancel}
        className="bg-white dark:bg-gray-800 dark:text-white text-gray-700 px-4 py-3 rounded-2xl shadow-xl font-bold border border-gray-200 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <X size={20} />
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
      >
        <Check size={20} />
        Confirmar Ubicación
      </button>
    </div>
  );
};
