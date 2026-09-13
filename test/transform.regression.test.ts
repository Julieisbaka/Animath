import { describe, expect, it } from 'vitest';
import { Circle, Vector2 } from '../src';

describe('regression: scene transforms', () => {
  it('preserves parent transforms when rendering a child world matrix', () => {
    const parent = new Circle(0).moveTo(new Vector2(100, 50));
    const child = new Circle(5).moveTo(new Vector2(10, 20));
    parent.add(child);
    expect(child.worldMatrix.transformPoint(Vector2.zero).toArray()).toEqual([110, 70]);
  });

  it('rejects parent cycles', () => {
    const parent = new Circle(1);
    const child = new Circle(1);
    parent.add(child);

    expect(() => child.add(parent)).toThrow('ancestors');
  });
});
