import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SmartTaskInput } from './SmartTaskInput';

describe('SmartTaskInput', () => {
  it('should render the input area correctly', () => {
    render(
      <SmartTaskInput
        newTaskInput=""
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={() => {}}
      />
    );

    expect(screen.getByPlaceholderText('Ej: Comprar leche en Walmart...')).toBeTruthy();
    expect(screen.getByRole('button', { name: /agregar/i })).toBeTruthy();
  });

  it('should call setNewTaskInput when typing', () => {
    const setNewTaskInput = vi.fn();
    render(
      <SmartTaskInput
        newTaskInput=""
        setNewTaskInput={setNewTaskInput}
        isProcessing={false}
        handleSmartAdd={() => {}}
      />
    );

    const input = screen.getByPlaceholderText('Ej: Comprar leche en Walmart...');
    fireEvent.change(input, { target: { value: 'Comprar pan' } });

    expect(setNewTaskInput).toHaveBeenCalledWith('Comprar pan');
  });

  it('should call handleSmartAdd when Agregar button is clicked', () => {
    const handleSmartAdd = vi.fn();
    render(
      <SmartTaskInput
        newTaskInput="Comprar pan"
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={handleSmartAdd}
      />
    );

    const button = screen.getByRole('button', { name: /agregar/i });
    fireEvent.click(button);

    expect(handleSmartAdd).toHaveBeenCalledTimes(1);
  });

  it('should call handleSmartAdd when Enter key is pressed', () => {
    const handleSmartAdd = vi.fn();
    render(
      <SmartTaskInput
        newTaskInput="Comprar pan"
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={handleSmartAdd}
      />
    );

    const input = screen.getByPlaceholderText('Ej: Comprar leche en Walmart...');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSmartAdd).toHaveBeenCalledTimes(1);
  });

  it('should disable button when input is empty', () => {
    render(
      <SmartTaskInput
        newTaskInput="   "
        setNewTaskInput={() => {}}
        isProcessing={false}
        handleSmartAdd={() => {}}
      />
    );

    const button = screen.getByRole('button', { name: /agregar/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should disable button and show loader when processing', () => {
    render(
      <SmartTaskInput
        newTaskInput="Comprar pan"
        setNewTaskInput={() => {}}
        isProcessing={true}
        handleSmartAdd={() => {}}
      />
    );

    const button = screen.getByRole('button', { name: /agregar/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    // Loader2 icon adds 'animate-spin' class
    expect(button.querySelector('.animate-spin')).toBeTruthy();
  });
});
