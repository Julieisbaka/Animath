import { Circle, Mobject, Polyline } from '../scene/mobject';
import { Renderer } from './renderer';

export class Canvas2DRenderer implements Renderer {
  readonly element: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  constructor(canvas?: HTMLCanvasElement) {
    this.element = canvas ?? document.createElement('canvas');
    const context = this.element.getContext('2d');
    if (!context) throw new Error('Canvas 2D context is unavailable');
    this.context = context;
  }

  resize(width: number, height: number): void {
    this.element.width = width;
    this.element.height = height;
  }

  beginFrame(): void { this.context.clearRect(0, 0, this.element.width, this.element.height); }

  renderMobject(mobject: Mobject): void {
    if (mobject instanceof Polyline) {
      this.context.save();
      const [a, b, c, d, e, f] = mobject.worldMatrix.values;
      this.context.setTransform(a ?? 1, d ?? 0, b ?? 0, e ?? 1, c ?? 0, f ?? 0);
      this.context.globalAlpha = mobject.style.opacity ?? 1;
      this.context.beginPath();
      mobject.points.forEach((point, index) => index === 0 ? this.context.moveTo(point.x, point.y) : this.context.lineTo(point.x, point.y));
      if (mobject.closed) this.context.closePath();
      if (mobject.style.fill && mobject.style.fill !== 'none') {
        this.context.fillStyle = mobject.style.fill;
        this.context.fill();
      }
      if (mobject.style.stroke && mobject.style.stroke !== 'none') {
        this.context.strokeStyle = mobject.style.stroke;
        this.context.lineWidth = mobject.style.strokeWidth ?? 1;
        this.context.stroke();
      }
      this.context.restore();
    } else if (mobject instanceof Circle) {
      const [a, b, c, d, e, f] = mobject.worldMatrix.values;
      this.context.save();
      this.context.setTransform(a ?? 1, d ?? 0, b ?? 0, e ?? 1, c ?? 0, f ?? 0);
      this.context.globalAlpha = mobject.style.opacity ?? 1;
      this.context.beginPath();
      this.context.arc(0, 0, mobject.radius, 0, Math.PI * 2);
      if (mobject.style.fill && mobject.style.fill !== 'none') {
        this.context.fillStyle = mobject.style.fill;
        this.context.fill();
      }
      if (mobject.style.stroke && mobject.style.stroke !== 'none') {
        this.context.strokeStyle = mobject.style.stroke;
        this.context.lineWidth = mobject.style.strokeWidth ?? 1;
        this.context.stroke();
      }
      this.context.restore();
    }
    for (const child of mobject.children) this.renderMobject(child);
  }

  endFrame(): void {}
}