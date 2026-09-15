import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const docs = ['index.md', 'getting-started.md', 'calculus.html', 'react.md', 'api.md'];
const examples = ['index.html', 'core.html', 'react.html', 'gallery.js'];

describe('acceptance: documentation site', () => {
  it('contains all linked documentation pages', () => {
    for (const page of docs) expect(existsSync(resolve('docs', page))).toBe(true);
    for (const example of examples) expect(existsSync(resolve('docs', 'examples', example))).toBe(true);
  });

  it('links the React and calculus experiences', () => {
    const index = readFileSync(resolve('docs/index.md'), 'utf8');
    expect(index).toContain('./examples/react.html');
    expect(index).toContain('./calculus.html');
  });

  it('publishes typed API documentation', () => {
    const api = readFileSync(resolve('docs/api.md'), 'utf8');
    expect(api).toContain('coordsToPoint(x: number, y: number): Vector2');
    expect(api).toContain('duration: number');
    expect(api).toContain('animath/react');
  });

  it('keeps interactive docs free of debug probes and marks code samples for highlighting', () => {
    const calculus = readFileSync(resolve('docs/calculus.html'), 'utf8');
    const playground = readFileSync(resolve('docs/playground.js'), 'utf8');
    const gettingStarted = readFileSync(resolve('docs/getting-started.md'), 'utf8');
    expect(calculus).toContain('class="language-typescript"');
    expect(calculus).toContain('./highlight.js');
    expect(playground).not.toContain('__pgRender');
    expect(gettingStarted).toContain('```bash');
  });

  it('does not retain deleted narrative HTML pages', () => {
    for (const page of ['index.html', 'getting-started.html', 'react.html', 'api.html']) {
      expect(existsSync(resolve('docs', page))).toBe(false);
    }
  });
});
