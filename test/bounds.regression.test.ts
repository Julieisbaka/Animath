import { describe, expect, it } from 'vitest';
import { Circle, MobjectGroup, Vector2 } from '../src';

describe('regression: world-space bounds', () => {
  it('includes parent transforms for child bounds', () => {
    const parent = new MobjectGroup().moveTo(new Vector2(10, 20));
    const child = new Circle(2).moveTo(new Vector2(5, 5));
    parent.add(child);

    const bounds = child.getBounds();
    expect(bounds.min.x).toBe(13);
    expect(bounds.min.y).toBe(23);
    expect(bounds.max.x).toBe(17);
    expect(bounds.max.y).toBe(27);
  });

  it('unions group children instead of returning a zero box', () => {
    const group = new MobjectGroup().add(
      new Circle(2).moveTo(new Vector2(-10, 4)),
      new Circle(3).moveTo(new Vector2(8, -5))
    );

    const bounds = group.getBounds();
    expect(bounds.min.x).toBe(-12);
    expect(bounds.min.y).toBe(-8);
    expect(bounds.max.x).toBe(11);
    expect(bounds.max.y).toBe(6);
  });
});