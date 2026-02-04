import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('should add a task', () => {
    const { result } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toEqual(newTask);
    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual([newTask]);
  });

  it('should delete a task', () => {
    const { result } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    act(() => {
      result.current.deleteTask('1');
    });

    expect(result.current.tasks).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual([]);
  });

  it('should toggle a task', () => {
    const { result } = renderHook(() => useTaskManager());
    const newTask: Task = { id: '1', title: 'New Task', description: '', radius: 100, isCompleted: false, createdAt: 123 };

    act(() => {
      result.current.addTask(newTask);
    });

    act(() => {
      result.current.toggleTask('1');
    });

    expect(result.current.tasks[0].isCompleted).toBe(true);
    expect(JSON.parse(localStorage.getItem('tasks')!)[0].isCompleted).toBe(true);
  });

  it('should update a task', () => {
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
    expect(JSON.parse(localStorage.getItem('tasks')!)[0].title).toBe('Updated Task');
  });
});
