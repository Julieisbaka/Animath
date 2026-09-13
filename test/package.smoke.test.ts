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
});
