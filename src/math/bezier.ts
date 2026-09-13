import { Vector2 } from './vector2';

export class CubicBezier {
  constructor(
    public readonly p0: Vector2,
    public readonly p1: Vector2,
    public readonly p2: Vector2,
    public readonly p3: Vector2
  ) {}

  pointAt(t: number): Vector2 {
    const u = 1 - t;
    return this.p0.scale(u ** 3)
      .add(this.p1.scale(3 * u ** 2 * t))
      .add(this.p2.scale(3 * u * t ** 2))
      .add(this.p3.scale(t ** 3));
  }

  derivativeAt(t: number): Vector2 {
    const u = 1 - t;
    return this.p1.sub(this.p0).scale(3 * u ** 2)
      .add(this.p2.sub(this.p1).scale(6 * u * t))
      .add(this.p3.sub(this.p2).scale(3 * t ** 2));
  }

  split(t = 0.5): [CubicBezier, CubicBezier] {
    const p01 = this.p0.lerp(this.p1, t);
    const p12 = this.p1.lerp(this.p2, t);
    const p23 = this.p2.lerp(this.p3, t);
    const p012 = p01.lerp(p12, t);
    const p123 = p12.lerp(p23, t);
    const middle = p012.lerp(p123, t);
    return [new CubicBezier(this.p0, p01, p012, middle), new CubicBezier(middle, p123, p23, this.p3)];
  }

  sample(segments: number): Vector2[] {
    if (!Number.isInteger(segments) || segments < 1) throw new RangeError('segments must be a positive integer');
    return Array.from({ length: segments + 1 }, (_, index) => this.pointAt(index / segments));
  }
}