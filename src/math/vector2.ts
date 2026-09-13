export class Vector2 {
  static readonly zero = new Vector2(0, 0);
  static readonly one = new Vector2(1, 1);

  constructor(public readonly x = 0, public readonly y = 0) {}

  add(other: Vector2): Vector2 { return new Vector2(this.x + other.x, this.y + other.y); }
  sub(other: Vector2): Vector2 { return new Vector2(this.x - other.x, this.y - other.y); }
  scale(value: number): Vector2 { return new Vector2(this.x * value, this.y * value); }
  dot(other: Vector2): number { return this.x * other.x + this.y * other.y; }
  length(): number { return Math.hypot(this.x, this.y); }
  distanceTo(other: Vector2): number { return this.sub(other).length(); }
  normalized(): Vector2 {
    const length = this.length();
    return length === 0 ? Vector2.zero : this.scale(1 / length);
  }
  lerp(other: Vector2, amount: number): Vector2 { return this.add(other.sub(this).scale(amount)); }
  equals(other: Vector2, epsilon = 1e-9): boolean {
    return Math.abs(this.x - other.x) <= epsilon && Math.abs(this.y - other.y) <= epsilon;
  }
  toArray(): [number, number] { return [this.x, this.y]; }
}
