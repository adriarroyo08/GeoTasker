import React, { useState } from 'react';

import { AppView, Task } from './types';
import { useGeofencing } from './hooks/useGeofencing';
import { useTaskManager } from './hooks/useTaskManager';
import { useTheme } from './hooks/useTheme';
import { useSmartTask } from './hooks/useSmartTask';
import { MapView } from './components/MapView';
import { EditTaskModal } from './components/EditTaskModal';
import { Header } from './components/Header';
import { LocationConfirmOverlay } from './components/LocationConfirmOverlay';
import { BottomNav } from './components/BottomNav';
import { TaskList } from './components/TaskList';

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
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      <Header
        locationError={locationError}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

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
            <LocationConfirmOverlay
              isSelectingLocation={isSelectingLocation}
              hasTempLocation={!!tempLocation}
              onCancel={cancelLocation}
              onConfirm={confirmLocation}
            />
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
      {editingTask && (
        <EditTaskModal
          key={editingTask.id}
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default App;
