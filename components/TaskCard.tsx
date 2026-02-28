import React from 'react';
import { Task } from '../types';
import { MapPin, Calendar, CheckCircle, Circle, Trash2, Pencil } from 'lucide-react';
import { calculateDistance, formatDistance } from '../utils/geo';

interface TaskCardProps {
  task: Task;
  userLat?: number;
  userLng?: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, userLat, userLng, onToggle, onDelete, onEdit }) => {
  let distanceStr = '';
  if (task.location && userLat !== undefined && userLng !== undefined) {
    const dist = calculateDistance(userLat, userLng, task.location.lat, task.location.lng);
    distanceStr = formatDistance(dist);
  }

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      onDelete(task.id);
    }
  };

  // Dynamic base classes depending on completion and dark mode
  const baseClasses = task.isCompleted 
    ? 'bg-gray-100 border-gray-200 opacity-60 dark:bg-gray-800 dark:border-gray-700' 
    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';

  const textClass = task.isCompleted
    ? 'line-through text-gray-500 dark:text-gray-500'
    : 'text-gray-800 dark:text-white';

  return (
    <div className={`p-4 mb-3 rounded-xl shadow-sm border transition-all ${baseClasses}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <button 
            onClick={() => onToggle(task.id)}
            className={`mt-1 transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400'}`}
          >
            {task.isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
          </button>
          
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${textClass}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 text-sm mt-1 dark:text-gray-400">{task.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {task.location && (
                <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-md ${
                  task.isCompleted 
                    ? 'text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-400' 
                    : 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  <MapPin size={12} className="mr-1" />
                  {task.location.address || 'Ubicación fijada'}
                  {userLat && userLng && task.location && (
                    <span className="ml-1 opacity-75">
                      (Radio: {task.radius}m{distanceStr ? ` - a ${distanceStr}` : ''})
                    </span>
                  )}
                </span>
              )}
              
              {task.dueDate && (
                <span className="inline-flex items-center text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md dark:bg-orange-900/30 dark:text-orange-300">
                  <Calendar size={12} className="mr-1" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button 
            onClick={() => onEdit(task)}
            className="text-gray-300 hover:text-blue-500 transition-colors p-2 dark:text-gray-600 dark:hover:text-blue-400"
            aria-label="Editar tarea"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-500 transition-colors p-2 dark:text-gray-600 dark:hover:text-red-400"
            aria-label="Eliminar tarea"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};