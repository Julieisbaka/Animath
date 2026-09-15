import { Mobject } from '../scene/mobject';

export interface Renderer<TElement extends Element = Element> {
  readonly element: TElement;
  resize(width: number, height: number): void;
  beginFrame(): void;
  renderMobject(mobject: Mobject): void;
  endFrame(): void;
  dispose(): void;
}
