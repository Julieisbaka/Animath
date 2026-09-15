# API reference

Every symbol below is exported from the package root unless marked as part of the optional `animath/react` subpath.

## Math primitives

- `Vector2`, `Vector3`: immutable Cartesian values with `add`, `sub`, `scale`, `length`, `normalized`, and `lerp`.
- `Matrix3`: 2D transforms with `translation(Vector2)`, `rotation(number)`, `scaling(Vector2)`, `multiply`, and `transformPoint`.
- `CubicBezier`: curves with `pointAt(t)`, `derivativeAt(t)`, `split(t)`, and `sample(segments)`.

## Animation

`TweenOptions` is `{ duration: number; easing?: Easing; onUpdate?: (progress: number) => void }`. `Tween` clamps progress to `[0, 1]` and rejects invalid durations.

`Timeline` supports `add`, `play`, `pause`, `seek(seconds)`, `tick(deltaSeconds)`, `restart(play?)`, and `subscribe(listener)`. Seek times and tick deltas must be finite. `Sequence`, `Parallel`, and `Spring` implement the animation contract.

## Scene and rendering

`Mobject` owns position, rotation, scale, style, children, and parent-aware world transforms. `Circle` and `Polyline` are built-in shapes. Geometry and style inputs are validated before rendering.

`Renderer<TElement>` defines `element`, `resize`, `beginFrame`, `renderMobject`, `endFrame`, and `dispose`. `SvgRenderer` targets `SVGSVGElement`; `Canvas2DRenderer` targets `HTMLCanvasElement` and scales for high-DPI displays.

## Calculus

`Axes2D` exposes `coordsToPoint(x: number, y: number): Vector2` and `pointToCoords(point: Vector2): Vector2`.

Plot helpers include `plotFunction`, `plotParametric`, `plotPolar`, `TangentLine`, `AreaUnderCurve`, `riemannRectangles`, and `vectorField`.

Invalid ranges, dimensions, sample counts, spacing values, and non-finite scene inputs throw `RangeError`.

Try the [interactive calculus lab](./calculus.html).

## React subpath

Import `AnimathCanvas`, `AnimathPlayer`, `useTimeline`, `useAnimathScene`, and `useMathSignal` from `animath/react`. React is an optional peer dependency.
