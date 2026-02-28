---
name: compositions
description: Composition, Still, Folder, defaultProps, Zod schema
---

## Composition

Defines renderable video in `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { FlexCard } from "./FlexCard/FlexCard";

export const RemotionRoot = () => (
  <>
    <Composition
      id="FlexCard"
      component={FlexCard}
      durationInFrames={150}   // 5s at 30fps
      fps={30}
      width={1080}
      height={1920}            // 9:16 vertical
      defaultProps={{
        playerName: "Admin TFT",
        iq: 1847,
        rank: "Challenger",
        topPercent: 0.3,
        region: "VN",
        avatarUrl: null,
      }}
    />

    {/* Square variant for Facebook */}
    <Composition
      id="FlexCardSquare"
      component={FlexCard}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ /* same */ }}
    />
  </>
);
```

## Still

Single-frame image, no fps/duration needed:

```tsx
import { Still } from "remotion";

<Still id="FlexImage" component={FlexCard} width={1080} height={1920} />
```

## Folder

Organize in sidebar:

```tsx
import { Folder } from "remotion";

<Folder name="TFT-Cards">
  <Composition id="FlexCard" /* ... */ />
  <Composition id="RankReveal" /* ... */ />
</Folder>
```

## Zod Schema (parametrizable props)

```tsx
// schema.ts
import { z } from "zod";

export const FlexCardSchema = z.object({
  playerName: z.string(),
  iq: z.number().min(0).max(3000),
  rank: z.string(),
  topPercent: z.number(),
  region: z.string(),
  avatarUrl: z.string().nullable(),
});

// Root.tsx
<Composition
  id="FlexCard"
  component={FlexCard}
  schema={FlexCardSchema}
  defaultProps={{ playerName: "Admin TFT", iq: 1847, /* ... */ }}
  /* ... */
/>
```

Props become editable in Remotion Studio sidebar.

## calculateMetadata

Dynamic duration/dimensions based on data:

```tsx
import { CalculateMetadataFunction } from "remotion";

const calcMeta: CalculateMetadataFunction<Props> = async ({ props }) => ({
  durationInFrames: props.showDrama ? 180 : 150,
});

<Composition calculateMetadata={calcMeta} /* ... */ />
```
