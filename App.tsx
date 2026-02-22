import React, { useState } from 'react';
import { Plus, List, Map as MapIcon, Mic, Loader2, Navigation, Check, X, Moon, Sun, Bell } from 'lucide-react';

import { AppView, Task } from './types';
import { useGeofencing } from './hooks/useGeofencing';
import { useTaskManager } from './hooks/useTaskManager';
import { useTheme } from './hooks/useTheme';
import { useSmartTask } from './hooks/useSmartTask';
import { MapView } from './components/MapView';
import { TaskCard } from './components/TaskCard';
import { EditTaskModal } from './components/EditTaskModal';

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
    cancelLocation,
    error: smartTaskError,
    clearError
  } = useSmartTask({ addTask, setView });

  const { userLocation, locationError, updateLocation, notificationPermission, requestPermission } = useGeofencing(tasks);

  const handleUpdateTask = (updatedTask: Task) => {
    updateTask(updatedTask);
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] z-10 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Navigation size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">GeoTasker</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {locationError && (
            <div className="text-xs text-red-500 max-w-[150px] leading-tight text-right hidden sm:block">
              {locationError}
            </div>
          )}
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              title="Activar notificaciones"
            >
              <Bell size={20} />
            </button>
          )}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {view === AppView.LIST && (
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
              {smartTaskError && (
                <div className="mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg flex justify-between items-center animate-in fade-in">
                  <span>{smartTaskError}</span>
                  <button onClick={clearError} className="text-red-700 dark:text-red-400 hover:text-red-900"><X size={16}/></button>
                </div>
              )}
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
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={setEditingTask}
                />
              ))
            )}
          </div>
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

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex justify-around items-center z-20 transition-colors">
        <button 
          onClick={() => {
            setView(AppView.LIST);
            if (isSelectingLocation) cancelLocation();
          }}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${view === AppView.LIST ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <List size={24} />
          Lista
        </button>
        
        <button 
           onClick={() => setView(AppView.MAP)}
           className={`flex flex-col items-center gap-1 text-xs font-medium ${view === AppView.MAP ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <MapIcon size={24} />
          Mapa
        </button>
      </nav>

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
