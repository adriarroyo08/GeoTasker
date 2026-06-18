import React, { useState } from 'react';
import { Task, GeoLocation } from '../types';
import { TaskCard } from './TaskCard';
import { TaskInput } from './TaskInput';
import { ConfirmModal } from './ConfirmModal';

interface TaskListProps {
  tasks: Task[];
  newTaskInput: string;
  setNewTaskInput: (val: string) => void;
  isProcessing: boolean;
  handleSmartAdd: () => void;
  userLocation: GeoLocation | null;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setEditingTask: (task: Task | null) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  newTaskInput,
  setNewTaskInput,
  isProcessing,
  handleSmartAdd,
  userLocation,
  toggleTask,
  deleteTask,
  setEditingTask,
}) => {
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-4 max-w-2xl mx-auto w-full">
      <TaskInput
        newTaskInput={newTaskInput}
        setNewTaskInput={setNewTaskInput}
        isProcessing={isProcessing}
        handleSmartAdd={handleSmartAdd}
      />

      {/* Task List */}
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Tareas pendientes ({tasks.filter(t => !t.isCompleted).length})</h2>
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
            onToggle={toggleTask}
            onDeleteClick={setTaskToDelete}
            onEdit={setEditingTask}
          />
        ))
      )}

      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Eliminar tarea"
        message="¿Estás seguro de que deseas eliminar esta tarea?"
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
