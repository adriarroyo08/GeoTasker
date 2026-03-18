import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { beforeEach } from 'vitest';
import { TaskCard } from './TaskCard';
import { Task } from '../types';

describe('TaskCard', () => {
  const baseTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'This is a test description',
    isCompleted: false,
    radius: 200,
    createdAt: Date.now(),
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task details correctly without location', () => {
    render(<TaskCard task={baseTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByText('Test Task')).toBeTruthy();
    expect(screen.getByText('This is a test description')).toBeTruthy();
    // It should not render any location indicator
    expect(screen.queryByText(/Ubicación fijada/)).toBeNull();
  });

  it('renders task location when provided', () => {
    const taskWithLocation: Task = {
      ...baseTask,
      location: { lat: 40.4168, lng: -3.7038, address: 'Puerta del Sol' }
    };
    render(<TaskCard task={taskWithLocation} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByText('Puerta del Sol')).toBeTruthy();
    // Since user location is not passed, it should render radius
    expect(screen.getByText('(Radio: 200m)')).toBeTruthy();
  });

  it('calculates and shows distance when user location is provided', () => {
    const taskWithLocation: Task = {
      ...baseTask,
      location: { lat: 40.4168, lng: -3.7038, address: 'Puerta del Sol' }
    };
    // Let's provide a user location exactly identical to the task location so distance is 0m
    render(<TaskCard task={taskWithLocation} userLat={40.4168} userLng={-3.7038} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />);

    expect(screen.getByText('(a 0m)')).toBeTruthy();
    expect(screen.queryByText('(Radio: 200m)')).toBeNull();
  });

  it('calls onToggle when circle button is clicked', () => {
    // We can find the button by its enclosing elements, but let's query the role since it's a button
    const { container } = render(<TaskCard task={baseTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    const buttons = container.querySelectorAll('button');
    // First button is toggle
    fireEvent.click(buttons[0]);
    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<TaskCard task={baseTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    const editButton = screen.getByLabelText('Editar tarea');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(baseTask);
  });

  it('calls onDelete when delete button is clicked and user confirms', () => {
    render(<TaskCard task={baseTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    const deleteButton = screen.getByLabelText('Eliminar tarea');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByLabelText('Confirmar eliminación');
    fireEvent.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('does not call onDelete if user cancels confirm dialog', () => {
    render(<TaskCard task={baseTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    const deleteButton = screen.getByLabelText('Eliminar tarea');
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByLabelText('Cancelar eliminación');
    fireEvent.click(cancelButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Confirmar eliminación')).toBeNull();
  });

  it('renders completed task with line-through styling', () => {
    const completedTask: Task = { ...baseTask, isCompleted: true };
    const { container } = render(
      <TaskCard task={completedTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />
    );
    const title = container.querySelector('h3');
    expect(title?.className).toContain('line-through');
  });

  it('renders due date badge when dueDate is provided', () => {
    const taskWithDate: Task = { ...baseTask, dueDate: '2026-12-31T00:00:00.000Z' };
    render(<TaskCard task={taskWithDate} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    // Should render a date string (format depends on locale, but some date text should appear)
    // The calendar badge container exists
    const { container } = render(
      <TaskCard task={taskWithDate} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />
    );
    // Find the element containing a date-formatted text — it exists when dueDate is set
    const spans = container.querySelectorAll('span');
    const dateSpan = Array.from(spans).find(s => s.textContent && /\d{4}|\d{1,2}\/\d{1,2}/.test(s.textContent));
    expect(dateSpan).toBeTruthy();
  });

  it('does not render description when description is empty', () => {
    const taskNoDesc: Task = { ...baseTask, description: '' };
    const { container } = render(
      <TaskCard task={taskNoDesc} onToggle={mockOnToggle} onDelete={mockOnDelete} onEdit={mockOnEdit} />
    );
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });
});
