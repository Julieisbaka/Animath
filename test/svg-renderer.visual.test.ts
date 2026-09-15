// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { Circle, Polyline, SvgRenderer, Tex, Vector2 } from '../src';

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

  it('reuses DOM nodes across frames and only updates changed mobjects', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new SvgRenderer(svg);
    const root = new Circle(0).setStyle({ opacity: 0 });
    const moving = new Circle(5).moveTo(new Vector2(10, 10));
    const still = new Circle(8).moveTo(new Vector2(50, 50));
    root.add(moving, still);

    const frame = () => { renderer.beginFrame(); renderer.renderMobject(root); renderer.endFrame(); };
    frame();
    const before = Array.from(svg.querySelectorAll('circle'));
    expect(before).toHaveLength(2);

    moving.moveTo(new Vector2(99, 99));
    frame();
    const after = Array.from(svg.querySelectorAll('circle'));
    // Same DOM nodes are reused — no full-frame rebuild.
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    // Only the moved circle's transform changed.
    expect(after[0]!.getAttribute('transform')).toContain('99');
    expect(after[1]!.getAttribute('transform')).toContain('50');
  });

  it('prunes nodes whose mobjects were removed from the scene', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new SvgRenderer(svg);
    const root = new Circle(0).setStyle({ opacity: 0 });
    const child = new Circle(5);
    root.add(child);
    renderer.beginFrame(); renderer.renderMobject(root); renderer.endFrame();
    expect(svg.querySelectorAll('circle')).toHaveLength(1);
    root.remove(child);
    renderer.beginFrame(); renderer.renderMobject(root); renderer.endFrame();
    expect(svg.querySelectorAll('circle')).toHaveLength(0);
  });

  it('updates formula transforms and styles across frames', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new SvgRenderer(svg);
    const formula = new Tex('x').moveTo(new Vector2(10, 20));

    const frame = () => { renderer.beginFrame(); renderer.renderMobject(formula); renderer.endFrame(); };
    frame();
    const formulaSvg = svg.querySelector('svg');
    expect(formulaSvg).not.toBeNull();
    expect(formulaSvg?.getAttribute('transform')).toContain('10');

    formula.moveTo(new Vector2(40, 50)).setStyle({ opacity: 0.25 });
    frame();
    expect(formulaSvg?.getAttribute('transform')).toContain('40');
    expect(formulaSvg?.getAttribute('opacity')).toBe('0.25');
  });

  it('removes SVG style attributes when styles are cleared', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new SvgRenderer(svg);
    const circle = new Circle(5).setStyle({ stroke: '#fff' });

    renderer.beginFrame(); renderer.renderMobject(circle); renderer.endFrame();
    const node = svg.querySelector('circle');
    expect(node?.getAttribute('stroke')).toBe('#fff');

    circle.setStyle({ stroke: undefined });
    renderer.beginFrame(); renderer.renderMobject(circle); renderer.endFrame();
    expect(node?.hasAttribute('stroke')).toBe(false);
  });

  it('reconciles SVG child order when scene order changes', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new SvgRenderer(svg);
    const root = new Circle(0);
    const first = new Circle(5);
    const second = new Circle(6);
    root.add(first, second);

    const frame = () => { renderer.beginFrame(); renderer.renderMobject(root); renderer.endFrame(); };
    frame();
    const initial = Array.from(svg.querySelectorAll('circle'));
    root.remove(first).add(first);
    frame();
    const reordered = Array.from(svg.querySelectorAll('circle'));
    expect(reordered[0]).toBe(initial[1]);
    expect(reordered[1]).toBe(initial[0]);
  });
});
