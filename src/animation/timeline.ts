import { clamp } from './easing';
import { Animation } from './tween';

export type TimelineState = 'idle' | 'playing' | 'paused' | 'finished';

export class Timeline {
  private elapsed = 0;
  private state: TimelineState = 'idle';
  private readonly animations: Animation[] = [];

  add(animation: Animation): this { this.animations.push(animation); return this; }
  get duration(): number { return this.animations.reduce((total, animation) => total + animation.duration, 0); }
  get currentTime(): number { return this.elapsed; }
  get status(): TimelineState { return this.state; }

  play(): this { if (this.state !== 'finished') this.state = 'playing'; return this; }
  pause(): this { if (this.state === 'playing') this.state = 'paused'; return this; }
  restart(play = true): this {
    this.elapsed = 0;
    this.state = play ? 'playing' : 'paused';
    this.renderAt(0);
    return this;
  }
  seek(time: number): this {
    this.elapsed = clamp(time, 0, this.duration);
    this.renderAt(this.elapsed);
    this.state = this.elapsed >= this.duration ? 'finished' : 'paused';
    return this;
  }
  tick(deltaSeconds: number): this {
    if (this.state !== 'playing') return this;
    this.elapsed = Math.min(this.duration, this.elapsed + Math.max(0, deltaSeconds));
    this.renderAt(this.elapsed);
    if (this.elapsed >= this.duration) this.state = 'finished';
    return this;
  }

  private renderAt(time: number): void {
    let offset = 0;
    for (const animation of this.animations) {
      animation.update(time - offset);
      offset += animation.duration;
    }
  }
}
