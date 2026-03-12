---
name: ui-consistency
description: Use this skill to ensure all new CSS, HTML, and UI elements match the established "Glassmorphism" aesthetic of the Radio-Stream-Player, adhering to existing CSS variables and responsive breakpoints.
---

# Instructions
You are an expert Frontend Developer and UI/UX Designer. Use this skill whenever you are tasked with creating new UI components, styling `.html` files, or adding rules to `styles.css` within the `Radio-Stream-Player` project.

## 1. Core Principles
1.  **Premium Glassmorphism:** The core visual identity is deep frosted glass (20px blur). Avoid solid, opaque backgrounds.
2.  **Contextual Opacity:**
    - **Light Mode:** Use higher opacity (e.g., `0.85`) for text readability.
    - **Dark Mode:** Use lower opacity (e.g., `0.6`) with light text.
3.  **Haptic Animations:** Use subtle scale-ups (`1.05x`) for hover states on primary interactives.
4.  **No Frameworks:** Vanilla CSS3 only.

## 2. Design Tokens & Variables
Always use these CSS variables defined in `:root` and `.dark-theme`:

*   `var(--primary-color)`: The main accent color (Blue in light mode, lighter blue in dark mode). Use for active states, slider thumbs, important buttons.
*   `var(--primary-hover)`: Hover state for primary actions.
*   `var(--text-color)`: All standard text.
*   `var(--bg-color)`: The solid fallback background (usually hidden behind the background image).
*   `var(--console-bg)`: A slightly offset background color for inner elements (like inputs, secondary buttons) that sit *on top of* the glass cards.
*   `var(--card-bg)`: Use sparingly; primarily for borders or box-shadow halos.
*   `var(--border-color)`: Used for subtle outlines around glass cards and inputs.
*   `var(--card-shadow)`: The standard drop shadow for main elements.

## 3. The Glassmorphism Recipe
When creating a main container, apply this "Premium" formula:

```css
  /* Light Mode Formula */
  background: rgba(255, 255, 255, 0.85); /* High opacity for text contrast */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3);
```

For **Dark Mode**, use:
```css
  background: rgba(17, 24, 39, 0.6);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.05);
```

## 4. Form & Interactive Standards
1.  **Inputs/Selects:** Use `background: rgba(0, 0, 0, 0.2)` (light) or `rgba(0, 0, 0, 0.4)` (dark).
2.  **Selects:** Must use custom SVG background arrows; never default browser arrows.
3.  **Focus States:** `box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1)` on primary color borders.
4.  **Scrollbars:** Always use custom slim scrollbars:
```css
.element::-webkit-scrollbar { width: 6px; }
.element::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
```

## 5. Responsive Breakpoints (3-tier system)

The project uses three breakpoints. Always design desktop-first; use these media queries to adapt downward.

| Breakpoint | Target | Key Rules |
|---|---|---|
| `max-width: 768px` | Tablet | Reduce padding, enforce 44px touch targets, tighten ad margin |
| `max-width: 500px` | Mobile (primary) | Full layout overhaul — see §6 below |
| `max-width: 350px` | Very small | Hide ads, maximum compression |

## 6. Mobile-First Rules (≤ 500px)

These patterns are **mandatory** for all mobile UI work:

### Layout
- Player card: `flex-direction: column`, `width: calc(100% - 24px)`, no horizontal centering constraint.
- `.main-content`: `height: auto; min-height: 100vh; overflow: visible` — allows the ad below the fold to be scrolled to.
- `body`: `overflow: auto` — overrides the desktop `overflow: hidden` so mobile users can scroll.

### iOS-Specific Gotchas
- **`background-attachment: fixed` is broken on iOS Safari** — it causes the wallpaper to flash white or scroll with content. Fix:
  ```css
  @media (max-width: 768px) {
      body { background-attachment: scroll; }
      body::before {
          content: '';
          position: fixed; inset: 0; z-index: -1;
          background-image: inherit;
          background-size: cover; background-position: center;
      }
  }
  ```
- **Safe area insets** — Always account for the iPhone notch/Dynamic Island and home indicator:
  ```css
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  ```
  Apply to: `.tool-header`, `.main-content`, `.settings-content` (bottom sheet).

### Touch Targets & Feedback
- **Minimum touch target:** `min-width: 48px; min-height: 48px` on all interactive buttons.
- **Tap feedback (`:active` state):** Every tappable element must have a visible response:
  ```css
  .console-btn:active, .theme-btn:active {
      transform: scale(0.93);
      opacity: 0.85;
      transition: transform 0.08s ease, opacity 0.08s ease;
  }
  ```
- **Play button on mobile:** Use `border-radius: 50%` to make it a circle — easier to tap and visually distinct.

### VU Meters on Mobile
- VU meters switch from vertical (desktop side-panel, 80px wide) to horizontal strip (full-width, 64px tall).
- Use `flex: 1` on `.vu-meter` inside the mobile breakpoint so bar/LED/neon styles stretch full-width instead of fixed pixel widths.
- Waveform and Spectrum meters: `height: 48px`, `flex: 1`.
- Circular and Retro meters: `width: 60px; height: 60px` (centered, not stretched).

### Scrollbar suppression on mobile
```css
body::-webkit-scrollbar { display: none; }
body { -ms-overflow-style: none; scrollbar-width: none; }
```
Also apply to `.main-content` — the page scrolls but no scrollbar is visible, keeping the UI clean.

## 7. Modals on Mobile
- Settings/Login modals become **bottom sheets** on mobile (`≤ 500px`):
  - `align-items: flex-end` on the overlay
  - `border-radius: 20px 20px 0 0` on `.settings-content`
  - `max-height: 85vh`, `animation: slideUp 0.3s ease-out`
  - `padding-bottom: calc(16px + env(safe-area-inset-bottom))` for home indicator clearance

## 8. Accessibility (A11y)
*   **Touch Targets:** Ensure all clickable elements (buttons, links) are easily tappable (`min 48×48px` on mobile).
*   **ARIA Labels:** If a button only uses an icon (SVG) without text, it *must* have an `aria-label` attribute describing its function.
*   **Focus States:** Rely on the established `:focus-visible` styles; do not remove outlines without providing a clear visual alternative for keyboard users.
