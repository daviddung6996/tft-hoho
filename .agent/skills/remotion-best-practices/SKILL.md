---
name: remotion-tft-video
description: Use this skill whenever dealing with Remotion code for TFT video creation, flex cards, share videos, rank reveals, or any programmatic video generation with React. Triggers on any mention of Remotion, video rendering, renderMedia, renderStill, flex video, share card video, animated card, video export, MP4 from React, frame extraction, or TFT video content. Also use when setting up a Remotion project, configuring rendering, or troubleshooting Remotion issues. ALWAYS read this skill before writing any Remotion code. When creating animations, load ./rules/animations.md. When working with timing/easing/springs, load ./rules/timing.md. When sequencing scenes, load ./rules/sequencing.md. When building particle systems, load ./rules/particles.md. When rendering output, load ./rules/rendering.md.
---

# Remotion TFT Video Skill

Best practices for creating TFT flex card videos and animated content with Remotion.

## Critical Rules

1. **ALL animations MUST use `useCurrentFrame()`** — CSS animations, transitions, @keyframes are FORBIDDEN
2. **ALL timing MUST use `interpolate()` or `spring()`** — no setTimeout, setInterval, requestAnimationFrame
3. **ALL state is derived from frame** — no useState for animation values
4. **Use `<Img>` from remotion** — native `<img>` causes flickering during render
5. **Use `staticFile()` for assets** in `/public/` folder
6. **Always clamp**: `extrapolateRight: "clamp"` prevents values overshooting

## Rule Files

Read individual rule files for detailed code examples:

- [rules/animations.md](rules/animations.md) - Frame-based animation fundamentals, forbidden patterns
- [rules/timing.md](rules/timing.md) - interpolate, spring, easing curves, combining animations
- [rules/sequencing.md](rules/sequencing.md) - Sequence, Series, nesting, premounting
- [rules/particles.md](rules/particles.md) - Deterministic particle systems (gold dust, embers, Math.sin based randomness)
- [rules/vip-templates.md](rules/vip-templates.md) - **NEW:** Scaling 360x640 VIP React prototypes (SVGs, Wings, Glows) into 1080x1920 `interpolate()` logic without `useState` or `setInterval`.
- [rules/rendering.md](rules/rendering.md) - CLI render, programmatic render, Still extraction, server-side
- [rules/project-setup.md](rules/project-setup.md) - Project init, dependencies, config, folder structure
- [rules/compositions.md](rules/compositions.md) - Composition, Still, Folder, defaultProps, Zod schema
- [rules/fonts.md](rules/fonts.md) - Google Fonts, local fonts via @remotion/fonts
- [rules/images.md](rules/images.md) - Img component, staticFile, remote images
- [rules/flex-card.md](rules/flex-card.md) - TFT Flex Card architecture, timeline, layers, Hextech palette
- [rules/transitions.md](rules/transitions.md) - TransitionSeries, fade, slide, wipe, overlays

## Quick Start

```bash
npx create-video@latest tft-flex --template blank
cd tft-flex
npm i
npx remotion studio   # Preview at localhost:3000
```
