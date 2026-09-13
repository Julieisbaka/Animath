import { describe, expect, it } from 'vitest';
import { Axes2D, plotFunction, plotParametric, plotPolar } from '../../src';

describe('function: plot generators', () => {
  const axes = new Axes2D({ xRange: [-2, 2], yRange: [-2, 2] });

  it('samples a function including both endpoints', () => {
    const plot = plotFunction(axes, (x) => x * x, { samples: 10 });
    expect(plot.points).toHaveLength(11);
    expect(axes.pointToCoords(plot.points[0]!).x).toBeCloseTo(-2);
    expect(axes.pointToCoords(plot.points.at(-1)!).x).toBeCloseTo(2);
  });

  it('generates parametric and polar curves', () => {
    expect(plotParametric(axes, Math.cos, Math.sin, [0, Math.PI], { samples: 12 }).points).toHaveLength(13);
    expect(plotPolar(axes, () => 1, [0, Math.PI * 2], { samples: 16 }).points).toHaveLength(17);
  });
});
