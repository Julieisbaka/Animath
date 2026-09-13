# Animath

Animath is a framework-agnostic TypeScript library for math animation on the web.
The publishable package is `animath`; framework integrations such as React will live
inside this package rather than being published as separate packages.

## Current capabilities

The `animath` package currently includes:

- immutable `Vector2` math primitives;
- `Vector3`, affine `Matrix3`, and cubic Bézier curve utilities;
- easing functions, tweens, springs, sequences, parallel tracks, and fade effects;
- a seekable, scrubbable timeline with restart support;
- a hierarchical scene graph with parent-aware transforms, `Mobject`, and `Circle`;
- pluggable SVG and Canvas 2D renderers;
- KaTeX-backed `Tex` and `MathTex` SVG scene objects.
- calculus tools including `Axes2D`, function/parametric/polar plots, tangent lines,
  area shading, Riemann rectangles, and vector fields;
- optional React bindings from `animath/react`: `AnimathCanvas`, `AnimathPlayer`,
  `useTimeline`, `useAnimathScene`, and `useMathSignal`.

## Development

Install dependencies with npm, then run the checks:

- `npm install`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm run demo` — build and serve the interactive demo at `http://localhost:4173`.
- `http://localhost:4173/react.html` — React adapter demo.
- `http://localhost:4173/docs/` — interactive documentation playground.

React is an optional peer dependency. Core users can install `animath` without React;
React users import the adapter from `animath/react`.

Renderers and `Tex` target browser environments, while timeline and math modules remain usable in Node and other JavaScript runtimes.
