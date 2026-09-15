import { Vector2 } from '../math/vector2';
import { Matrix3 } from '../math/matrix3';

export interface Style {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export abstract class Mobject {
  position = Vector2.zero;
  rotation = 0;
  scale = Vector2.one;
  style: Style = { fill: 'none', stroke: '#111827', strokeWidth: 2, opacity: 1 };
  readonly children: Mobject[] = [];
  private parent?: Mobject;

  add(...children: Mobject[]): this {
    for (const child of children) {
      if (child === this) throw new Error('A Mobject cannot be added to itself');
      for (let ancestor: Mobject | undefined = this; ancestor; ancestor = ancestor.parent) {
        if (ancestor === child) throw new Error('A Mobject cannot be added to one of its ancestors');
      }
      if (this.children.includes(child)) continue;
      if (child.parent && child.parent !== this) child.parent.remove(child);
      child.parent = this;
      this.children.push(child);
    }
    return this;
  }
  remove(child: Mobject): this {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parent = undefined;
    }
    return this;
  }
  moveTo(position: Vector2): this {
    assertFiniteVector(position, 'position');
    this.position = position;
    return this;
  }
  shift(offset: Vector2): this {
    assertFiniteVector(offset, 'offset');
    return this.moveTo(this.position.add(offset));
  }
  rotate(radians: number): this {
    if (!Number.isFinite(radians)) throw new RangeError('rotation must be finite');
    this.rotation += radians;
    return this;
  }
  setScale(scale: Vector2): this {
    assertFiniteVector(scale, 'scale');
    this.scale = scale;
    return this;
  }
  setStyle(style: Style): this {
    if (style.strokeWidth !== undefined && (!Number.isFinite(style.strokeWidth) || style.strokeWidth < 0)) throw new RangeError('strokeWidth must be finite and non-negative');
    if (style.opacity !== undefined && (!Number.isFinite(style.opacity) || style.opacity < 0 || style.opacity > 1)) throw new RangeError('opacity must be finite and between 0 and 1');
    this.style = { ...this.style, ...style };
    return this;
  }
  get localMatrix(): Matrix3 {
    return Matrix3.translation(this.position).multiply(Matrix3.rotation(this.rotation)).multiply(Matrix3.scaling(this.scale));
  }
  get worldMatrix(): Matrix3 { return this.parent ? this.parent.worldMatrix.multiply(this.localMatrix) : this.localMatrix; }
  abstract getBounds(): { min: Vector2; max: Vector2 };
}

export class Circle extends Mobject {
  constructor(public radius = 1) {
    super();
    if (!Number.isFinite(radius) || radius < 0) throw new RangeError('Circle radius must be finite and non-negative');
  }
  getBounds() {
    return {
      min: this.position.sub(new Vector2(this.radius, this.radius)),
      max: this.position.add(new Vector2(this.radius, this.radius))
    };
  }
}

export class Polyline extends Mobject {
  constructor(public points: Vector2[] = [], public closed = false) {
    super();
    assertFinitePoints(points);
  }

  setPoints(points: Vector2[]): this {
    assertFinitePoints(points);
    this.points = points;
    return this;
  }

  getBounds() {
    if (this.points.length === 0) return { min: Vector2.zero, max: Vector2.zero };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const point of this.points) {
      if (point.x < minX) minX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.x > maxX) maxX = point.x;
      if (point.y > maxY) maxY = point.y;
    }
    return { min: new Vector2(minX, minY), max: new Vector2(maxX, maxY) };
  }
}

function assertFiniteVector(value: Vector2, name: string): void {
  if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) throw new RangeError(`${name} coordinates must be finite`);
}

function assertFinitePoints(points: readonly Vector2[]): void {
  for (const point of points) assertFiniteVector(point, 'point');
}
