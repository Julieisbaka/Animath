import { Circle, Mobject, Polyline } from '../scene/mobject';
import { Tex } from '../latex/tex';
import { Renderer } from './renderer';

export class Canvas2DRenderer implements Renderer<HTMLCanvasElement> {
  readonly element: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private pixelRatio = 1;

  constructor(canvas?: HTMLCanvasElement) {
    this.element = canvas ?? document.createElement('canvas');
    const context = this.element.getContext('2d');
    if (!context) throw new Error('Canvas 2D context is unavailable');
    this.context = context;
  }

  resize(width: number, height: number): void {
    this.pixelRatio = typeof globalThis.devicePixelRatio === 'number' && Number.isFinite(globalThis.devicePixelRatio)
      ? Math.max(1, globalThis.devicePixelRatio)
      : 1;
    this.element.width = Math.round(width * this.pixelRatio);
    this.element.height = Math.round(height * this.pixelRatio);
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  beginFrame(): void {
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.context.clearRect(0, 0, this.element.width / this.pixelRatio, this.element.height / this.pixelRatio);
  }

  renderMobject(mobject: Mobject): void {
    if (mobject instanceof Tex) {
      const [a, b, c, d, e, f] = mobject.worldMatrix.values;
      this.context.save();
      this.context.setTransform(this.pixelRatio * (a ?? 1), this.pixelRatio * (d ?? 0), this.pixelRatio * (b ?? 0), this.pixelRatio * (e ?? 1), this.pixelRatio * (c ?? 0), this.pixelRatio * (f ?? 0));
      this.context.globalAlpha = mobject.style.opacity ?? 1;
      this.context.fillStyle = mobject.style.fill && mobject.style.fill !== 'currentColor' ? mobject.style.fill : '#000';
      this.context.font = `${mobject.fontSize}px sans-serif`;
      this.context.fillText(mobject.expression, 0, 0);
      this.context.restore();
    } else if (mobject instanceof Polyline) {
      this.context.save();
      const [a, b, c, d, e, f] = mobject.worldMatrix.values;
      this.context.setTransform(this.pixelRatio * (a ?? 1), this.pixelRatio * (d ?? 0), this.pixelRatio * (b ?? 0), this.pixelRatio * (e ?? 1), this.pixelRatio * (c ?? 0), this.pixelRatio * (f ?? 0));
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
      this.context.setTransform(this.pixelRatio * (a ?? 1), this.pixelRatio * (d ?? 0), this.pixelRatio * (b ?? 0), this.pixelRatio * (e ?? 1), this.pixelRatio * (c ?? 0), this.pixelRatio * (f ?? 0));
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

  dispose(): void {}
}