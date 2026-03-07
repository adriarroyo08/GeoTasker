import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../types';

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tasks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse tasks from localStorage", e);
        }
      }
    }
    return [];
  });

  const tasksRef = useRef(tasks);

  // Update ref whenever tasks change
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    let timeoutId: number;

    const saveTasks = () => {
      localStorage.setItem('tasks', JSON.stringify(tasksRef.current));
    };

    // Debounced save
    timeoutId = window.setTimeout(() => {
      saveTasks();
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveTasks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tasks]);

  // Handle final flush on component unmount only
  useEffect(() => {
    return () => {
      localStorage.setItem('tasks', JSON.stringify(tasksRef.current));
    };
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev]);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  }, []);

  return {
    tasks,
    addTask,
    deleteTask,
    updateTask,
    toggleTask
  };
};
