import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SmartTaskInput } from './SmartTaskInput';
import React from 'react';

describe('SmartTaskInput', () => {
  it('renders correctly', () => {
    render(
      <SmartTaskInput
        newTaskInput=""
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={() => {}}
      />
    );
    expect(screen.getByPlaceholderText('Ej: Comprar leche en Walmart...')).toBeTruthy();
    expect(screen.getByText('Agregar')).toBeTruthy();
  });

  it('calls setNewTaskInput on change', () => {
    const setNewTaskInput = vi.fn();
    render(
      <SmartTaskInput
        newTaskInput=""
        setNewTaskInput={setNewTaskInput}
        isProcessing={false}
        handleSmartAdd={() => {}}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Ej: Comprar leche en Walmart...'), {
      target: { value: 'Nueva tarea' }
    });
    expect(setNewTaskInput).toHaveBeenCalledWith('Nueva tarea');
  });

  it('disables add button when processing or input is empty', () => {
    const { rerender } = render(
      <SmartTaskInput
        newTaskInput=""
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={() => {}}
      />
    );
    const button = screen.getByRole('button', { name: /agregar/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);

    rerender(
      <SmartTaskInput
        newTaskInput="Tarea"
        setNewTaskInput={() => {}}
        isProcessing={true}
        handleSmartAdd={() => {}}
      />
    );
    expect((button as HTMLButtonElement).disabled).toBe(true);

    rerender(
      <SmartTaskInput
        newTaskInput="Tarea"
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={() => {}}
      />
    );
    expect((button as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls handleSmartAdd on enter key', () => {
    const handleSmartAdd = vi.fn();
    render(
      <SmartTaskInput
        newTaskInput="Tarea"
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={handleSmartAdd}
      />
    );
    fireEvent.keyDown(screen.getByPlaceholderText('Ej: Comprar leche en Walmart...'), {
      key: 'Enter',
      code: 'Enter'
    });
    expect(handleSmartAdd).toHaveBeenCalled();
  });
});
