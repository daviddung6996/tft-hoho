# ARCHITECTURE.md

> Runtime architecture as it exists today. Describe the real system, not the ideal one.

## 1. System Overview

TFTISEASY is currently a **frontend-first React/Vite app** deployed on **Cloudflare Pages**.

The app runtime is split into 4 practical layers:

1. **Client app (`src/`)**
   React 18 + Vite single-page app. This is the real application core.
2. **Supabase**
   Primary backend for auth, data storage, RLS, and most business operations. The client calls Supabase directly.
3. **Edge/server helpers**
   - `functions/`: Cloudflare Pages Functions for SEO/canonical/robots handling.
   - `supabase/functions/`: Supabase Edge Functions for AI/server-side helpers.
4. **Local backend skeleton (`backend/`)**
   Present in repo, but not the main runtime path today. Treat it as a stub/in-progress server layer, not the active backend.

## 2. Current Runtime Flow

### App boot

- `src/main.tsx` mounts the app inside:
  - `AuthProvider`
  - `GameDataProvider`
- `src/App.tsx` is the top-level shell and coordinates:
  - auth modal visibility
  - puzzle vs video-library view
  - puzzle progression
  - admin modal
  - profile/support/settings modals

### Puzzle gameplay

- `usePuzzleGame` owns the puzzle pool and access layer:
  - fetch puzzles from Supabase
  - fallback to local `PUZZLE_SCENARIOS` if needed
  - deep-link via `?puzzle=...`
  - completion tracking
  - tier/unlock checks
- `useGameFlow` owns the per-puzzle state machine:
  - `declaring_intent`
  - `declaring_plan`
  - `selecting`
  - `reviewing`
- `usePuzzleToPlayers` converts raw puzzle data into renderable lobby/player state for the board and HUD.

### Data access

- The client talks to Supabase directly through service modules in:
  - `src/services/*`
  - `src/features/*/*.service.ts`
- Admin actions use the same client-side services, with role checks plus Supabase RLS.
- There is no separate API gateway/BFF in active use today.

## 3. Directory Map

```text
src/
  App.tsx                     # Main application shell
  contexts/                   # Auth + shared game-data bootstrap
  hooks/                      # Cross-feature gameplay hooks
  components/                 # Legacy/global UI folders used heavily by the app
  pages/Admin/                # Admin console + Puzzle Builder
  services/                   # Legacy/global Supabase CRUD services
  features/                   # Newer domain-oriented modules
  remotion/                   # Flex/share card compositions
  utils/                      # Pure helpers and data transforms
  data/                       # Static fallback/mock/game data
  lib/                        # Supabase client + TS schema types
  styles/                     # Shared CSS

functions/                    # Cloudflare Pages Functions
supabase/
  migrations/                 # Database schema and policy migrations
  functions/                  # Supabase Edge Functions

backend/
  features/auth/              # Stubbed Node/Express-style backend module
```

## 4. Frontend Organization Reality

The frontend is **hybrid**, not purely feature-sliced.

Current code lives in three parallel shapes:

1. `src/features/*`
   Newer business domains such as:
   - `augment-trainer`
   - `tcoin`
   - `user-iq`
   - `video-library`
   - `share`
   - `pro-supporter`
2. `src/components/*`
   Older but still first-class UI areas:
   - `Arena`
   - `Game`
   - `Sidebar`
   - `Settings`
   - `Auth`
   - `common`
3. `src/services/*`
   Older shared Supabase CRUD modules for champions/traits/items/augments/puzzles/stats/votes.

Do **not** rewrite docs or code under the assumption that everything already lives cleanly under `src/features/*`. That is a target direction, not the current state.

## 5. State Management Boundaries

The project uses React state/hooks rather than a global state library.

- `AuthContext`
  session, user profile, guest mode, role/capability flags
- `GameDataContext`
  shared reference datasets: champions, items, traits, augments
- Local state in `App.tsx`
  screen and modal orchestration
- Feature hooks
  domain state machines and async coordination

This keeps the app simple, but it also means `App.tsx` is an orchestration-heavy container.

## 6. Backend and Infrastructure Boundaries

### Supabase

Supabase is the real backend today:

- auth/session persistence
- user profiles and roles
- puzzle storage
- votes/history/attempt analytics
- IQ history
- T-Coin wallet and transactions
- unlock tables
- video unlocks
- RLS enforcement

### Cloudflare Pages Functions

`functions/` is used for deployment-edge concerns, not business logic:

- `_middleware.ts`: canonical tags, robots/noindex behavior
- `robots.txt.ts`: environment-specific robots response

### Supabase Edge Functions

`supabase/functions/` is reserved for server-side helpers.

Current repo state:

- `generate-caption` exists
- client share/admin AI flows still call Gemini directly from the browser in some places

That means AI integration is currently split across **client-side direct calls** and **server-side edge function capability**.

### Local backend (`backend/`)

`backend/features/auth/*` follows the intended `Controller -> Service -> Repo` shape, but it is not yet the production path for the app. Do not document this folder as if the user-facing product depends on it.

## 7. Deployment Model

- Frontend build: `vite build`
- Hosting: Cloudflare Pages
- Production domain shape: root deployment on `training.tftiseasy.com`
- SPA routing: `public/_redirects` uses `/* /index.html 200`
- Cache policy: `public/_headers`

Important: this app is deployed at the domain root, not under `/training/`.

## 8. Testing Reality

Testing exists but is selective, not exhaustive.

Current automated coverage is concentrated in:

- core hooks
- normalization utilities
- synergy calculation
- user stats service

There is no large integration/E2E layer in the repo today.

## 9. Practical Rules For New Code

1. Prefer extending existing runtime patterns over forcing a full architectural rewrite.
2. Frontend business logic can live in feature hooks/services when that is already the dominant path.
3. If logic is security-sensitive or secret-bearing, move it to Supabase Edge Functions instead of browser-only code.
4. Keep Supabase schema, migrations, and TypeScript types in sync.
5. Treat `backend/` as optional/in-progress unless the feature explicitly needs a separate server.
6. When documenting the repo, distinguish clearly between:
   - current runtime architecture
   - desired future architecture

## 10. Current Architectural Debt

These are the main realities to keep in mind:

- The frontend is split between legacy global folders and newer feature folders.
- `App.tsx` is large because it coordinates many screens and modals directly.
- Service-layer admin role checks are duplicated across multiple client services.
- AI integrations are duplicated/drifted between browser-side Gemini calls and Supabase Edge Function capability.
- `backend/` exists but is not yet the main execution path, which can confuse readers if not stated explicitly.
