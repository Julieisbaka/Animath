import { Mobject, Circle, Polyline } from '../scene/mobject';
import { Tex } from '../latex/tex';
import { Renderer } from './renderer';

const SVG_NS = 'http://www.w3.org/2000/svg';

type CachedNode = { node: Element; signature: string };

export class SvgRenderer implements Renderer<SVGSVGElement> {
  readonly element: SVGSVGElement;
  private group: SVGGElement;
  private readonly cache = new Map<Mobject, CachedNode>();
  private frameNodes = new Set<Mobject>();

  constructor(container?: SVGSVGElement) {
    this.element = container ?? document.createElementNS(SVG_NS, 'svg');
    this.group = document.createElementNS(SVG_NS, 'g');
    this.element.appendChild(this.group);
  }

  resize(width: number, height: number): void {
    this.element.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.element.setAttribute('width', String(width));
    this.element.setAttribute('height', String(height));
  }

  beginFrame(): void { this.frameNodes = new Set(); }

  renderMobject(mobject: Mobject): void {
    this.frameNodes.add(mobject);
    this.syncMobject(mobject);
    for (const child of mobject.children) this.renderMobject(child);
  }

  endFrame(): void {
    // Prune nodes for mobjects that no longer appear in the scene.
    for (const [mobject, entry] of this.cache) {
      if (!this.frameNodes.has(mobject)) {
        entry.node.remove();
        this.cache.delete(mobject);
      }
    }
  }

  /** Remove cached nodes for a mobject that was removed from the scene. */
  destroy(mobject: Mobject): void {
    const entry = this.cache.get(mobject);
    entry?.node.remove();
    this.cache.delete(mobject);
  }

  private syncMobject(mobject: Mobject): void {
    const signature = this.signatureOf(mobject);
    const cached = this.cache.get(mobject);
    if (cached && cached.signature === signature) return;

    if (cached && this.nodeKind(cached.node) !== this.nodeKindOf(mobject)) {
      cached.node.remove();
      this.cache.delete(mobject);
    } else if (cached) {
      this.updateNode(cached.node, mobject);
      this.cache.set(mobject, { node: cached.node, signature });
      return;
    }

    const node = this.createNode(mobject);
    if (!node) return;
    this.group.appendChild(node);
    this.cache.set(mobject, { node, signature });
  }

  private nodeKindOf(mobject: Mobject): string {
    if (mobject instanceof Tex) return 'tex';
    if (mobject instanceof Circle && mobject.radius <= 0) return 'group';
    if (mobject instanceof Circle) return 'circle';
    if (mobject instanceof Polyline) return mobject.closed ? 'polygon' : 'polyline';
    return 'group';
  }

  private nodeKind(node: Element): string {
    if (node.tagName === 'g') return 'group';
    if (node.tagName === 'foreignObject' || (node.tagName === 'svg' && node.querySelector('foreignObject'))) return 'tex';
    return node.tagName;
  }

  private createNode(mobject: Mobject): Element | null {
    if (mobject instanceof Tex) {
      const template = document.createElement('template');
      template.innerHTML = mobject.toSvg();
      const formula = template.content.querySelector('svg');
      if (!formula) return null;
      this.applyTransform(formula, mobject);
      formula.setAttribute('fill', mobject.style.fill ?? 'currentColor');
      formula.setAttribute('font-size', `${mobject.fontSize}px`);
      this.applyOpacity(formula, mobject);
      return formula;
    }
    const node = document.createElementNS(SVG_NS, this.nodeKindOf(mobject));
    this.updateNode(node, mobject);
    return node;
  }

  private updateNode(node: Element, mobject: Mobject): void {
    if (mobject instanceof Polyline) {
      const matrix = mobject.worldMatrix;
      node.setAttribute('points', mobject.points.map((point) => {
        const transformed = matrix.transformPoint(point);
        return `${transformed.x},${transformed.y}`;
      }).join(' '));
    } else if (mobject instanceof Circle) {
      this.applyTransform(node, mobject);
      node.setAttribute('cx', '0');
      node.setAttribute('cy', '0');
      node.setAttribute('r', String(mobject.radius));
    }
    if (mobject.style.fill) node.setAttribute('fill', mobject.style.fill);
    if (mobject.style.stroke) node.setAttribute('stroke', mobject.style.stroke);
    if (mobject.style.strokeWidth !== undefined) node.setAttribute('stroke-width', String(mobject.style.strokeWidth));
    this.applyOpacity(node, mobject);
  }

  private applyTransform(node: Element, mobject: Mobject): void {
    const [a, b, c, d, e, f] = mobject.worldMatrix.values;
    node.setAttribute('transform', `matrix(${a} ${d} ${b} ${e} ${c} ${f})`);
  }

  private applyOpacity(node: Element, mobject: Mobject): void {
    if (mobject.style.opacity !== undefined) node.setAttribute('opacity', String(mobject.style.opacity));
  }

  private signatureOf(mobject: Mobject): string {
    const matrix = mobject.worldMatrix.values.join(',');
    const style = `${mobject.style.fill}|${mobject.style.stroke}|${mobject.style.strokeWidth}|${mobject.style.opacity}`;
    if (mobject instanceof Circle) return `circle:${mobject.radius}:${matrix}:${style}`;
    if (mobject instanceof Polyline) {
      let points = '';
      for (const point of mobject.points) points += `${point.x},${point.y};`;
      return `poly:${mobject.closed}:${points}:${matrix}:${style}`;
    }
    if (mobject instanceof Tex) return `tex:${mobject.expression}:${mobject.fontSize}:${matrix}:${style}`;
    return `group:${matrix}:${style}`;
  }
}
