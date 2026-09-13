import { describe, expect, it } from 'vitest';
import { AreaUnderCurve, Axes2D, plotFunction, plotParametric, plotPolar, riemannRectangles, TangentLine, Vector2, vectorField } from '../src';

describe('calculus primitives', () => {
  const axes = new Axes2D({ xRange: [-2, 2], yRange: [-2, 2], width: 400, height: 400 });

  it('maps coordinates in both directions', () => {
    const point = axes.coordsToPoint(1, -1);
    expect(point.toArray()).toEqual([300, 300]);
    expect(axes.pointToCoords(point).toArray()).toEqual([1, -1]);
  });

  it('creates Cartesian, parametric, and polar plots', () => {
    expect(plotFunction(axes, (x) => x * x, { samples: 4 }).points).toHaveLength(5);
    expect(plotParametric(axes, Math.cos, Math.sin, [0, Math.PI], { samples: 8 }).points).toHaveLength(9);
    expect(plotPolar(axes, () => 1, [0, Math.PI], { samples: 8 }).points).toHaveLength(9);
  });

  it('creates calculus overlays', () => {
    expect(new TangentLine(axes, (x) => x * x, 1).points).toHaveLength(2);
    expect(new AreaUnderCurve(axes, (x) => x * x, [0, 1]).closed).toBe(true);
    expect(riemannRectangles(axes, (x) => x, [0, 1], 4).children).toHaveLength(4);
    expect(vectorField(axes, () => new Vector2(1, 0), 1).children.length).toBeGreaterThan(0);
  });
});