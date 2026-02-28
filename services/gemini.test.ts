import { describe, it, expect, vi, beforeEach } from 'vitest';

// We must define process.env.API_KEY before importing gemini.ts
// so it doesn't default to 'dummy_key'
vi.stubEnv('API_KEY', 'test_key');

import { parseTaskWithGemini } from './gemini';

// Mock the GoogleGenAI constructor
const mockGenerateContent = vi.fn();
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
      };
    }
  };
});

describe('gemini service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sanitize input to prevent escaping quotes and newlines in prompt', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        title: 'Safe Title',
        description: 'Safe Description',
        hasLocation: false
      })
    });

    const maliciousInput = 'Buy "milk" and \\cheese\\';
    await parseTaskWithGemini(maliciousInput);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);

    // Get the first argument passed to generateContent
    const generateContentArg = mockGenerateContent.mock.calls[0][0];
    const contents = generateContentArg.contents;

    // The sanitized string should be 'Buy \\"milk\\" and \\\\cheese\\\\'
    expect(contents).toContain('Buy \\"milk\\" and \\\\cheese\\\\');
  });
});
