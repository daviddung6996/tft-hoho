---
name: sequencing
description: Sequencing patterns - Sequence, Series, premounting
---

## Sequence

Delay when an element appears. Always premount!

```tsx
import { Sequence, useVideoConfig } from "remotion";

const { fps } = useVideoConfig();

<Sequence from={1 * fps} durationInFrames={2 * fps} premountFor={1 * fps}>
  <Title />
</Sequence>
<Sequence from={2 * fps} durationInFrames={2 * fps} premountFor={1 * fps}>
  <Subtitle />
</Sequence>
```

Children are wrapped in AbsoluteFill by default.
Use `layout="none"` to disable wrapping.

## Premounting

ALWAYS premount to preload content before it appears:

```tsx
<Sequence premountFor={1 * fps}>
  <HeavyComponent />
</Sequence>
```

## Series

Elements play one after another:

```tsx
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={45}><Intro /></Series.Sequence>
  <Series.Sequence durationInFrames={60}><Main /></Series.Sequence>
  <Series.Sequence durationInFrames={30}><Outro /></Series.Sequence>
</Series>
```

### Overlapping series

Negative offset:

```tsx
<Series>
  <Series.Sequence durationInFrames={60}><A /></Series.Sequence>
  <Series.Sequence offset={-15} durationInFrames={60}><B /></Series.Sequence>
</Series>
```

## Local Frame

Inside a Sequence, `useCurrentFrame()` returns local frame starting at 0:

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent /> {/* useCurrentFrame() returns 0-29, not 60-89 */}
</Sequence>
```

## Trim start

Negative `from` trims the beginning:

```tsx
<Sequence from={-0.5 * fps}>
  <MyAnimation /> {/* Starts 15 frames into its progress */}
</Sequence>
```

## Nest for trim + delay

```tsx
<Sequence from={30}>       {/* delay 30 frames */}
  <Sequence from={-15}>    {/* trim first 15 frames */}
    <MyAnimation />
  </Sequence>
</Sequence>
```
