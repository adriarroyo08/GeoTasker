import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, AppView, GeoLocation } from '../types';
import { DEFAULT_RADIUS } from '../constants';
import { parseTaskWithGemini } from '../services/gemini';

interface UseSmartTaskProps {
  addTask: (task: Task) => void;
  setView: (view: AppView) => void;
}

export const useSmartTask = ({ addTask, setView }: UseSmartTaskProps) => {
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingTask, setPendingTask] = useState<Partial<Task> | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState<GeoLocation | null>(null);

  const handleSmartAdd = async () => {
    const sanitized = newTaskInput.trim().slice(0, 200);
    if (!sanitized) return;
    setIsProcessing(true);

    try {
      const parsed = await parseTaskWithGemini(sanitized);

      // Clamp/validate title returned by the AI before storing
      const safeTitle = (typeof parsed.title === 'string' ? parsed.title.trim() : '').slice(0, 100) || sanitized.slice(0, 100);
      const safeDescription = (typeof parsed.description === 'string' ? parsed.description : '').slice(0, 500);

      const newTask: Partial<Task> = {
        title: safeTitle,
        description: safeDescription,
        radius: DEFAULT_RADIUS,
        isCompleted: false,
        createdAt: Date.now(),
      };

      if (parsed.hasLocation) {
        setPendingTask(newTask);
        setIsSelectingLocation(true);
        setView(AppView.MAP);
        setTempLocation(null);
      } else {
        finalizeTaskCreation(newTask);
      }
    } catch (e) {
      console.error(e);
      // Fallback a modo manual
      const fallbackTask: Partial<Task> = {
        title: sanitized.slice(0, 100),
        description: '',
        radius: DEFAULT_RADIUS,
        isCompleted: false,
        createdAt: Date.now(),
      };
      finalizeTaskCreation(fallbackTask);
    } finally {
      setIsProcessing(false);
      setNewTaskInput('');
    }
  };

  const finalizeTaskCreation = (taskPartial: Partial<Task>, location?: GeoLocation) => {
    const task: Task = {
      id: uuidv4(),
      title: taskPartial.title || 'Nueva Tarea',
      description: taskPartial.description || '',
      radius: taskPartial.radius || DEFAULT_RADIUS,
      isCompleted: false,
      createdAt: Date.now(),
      location: location,
      ...taskPartial
    };
    addTask(task);
    setPendingTask(null);
    setTempLocation(null);
    setIsSelectingLocation(false);
    setView(AppView.LIST);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectingLocation) {
      setTempLocation({ lat, lng, address: 'Punto seleccionado' });
    }
  };

  const confirmLocation = () => {
    if (isSelectingLocation && pendingTask && tempLocation) {
      finalizeTaskCreation(pendingTask, tempLocation);
    }
  };

  const cancelLocation = () => {
    setIsSelectingLocation(false);
    setPendingTask(null);
    setTempLocation(null);
    setView(AppView.LIST);
  };

  return {
    newTaskInput,
    setNewTaskInput,
    isProcessing,
    pendingTask,
    isSelectingLocation,
    tempLocation,
    handleSmartAdd,
    handleMapClick,
    confirmLocation,
    cancelLocation
  };
};
