import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../types';

/** Maximum number of tasks kept in state/localStorage to prevent unbounded growth. */
const MAX_TASKS = 500;

/**
 * Validate that a value from localStorage conforms to the Task shape.
 * Returns the item if valid, null otherwise.
 */
const isValidTask = (item: unknown): item is Task => {
  if (!item || typeof item !== 'object') return false;
  const t = item as Record<string, unknown>;
  if (
    typeof t.id !== 'string' || t.id.length === 0 || t.id.length > 64 ||
    typeof t.title !== 'string' || t.title.length > 100 ||
    typeof t.description !== 'string' || t.description.length > 500 ||
    typeof t.radius !== 'number' || !Number.isFinite(t.radius) || t.radius <= 0 || t.radius > 50000 ||
    typeof t.isCompleted !== 'boolean' ||
    typeof t.createdAt !== 'number' || !Number.isFinite(t.createdAt)
  ) return false;
  // Validate optional location shape if present
  if (t.location !== undefined) {
    if (!t.location || typeof t.location !== 'object') return false;
    const loc = t.location as Record<string, unknown>;
    if (
      typeof loc.lat !== 'number' || !Number.isFinite(loc.lat) || loc.lat < -90 || loc.lat > 90 ||
      typeof loc.lng !== 'number' || !Number.isFinite(loc.lng) || loc.lng < -180 || loc.lng > 180
    ) return false;
    if (loc.address !== undefined && (typeof loc.address !== 'string' || loc.address.length > 200)) return false;
  }
  // Validate optional dueDate if present
  if (t.dueDate !== undefined && (typeof t.dueDate !== 'string' || isNaN(new Date(t.dueDate).getTime()))) return false;
  return true;
};

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tasks');
      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out any corrupt/malformed entries before trusting stored data
            return parsed.filter(isValidTask).slice(0, MAX_TASKS);
          }
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
      // Prune completed tasks older than 30 days to prevent unbounded localStorage growth
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const prunedTasks = tasksRef.current.filter(
        t => !t.isCompleted || t.createdAt > thirtyDaysAgo
      );
      localStorage.setItem('tasks', JSON.stringify(prunedTasks));
    };

    // Debounced save with pruning of old completed tasks
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
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const prunedTasks = tasksRef.current.filter(
        t => !t.isCompleted || t.createdAt > thirtyDaysAgo
      );
      localStorage.setItem('tasks', JSON.stringify(prunedTasks));
    };
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev].slice(0, MAX_TASKS));
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
