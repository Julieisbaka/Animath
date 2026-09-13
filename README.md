# Animath

Animath is a typed, framework-agnostic TypeScript library for creating interactive mathematical animations in the browser. It combines immutable math primitives, a seekable animation timeline, a hierarchical scene graph, SVG/Canvas renderers, calculus visualizations, and optional React bindings in one npm package.

## Highlights

- **Math:** `Vector2`, `Vector3`, affine `Matrix3`, and cubic Bézier curves.
- **Animation:** `Tween`, `Spring`, `Sequence`, `Parallel`, `Timeline`, easing, and fade effects.
- **Scene graph:** parent-aware transforms, styles, circles, and polylines.
- **Rendering:** SVG for inspectable vector output and Canvas 2D for fast raster rendering.
- **Formula rendering:** KaTeX-backed `Tex` and `MathTex` objects.
- **Calculus:** axes, coordinate conversion, Cartesian/parametric/polar plots, tangents, areas, Riemann rectangles, and vector fields.
- **React:** optional `animath/react` components and hooks.

## Installation

```text
npm install animath
```

React applications may also install React if it is not already present:

```text
npm install react react-dom
```

React is an optional peer dependency. Core users do not load React code.

## Quick start

```ts
import { Circle, Timeline, Tween, Vector2 } from 'animath';

const scene = new Circle(24)
  .moveTo(new Vector2(80, 80))
  .setStyle({ fill: '#38bdf8', stroke: '#bae6fd' });

const timeline = new Timeline().add(new Tween({
  duration: 2,
  onUpdate: (progress) => scene.moveTo(new Vector2(80 + progress * 400, 80))
}));

timeline.play();
```

In a browser, create an `SvgRenderer` or `Canvas2DRenderer`, call `beginFrame()`, render the scene, and call `endFrame()` from your animation loop. See the live demos and typed API reference in `docs/`.

## React

```tsx
import { AnimathPlayer, useAnimathScene } from 'animath/react';

function Example({ timeline }: { timeline: Timeline }) {
  const scene = useAnimathScene(() => new Circle(24));
  return <AnimathPlayer scene={scene} timeline={timeline} renderer="svg" />;
}
```

The React entrypoint is an adapter, not a replacement for the core API. It owns browser lifecycle concerns while scenes, timelines, and renderers remain framework-independent.

## Development

```text
npm install
npm run typecheck
npm test
npm run build
npm run demo
```

The demo server is available at `http://localhost:4173` and includes the core demo, React demo, documentation, calculus playground, and API reference.

## Documentation

- `/docs/` — product overview and links
- `/docs/getting-started.html` — installation and first scene
- `/docs/calculus.html` — interactive plotting playground
- `/docs/react.html` — React adapter guide
- `/docs/api.html` — typed API reference

## Compatibility and security

The core math and timeline modules are runtime-neutral. DOM renderers, KaTeX formulas, and React bindings require a browser environment. Formula input is passed to KaTeX with `trust: false`; applications should still treat user-provided expressions as untrusted data. The development server applies a restrictive content security policy, MIME sniffing protection, and referrer policy.

Run `npm audit` before publishing or deploying. Dependency advisories should be reviewed and upgraded deliberately rather than hidden with forced upgrades.

## License

This project is currently unpublished and does not yet declare a license. Add a license before distributing it publicly.
