---
name: fonts
description: Loading Google Fonts and local fonts in Remotion
---

## Google Fonts (recommended)

```bash
npx remotion add @remotion/google-fonts
```

```tsx
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

// Use in component
<div style={{ fontFamily, fontSize: 80, fontWeight: 900 }}>1847</div>
```

## Local Fonts

```bash
npx remotion add @remotion/fonts
```

Place font files in `public/fonts/`, then:

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

await loadFont({
  family: "Cinzel",
  url: staticFile("fonts/Cinzel-Bold.woff2"),
  weight: "700",
});

// Multiple weights
await Promise.all([
  loadFont({ family: "Barlow", url: staticFile("fonts/Barlow-Regular.woff2"), weight: "400" }),
  loadFont({ family: "Barlow", url: staticFile("fonts/Barlow-Bold.woff2"), weight: "700" }),
]);
```

## Wait for font load

```tsx
const { fontFamily, waitUntilDone } = loadFont();
await waitUntilDone();
```
