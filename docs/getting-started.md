# Getting started

Animath separates what a scene is from how it is rendered and when it changes. The same scene can therefore work in a demo, lesson, or React application.

## Install

```bash
npm install animath
```

The root entrypoint is framework-neutral. The optional React adapter lives at `animath/react` and is not required for SVG, Canvas, math, or timeline usage.

## 1. Create a scene

```ts
import { Circle, Vector2 } from 'animath';

const ball = new Circle(24)
  .moveTo(new Vector2(80, 100))
  .setStyle({ fill: '#c9973f', stroke: '#f0efe9', strokeWidth: 2 });
```

`Mobject` instances hold transforms, styles, and children. Add a child to a parent to compose transforms hierarchically.

## 2. Animate deterministically

```ts
const timeline = new Timeline().add(new Tween({
  duration: 1.5,
  easing: easeInOutQuad,
  onUpdate: (progress) => {
    ball.moveTo(new Vector2(80 + progress * 500, 100));
  }
}));

timeline.play();
// In your frame loop:
timeline.tick(deltaSeconds);
```

Use `seek(time)` for scrubbers and tests. Use `Sequence` and `Parallel` to compose tracks. Timeline times and deltas must be finite numbers.

## 3. Render a frame

```ts
const renderer = new SvgRenderer(svgElement);
renderer.resize(800, 400);
renderer.beginFrame();
renderer.renderMobject(ball);
renderer.endFrame();
```

Swap `SvgRenderer` for `Canvas2DRenderer` when you prefer raster throughput over DOM inspectability. Both renderers reuse state between frames. Call `dispose()` when a renderer is no longer needed.

## Next steps

- Open the [interactive calculus lab](./calculus.html).
- Try the [core example](./examples/core.html).
- Read the [React adapter guide](./react.md).
- Browse the [API reference](./api.md).
