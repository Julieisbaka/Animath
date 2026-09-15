import { clamp } from './easing';
import { Animation } from './tween';

export type TimelineState = 'idle' | 'playing' | 'paused' | 'finished';

export class Timeline {
  private elapsed = 0;
  private state: TimelineState = 'idle';
  private readonly animations: Animation[] = [];
  private readonly listeners = new Set<() => void>();
  private schedulerOwner?: object;

  add(animation: Animation): this { this.animations.push(animation); return this; }
  get duration(): number { return this.animations.reduce((total, animation) => total + animation.duration, 0); }
  get currentTime(): number { return this.elapsed; }
  get status(): TimelineState { return this.state; }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  acquireScheduler(owner: object): boolean {
    if (this.schedulerOwner && this.schedulerOwner !== owner) return false;
    this.schedulerOwner = owner;
    return true;
  }

  releaseScheduler(owner: object): void {
    if (this.schedulerOwner === owner) this.schedulerOwner = undefined;
  }

  play(): this {
    if (this.state !== 'finished') this.state = 'playing';
    this.notify();
    return this;
  }
  pause(): this {
    if (this.state === 'playing') this.state = 'paused';
    this.notify();
    return this;
  }
  restart(play = true): this {
    this.elapsed = 0;
    this.state = play ? 'playing' : 'paused';
    this.renderAt(0);
    this.notify();
    return this;
  }
  seek(time: number): this {
    if (!Number.isFinite(time)) throw new RangeError('Timeline seek time must be finite');
    this.elapsed = clamp(time, 0, this.duration);
    this.renderAt(this.elapsed);
    this.state = this.elapsed >= this.duration ? 'finished' : 'paused';
    this.notify();
    return this;
  }
  tick(deltaSeconds: number): this {
    if (!Number.isFinite(deltaSeconds)) throw new RangeError('Timeline tick delta must be finite');
    if (this.state !== 'playing') return this;
    this.elapsed = Math.min(this.duration, this.elapsed + Math.max(0, deltaSeconds));
    this.renderAt(this.elapsed);
    if (this.elapsed >= this.duration) this.state = 'finished';
    this.notify();
    return this;
  }

  private renderAt(time: number): void {
    let offset = 0;
    for (const animation of this.animations) {
      const localTime = time - offset;
      if (localTime >= 0) animation.update(localTime);
      offset += animation.duration;
    }
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}
