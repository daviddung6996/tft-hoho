---
name: particles
description: Deterministic particle systems for Remotion - gold dust, embers, sparkles
---

## Key Principle

Particles MUST be deterministic (same frame = same visual).
Use seed-based pseudo-random, NOT `Math.random()` at render time.

```tsx
// Seed-based deterministic random
function seededRandom(seed: number, n: number): number {
  return ((Math.sin(seed * n * 1337) * 43758.5453) % 1 + 1) % 1;
}
```

## Gold Dust (Rising particles)

```tsx
import { useCurrentFrame, interpolate } from "remotion";

const GoldDust: React.FC<{ count?: number }> = ({ count = 40 }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => seededRandom(i, n);
        const startX = r(1) * 100;       // % horizontal
        const speed = 0.4 + r(2) * 0.6;  // px per frame
        const drift = (r(3) - 0.5) * 0.7;
        const size = 1 + r(4) * 2.5;
        const delay = r(5) * 60;         // frame delay
        const cycle = 80 + r(6) * 70;    // cycle length

        const local = frame - delay;
        if (local < 0) return null;

        const t = local % cycle;
        const x = startX + drift * t;
        const y = 100 - speed * t;

        const opacity = interpolate(t,
          [0, 8, cycle - 15, cycle],
          [0, 0.6, 0.2, 0],
          { extrapolateRight: "clamp" }
        );

        if (y < -5) return null;

        return (
          <div key={i} style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: r(7) > 0.5 ? "#ffe44d" : "#e8c252",
            opacity,
          }} />
        );
      })}
    </>
  );
};
```

## Horizontal Embers (Drifting particles)

```tsx
const Embers: React.FC<{ count?: number }> = ({ count = 30 }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => seededRandom(i, n);
        const startY = r(1) * 100;
        const speed = 0.8 + r(2) * 1.2;
        const driftY = (r(3) - 0.5) * 0.3;
        const size = 1 + r(4) * 2.5;
        const delay = r(5) * 80;
        const cycle = 70 + r(6) * 80;

        const local = frame - delay;
        if (local < 0) return null;

        const t = local % cycle;
        const x = (speed * t / cycle) * 110 - 5; // left to right %
        const y = startY + driftY * t;

        const opacity = interpolate(t,
          [0, 8, cycle - 15, cycle],
          [0, 0.5, 0.25, 0],
          { extrapolateRight: "clamp" }
        );

        return (
          <div key={i} style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: r(7) > 0.4 ? "#ffe44d" : "#18eed8",
            opacity,
          }} />
        );
      })}
    </>
  );
};
```

## Glow Pulse (Final frame intensification)

```tsx
const { durationInFrames } = useVideoConfig();

// Glow intensifies toward final frame
const finalGlow = interpolate(
  frame,
  [durationInFrames - 30, durationInFrames - 1],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

// Apply to shadows, particle opacity, border brightness
<div style={{
  filter: `drop-shadow(0 0 ${10 + finalGlow * 25}px rgba(255,228,77,${0.2 + finalGlow * 0.4}))`,
}}>
```

## Sparkle Burst

Short-lived sparkles at a specific moment:

```tsx
const Sparkles: React.FC<{ triggerFrame: number; count?: number }> = ({
  triggerFrame, count = 15,
}) => {
  const frame = useCurrentFrame();
  const local = frame - triggerFrame;
  if (local < 0 || local > 40) return null;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => seededRandom(i, n);
        const angle = r(1) * Math.PI * 2;
        const dist = r(2) * 80 * (local / 40);
        const x = 50 + Math.cos(angle) * dist;
        const y = 50 + Math.sin(angle) * dist;
        const opacity = interpolate(local, [0, 5, 30, 40], [0, 1, 0.5, 0]);

        return (
          <div key={i} style={{
            position: "absolute",
            left: `${x}%`, top: `${y}%`,
            width: 2, height: 2, borderRadius: "50%",
            backgroundColor: "#ffe44d",
            opacity,
          }} />
        );
      })}
    </>
  );
};
```
