import { describe, expect, it } from 'vitest';
import { Sequence, Timeline, Tween } from '../src';

describe('Timeline', () => {
  it('seeks across sequential tweens', () => {
    const values: number[] = [];
    const timeline = new Timeline()
      .add(new Tween({ duration: 1, onUpdate: (value) => values.push(value) }))
      .add(new Tween({ duration: 2, onUpdate: (value) => values.push(value) }));

    timeline.seek(1.5);
    expect(timeline.currentTime).toBe(1.5);
    expect(values.at(-2)).toBe(1);
    expect(values.at(-1)).toBe(0.25);
  });

  it('plays until finished and ignores ticks while paused', () => {
    let progress = 0;
    const timeline = new Timeline().add(new Tween({ duration: 2, onUpdate: (value) => { progress = value; } }));
    timeline.tick(1);
    expect(progress).toBe(0);
    timeline.play().tick(1).tick(1);
    expect(progress).toBe(1);
    expect(timeline.status).toBe('finished');
  });

  it('rejects non-finite seek and tick values without corrupting state', () => {
    const timeline = new Timeline().add(new Tween({ duration: 2 }));

    expect(() => timeline.seek(Number.NaN)).toThrow(RangeError);
    expect(() => timeline.seek(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    timeline.play();
    expect(() => timeline.tick(Number.NaN)).toThrow(RangeError);
    expect(() => timeline.tick(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(timeline.currentTime).toBe(0);
  });

  it('does not update sequence tracks before their start time', () => {
    const updates: string[] = [];
    const sequence = new Sequence([
      new Tween({ duration: 1, onUpdate: () => updates.push('first') }),
      new Tween({ duration: 1, onUpdate: () => updates.push('second') })
    ]);

    sequence.update(0.25);
    expect(updates).toEqual(['first']);
  });
});
