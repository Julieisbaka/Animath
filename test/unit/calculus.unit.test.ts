import { describe, expect, it } from 'vitest';
import { Axes2D } from '../../src';

describe('unit: Axes2D', () => {
  it('maps the center of a symmetric domain to the canvas center', () => {
    const axes = new Axes2D({ xRange: [-1, 1], yRange: [-1, 1], width: 200, height: 100 });
    expect(axes.coordsToPoint(0, 0).toArray()).toEqual([100, 50]);
  });
});
