import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from './TaskList';
import { Task } from '../types';

const defaultProps = {
  tasks: [] as Task[],
  newTaskInput: '',
  setNewTaskInput: vi.fn(),
  isProcessing: false,
  handleSmartAdd: vi.fn(),
  userLocation: null,
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
  setEditingTask: vi.fn(),
};

const sampleTask: Task = {
  id: '1',
  title: 'Buy groceries',
  description: 'Milk and eggs',
  radius: 200,
  isCompleted: false,
  createdAt: Date.now(),
};

const completedTask: Task = {
  id: '2',
  title: 'Done task',
  description: '',
  radius: 100,
  isCompleted: true,
  createdAt: Date.now(),
};

describe('TaskList', () => {
  it('should render the task input area', () => {
    render(<TaskList {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Comprar leche/)).toBeTruthy();
  });

  it('should render empty state when no tasks', () => {
    render(<TaskList {...defaultProps} tasks={[]} />);
    expect(screen.getByText('No tienes tareas pendientes.')).toBeTruthy();
    expect(screen.getByText('¡Agrega una arriba!')).toBeTruthy();
  });

  it('should show task count (only pending)', () => {
    render(<TaskList {...defaultProps} tasks={[sampleTask, completedTask]} />);
    // 1 pending task (completedTask is excluded from count)
    expect(screen.getByText('Tareas Pendientes (1)')).toBeTruthy();
  });

  it('should show task count of 0 when all tasks are completed', () => {
    render(<TaskList {...defaultProps} tasks={[completedTask]} />);
    expect(screen.getByText('Tareas Pendientes (0)')).toBeTruthy();
  });

  it('should render task titles when tasks exist', () => {
    render(<TaskList {...defaultProps} tasks={[sampleTask]} />);
    expect(screen.getByText('Buy groceries')).toBeTruthy();
  });

  it('should call setNewTaskInput when input changes', () => {
    const setNewTaskInput = vi.fn();
    render(<TaskList {...defaultProps} setNewTaskInput={setNewTaskInput} />);
    const input = screen.getByPlaceholderText(/Comprar leche/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New task' } });
    expect(setNewTaskInput).toHaveBeenCalledWith('New task');
  });

  it('should call handleSmartAdd when Enter is pressed in input', () => {
    const handleSmartAdd = vi.fn();
    render(<TaskList {...defaultProps} newTaskInput="Test task" handleSmartAdd={handleSmartAdd} />);
    const input = screen.getByPlaceholderText(/Comprar leche/);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleSmartAdd).toHaveBeenCalledTimes(1);
  });

  it('should NOT call handleSmartAdd when other keys are pressed', () => {
    const handleSmartAdd = vi.fn();
    render(<TaskList {...defaultProps} newTaskInput="Test task" handleSmartAdd={handleSmartAdd} />);
    const input = screen.getByPlaceholderText(/Comprar leche/);
    fireEvent.keyDown(input, { key: 'a' });
    expect(handleSmartAdd).not.toHaveBeenCalled();
  });

  it('should call handleSmartAdd when Agregar button is clicked', () => {
    const handleSmartAdd = vi.fn();
    render(<TaskList {...defaultProps} newTaskInput="Some task" handleSmartAdd={handleSmartAdd} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleSmartAdd).toHaveBeenCalledTimes(1);
  });

  it('should disable Agregar button when isProcessing is true', () => {
    render(<TaskList {...defaultProps} newTaskInput="task" isProcessing={true} />);
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should disable Agregar button when newTaskInput is empty', () => {
    render(<TaskList {...defaultProps} newTaskInput="" />);
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should disable Agregar button when newTaskInput is only whitespace', () => {
    render(<TaskList {...defaultProps} newTaskInput="   " />);
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should not render empty state when tasks are present', () => {
    render(<TaskList {...defaultProps} tasks={[sampleTask]} />);
    expect(screen.queryByText('No tienes tareas pendientes.')).toBeNull();
  });

  it('should render multiple tasks', () => {
    const task2: Task = { ...sampleTask, id: '2', title: 'Second task' };
    render(<TaskList {...defaultProps} tasks={[sampleTask, task2]} />);
    expect(screen.getByText('Buy groceries')).toBeTruthy();
    expect(screen.getByText('Second task')).toBeTruthy();
  });
});
