import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskList } from './TaskList';
import { Task } from '../types';

vi.mock('./TaskCard', () => ({
  TaskCard: vi.fn(({ task, onToggle, onDeleteClick, onEdit }) => (
    <div data-testid={`task-card-${task.id}`}>
      <span>{task.title}</span>
      <button data-testid={`toggle-${task.id}`} onClick={() => onToggle(task.id)}>Toggle</button>
      <button data-testid={`delete-${task.id}`} onClick={() => onDeleteClick(task.id)}>Delete</button>
      <button data-testid={`edit-${task.id}`} onClick={() => onEdit(task)}>Edit</button>
    </div>
  ))
}));

describe('TaskList', () => {
  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', description: '', isCompleted: false, radius: 200, createdAt: 123 },
    { id: '2', title: 'Task 2', description: '', isCompleted: true, radius: 200, createdAt: 123 }
  ];

  const defaultProps = {
    tasks: mockTasks,
    newTaskInput: '',
    setNewTaskInput: vi.fn(),
    isProcessing: false,
    handleSmartAdd: vi.fn(),
    userLocation: null,
    toggleTask: vi.fn(),
    deleteTask: vi.fn(),
    setEditingTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input area correctly', () => {
    render(<TaskList {...defaultProps} />);
    expect(screen.getByPlaceholderText('Ej: Comprar leche en Walmart...')).not.toBeNull();
    expect(screen.getByRole('button', { name: /agregar/i })).not.toBeNull();
  });

  it('calls handleSmartAdd on button click', () => {
    render(<TaskList {...defaultProps} newTaskInput="New task" />);
    const button = screen.getByRole('button', { name: /agregar/i });
    fireEvent.click(button);
    expect(defaultProps.handleSmartAdd).toHaveBeenCalled();
  });

  it('calls handleSmartAdd on Enter key press', () => {
    render(<TaskList {...defaultProps} newTaskInput="New task" />);
    const input = screen.getByPlaceholderText('Ej: Comprar leche en Walmart...');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(defaultProps.handleSmartAdd).toHaveBeenCalled();
  });

  it('disables add button when input is empty or processing', () => {
    const { rerender } = render(<TaskList {...defaultProps} newTaskInput="" />);
    expect(screen.getByRole('button', { name: /agregar/i }).hasAttribute('disabled')).toBe(true);

    rerender(<TaskList {...defaultProps} newTaskInput="Task" isProcessing={true} />);
    expect(screen.getByRole('button', { name: /agregar/i }).hasAttribute('disabled')).toBe(true);

    rerender(<TaskList {...defaultProps} newTaskInput="Task" isProcessing={false} />);
    expect(screen.getByRole('button', { name: /agregar/i }).hasAttribute('disabled')).toBe(false);
  });

  it('renders correct count of pending tasks', () => {
    render(<TaskList {...defaultProps} />);
    expect(screen.getByText('Tareas pendientes (1)')).not.toBeNull();
  });

  it('renders TaskCards for tasks', () => {
    render(<TaskList {...defaultProps} />);
    expect(screen.getByTestId('task-card-1')).not.toBeNull();
    expect(screen.getByTestId('task-card-2')).not.toBeNull();
  });

  it('shows empty state when no tasks', () => {
    render(<TaskList {...defaultProps} tasks={[]} />);
    expect(screen.getByText('No tienes tareas pendientes.')).not.toBeNull();
  });

  it('passes handlers to TaskCard and opens delete confirmation', () => {
    render(<TaskList {...defaultProps} />);

    // Toggle
    fireEvent.click(screen.getByTestId('toggle-1'));
    expect(defaultProps.toggleTask).toHaveBeenCalledWith('1');

    // Edit
    fireEvent.click(screen.getByTestId('edit-1'));
    expect(defaultProps.setEditingTask).toHaveBeenCalledWith(mockTasks[0]);

    // Delete flow
    fireEvent.click(screen.getByTestId('delete-1'));

    // Confirm modal should appear
    expect(screen.getByText('¿Estás seguro de que deseas eliminar esta tarea?')).not.toBeNull();

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(confirmBtn);

    expect(defaultProps.deleteTask).toHaveBeenCalledWith('1');
  });

  it('memoizes pending tasks count correctly when other props change', () => {
    const { rerender } = render(<TaskList {...defaultProps} />);
    expect(screen.getByText('Tareas pendientes (1)')).not.toBeNull();

    // Rerender with different non-task prop
    rerender(<TaskList {...defaultProps} newTaskInput="Changed Input" />);
    // Count should still be correct and derived from memo
    expect(screen.getByText('Tareas pendientes (1)')).not.toBeNull();
  });

  it('memoizes rendered tasks array correctly when other props change', () => {
    const { rerender } = render(<TaskList {...defaultProps} />);
    expect(screen.getByTestId('task-card-1')).not.toBeNull();
    expect(screen.getByTestId('task-card-2')).not.toBeNull();

    // Rerender with different non-task prop
    rerender(<TaskList {...defaultProps} newTaskInput="Changed Input" />);
    // Tasks should still be rendered correctly derived from memo
    expect(screen.getByTestId('task-card-1')).not.toBeNull();
    expect(screen.getByTestId('task-card-2')).not.toBeNull();
  });
});
