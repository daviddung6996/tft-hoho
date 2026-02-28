---
name: transitions
description: Scene transitions - TransitionSeries, fade, slide, wipe
---

```bash
npx remotion add @remotion/transitions
```

## Basic Transition

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Available transitions

```tsx
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";

// Slide with direction
slide({ direction: "from-left" })  // from-left, from-right, from-top, from-bottom
```

## Timing

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

linearTiming({ durationInFrames: 20 });
springTiming({ config: { damping: 200 }, durationInFrames: 25 });
```

## Duration note

Transitions overlap scenes, so total duration = sum of scenes - sum of transitions.
