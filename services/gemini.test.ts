import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseTaskWithGemini } from './gemini';

const MOCK_DATE = new Date('2023-10-15T12:00:00Z');

// Mock environment variable used by Vite
vi.stubEnv('VITE_GEMINI_API_KEY', 'test_key');

// Mock @google/genai module
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: (...args: any[]) => mockGenerateContent(...args)
      };
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      BOOLEAN: 'BOOLEAN'
    }
  };
});

describe('parseTaskWithGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully parse a valid input with location', async () => {
    const mockResponse = {
      text: JSON.stringify({
        title: "Comprar leche",
        description: "En el supermercado de la esquina",
        hasLocation: true,
        suggestedLocationName: "supermercado de la esquina"
      })
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const input = "Comprar leche en el supermercado de la esquina";
    const result = await parseTaskWithGemini(input);

    expect(result).toEqual({
      title: "Comprar leche",
      description: "En el supermercado de la esquina",
      hasLocation: true,
      suggestedLocationName: "supermercado de la esquina"
    });

    // Check that sanitization doesn't modify a normal string
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.0-flash',
        contents: expect.stringContaining(input)
      })
    );
    // Check that the current date is passed to the prompt
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: expect.stringContaining(MOCK_DATE.toISOString())
      })
    );
  });

  it('should successfully parse a valid input with location and relative dueDate', async () => {
    const input = 'Recordarme comprar pan mañana en la panadería';
    const expectedOutput = {
      title: 'Comprar pan',
      description: 'Recordatorio',
      hasLocation: true,
      suggestedLocationName: 'panadería',
      dueDate: '2023-10-16T12:00:00.000Z'
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(expectedOutput)
    });

    const result = await parseTaskWithGemini(input);

    expect(result).toEqual(expectedOutput);
  });

  it('should sanitize input containing quotes and backslashes', async () => {
    const mockResponse = {
      text: JSON.stringify({
        title: "Test Task",
        description: "Test Desc",
        hasLocation: false
      })
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const rawInput = 'Task with "quotes" and \\backslashes\\';
    const expectedSanitized = 'Task with \\"quotes\\" and \\\\backslashes\\\\';

    await parseTaskWithGemini(rawInput);

    // Assert that the API was called with the sanitized string
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.0-flash',
        contents: expect.stringContaining(expectedSanitized)
      })
    );
  });

  it('should fallback properly on API error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API failed'));

    const input = "Hacer ejercicio";
    const result = await parseTaskWithGemini(input);

    expect(result).toEqual({
      title: input,
      description: "Generado automáticamente",
      hasLocation: false
    });
  });

  it('should fallback when API returns empty response text', async () => {
    mockGenerateContent.mockResolvedValue({ text: null });

    const input = "Tarea sin respuesta";
    const result = await parseTaskWithGemini(input);

    expect(result).toEqual({
      title: input,
      description: "Generado automáticamente",
      hasLocation: false
    });
  });

  it('should fallback when API returns undefined response text', async () => {
    mockGenerateContent.mockResolvedValue({});

    const input = "Tarea respuesta indefinida";
    const result = await parseTaskWithGemini(input);

    expect(result).toEqual({
      title: input,
      description: "Generado automáticamente",
      hasLocation: false
    });
  });
});
