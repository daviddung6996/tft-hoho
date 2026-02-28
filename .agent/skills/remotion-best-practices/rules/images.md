---
name: images
description: Using images in Remotion - Img component, staticFile
---

## MUST use `<Img>` from remotion

```tsx
import { Img, staticFile } from "remotion";

<Img src={staticFile("ranks/challenger.png")} />
<Img src="https://example.com/avatar.png" />  // remote OK
```

**FORBIDDEN:** native `<img>`, Next.js `<Image>`, CSS `background-image`
These cause flickering/blank frames during render.

## Sizing

```tsx
<Img
  src={staticFile("ranks/challenger.png")}
  style={{ width: 500, height: 350, objectFit: "contain" }}
/>
```

## Dynamic paths

```tsx
<Img src={staticFile(`ranks/${rank.toLowerCase()}.png`)} />
<Img src={staticFile(`avatars/${userId}.png`)} />
```

## Get dimensions

```tsx
import { getImageDimensions, staticFile } from "remotion";

const { width, height } = await getImageDimensions(staticFile("photo.png"));
```
