import { describe, expect, it } from 'vitest';
import { Vector2 } from '../src';

describe('Vector2', () => {
  it('supports vector arithmetic and interpolation', () => {
    const a = new Vector2(1, 2);
    const b = new Vector2(5, 6);
    expect(a.add(b).toArray()).toEqual([6, 8]);
    expect(a.sub(b).toArray()).toEqual([-4, -4]);
    expect(a.lerp(b, 0.5).toArray()).toEqual([3, 4]);
  });

  it('normalizes non-zero vectors and safely handles zero', () => {
    expect(new Vector2(3, 4).normalized().length()).toBeCloseTo(1);
    expect(Vector2.zero.normalized()).toBe(Vector2.zero);
  });
});
