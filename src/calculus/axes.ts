import { Vector2 } from '../math/vector2';
import { Mobject, Polyline } from '../scene/mobject';

export interface AxesOptions {
  xRange?: [number, number];
  yRange?: [number, number];
  width?: number;
  height?: number;
  grid?: boolean;
  gridColor?: string;
}

export class Axes2D extends Mobject {
  readonly xRange: [number, number];
  readonly yRange: [number, number];
  readonly width: number;
  readonly height: number;

  constructor(options: AxesOptions = {}) {
    super();
    this.xRange = options.xRange ?? [-5, 5];
    this.yRange = options.yRange ?? [-3, 3];
    this.width = options.width ?? 800;
    this.height = options.height ?? 480;
    if (!(this.xRange[1] > this.xRange[0]) || !(this.yRange[1] > this.yRange[0])) throw new RangeError('Axes ranges must be increasing');
    if (!(this.width > 0) || !(this.height > 0)) throw new RangeError('Axes dimensions must be positive');
    const axisStyle = { stroke: '#94a3b8', strokeWidth: 2, fill: 'none' };
    this.add(new Polyline([this.coordsToPoint(this.xRange[0], 0), this.coordsToPoint(this.xRange[1], 0)]).setStyle(axisStyle));
    this.add(new Polyline([this.coordsToPoint(0, this.yRange[0]), this.coordsToPoint(0, this.yRange[1])]).setStyle(axisStyle));
    if (options.grid) this.add(...this.createGrid(options.gridColor ?? '#334155'));
  }

  coordsToPoint(x: number, y: number): Vector2 {
    return new Vector2(
      ((x - this.xRange[0]) / (this.xRange[1] - this.xRange[0])) * this.width,
      ((this.yRange[1] - y) / (this.yRange[1] - this.yRange[0])) * this.height
    );
  }

  pointToCoords(point: Vector2): Vector2 {
    return new Vector2(
      this.xRange[0] + (point.x / this.width) * (this.xRange[1] - this.xRange[0]),
      this.yRange[1] - (point.y / this.height) * (this.yRange[1] - this.yRange[0])
    );
  }

  private createGrid(color: string): Polyline[] {
    const lines: Polyline[] = [];
    const xStep = this.gridStep(this.xRange);
    const yStep = this.gridStep(this.yRange);
    for (let x = Math.ceil(this.xRange[0] / xStep) * xStep; x <= this.xRange[1]; x += xStep) {
      lines.push(new Polyline([this.coordsToPoint(x, this.yRange[0]), this.coordsToPoint(x, this.yRange[1])]).setStyle({ stroke: color, strokeWidth: 1 }));
    }
    for (let y = Math.ceil(this.yRange[0] / yStep) * yStep; y <= this.yRange[1]; y += yStep) {
      lines.push(new Polyline([this.coordsToPoint(this.xRange[0], y), this.coordsToPoint(this.xRange[1], y)]).setStyle({ stroke: color, strokeWidth: 1 }));
    }
    return lines;
  }

  private gridStep(range: [number, number]): number { return Math.max(1, Math.pow(10, Math.floor(Math.log10((range[1] - range[0]) / 10)))); }
  getBounds() { return { min: Vector2.zero, max: new Vector2(this.width, this.height) }; }
}