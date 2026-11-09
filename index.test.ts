import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

describe('index.html', () => {
  const html = readFileSync('index.html', 'utf-8');

  it('permite ampliar la página (viewport sin maximum-scale ni user-scalable=no)', () => {
    const viewport = html.match(/<meta name="viewport" content="([^"]*)"/)?.[1] ?? '';
    expect(viewport).toBeTruthy();
    expect(viewport.includes('maximum-scale')).toBe(false);
    expect(viewport.includes('user-scalable')).toBe(false);
  });
});
