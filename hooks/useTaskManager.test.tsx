import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskManager } from './useTaskManager';
import { Task } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useTaskManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty tasks', () => {
    const { result } = renderHook(() => useTaskManager());
    expect(result.current.tasks).toEqual([]);
  });

  it('should initialize with tasks from localStorage', () => {
    const mockTasks: Task[] = [
      { id: '1', title: 'Test Task', description: '', radius: 100, isCompleted: false, createdAt: 123 }
    ];
    localStorage.setItem('tasks', JSON.stringify(mockTasks));

    const { result } = renderHook(() => useTaskManager());
    expect(result.current.tasks).toEqual(mockTasks);
  });

  it('should initialize with empty array if localStorage contains invalid JSON', () => {
    localStorage.setItem('tasks', 'not-valid-json{{}}');
    const { result } = renderHook(() => useTaskManager());
    expect(result.current.tasks).toEqual([]);
  });

  it('should add a task and debounce save to localStorage', () => {
    const { result } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toEqual(newTask);

    // Check it hasn't saved immediately
    expect(localStorage.getItem('tasks')).toBeNull();

    // Fast-forward 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual([newTask]);
  });

  it('should delete a task and debounce save to localStorage', () => {
    const { result } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual([newTask]);

    act(() => {
      result.current.deleteTask('1');
    });

    expect(result.current.tasks).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual([]);
  });

  it('should toggle a task and debounce save to localStorage', () => {
    const { result } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    act(() => {
      result.current.toggleTask('1');
    });

    expect(result.current.tasks[0].isCompleted).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(JSON.parse(localStorage.getItem('tasks')!)[0].isCompleted).toBe(true);
  });

  it('should update a task and debounce save to localStorage', () => {
    const { result } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    const updatedTask: Task = { ...newTask, title: 'Updated Task' };

    act(() => {
      result.current.updateTask(updatedTask);
    });

    expect(result.current.tasks[0].title).toBe('Updated Task');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(JSON.parse(localStorage.getItem('tasks')!)[0].title).toBe('Updated Task');
  });

  it('should save immediately on unmount', () => {
    const { result, unmount } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    expect(localStorage.getItem('tasks')).toBeNull();

    unmount();

    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual([newTask]);
  });

  it('should save immediately on visibilitychange to hidden', () => {
    const { result } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    expect(localStorage.getItem('tasks')).toBeNull();

    // Mock document.visibilityState
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    });

    // Dispatch visibilitychange event
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual([newTask]);
  });
});