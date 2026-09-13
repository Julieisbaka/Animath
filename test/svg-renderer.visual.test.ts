// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { Circle, Polyline, SvgRenderer, Vector2 } from '../src';

describe('visual: SVG renderer structure', () => {
  it('renders circles and polylines into SVG elements', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new SvgRenderer(svg);
    const scene = new Circle(10).moveTo(new Vector2(20, 30)).add(new Polyline([new Vector2(0, 0), new Vector2(5, 5)]));
    renderer.resize(100, 100);
    renderer.beginFrame();
    renderer.renderMobject(scene);
    renderer.endFrame();
    expect(svg.querySelector('circle')).not.toBeNull();
    expect(svg.querySelector('polyline')).not.toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 0 100 100');
  });

  it('preserves an explicit zero stroke width', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new SvgRenderer(svg);
    const circle = new Circle(10).setStyle({ strokeWidth: 0, fill: '#fff' });
    renderer.beginFrame();
    renderer.renderMobject(circle);
    renderer.endFrame();
    expect(svg.querySelector('circle')?.getAttribute('stroke-width')).toBe('0');
  });
});
