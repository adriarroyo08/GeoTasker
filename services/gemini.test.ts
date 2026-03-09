import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseTaskWithGemini } from './gemini';

// Mock environment variable used by Vite
vi.stubEnv('API_KEY', 'test_key');

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
        contents: expect.stringContaining(input)
      })
    );
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
      description: "Generado automáticamente (Fallback)",
      hasLocation: false
    });
  });
});
