// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { Circle, SvgRenderer, Timeline, Tween, Vector2 } from '../src';

describe('integration: timeline and renderer', () => {
  it('animates a scene and renders its updated position', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const circle = new Circle(5);
    const timeline = new Timeline().add(new Tween({ duration: 1, onUpdate: (progress) => circle.moveTo(new Vector2(progress * 100, 0)) }));
    timeline.seek(0.5);
    const renderer = new SvgRenderer(svg);
    renderer.beginFrame();
    renderer.renderMobject(circle);
    renderer.endFrame();
    expect(circle.position.x).toBe(50);
    expect(svg.querySelector('circle')?.getAttribute('transform')).toContain('50');
  });
});
