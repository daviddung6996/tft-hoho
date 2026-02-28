---
name: project-setup
description: Remotion project initialization, dependencies, config, structure
---

## Init

```bash
npx create-video@latest tft-flex --template blank
cd tft-flex
npm i
npx remotion studio  # Preview at localhost:3000
```

## Install Packages

Use `npx remotion add` to install Remotion packages:

```bash
npx remotion add @remotion/google-fonts   # Google Fonts
npx remotion add @remotion/fonts          # Local fonts
npx remotion add @remotion/transitions    # Scene transitions
npx remotion add @remotion/paths          # SVG path animations
npx remotion add @remotion/media          # Video/Audio components
npx remotion add @remotion/zod-types      # Color picker in studio
```

For non-Remotion packages use npm directly:

```bash
npm i zod
```

## Project Structure

```
tft-flex/
├── package.json
├── remotion.config.ts
├── src/
│   ├── Root.tsx              # RegisterRoot - all compositions
│   ├── index.ts              # Entry: registerRoot(RemotionRoot)
│   ├── FlexCard/
│   │   ├── FlexCard.tsx      # Main composition component
│   │   ├── schema.ts         # Zod props schema
│   │   └── layers/
│   │       ├── Background.tsx
│   │       ├── Avatar.tsx
│   │       ├── RankWings.tsx
│   │       ├── IQNumber.tsx
│   │       ├── PlayerInfo.tsx
│   │       ├── Drama.tsx
│   │       ├── CTA.tsx
│   │       └── Particles.tsx
│   └── utils/
│       ├── colors.ts         # Hextech palette
│       └── helpers.ts        # phase(), seededRandom()
├── public/
│   ├── ranks/                # challenger.png, grandmaster.png, etc.
│   └── fonts/                # Local font files
└── scripts/
    └── render.ts             # Programmatic render script
```

## Entry Point (src/index.ts)

```tsx
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

## Config (remotion.config.ts)

```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
```
