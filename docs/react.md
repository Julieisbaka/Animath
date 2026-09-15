# React adapter

The core scene graph and timeline stay framework-neutral. The React entrypoint adds lifecycle management, rendering components, and reactive controls when your application needs them.

## Why a separate subpath?

Importing `animath` never requires React. React applications can opt into `animath/react` without maintaining a second package or duplicating scene primitives.

## Components

### `AnimathCanvas`

Renders a scene through SVG or Canvas. It supports an optional `ariaLabel`, a human-readable `description`, reduced-motion preferences, and an optional timeline.

### `AnimathPlayer`

Combines a scene viewport with semantic play/pause controls and a keyboard-accessible scrubber for lessons and demos.

## Hooks

- `useTimeline` connects time, duration, status, play, pause, and seek operations to React state.
- `useAnimathScene` memoizes scene construction so object identity remains stable across renders.
- `useMathSignal` is a typed state helper for sliders, parameters, and reactive mathematical values.

## Typed example

```tsx
import { AnimathPlayer, useAnimathScene } from 'animath/react';
import { Circle, Timeline, Vector2 } from 'animath';

function Lesson({ timeline }: { timeline: Timeline }) {
  const scene = useAnimathScene(() =>
    new Circle(32).moveTo(new Vector2(120, 120))
  );
  return (
    <AnimathPlayer
      scene={scene}
      timeline={timeline}
      ariaLabel="Animated lesson scene"
      description="A circle moving through the lesson coordinate space."
    />
  );
}
```

Open the [live React example](./examples/react.html) to see the adapter in action.
