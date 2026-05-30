import React from 'react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';

interface TaskInputProps {
  newTaskInput: string;
  setNewTaskInput: (val: string) => void;
  isProcessing: boolean;
  handleSmartAdd: () => void;
}

export const TaskInput = React.memo(({
  newTaskInput,
  setNewTaskInput,
  isProcessing,
  handleSmartAdd
}: TaskInputProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        ¿Qué necesitas hacer?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskInput}
          maxLength={100}
          onChange={(e) => setNewTaskInput(e.target.value)}
          placeholder="Ej: Comprar leche en Walmart..."
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
          onKeyDown={(e) => e.key === 'Enter' && handleSmartAdd()}
        />
        <button
          onClick={handleSmartAdd}
          disabled={isProcessing || !newTaskInput.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          <span className="hidden sm:inline">Agregar</span>
        </button>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
        <Sparkles size={12} />
        Intenta: "Recordarme sacar dinero cuando pase por el banco" (Gemini AI Powered)
      </p>
    </div>
  );
});

TaskInput.displayName = 'TaskInput';
