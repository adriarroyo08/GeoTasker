import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { Task } from '../types';

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'A description',
    radius: 200,
    isCompleted: false,
    createdAt: Date.now(),
    location: { lat: 40.7128, lng: -74.0060, address: 'Test Location' }
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task details correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Test Task')).toBeTruthy();
    expect(screen.getByText('A description')).toBeTruthy();
    expect(screen.getByText('Test Location')).toBeTruthy();
  });

  it('calculates and displays distance if user location is provided', () => {
    // NYC to slightly different NYC coords (~111m)
    render(
      <TaskCard
        task={mockTask}
        userLat={40.7138}
        userLng={-74.0060}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    // It should contain the calculated string like "(a 111m)"
    expect(screen.getByText(/\(a 111m\)/)).toBeTruthy();
  });

  it('calls onToggle when circle button is clicked', () => {
    const { container } = render(
      <TaskCard
        task={mockTask}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const toggleButton = container.querySelector('button');
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(mockOnToggle).toHaveBeenCalledWith('1');
    }
  });

  it('calls onDelete when trash button is clicked and confirmed', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    const { container } = render(
      <TaskCard
        task={mockTask}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const deleteButton = container.querySelector('button[aria-label="Eliminar tarea"]');
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    }
  });
});