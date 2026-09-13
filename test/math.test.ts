import { describe, expect, it } from 'vitest';
import { CubicBezier, Matrix3, Vector2, Vector3 } from '../src';

describe('Phase 2 math primitives', () => {
  it('supports Vector3 dot and cross products', () => {
    const x = new Vector3(1, 0, 0);
    const y = new Vector3(0, 1, 0);
    expect(x.dot(y)).toBe(0);
    expect(x.cross(y).toArray()).toEqual([0, 0, 1]);
  });

  it('composes 2D affine transforms', () => {
    const transform = Matrix3.translation(new Vector2(10, 20)).multiply(Matrix3.scaling(new Vector2(2, 3)));
    expect(transform.transformPoint(new Vector2(1, 2)).toArray()).toEqual([12, 26]);
  });

  it('evaluates and splits cubic Bézier curves', () => {
    const curve = new CubicBezier(new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1), new Vector2(2, 1));
    expect(curve.pointAt(0).toArray()).toEqual([0, 0]);
    expect(curve.pointAt(1).toArray()).toEqual([2, 1]);
    const [left, right] = curve.split();
    expect(left.pointAt(1).equals(right.pointAt(0))).toBe(true);
    expect(curve.sample(4)).toHaveLength(5);
  });
});