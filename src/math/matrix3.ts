import { Vector2 } from './vector2';

/** Row-major 3x3 matrix for 2D affine transforms. */
export class Matrix3 {
  static readonly identity = new Matrix3();

  constructor(public readonly values: readonly number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1]) {
    if (values.length !== 9) throw new RangeError('Matrix3 requires 9 values');
  }

  private value(index: number): number {
    const value = this.values[index];
    if (value === undefined) throw new RangeError('Matrix3 contains an invalid value');
    return value;
  }

  multiply(other: Matrix3): Matrix3 {
    const result = Array.from({ length: 9 }, (_, index) => {
      const row = Math.floor(index / 3);
      const column = index % 3;
      return this.value(row * 3) * other.value(column)
        + this.value(row * 3 + 1) * other.value(column + 3)
        + this.value(row * 3 + 2) * other.value(column + 6);
    });
    return new Matrix3(result);
  }

  transformPoint(point: Vector2): Vector2 {
    const a = this.value(0);
    const b = this.value(1);
    const c = this.value(2);
    const d = this.value(3);
    const e = this.value(4);
    const f = this.value(5);
    const g = this.value(6);
    const h = this.value(7);
    const i = this.value(8);
    const denominator = g * point.x + h * point.y + i;
    return new Vector2((a * point.x + b * point.y + c) / denominator, (d * point.x + e * point.y + f) / denominator);
  }

  static translation(offset: Vector2): Matrix3 { return new Matrix3([1, 0, offset.x, 0, 1, offset.y, 0, 0, 1]); }
  static rotation(radians: number): Matrix3 {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    return new Matrix3([cosine, -sine, 0, sine, cosine, 0, 0, 0, 1]);
  }
  static scaling(scale: Vector2): Matrix3 { return new Matrix3([scale.x, 0, 0, 0, scale.y, 0, 0, 0, 1]); }
}