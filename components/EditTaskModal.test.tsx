import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditTaskModal } from './EditTaskModal';
import { Task } from '../types';

const baseTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test description',
  radius: 200,
  isCompleted: false,
  createdAt: 1000,
};

const taskWithLocation: Task = {
  ...baseTask,
  location: { lat: 40.7128, lng: -74.006, address: 'New York' },
};

describe('EditTaskModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <EditTaskModal task={baseTask} isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when task is null', () => {
    const { container } = render(
      <EditTaskModal task={null} isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render the modal title "Editar Tarea" when open', () => {
    render(<EditTaskModal task={baseTask} isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText('Editar Tarea')).toBeTruthy();
  });

  it('should render the task title in the input', () => {
    const { container } = render(
      <EditTaskModal task={baseTask} isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    const titleInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(titleInput).not.toBeNull();
    expect(titleInput.value).toBe('Test Task');
  });

  it('should render the task description in the textarea', () => {
    const { container } = render(
      <EditTaskModal task={baseTask} isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    const descTextarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(descTextarea).not.toBeNull();
    expect(descTextarea.value).toBe('Test description');
  });

  it('should NOT render radius slider when task has no location', () => {
    render(<EditTaskModal task={baseTask} isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText(/Radio de alerta/i)).toBeNull();
  });

  it('should render radius slider when task has a location', () => {
    render(
      <EditTaskModal task={taskWithLocation} isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByText(/Radio de alerta/i)).toBeTruthy();
    expect(screen.getByRole('slider')).toBeTruthy();
  });

  it('should call onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<EditTaskModal task={baseTask} isOpen={true} onClose={onClose} onSave={vi.fn()} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button is clicked', () => {
    const onClose = vi.fn();
    render(<EditTaskModal task={baseTask} isOpen={true} onClose={onClose} onSave={vi.fn()} />);
    // The X button is in the header area, find it by its SVG icon presence
    const closeButtons = screen.getAllByRole('button');
    // First button is X close, then Cancel, then Guardar
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSave with updated title when form is submitted', () => {
    const onSave = vi.fn();
    const { container } = render(
      <EditTaskModal task={baseTask} isOpen={true} onClose={vi.fn()} onSave={onSave} />
    );

    const titleInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    fireEvent.click(screen.getByText('Guardar'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated Title' })
    );
  });

  it('should call onSave with updated description when form is submitted', () => {
    const onSave = vi.fn();
    const { container } = render(
      <EditTaskModal task={baseTask} isOpen={true} onClose={vi.fn()} onSave={onSave} />
    );

    const descTextarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(descTextarea, { target: { value: 'New description' } });

    fireEvent.click(screen.getByText('Guardar'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'New description' })
    );
  });

  it('should call onSave with updated radius when slider is changed', () => {
    const onSave = vi.fn();
    render(
      <EditTaskModal task={taskWithLocation} isOpen={true} onClose={vi.fn()} onSave={onSave} />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '500' } });

    fireEvent.click(screen.getByText('Guardar'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ radius: 500 })
    );
  });

  it('should preserve task id and other fields when saving', () => {
    const onSave = vi.fn();
    render(<EditTaskModal task={baseTask} isOpen={true} onClose={vi.fn()} onSave={onSave} />);

    fireEvent.click(screen.getByText('Guardar'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'task-1',
        isCompleted: false,
        createdAt: 1000,
      })
    );
  });
});
