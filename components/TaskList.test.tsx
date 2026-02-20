import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from './TaskList';
import { Task } from '../types';

// Mock TaskCard
vi.mock('./TaskCard', () => ({
  TaskCard: ({ task }: { task: any }) => <div data-testid="task-card">{task.title}</div>
}));

describe('TaskList', () => {
  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', description: '', radius: 100, isCompleted: false, createdAt: Date.now() },
    { id: '2', title: 'Task 2', description: '', radius: 100, isCompleted: true, createdAt: Date.now() }
  ];

  it('renders input and tasks', () => {
    render(
      <TaskList
        tasks={mockTasks}
        newTaskInput=""
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={() => {}}
        userLocation={null}
        onToggle={() => {}}
        onDelete={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByPlaceholderText(/Ej: Comprar/)).toBeTruthy();
    expect(screen.getByText('Mis Tareas (1)')).toBeTruthy();
    expect(screen.getAllByTestId('task-card')).toHaveLength(2);
  });

  it('handles empty state', () => {
    render(
      <TaskList
        tasks={[]}
        newTaskInput=""
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={() => {}}
        userLocation={null}
        onToggle={() => {}}
        onDelete={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText('No tienes tareas pendientes.')).toBeTruthy();
  });

  it('handles input change and submit', () => {
    const setInput = vi.fn();
    const handleAdd = vi.fn();

    render(
      <TaskList
        tasks={[]}
        newTaskInput="New Task"
        setNewTaskInput={setInput}
        isProcessing={false}
        handleSmartAdd={handleAdd}
        userLocation={null}
        onToggle={() => {}}
        onDelete={() => {}}
        onEdit={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/Ej: Comprar/);
    fireEvent.change(input, { target: { value: 'Something' } });
    expect(setInput).toHaveBeenCalledWith('Something');

    const button = screen.getByText('Agregar');
    fireEvent.click(button);
    expect(handleAdd).toHaveBeenCalled();
  });
});
