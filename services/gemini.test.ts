import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent
      };
    },
    Type: { OBJECT: 'OBJECT', STRING: 'STRING', BOOLEAN: 'BOOLEAN' }
  };
});

describe('gemini service', () => {
  beforeEach(() => {
    vi.resetModules();
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should sanitize input correctly', async () => {
    const { sanitizeInput } = await import('./gemini');
    const dangerousInput = 'Hello "world" \\ injection';
    const safeInput = sanitizeInput(dangerousInput);
    expect(safeInput).toBe('Hello \\"world\\" \\\\ injection');
  });
});
