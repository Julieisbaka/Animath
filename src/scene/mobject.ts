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
  moveTo(position: Vector2): this { this.position = position; return this; }
  shift(offset: Vector2): this { this.position = this.position.add(offset); return this; }
  rotate(radians: number): this { this.rotation += radians; return this; }
  setScale(scale: Vector2): this { this.scale = scale; return this; }
  setStyle(style: Style): this { this.style = { ...this.style, ...style }; return this; }
  get localMatrix(): Matrix3 {
    return Matrix3.translation(this.position).multiply(Matrix3.rotation(this.rotation)).multiply(Matrix3.scaling(this.scale));
  }
  get worldMatrix(): Matrix3 { return this.parent ? this.parent.worldMatrix.multiply(this.localMatrix) : this.localMatrix; }
  abstract getBounds(): { min: Vector2; max: Vector2 };
}

export class Circle extends Mobject {
  constructor(public radius = 1) { super(); }
  getBounds() {
    return {
      min: this.position.sub(new Vector2(this.radius, this.radius)),
      max: this.position.add(new Vector2(this.radius, this.radius))
    };
  }
}

export class Polyline extends Mobject {
  constructor(public points: Vector2[] = [], public closed = false) { super(); }

  setPoints(points: Vector2[]): this { this.points = points; return this; }

  getBounds() {
    if (this.points.length === 0) return { min: Vector2.zero, max: Vector2.zero };
    return {
      min: new Vector2(Math.min(...this.points.map((point) => point.x)), Math.min(...this.points.map((point) => point.y))),
      max: new Vector2(Math.max(...this.points.map((point) => point.x)), Math.max(...this.points.map((point) => point.y)))
    };
  }
}
