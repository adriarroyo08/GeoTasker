import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSmartTask } from './useSmartTask';
import { AppView } from '../types';
import * as geminiService from '../services/gemini';

// Mock gemini service
vi.mock('../services/gemini', () => ({
  parseTaskWithGemini: vi.fn(),
}));

describe('useSmartTask', () => {
  const mockAddTask = vi.fn();
  const mockSetView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSmartTask({ addTask: mockAddTask, setView: mockSetView }));

    expect(result.current.newTaskInput).toBe('');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.pendingTask).toBeNull();
    expect(result.current.isSelectingLocation).toBe(false);
  });

  it('should handle smart add without location', async () => {
    const mockParsed = {
      title: 'Buy Milk',
      description: 'At the store',
      hasLocation: false,
      suggestedLocationName: undefined
    };
    vi.spyOn(geminiService, 'parseTaskWithGemini').mockResolvedValue(mockParsed);

    const { result } = renderHook(() => useSmartTask({ addTask: mockAddTask, setView: mockSetView }));

    act(() => {
      result.current.setNewTaskInput('Buy Milk');
    });

    await act(async () => {
      await result.current.handleSmartAdd();
    });

    expect(geminiService.parseTaskWithGemini).toHaveBeenCalledWith('Buy Milk');
    expect(mockAddTask).toHaveBeenCalled();
    expect(mockAddTask.mock.calls[0][0]).toMatchObject({
      title: 'Buy Milk',
      description: 'At the store',
      isCompleted: false
    });
    expect(mockSetView).toHaveBeenCalledWith(AppView.LIST);
    expect(result.current.newTaskInput).toBe('');
  });

  it('should handle smart add with location', async () => {
    const mockParsed = {
      title: 'Go to Park',
      description: 'Have fun',
      hasLocation: true,
      suggestedLocationName: 'Central Park'
    };
    vi.spyOn(geminiService, 'parseTaskWithGemini').mockResolvedValue(mockParsed);
    // Mock alert to prevent jsdom error or annoyance
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useSmartTask({ addTask: mockAddTask, setView: mockSetView }));

    act(() => {
      result.current.setNewTaskInput('Go to Park');
    });

    await act(async () => {
      await result.current.handleSmartAdd();
    });

    expect(result.current.pendingTask).toMatchObject({
      title: 'Go to Park',
      description: 'Have fun'
    });
    expect(result.current.isSelectingLocation).toBe(true);
    expect(mockSetView).toHaveBeenCalledWith(AppView.MAP);
    // addTask should not be called yet
    expect(mockAddTask).not.toHaveBeenCalled();
  });

  it('should confirm location', async () => {
    const mockParsed = {
      title: 'Go to Park',
      description: 'Have fun',
      hasLocation: true,
      suggestedLocationName: 'Central Park'
    };
    vi.spyOn(geminiService, 'parseTaskWithGemini').mockResolvedValue(mockParsed);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useSmartTask({ addTask: mockAddTask, setView: mockSetView }));

    // Setup pending task
    act(() => {
      result.current.setNewTaskInput('Go to Park');
    });
    await act(async () => {
      await result.current.handleSmartAdd();
    });

    // Select location
    act(() => {
      result.current.handleMapClick(10, 20);
    });

    expect(result.current.tempLocation).toEqual({ lat: 10, lng: 20, address: 'Punto seleccionado' });

    // Confirm
    act(() => {
      result.current.confirmLocation();
    });

    expect(mockAddTask).toHaveBeenCalled();
    expect(mockAddTask.mock.calls[0][0].location).toEqual({ lat: 10, lng: 20, address: 'Punto seleccionado' });
    expect(result.current.isSelectingLocation).toBe(false);
    expect(mockSetView).toHaveBeenCalledWith(AppView.LIST);
  });
});
