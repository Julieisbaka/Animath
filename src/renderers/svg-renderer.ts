import { Mobject, Circle, Polyline } from '../scene/mobject';
import { Tex } from '../latex/tex';
import { Renderer } from './renderer';

export class SvgRenderer implements Renderer {
  readonly element: SVGSVGElement;
  private group: SVGGElement;

  constructor(container?: SVGSVGElement) {
    this.element = container ?? document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.appendChild(this.group);
  }

  resize(width: number, height: number): void {
    this.element.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.element.setAttribute('width', String(width));
    this.element.setAttribute('height', String(height));
  }
  beginFrame(): void { this.group.replaceChildren(); }
  renderMobject(mobject: Mobject): void {
    if (mobject instanceof Tex) {
      const template = document.createElement('template');
      template.innerHTML = mobject.toSvg();
      const formula = template.content.querySelector('svg');
      if (formula) {
        const [a, b, c, d, e, f] = mobject.worldMatrix.values;
        formula.setAttribute('transform', `matrix(${a} ${d} ${b} ${e} ${c} ${f})`);
        formula.setAttribute('fill', mobject.style.fill ?? 'currentColor');
        formula.setAttribute('font-size', `${mobject.fontSize}px`);
        this.group.appendChild(formula);
      }
    } else if (mobject instanceof Polyline) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', mobject.closed ? 'polygon' : 'polyline');
      const matrix = mobject.worldMatrix;
      path.setAttribute('points', mobject.points.map((point) => {
        const transformed = matrix.transformPoint(point);
        return `${transformed.x},${transformed.y}`;
      }).join(' '));
      if (mobject.style.fill) path.setAttribute('fill', mobject.style.fill);
      if (mobject.style.stroke) path.setAttribute('stroke', mobject.style.stroke);
      if (mobject.style.strokeWidth) path.setAttribute('stroke-width', String(mobject.style.strokeWidth));
      if (mobject.style.opacity !== undefined) path.setAttribute('opacity', String(mobject.style.opacity));
      this.group.appendChild(path);
    } else if (mobject instanceof Circle) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const [a, b, c, d, e, f] = mobject.worldMatrix.values;
      circle.setAttribute('transform', `matrix(${a} ${d} ${b} ${e} ${c} ${f})`);
      circle.setAttribute('cx', '0');
      circle.setAttribute('cy', '0');
      circle.setAttribute('r', String(mobject.radius));
      if (mobject.style.fill) circle.setAttribute('fill', mobject.style.fill);
      if (mobject.style.stroke) circle.setAttribute('stroke', mobject.style.stroke);
      if (mobject.style.strokeWidth) circle.setAttribute('stroke-width', String(mobject.style.strokeWidth));
      if (mobject.style.opacity !== undefined) circle.setAttribute('opacity', String(mobject.style.opacity));
      this.group.appendChild(circle);
    }
    for (const child of mobject.children) this.renderMobject(child);
  }
  endFrame(): void {}
}
