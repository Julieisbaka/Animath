import { describe, expect, it } from 'vitest';
import { Axes2D, Circle, plotFunction, Polyline, vectorField, Vector2 } from '../src';

describe('regression: validation and scene safety', () => {
  it('rejects invalid axes, samples, and vector-field spacing', () => {
    expect(() => new Axes2D({ xRange: [1, 1] })).toThrow(RangeError);
    expect(() => plotFunction(new Axes2D(), Math.sin, { samples: 0 })).toThrow(RangeError);
    expect(() => vectorField(new Axes2D(), () => Vector2.zero, 0)).toThrow(RangeError);
  });

  it('does not duplicate children or allow self-parenting', () => {
    const parent = new Circle();
    const child = new Circle();
    parent.add(child).add(child);
    expect(parent.children).toHaveLength(1);
    expect(() => parent.add(parent)).toThrow();
  });

  it('computes bounds for dense polylines without overflowing the call stack', () => {
    const points = Array.from({ length: 100_000 }, (_, index) => new Vector2(index, -index));
    const bounds = new Polyline(points).getBounds();
    expect(bounds.min.x).toBe(0);
    expect(bounds.max.x).toBe(99_999);
    expect(bounds.min.y).toBe(-99_999);
    expect(bounds.max.y).toBeCloseTo(0);
  });
});
