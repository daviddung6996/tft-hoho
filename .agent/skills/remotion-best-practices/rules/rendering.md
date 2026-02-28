---
name: rendering
description: Rendering video, stills, and server-side generation with Remotion
---

## CLI Render

```bash
# MP4 video
npx remotion render FlexCard out/flex.mp4

# With custom props
npx remotion render FlexCard out/flex.mp4 \
  --props='{"playerName":"Luc","iq":2100,"rank":"Challenger"}'

# PNG still (specific frame)
npx remotion still FlexCard out/flex-card.png --frame=149

# High-res still (2x scale)
npx remotion still FlexCard out/flex-card.png --frame=149 --scale=2
```

## Programmatic Rendering

```tsx
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, getCompositions } from "@remotion/renderer";
import path from "path";

async function render(props: Record<string, unknown>) {
  const bundled = await bundle({
    entryPoint: path.resolve("./src/index.ts"),
  });

  const comps = await getCompositions(bundled);
  const comp = comps.find((c) => c.id === "FlexCard")!;

  // Render video
  await renderMedia({
    composition: comp,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: "out/flex.mp4",
    inputProps: props,
  });

  // Extract last frame as flex image
  await renderStill({
    composition: comp,
    serveUrl: bundled,
    frame: comp.durationInFrames - 1,
    output: "out/flex-card.png",
    inputProps: props,
    imageFormat: "png",
    scale: 2,
  });
}
```

## Server-side (API endpoint for tftiseasy.com)

```tsx
import { bundle } from "@remotion/bundler";
import { renderStill, getCompositions } from "@remotion/renderer";

// Cache the bundle (expensive, do once at startup)
let bundledUrl: string;

async function init() {
  bundledUrl = await bundle({ entryPoint: "./src/index.ts" });
}

async function generateFlexCard(userId: string, data: PlayerData) {
  const comps = await getCompositions(bundledUrl);
  const comp = comps.find((c) => c.id === "FlexCard")!;

  const outputPath = `/tmp/flex-${userId}.png`;

  await renderStill({
    composition: comp,
    serveUrl: bundledUrl,
    frame: comp.durationInFrames - 1,
    output: outputPath,
    inputProps: {
      playerName: data.name,
      iq: data.iq,
      rank: getRank(data.iq),
      topPercent: data.topPercent,
      region: data.region,
      avatarUrl: data.avatarUrl,
    },
    imageFormat: "png",
    scale: 2,
  });

  // Upload to Supabase Storage
  const url = await uploadToStorage(outputPath, `flex/${userId}.png`);
  return url;
}
```

## Remotion Lambda (AWS - scale to thousands)

```bash
npx remotion lambda sites create src/index.ts --site-name=tft-flex
npx remotion lambda render tft-flex FlexCard --props='{"iq":1847}'
```

## Config (remotion.config.ts)

```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");  // Best quality for stills
Config.setOverwriteOutput(true);
```

## Transparent Video

```bash
# ProRes with alpha (for editing software)
npx remotion render --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444 FlexCard out.mov

# WebM with alpha (for browser playback)
npx remotion render --image-format=png --pixel-format=yuva420p --codec=vp9 FlexCard out.webm
```
