import { Animation } from './tween';

export class Sequence implements Animation {
  readonly duration: number;
  constructor(private readonly animations: readonly Animation[]) {
    this.duration = animations.reduce((total, animation) => total + animation.duration, 0);
  }

  update(time: number): boolean {
    let offset = 0;
    for (const animation of this.animations) {
      animation.update(time - offset);
      offset += animation.duration;
    }
    return time >= this.duration;
  }
}

export class Parallel implements Animation {
  readonly duration: number;
  constructor(private readonly animations: readonly Animation[]) {
    this.duration = Math.max(0, ...animations.map((animation) => animation.duration));
  }

  update(time: number): boolean {
    for (const animation of this.animations) animation.update(time);
    return time >= this.duration;
  }
}

export interface SpringOptions {
  duration: number;
  frequency?: number;
  damping?: number;
  onUpdate?: (progress: number) => void;
}

/** A deterministic damped spring track suitable for scrubbing and replay. */
export class Spring implements Animation {
  readonly duration: number;
  private readonly frequency: number;
  private readonly damping: number;
  private readonly onUpdate?: (progress: number) => void;

  constructor(options: SpringOptions) {
    if (options.duration < 0) throw new RangeError('Spring duration cannot be negative');
    this.duration = options.duration;
    this.frequency = options.frequency ?? 10;
    this.damping = options.damping ?? 6;
    this.onUpdate = options.onUpdate;
  }

  update(time: number): boolean {
    const t = Math.min(this.duration, Math.max(0, time));
    const progress = this.duration === 0
      ? 1
      : 1 - Math.exp(-this.damping * t) * Math.cos(this.frequency * t);
    this.onUpdate?.(t >= this.duration ? 1 : progress);
    return t >= this.duration;
  }
}