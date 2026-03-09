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
