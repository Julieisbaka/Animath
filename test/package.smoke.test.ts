import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as animath from '../src';
import * as reactAdapter from '../src/react';

describe('smoke: public entrypoints', () => {
  it('loads the core and React adapter entrypoints', () => {
    expect(animath.Timeline).toBeDefined();
    expect(animath.Axes2D).toBeDefined();
    expect(reactAdapter.AnimathCanvas).toBeDefined();
    expect(reactAdapter.useTimeline).toBeDefined();
  });

  it('declares professional package metadata', () => {
    const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as Record<string, unknown>;
    expect(typeof manifest.description).toBe('string');
    expect(manifest.license).toBe('MIT');
    expect(manifest.sideEffects).toBe(false);
    expect(manifest.exports).toHaveProperty('.');
    expect(manifest.exports).toHaveProperty('./react');
    expect(manifest.files).toContain('LICENSE');
  });
});
