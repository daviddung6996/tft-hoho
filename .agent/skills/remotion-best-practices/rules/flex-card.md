---
name: flex-card
description: TFT Flex Card video architecture - timeline, layers, Hextech palette, pro drama
---

# TFT Flex Card Video

5-second video (150 frames at 30fps), 9:16 ratio (1080x1920).
Final frame = shareable flex image.
Marketing: ego-driven viral sharing for Vietnamese TFT community.

## Composition Setup

```tsx
<Composition
  id="FlexCard"
  component={FlexCard}
  durationInFrames={150}
  fps={30}
  width={1080}
  height={1920}
  schema={FlexCardSchema}
  defaultProps={{
    playerName: "Admin TFT",
    iq: 1847,
    topPercent: 0.3,
    region: "VN",
    avatarUrl: null,
  }}
/>
```

## Layer Architecture

```tsx
import { AbsoluteFill } from "remotion";

export const FlexCard: React.FC<Props> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: HEXTECH.dark }}>
      <BackgroundLayer frame={frame} fps={fps} />
      <ParticleLayer frame={frame} fps={fps} durationInFrames={durationInFrames} />
      <AvatarLayer frame={frame} fps={fps} {...props} />
      <RankWingsLayer frame={frame} fps={fps} rank={getRank(props.iq)} />
      <IQNumberLayer frame={frame} fps={fps} iq={props.iq} />
      <PlayerInfoLayer frame={frame} fps={fps} {...props} />
      <DramaLayer frame={frame} fps={fps} {...props} />
      <CTALayer frame={frame} fps={fps} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
```

## Timeline (150 frames = 5s)

```
Frame   0-20  (0.0-0.7s): BG gradient + hex grid fade in
Frame  15-40  (0.5-1.3s): Avatar hex rises with spring
Frame  35-65  (1.2-2.2s): Rank wings scale in + glow
Frame  55-90  (1.8-3.0s): IQ number counts up
Frame  80-105 (2.7-3.5s): Name + "Top 0.3% VN" fade in
Frame  95-125 (3.2-4.2s): Drama table slides in
Frame 115-140 (3.8-4.7s): CTA appears
Frame 130-149 (4.3-5.0s): Final glow burst → FLEX FRAME at 149
```

## Layout Zones (1080x1920, no overlap)

```
Y 80-280    AVATAR hex (200px)
Y 300-560   RANK WINGS (260px)
Y 580-740   IQ NUMBER + "TFT IQ" label (160px)
Y 770-870   NAME + TOP% (100px)
Y 900-1150  DRAMA comparison (250px)
Y 1200-1350 CTA + brand (150px)
```

Scale all Y values proportionally: Y_1080 = Y_360 * 3

## Hextech VIP Palette

```tsx
export const HEXTECH = {
  bg: "#0a2830",
  bgLight: "#1a4a50",
  gold: "#e8c252",
  goldBright: "#fff4d6",
  goldDark: "#a07820",
  goldHot: "#ffe44d",
  teal: "#18eed8",
  tealBright: "#60fff0",
  tealDark: "#0c3a3e",
  dark: "#061820",
  text: "#FFF8EC",
  textDim: "#c0b898",
} as const;

export const RANK_COLORS: Record<string, { color: string; glow: string }> = {
  Iron:        { color: "#8a8a8a", glow: "#6a6a6a" },
  Bronze:      { color: "#c07838", glow: "#d08840" },
  Silver:      { color: "#a8c0d0", glow: "#b8d0e0" },
  Gold:        { color: "#e8c252", glow: "#ffd860" },
  Platinum:    { color: "#60f0d0", glow: "#40e8c0" },
  Diamond:     { color: "#7088ee", glow: "#8098ff" },
  Master:      { color: "#b868f0", glow: "#c880ff" },
  Grandmaster: { color: "#ff5858", glow: "#ff7878" },
  Challenger:  { color: "#ffd870", glow: "#ffe898" },
};

export function getRank(iq: number): string {
  if (iq >= 2000) return "Challenger";
  if (iq >= 1800) return "Grandmaster";
  if (iq >= 1600) return "Master";
  if (iq >= 1400) return "Diamond";
  if (iq >= 1200) return "Platinum";
  if (iq >= 1000) return "Gold";
  if (iq >= 800) return "Silver";
  if (iq >= 500) return "Bronze";
  return "Iron";
}
```

## IQ Counter

```tsx
const IQNumber: React.FC<{ frame: number; fps: number; iq: number }> = ({
  frame, fps, iq
}) => {
  const startFrame = Math.round(1.8 * fps); // 1.8s
  const dur = Math.round(1.2 * fps);        // 1.2s count-up

  const progress = interpolate(frame, [startFrame, startFrame + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayIQ = Math.round(progress * iq);

  return (
    <div style={{
      position: "absolute", top: 580, width: "100%", textAlign: "center",
      opacity,
    }}>
      <div style={{
        fontFamily: "Playfair Display", fontSize: 240, fontWeight: 900,
        color: HEXTECH.goldBright,
        textShadow: `0 0 60px ${HEXTECH.goldHot}40, 0 4px 8px rgba(0,0,0,0.7)`,
      }}>
        {displayIQ.toLocaleString()}
      </div>
    </div>
  );
};
```

## Pro Drama Comparison

```tsx
const PRO_BENCHMARKS = [
  { name: "Dishsoap", iq: 1750, region: "NA" },
  { name: "k3soju", iq: 1900, region: "NA" },
  { name: "Bebe872", iq: 1950, region: "TW" },
  { name: "Setsuko", iq: 2050, region: "EUW" },
  { name: "Milk", iq: 2100, region: "KR" },
];

// Find beaten pro + next target
const beaten = PRO_BENCHMARKS.filter(p => userIQ > p.iq);
const topBeaten = beaten[beaten.length - 1];
const nextTarget = PRO_BENCHMARKS.find(p => p.iq > userIQ);

// Layout: 3 rows
// VUOT  | k3soju    NA  | 1900    (dim)
// YOU   | Admin TFT     | 1847    (highlighted, gold border-left)
// TIEP  | Bebe872   TW  | 1950    (dim)
// -103 IQ (teal, centered)
```

## Final Frame = Flex Image

Frame 149 is the most visually impressive:
- All elements fully visible
- Gold glow at maximum intensity
- Particle density doubled
- Drop shadows brightened
- Box shadow pulsing

Extract with:
```bash
npx remotion still FlexCard out/flex-card.png --frame=149 --scale=2
```

## Caption Templates (auto-generated)

```tsx
const captions = [
  `TFT IQ ${iq} — Cao hon ${topBeaten.name}. Ban? #TFTISEASY`,
  `Top ${topPercent}% VN 💎 tftiseasy.com`,
  `Con ${nextTarget.iq - iq} IQ nua vuot ${nextTarget.name} 🔥`,
];
```

## Design Principles (ALL Templates)

1. **Identity > Stats** — IQ hero number is the biggest element
2. **Ego trigger** — Pro comparison or drama quotes create viral sharing
3. **Low cognitive load** — Max 5 info items on card
4. **Share friction low** — 9:16 native for TikTok/Story, caption ready
5. **Brand muted** — tftiseasy.com small, player-first design
6. **Final frame = best frame** — glow intensifies toward end

## Template System

Multiple templates selected randomly via `FlexCardSelector`:
- **Template A** (`FlexCardCanvas.tsx`): Classic — avatar hex, wings, drama table
- **Template B** (`FlexCardCyber.tsx`): Cyber Hextech — giant IQ, circuit BG, drama quotes

All templates MUST implement `FlexCardCanvasRef` interface:
```tsx
interface FlexCardCanvasRef {
  jumpToEnd: () => void;
  play: () => void;
  getContainer: () => HTMLDivElement | null;
  isPlaying: () => boolean;
}
```

## Mandatory Rules for New Templates

### Branded Terms (NEVER translate)
- **"TFT IQ"** — branded term, always in English
- **"Rank"** — gaming term understood by VN community, never say "Hạng"
- **"TFTISEASY"** — brand name

### Vietnamese Rank Names (ALWAYS use)
| English | Vietnamese | Abbreviation |
|---------|-----------|--------------|
| Iron | Sắt | SẮT |
| Bronze | Đồng | ĐỒN |
| Silver | Bạc | BẠC |
| Gold | Vàng | VÀN |
| Platinum | Bạch Kim | BẠC |
| Diamond | Kim Cương | KIM |
| Master | Cao Thủ | CAO |
| Grandmaster | Đại Cao Thủ | ĐẠI |
| Challenger | Thách Đấu | THÁ |

### Text & Language
- **Thuần Việt có dấu** — All Vietnamese text MUST have diacritics
- **No AI blue text** — NEVER use teal/cyan (#18eed8) for text. Use gold (#e8c252, #fff4d6, #d4b058)
- **Emphasis = Gold** — Important text uses goldBright (#fff4d6) with textShadow
- **No English gaming slang** — No "GG", "go next", "meta". Use Vietnamese equivalents

### Visual Rules
- **Brightness** — Card must not look dark/muddy. Use bgLight (#1e5560) or higher for top gradients
- **Gold-dominant accents** — Borders, corners, dividers, embers must be gold family
- **Teal only for BG effects** — Teal (#18eed8) allowed ONLY for subtle BG glows, never text/borders
- **Highlights** — All target stats or key metrics MUST use Luxurious Gold (`#fff4d6` or `#e8c252`) and must have heavy `textShadow` for a glowing neon effect.
- **Negative Metrics Forbidden** — NEVER show negative metrics (e.g., "-150 IQ"). Replace missing scores or gaps with playful drama quotes instead.

### Drama & Engagement (from NotebookLM research)
- **Tone: "toxic tích cực" / "mỏ hỗn"** — Sassy, provocative, playfully arrogant
- **Every card must have a drama element** — Either pro comparison table OR provocative quote
- **Quotes adapt to IQ tier:**
  - **High (≥1800):** Cocky war — "Mang vở ra mà chép giáo án", "Out trình mẹ tư duy bọn Cao Thủ"
  - **Mid (≥1200):** Competitive — "Đang leo, đừng chọc", "Chê không thèm bú meta"
  - **Low (<1200):** Motivational with edge — "Sắt rách thì sao? Não vẫn to"
- **Rotate content** — Use `useState(() => random())` for stable random selection

### Muted Branding & CTA (from NotebookLM)
- **Brand logo** — `tftiseasy.com` must appear at the footer in a Faded Gold color (`H.gold` + `opacity: 0.6`).
- **No Generic Prompts** — Do not use generic, cheap CTAs like "Bạn IQ bao nhiêu?". The card must feel like an exclusive badge, not an advertisement. 
- **Share friction low** — 9:16 layout limits reading, so typography must stay strictly as ambient atmosphere in the footer.
