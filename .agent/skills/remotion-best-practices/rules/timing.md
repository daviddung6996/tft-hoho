---
name: timing
description: Interpolation, spring animations, and easing curves in Remotion
---

## interpolate

```tsx
import { interpolate } from "remotion";

// Linear 0→1 over 100 frames
const opacity = interpolate(frame, [0, 100], [0, 1]);

// Always clamp to prevent overshooting
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: "clamp",
  extrapolateLeft: "clamp",
});

// Multi-point: fade in then out
const opacity = interpolate(frame, [0, 30, 90, 120], [0, 1, 1, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

## spring

Natural motion from 0 to 1. Always use `fps` from `useVideoConfig()`.

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const scale = spring({ frame, fps });
```

### Common configs

```tsx
const smooth = { damping: 200 };                    // No bounce (reveals)
const snappy = { damping: 20, stiffness: 200 };     // Snappy (UI elements)
const bouncy = { damping: 8 };                       // Bouncy (playful)
const heavy  = { damping: 15, stiffness: 80, mass: 2 }; // Heavy, slow
```

### Delay

```tsx
const entrance = spring({
  frame,
  fps,
  delay: 20, // delay in frames
});
```

### Fixed duration

```tsx
const s = spring({ frame, fps, durationInFrames: 40 });
```

### Combining spring + interpolate

Map spring 0→1 to custom range:

```tsx
const progress = spring({ frame, fps });
const rotation = interpolate(progress, [0, 1], [0, 360]);
<div style={{ rotate: rotation + "deg" }} />;
```

### In + Out animation

```tsx
const { fps, durationInFrames } = useVideoConfig();

const inAnim = spring({ frame, fps });
const outAnim = spring({
  frame,
  fps,
  durationInFrames: 1 * fps,
  delay: durationInFrames - 1 * fps,
});
const scale = inAnim - outAnim;
```

## Easing

```tsx
import { interpolate, Easing } from "remotion";

const value = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

Convexities: `Easing.in`, `Easing.out`, `Easing.inOut`
Curves (linear → steep): `Easing.quad`, `Easing.sin`, `Easing.exp`, `Easing.circle`

Cubic bezier:
```tsx
easing: Easing.bezier(0.8, 0.22, 0.96, 0.65)
```
