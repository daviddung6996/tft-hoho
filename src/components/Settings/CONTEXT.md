# Settings And Profile Modal Context

## Purpose

Document the fixed modals and settings UI under `src/components/Settings/`, including profile, support, arena selection, and top-level settings controls.

## Read This When

- You are changing settings, profile, or support modals.
- You need the fixed-overlay modal rules and profile visual standards.
- You are touching header-level controls that open these dialogs.

## Key Entry Points

- `src/components/Settings/SettingsButton.tsx`
- `src/components/Settings/UserProfileModal.tsx`
- `src/components/Settings/SupportModal.tsx`
- `src/components/Settings/ArenaSelectorModal.tsx`

## Inbound / Outbound Dependencies

- Inbound: `src/App.tsx`, auth state, user stats, T-Coin balance, and user IQ display logic.
- Outbound: shared modal styling, `src/features/user-iq/*`, and `src/features/tcoin/*`.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`

## Rules and Invariants

- Fixed modals use the full Hextech overlay pattern with atmosphere gradients and optional backdrop blur.
- Profile and stats modals should use the brighter teal shell standard, not a pitch-black panel.
- Keep T-Coin displays wired to `TCoinIcon`.
- IQ rank color values are defined by the user IQ feature and should not be redefined here.

## Known Gotchas

- A modal that visually works with a flat black background is still wrong for this design system.
- Settings controls that drift into viewport-crop bugs are usually attached to the wrong layout layer.
- **Modals rendered inside `viewport-hud-layer` inherit `pointer-events: none`.** `SettingsButton` lives in `viewport-hud-layer`, so any modal it renders (e.g. `SupportModal`, `LoginModal`) must set `pointer-events: auto` on its overlay element. Without this, clicks pass through the modal to the game UI behind it.

## How to Verify

- `rg -n "TCoinIcon|rank-color|hex-overlay-in" src/components/Settings src/features/user-iq src/features/tcoin`
- Run the app and open the profile, support, and arena selector modals.

## Related Contexts

- `../Game/CONTEXT.md`
- `../../features/tcoin/CONTEXT.md`
- `../../features/user-iq/CONTEXT.md`
