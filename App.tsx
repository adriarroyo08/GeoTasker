import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

import { AppView, Task } from './types';
import { useGeofencing } from './hooks/useGeofencing';
import { useTaskManager } from './hooks/useTaskManager';
import { useTheme } from './hooks/useTheme';
import { useSmartTask } from './hooks/useSmartTask';
import { MapView } from './components/MapView';
import { EditTaskModal } from './components/EditTaskModal';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { BottomNav } from './components/BottomNav';

const App: React.FC = () => {
  // State
  const { tasks, addTask, deleteTask, updateTask, toggleTask } = useTaskManager();
  const [view, setView] = useState<AppView>(AppView.LIST);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Custom Hooks
  const { darkMode, toggleTheme } = useTheme();
  const {
    newTaskInput,
    setNewTaskInput,
    isProcessing,
    handleSmartAdd,
    pendingTask,
    isSelectingLocation,
    tempLocation,
    handleMapClick,
    confirmLocation,
    cancelLocation
  } = useSmartTask({ addTask, setView });

  const { userLocation, locationError, updateLocation } = useGeofencing(tasks);

  const handleUpdateTask = (updatedTask: Task) => {
    updateTask(updatedTask);
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      <Header locationError={locationError} darkMode={darkMode} toggleTheme={toggleTheme} />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {view === AppView.LIST && (
          <TaskList
            tasks={tasks}
            newTaskInput={newTaskInput}
            setNewTaskInput={setNewTaskInput}
            isProcessing={isProcessing}
            handleSmartAdd={handleSmartAdd}
            userLocation={userLocation}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            setEditingTask={setEditingTask}
          />
        )}

        {view === AppView.MAP && (
          <div className="flex-1 relative">
            <MapView 
              tasks={tasks} 
              userLocation={userLocation} 
              onMapClick={handleMapClick}
              selectingLocation={isSelectingLocation}
              onUserLocationUpdate={updateLocation}
              previewLocation={tempLocation}
              previewRadius={pendingTask?.radius}
              isDarkMode={darkMode}
            />
            
            {/* Location Confirmation Overlay */}
            {isSelectingLocation && tempLocation && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-3 animate-in slide-in-from-bottom-4">
                <button
                  onClick={cancelLocation}
                  className="bg-white dark:bg-gray-800 dark:text-white text-gray-700 px-4 py-3 rounded-2xl shadow-xl font-bold border border-gray-200 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                  Cancelar
                </button>
                <button
                  onClick={confirmLocation}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Check size={20} />
                  Confirmar Ubicación
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav
        view={view}
        setView={setView}
        isSelectingLocation={isSelectingLocation}
        cancelLocation={cancelLocation}
      />

      {/* Edit Modal */}
      <EditTaskModal 
        task={editingTask} 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        onSave={handleUpdateTask}
      />
    </div>
  );
};

export default App;
