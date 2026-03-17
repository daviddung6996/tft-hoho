# Cloudflare Pages Functions Context

## Purpose

Describe the Cloudflare Pages edge helpers in `functions/`. These files handle deployment-edge behavior such as middleware, canonical tags, and robots responses.

## Read This When

- You are touching `_middleware.ts` or `robots.txt.ts`.
- You are debugging canonical, robots, or edge-hosting behavior.
- You need to distinguish Cloudflare edge helpers from Supabase Edge Functions.

## Key Entry Points

- `functions/_middleware.ts`
- `functions/robots.txt.ts`
- `public/_headers`
- `public/_redirects`

## Inbound / Outbound Dependencies

- Inbound: Cloudflare Pages request handling.
- Outbound: deployment behavior for the SPA and search-engine directives.

## Relevant Skills

- `problem-solving-pro`

## Rules and Invariants

- Keep this folder focused on hosting and edge concerns.
- Do not move business logic here when Supabase Edge Functions are the real server-side helper layer.
- Preserve the SPA deployment assumptions used by `public/_redirects` and `public/_headers`.

## Known Gotchas

- This folder is not the active business API surface.
- It is easy to confuse `functions/` with `supabase/functions/`; treat them as different runtimes with different responsibilities.

## How to Verify

- `rg --files functions public`
- Run `npm run build` to ensure the SPA build still aligns with the hosting setup.

## Related Contexts

- `../AGENTS.md`
- `../supabase/functions/CONTEXT.md`
