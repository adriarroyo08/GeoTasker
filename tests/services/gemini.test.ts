import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseTaskWithGemini } from '../../services/gemini';

vi.mock('@google/genai', () => {
  const generateContent = vi.fn().mockResolvedValue({
    text: JSON.stringify({
      title: "Comprar leche",
      description: "Ir al super",
      hasLocation: true,
      suggestedLocationName: "supermercado",
      dueDate: "2024-05-02T00:00:00.000Z"
    })
  });

  return {
    GoogleGenAI: class {
      models = { generateContent };
      constructor(config: any) {}
    },
    Type: { OBJECT: 'object', STRING: 'string', BOOLEAN: 'boolean' }
  };
});

describe('parseTaskWithGemini prompt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('parses input correctly and extracts date relative to system time', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const aiInstance = new GoogleGenAI({ apiKey: 'test' });
    const mockGenerateContent = aiInstance.models.generateContent as any;

    const result = await parseTaskWithGemini("Comprar leche mañana en el supermercado");

    expect(result).toEqual({
      title: "Comprar leche",
      description: "Ir al super",
      hasLocation: true,
      suggestedLocationName: "supermercado",
      dueDate: "2024-05-02T00:00:00.000Z"
    });

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: expect.stringContaining('2024-05-01T12:00:00.000Z')
      })
    );
  });
});
