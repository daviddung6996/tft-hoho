---
name: animations
description: Frame-based animation fundamentals for Remotion
---

All animations MUST be driven by `useCurrentFrame()`.
Write durations in seconds and multiply by `fps` from `useVideoConfig()`.

```tsx
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return <div style={{ opacity }}>Hello</div>;
};
```

## FORBIDDEN Patterns

These will NOT render correctly in video output:

- CSS `animation` / `@keyframes` — FORBIDDEN
- CSS `transition` — FORBIDDEN
- Tailwind animation classes — FORBIDDEN
- `setTimeout` / `setInterval` — FORBIDDEN
- `requestAnimationFrame` — FORBIDDEN
- `useState` for animation values — FORBIDDEN (derive from frame)

## Correct Patterns

```tsx
// WRONG: CSS animation
<div style={{ animation: "fadeIn 1s ease" }}>

// CORRECT: interpolate from frame
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});
<div style={{ opacity }}>

// WRONG: useState for animation
const [scale, setScale] = useState(0);
useEffect(() => { setScale(1); }, []);

// CORRECT: derive from frame
const scale = spring({ frame, fps, config: { damping: 200 } });
<div style={{ transform: `scale(${scale})` }}>
```

## Multi-phase Animation

Create helper for timeline phases:

```tsx
function phase(frame: number, startSec: number, durSec: number, fps: number) {
  const start = Math.round(startSec * fps);
  const end = start + Math.round(durSec * fps);
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// Usage
const avatarIn = phase(frame, 0.5, 0.8, fps);   // 0.5s → 1.3s
const wingsIn  = phase(frame, 1.0, 0.8, fps);   // 1.0s → 1.8s
const iqIn     = phase(frame, 1.5, 0.9, fps);   // 1.5s → 2.4s
```
