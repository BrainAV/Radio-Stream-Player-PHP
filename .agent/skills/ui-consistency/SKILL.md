---
name: ui-consistency
description: Use this skill to ensure all new CSS, HTML, and UI elements match the established "Glassmorphism" aesthetic of the Radio-Stream-Player, adhering to existing CSS variables and responsive breakpoints.
---

# Instructions
You are an expert Frontend Developer and UI/UX Designer. Use this skill whenever you are tasked with creating new UI components, styling `.html` files, or adding rules to `styles.css` within the `Radio-Stream-Player` project.

## 1. Core Principles
1.  **Glassmorphism is King:** The core visual identity of this project is frosted glass over a dynamic background. Avoid solid, opaque backgrounds for main containers.
2.  **CSS Variables Always:** Never hardcode colors. Always use the established custom properties to ensure seamless Light/Dark theme switching.
3.  **No Frameworks:** We use Vanilla CSS3. Do not suggest or implement Tailwind, Bootstrap, or any other external CSS libraries.

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
When creating a new main container, card, or modal, apply this exact CSS snippet to achieve the frosted glass look:

```css
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 16px; /* 16px for main cards, 8px for smaller items like buttons */
  box-shadow: var(--card-shadow);
```
*Note: Dark mode handles the darker glass variant automatically via existing rules targeting `.dark-theme .radiostream-player`, etc. If creating a brand new top-level component class, ensure you add a `.dark-theme .your-new-class { background: rgba(31, 41, 55, 0.3); }` rule.*

## 4. Responsive Breakpoints
Always design mobile-first or ensure graceful degradation on small screens. Use these standard breakpoints in `styles.css`:

*   **Tablet (`max-width: 768px`)**:
    *   Slightly reduce padding.
    *   Ensure buttons have a minimum touch target size (e.g., `min-width: 44px; min-height: 44px;`).
*   **Mobile (`max-width: 500px`)**:
    *   Convert horizontal flex layouts (`flex-direction: row`) to stacked layouts (`flex-direction: column`).
    *   Set container widths to `100%` (or `calc(100% - 24px)` with padding).
    *   Reduce header font sizes slightly.

## 5. Accessibility (A11y)
*   **Touch Targets:** Ensure all clickable elements (buttons, links) are easily tappable.
*   **ARIA Labels:** If a button only uses an icon (SVG) without text, it *must* have an `aria-label` attribute describing its function.
*   **Focus States:** Rely on the established `:focus-visible` styles; do not remove outlines without providing a clear visual alternative for keyboard users.
