import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const docs = ['index.html', 'getting-started.html', 'calculus.html', 'react.html', 'api.html'];

describe('acceptance: documentation site', () => {
  it('contains all linked documentation pages', () => {
    for (const page of docs) expect(existsSync(resolve('docs', page))).toBe(true);
  });

  it('links the React and calculus experiences', () => {
    const index = readFileSync(resolve('docs/index.html'), 'utf8');
    expect(index).toContain('./react.html');
    expect(index).toContain('./calculus.html');
  });
});
