# Video Library Context

## Purpose

Document the video library page, unlock flow, thumbnail handling, and YouTube embedding rules.

## Read This When

- You are changing video cards, unlock progression, or playback behavior.
- You are debugging blank thumbnails or broken YouTube embeds.

## Key Entry Points

- `src/features/video-library/videoLibrary.service.ts`
- `src/features/video-library/components/VideoLibraryPage.tsx`
- `src/features/video-library/components/VideoCard.tsx`
- `src/features/video-library/components/VideoPlayerModal.tsx`
- `src/utils/youtube.ts`

## Inbound / Outbound Dependencies

- Inbound: puzzle unlock state, T-Coin and supporter entitlements, and library UI routing.
- Outbound: YouTube URL normalization and Supabase-backed library data.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`

## Rules and Invariants

- Normalize YouTube parsing through `src/utils/youtube.ts`.
- Use thumbnail fallback chains when a stored thumbnail URL is invalid.
- Keep playback and thumbnail logic aligned so the same URL formats work across the library and modal player.

## Known Gotchas

- A valid YouTube URL can still show a blank card if the thumbnail fallback chain is missing.
- Parsing logic drifts quickly when multiple components implement their own YouTube URL handling.

## How to Verify

- `rg -n "extractYouTubeVideoId|buildYouTubeEmbedUrl|maxresdefault|hqdefault|mqdefault" src/features/video-library src/utils/youtube.ts`
- Run the app, open the library, and test cards with both explicit and fallback thumbnails.

## Related Contexts

- `../tcoin/CONTEXT.md`
- `../../components/Settings/CONTEXT.md`
