---
estimated_steps: 6
estimated_files: 4
---

# T02: Make login entry intent-driven and guest-safe

**Slice:** S02 - Fast puzzle entry and interruption cleanup
**Milestone:** M001

## Description

Fix the auth interruption by making login entry intentional and guest-aware. The existing auth model already supports persisted guest mode; this task should align the App shell with that model instead of forcing login on every first auth resolution with `!user`.

## Steps

1. Review the current `showLoginModal` effect in `src/App.tsx` and the persisted `isGuest` contract in `src/contexts/AuthContext.tsx`.
2. Change the boot-time auth gate so persisted guest and clean guest sessions can reach the puzzle first.
3. Keep explicit login surfaces intact: the menu login action and locked-puzzle unlock path must still open the modal.
4. Preserve `continueAsGuest`, sign-in success, and sign-out fallback-to-guest behavior.
5. Extend app-level tests around fresh session, persisted guest, and explicit login-open actions.
6. Confirm the login modal still closes cleanly after guest or authenticated entry.

## Must-Haves

- [ ] Boot no longer auto-opens the login modal merely because `user` is null.
- [ ] Persisted `tft_guest_mode` sessions re-enter directly into the puzzle loop.
- [ ] Explicit login paths still function from the menu and lock-overlay unlock flow.

## Verification

- `npm run test -- src/App.mobile-overlay.test.tsx`
- Browser check: clear `localStorage`, refresh the desktop app, verify the puzzle shows without the login modal; then open login from the menu or a lock action and confirm the modal appears. Click `CHOI NGAY`, refresh, and confirm it stays guest-safe on repeat entry.

## Observability Impact

- Signals added/changed: boot-time `showLoginModal`, `tft_guest_mode`, explicit login-open actions.
- How a future agent inspects this: App tests, browser DOM, and `localStorage`.
- Failure state exposed: the login modal reappearing automatically on boot or disappearing from explicit login surfaces.

## Inputs

- `src/App.tsx` - current auth-driven login modal effect and menu wiring.
- `src/contexts/AuthContext.tsx` - persisted guest-mode contract and sign-out fallback behavior.
- `src/components/Auth/LoginModal.tsx` - current guest CTA and auth entry UI.
- `src/App.mobile-overlay.test.tsx` - existing App-shell test surface that can assert modal presence or absence.

## Expected Output

- `src/App.tsx` - intent-driven login gating aligned with the guest model.
- `src/contexts/AuthContext.tsx` - only minimal changes if the app gate needs a clearer guest/auth signal.
- `src/components/Auth/LoginModal.tsx` - preserved guest CTA behavior with any cleanup needed for the new entry contract.
- `src/App.mobile-overlay.test.tsx` - coverage for fresh-session, persisted-guest, and explicit login-open paths.
