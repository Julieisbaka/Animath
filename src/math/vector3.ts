export class Vector3 {
  static readonly zero = new Vector3(0, 0, 0);
  static readonly one = new Vector3(1, 1, 1);

  constructor(public readonly x = 0, public readonly y = 0, public readonly z = 0) {}

  add(other: Vector3): Vector3 { return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z); }
  sub(other: Vector3): Vector3 { return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z); }
  scale(value: number): Vector3 { return new Vector3(this.x * value, this.y * value, this.z * value); }
  dot(other: Vector3): number { return this.x * other.x + this.y * other.y + this.z * other.z; }
  cross(other: Vector3): Vector3 {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }
  length(): number { return Math.hypot(this.x, this.y, this.z); }
  normalized(): Vector3 {
    const length = this.length();
    return length === 0 ? Vector3.zero : this.scale(1 / length);
  }
  lerp(other: Vector3, amount: number): Vector3 { return this.add(other.sub(this).scale(amount)); }
  toArray(): [number, number, number] { return [this.x, this.y, this.z]; }
}