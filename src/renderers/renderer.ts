import { Mobject } from '../scene/mobject';

export interface Renderer {
  readonly element: unknown;
  resize(width: number, height: number): void;
  beginFrame(): void;
  renderMobject(mobject: Mobject): void;
  endFrame(): void;
}
