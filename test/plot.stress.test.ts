import { describe, expect, it } from 'vitest';
import { Axes2D, plotFunction, Vector2, vectorField } from '../src';

describe('stress: dense plotting', () => {
  it('handles a high-resolution function plot', () => {
    const axes = new Axes2D({ xRange: [-10, 10], yRange: [-10, 10] });
    const plot = plotFunction(axes, (x) => Math.sin(x) * Math.cos(x * 3), { samples: 10_000 });
    expect(plot.points).toHaveLength(10_001);
  });

  it('handles a dense vector field without losing samples', () => {
    const axes = new Axes2D({ xRange: [-10, 10], yRange: [-10, 10] });
    const field = vectorField(axes, () => new Vector2(0.1, 0.1), 0.5);
    expect(field.children.length).toBeGreaterThan(1_500);
  });
});
