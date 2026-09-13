export type Easing = (t: number) => number;

export const linear: Easing = (t) => t;
export const easeInQuad: Easing = (t) => t * t;
export const easeOutQuad: Easing = (t) => t * (2 - t);
export const easeInOutQuad: Easing = (t) => t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
export const smoothstep: Easing = (t) => t * t * (3 - 2 * t);

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}
