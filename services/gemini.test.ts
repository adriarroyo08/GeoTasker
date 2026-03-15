import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock import.meta.env
vi.stubEnv('VITE_GEMINI_API_KEY', 'test_api_key');

// Custom mock response to return from mockGenerateContent
let mockGenerateContentResponse: any;

// A mock function we can inspect
const mockGenerateContent = vi.fn().mockImplementation(async () => {
  if (mockGenerateContentResponse instanceof Error) {
    throw mockGenerateContentResponse;
  }
  return mockGenerateContentResponse;
});

// Mock @google/genai module as specified in memory
vi.mock('@google/genai', () => {
  return {
    Type: {
      OBJECT: 'object',
      STRING: 'string',
      BOOLEAN: 'boolean'
    },
    GoogleGenAI: class {
      models = {
        generateContent: (...args: any[]) => mockGenerateContent(...args)
      }
    }
  };
});

import { parseTaskWithGemini } from './gemini';

describe('parseTaskWithGemini', () => {
  beforeEach(() => {
    mockGenerateContent.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully parse a task with location', async () => {
    const mockJson = {
      title: 'Comprar pan',
      description: 'En la panadería del centro',
      hasLocation: true,
      suggestedLocationName: 'panadería del centro'
    };
    mockGenerateContentResponse = { text: JSON.stringify(mockJson) };

    const result = await parseTaskWithGemini('Comprar pan en la panadería del centro');

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.0-flash',
      })
    );
    expect(result).toEqual(mockJson);
  });

  it('should fallback when generateContent throws an error', async () => {
    mockGenerateContentResponse = new Error('API Error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await parseTaskWithGemini('Una tarea fallida');

    expect(result).toEqual({
      title: 'Una tarea fallida',
      description: 'Generado automáticamente (Fallback)',
      hasLocation: false
    });

    consoleErrorSpy.mockRestore();
  });
});
