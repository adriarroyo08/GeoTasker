import React from 'react';
import { Plus, Mic, Loader2 } from 'lucide-react';
import { Task } from '../types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  newTaskInput: string;
  setNewTaskInput: (val: string) => void;
  isProcessing: boolean;
  handleSmartAdd: () => void;
  userLocation: { lat: number; lng: number } | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  newTaskInput,
  setNewTaskInput,
  isProcessing,
  handleSmartAdd,
  userLocation,
  onToggle,
  onDelete,
  onEdit
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ¿Qué necesitas hacer?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Ej: Comprar leche en Walmart..."
            className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && handleSmartAdd()}
          />
          <button
            onClick={handleSmartAdd}
            disabled={isProcessing || !newTaskInput.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
          <Mic size={12} />
          Intenta: "Recordarme sacar dinero cuando pase por el banco" (Gemini AI Powered)
        </p>
      </div>

      {/* Task List */}
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Mis Tareas ({tasks.filter(t => !t.isCompleted).length})</h2>
      {tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <p>No tienes tareas pendientes.</p>
          <p className="text-sm">¡Agrega una arriba!</p>
        </div>
      ) : (
        tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            userLat={userLocation?.lat}
            userLng={userLocation?.lng}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
};
