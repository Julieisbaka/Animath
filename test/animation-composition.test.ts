import { describe, expect, it } from 'vitest';
import { Circle, fadeIn, Parallel, Sequence, Spring, Tween, Vector2 } from '../src';

describe('animation composition', () => {
  it('runs sequences and parallel tracks with a shared clock', () => {
    const values: string[] = [];
    const sequence = new Sequence([
      new Tween({ duration: 1, onUpdate: () => values.push('first') }),
      new Tween({ duration: 2, onUpdate: () => values.push('second') })
    ]);
    const parallel = new Parallel([sequence, new Tween({ duration: 4, onUpdate: () => values.push('parallel') })]);
    parallel.update(1.5);
    expect(parallel.duration).toBe(4);
    expect(values).toEqual(['first', 'second', 'parallel']);
  });

  it('supports deterministic spring completion and fade effects', () => {
    const circle = new Circle().moveTo(new Vector2(1, 1));
    const values: number[] = [];
    const spring = new Spring({ duration: 1, onUpdate: (value) => values.push(value) });
    expect(spring.update(1)).toBe(true);
    expect(values.at(-1)).toBe(1);
    const fade = fadeIn(circle, 1);
    fade.update(0);
    expect(circle.style.opacity).toBe(0);
    fade.update(1);
    expect(circle.style.opacity).toBe(1);
  });
});