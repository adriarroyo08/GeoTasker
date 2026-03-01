import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    }),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      BOOLEAN: 'BOOLEAN',
    }
  };
});

describe('gemini service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should sanitize input and call generateContent successfully', async () => {
    // Override API key before importing the module
    process.env.API_KEY = 'real-api-key';

    // Dynamic import to re-evaluate the module with the new process.env
    const { parseTaskWithGemini } = await import('./gemini');

    // Setup successful mock response
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        title: 'Comprar "pan"',
        description: 'En la panadería',
        hasLocation: true,
        suggestedLocationName: 'panadería'
      })
    });

    const maliciousInput = 'Comprar "pan" \\ y "leche"';
    const result = await parseTaskWithGemini(maliciousInput);

    expect(result).toEqual({
      title: 'Comprar "pan"',
      description: 'En la panadería',
      hasLocation: true,
      suggestedLocationName: 'panadería'
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);

    // Verify that the argument passed to generateContent was sanitized properly
    const callArgs = mockGenerateContent.mock.calls[0][0];
    const contents = callArgs.contents;

    // Original input: Comprar "pan" \ y "leche"
    // Sanitized: Comprar \"pan\" \\ y \"leche\"
    expect(contents).toContain('Comprar \\"pan\\" \\\\ y \\"leche\\"');
  });

  it('should fallback if API key is not present (or dummy_key)', async () => {
    // Override API key to dummy_key before importing the module
    process.env.API_KEY = 'dummy_key';

    // Dynamic import to re-evaluate the module with the new process.env
    const { parseTaskWithGemini } = await import('./gemini');

    const result = await parseTaskWithGemini('Comprar pan');

    expect(result).toEqual({
      title: 'Comprar pan',
      description: 'Generado automáticamente (Fallback)',
      hasLocation: false
    });

    // Generate content shouldn't be called if the dummy_key throws immediately
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should fallback if generateContent fails', async () => {
    // Override API key before importing the module
    process.env.API_KEY = 'real-api-key';

    // Dynamic import to re-evaluate the module with the new process.env
    const { parseTaskWithGemini } = await import('./gemini');

    // Setup failed mock response
    mockGenerateContent.mockRejectedValue(new Error('API Error'));

    const result = await parseTaskWithGemini('Comprar pan');

    expect(result).toEqual({
      title: 'Comprar pan',
      description: 'Generado automáticamente (Fallback)',
      hasLocation: false
    });
    expect(mockGenerateContent).toHaveBeenCalled();
  });
});
