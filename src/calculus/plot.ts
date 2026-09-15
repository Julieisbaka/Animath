import { Vector2 } from '../math/vector2';
import { Mobject, Polyline } from '../scene/mobject';
import { Axes2D } from './axes';

export interface PlotOptions { samples?: number; style?: { stroke?: string; strokeWidth?: number; fill?: string; opacity?: number }; }

function sampleCount(value: number | undefined, fallback: number): number {
  const samples = value ?? fallback;
  if (!Number.isInteger(samples) || samples < 1) throw new RangeError('samples must be a positive integer');
  return samples;
}

export function plotFunction(axes: Axes2D, fn: (x: number) => number, options: PlotOptions = {}): Polyline {
  const samples = sampleCount(options.samples, 256);
  const points = Array.from({ length: samples + 1 }, (_, index) => {
    const x = axes.xRange[0] + (index / samples) * (axes.xRange[1] - axes.xRange[0]);
    return axes.coordsToPoint(x, fn(x));
  });
  return new Polyline(points).setStyle({ stroke: '#38bdf8', strokeWidth: 3, ...options.style });
}

export function plotParametric(axes: Axes2D, xFn: (t: number) => number, yFn: (t: number) => number, range: [number, number] = [0, 1], options: PlotOptions = {}): Polyline {
  const samples = sampleCount(options.samples, 256);
  const points = Array.from({ length: samples + 1 }, (_, index) => {
    const t = range[0] + (index / samples) * (range[1] - range[0]);
    return axes.coordsToPoint(xFn(t), yFn(t));
  });
  return new Polyline(points).setStyle({ stroke: '#f472b6', strokeWidth: 3, ...options.style });
}

export function plotPolar(axes: Axes2D, radius: (theta: number) => number, range: [number, number] = [0, Math.PI * 2], options: PlotOptions = {}): Polyline {
  return plotParametric(axes, (theta) => radius(theta) * Math.cos(theta), (theta) => radius(theta) * Math.sin(theta), range, options);
}

export class TangentLine extends Polyline {
  constructor(axes: Axes2D, fn: (x: number) => number, x: number, length = 2, options: PlotOptions = {}) {
    const derivative = (fn(x + 1e-5) - fn(x - 1e-5)) / 2e-5;
    const half = length / 2;
    super([axes.coordsToPoint(x - half, fn(x) - derivative * half), axes.coordsToPoint(x + half, fn(x) + derivative * half)]);
    this.setStyle({ stroke: '#facc15', strokeWidth: 3, ...options.style });
  }
}

export class AreaUnderCurve extends Polyline {
  constructor(axes: Axes2D, fn: (x: number) => number, range: [number, number], options: PlotOptions = {}) {
    const samples = sampleCount(options.samples, 128);
    const points = [axes.coordsToPoint(range[0], 0)];
    for (let index = 0; index <= samples; index++) {
      const x = range[0] + (index / samples) * (range[1] - range[0]);
      points.push(axes.coordsToPoint(x, fn(x)));
    }
    points.push(axes.coordsToPoint(range[1], 0));
    super(points, true);
    this.setStyle({ fill: '#38bdf855', stroke: '#38bdf8', strokeWidth: 1, ...options.style });
  }
}

export function riemannRectangles(axes: Axes2D, fn: (x: number) => number, range: [number, number], count: number, method: 'left' | 'right' | 'midpoint' = 'left', options: PlotOptions = {}): Mobject {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('count must be a positive integer');
  const group = new MobjectGroup();
  const width = (range[1] - range[0]) / count;
  for (let index = 0; index < count; index++) {
    const left = range[0] + index * width;
    const sample = method === 'right' ? left + width : method === 'midpoint' ? left + width / 2 : left;
    const right = left + width;
    group.add(new Polyline([axes.coordsToPoint(left, 0), axes.coordsToPoint(left, fn(sample)), axes.coordsToPoint(right, fn(sample)), axes.coordsToPoint(right, 0)], true).setStyle({ fill: '#f472b655', stroke: '#f472b6', strokeWidth: 1, ...options.style }));
  }
  return group;
}

export class MobjectGroup extends Mobject {
  getBounds() {
    if (this.children.length === 0) return { min: Vector2.zero, max: Vector2.zero };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const child of this.children) {
      const bounds = child.getBounds();
      minX = Math.min(minX, bounds.min.x);
      minY = Math.min(minY, bounds.min.y);
      maxX = Math.max(maxX, bounds.max.x);
      maxY = Math.max(maxY, bounds.max.y);
    }
    return { min: new Vector2(minX, minY), max: new Vector2(maxX, maxY) };
  }
}

export function vectorField(axes: Axes2D, field: (x: number, y: number) => Vector2, spacing = 1, options: PlotOptions = {}): Mobject {
  if (!Number.isFinite(spacing) || spacing <= 0) throw new RangeError('spacing must be positive');
  const group = new MobjectGroup();
  const xStart = Math.ceil(axes.xRange[0] / spacing) * spacing;
  const yStart = Math.ceil(axes.yRange[0] / spacing) * spacing;
  const xCount = Math.floor((axes.xRange[1] - xStart) / spacing) + 1;
  const yCount = Math.floor((axes.yRange[1] - yStart) / spacing) + 1;
  for (let xIndex = 0; xIndex < xCount; xIndex++) {
    const x = xStart + xIndex * spacing;
    for (let yIndex = 0; yIndex < yCount; yIndex++) {
      const y = yStart + yIndex * spacing;
      const start = axes.coordsToPoint(x, y);
      const vector = field(x, y);
      const end = axes.coordsToPoint(x + vector.x, y + vector.y);
      group.add(new Polyline([start, end]).setStyle({ stroke: '#a78bfa', strokeWidth: 1, ...options.style }));
    }
  }
  return group;
}