# Mobile Menu Refactor SPEC

## State
- Status: `DONE`

## 1. Goal Description
Refactor the mobile menu to provide an iOS-like "Bottom Sheet" experience, reposition the menu and full-screen buttons on mobile, and remove the T-Coin display from the menu as requested.

### Requirements:
1. **Button Placement (Mobile Only):** Menu button moves to the Top Left. Fullscreen button stays on the Top Right. (Desktop remains on the Top Right for both).
2. **Bottom Sheet UX (Mobile Only):** When the menu is opened on mobile, it should slide up from the bottom occupying ~60-70% of the screen. It must have a dark overlay behind it. Users can close it by clicking the overlay.
3. **Remove T-Coin:** The T-Coin balance display will be completely removed from the menu on all platforms.

## 2. Proposed Changes

### `src/components/Settings/SettingsButton.tsx`
- **[MODIFY]**: Remove the T-Coin stat panel (`menu-stat-panel` for T-Coin).
- **[MODIFY]**: Add a backdrop overlay div that only renders when the menu is visible `isOpen`, specifically styled for mobile to catch outside clicks/taps (acting as the iOS dimming background).
- **[MODIFY]**: Add touch handlers (Swipe down to close) for the menu dropdown if feasible, or rely on clicking the backdrop.

### `src/components/Settings/SettingsButton.css` & `src/styles/mobile.css`
- **[MODIFY]**: Update the `.menu-container` and its children in `mobile.css` (inside `[data-layout-mode="phone-landscape"]` or media queries) so that:
  - The Menu button is explicitly positioned `left: env(safe-area-inset-left, 12px)`.
  - The Fullscreen button remains on the `right`.
  - Since both buttons are currently wrapped in a single `.menu-container` with `display: flex`, we will need to change `.menu-container` to `width: 100%`, `justify-content: space-between`, and swap the visual order, OR change them to `position: fixed` individually on mobile.
- **[MODIFY]**: Style the `.menu-dropdown` on mobile as a Bottom Sheet:
  - `position: fixed; bottom: 0; left: 0; right: 0; top: auto; width: 100%;`
  - `max-height: 70vh;` with `overflow-y: auto;`
  - `animation: slide-up 0.3s ease-out;`
  - `border-radius: 20px 20px 0 0;`

## 3. Tasks

- [ ] Task 1: Remove T-Coin logic & UI from `SettingsButton.tsx`.
- [ ] Task 2: Refactor layout of `Fullscreen` and `Settings` buttons so they can be split apart on Mobile (Menu on Left, Fullscreen on Right).
- [ ] Task 3: Implement Mobile Bottom Sheet styling for the menu dropdown (Fixed at bottom, 70% height, rounded top corners, slide up animation).
- [ ] Task 4: Add Mobile Backdrop Overlay for the menu (dark blurred background that closes the menu when clicked).

## 4. Verification Plan

### Manual Verification
1. Run `npm run dev`.
2. Open the app in **Desktop mode**:
   - Verify Menu and Fullscreen buttons are on the top right.
   - Click Menu -> verify it opens as a normal dropdown.
   - Verify T-Coin is no longer visible in the menu.
3. Open the app in **Mobile Landscape mode** (DevTools -> iPhone SE -> rotate):
   - Verify Menu button is on the top **left**, Fullscreen button is on the top **right**.
   - Click Menu -> verify a dark overlay appears and the menu slides up from the **bottom** (Bottom Sheet).
   - Verify the menu takes up about 70% of the height and contains a scrollbar if content overflows.
   - Click the dark overlay -> verify the menu closes.
