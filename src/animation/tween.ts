import { clamp, Easing, linear } from './easing';

export interface TweenOptions {
  duration: number;
  easing?: Easing;
  onUpdate?: (progress: number) => void;
}

export interface Animation {
  readonly duration: number;
  update(time: number): boolean;
}

export class Tween implements Animation {
  readonly duration: number;
  private readonly easing: Easing;
  private readonly onUpdate?: (progress: number) => void;

  constructor(options: TweenOptions) {
    if (!Number.isFinite(options.duration) || options.duration < 0) throw new RangeError('Tween duration must be finite and non-negative');
    this.duration = options.duration;
    this.easing = options.easing ?? linear;
    this.onUpdate = options.onUpdate;
  }

  update(time: number): boolean {
    const progress = clamp(this.duration === 0 ? 1 : time / this.duration);
    this.onUpdate?.(this.easing(progress));
    return progress >= 1;
  }
}
