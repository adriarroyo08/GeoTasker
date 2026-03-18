import React, { useState } from 'react';
import { Task } from '../types';
import { MapPin, Calendar, CheckCircle, Circle, Trash2, Pencil, X, Check } from 'lucide-react';
import { formatDistance, calculateDistance } from '../utils/geo';

interface TaskCardProps {
  task: Task;
  userLat?: number;
  userLng?: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, userLat, userLng, onToggle, onDelete, onEdit }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  let distanceStr = '';
  if (task.location && userLat !== undefined && userLng !== undefined) {
    const dist = calculateDistance(userLat, userLng, task.location.lat, task.location.lng);
    distanceStr = formatDistance(dist);
  }

  const handleDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
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
                  {distanceStr && (
                    <span className="ml-1 opacity-75">
                      (a {distanceStr})
                    </span>
                  )}
                  {!distanceStr && task.location && (
                    <span className="ml-1 opacity-75">
                      (Radio: {task.radius}m)
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
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={() => onEdit(task)}
                className="text-gray-300 hover:text-blue-500 transition-colors p-2 dark:text-gray-600 dark:hover:text-blue-400"
                aria-label="Editar tarea"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-300 hover:text-red-500 transition-colors p-2 dark:text-gray-600 dark:hover:text-red-400"
                aria-label="Eliminar tarea"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-1 animate-in slide-in-from-right-2">
              <button
                onClick={handleDelete}
                className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                aria-label="Confirmar eliminación"
              >
                <Check size={14} /> Confirmar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                aria-label="Cancelar eliminación"
              >
                <X size={14} /> Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};