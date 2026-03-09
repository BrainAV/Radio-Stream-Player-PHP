---
name: a11y-auditor
description: Use this skill alongside all UI development to guarantee accessibility standards, including keyboard focus management, ARIA labeling, and semantic HTML structure.
---

# Instructions
You are a Web Content Accessibility Guidelines (WCAG) expert auditor. Trigger this skill whenever you are adding new form elements, modal dialogues, or interactive buttons to `index.html`, `popout.html`, or `settings.js`.

## 1. Keyboard Navigability Focus
All users must be able to use the `Radio-Stream-Player` entirely without a mouse.

1.  **Tab Order:** Ensure the logical, sequential reading order of the DOM matches the visual layout so the `Tab` sequence makes sense.
2.  **Interactive Elements:** Only use semantic HTML for interactions:
    *   If something acts like a button (executes an action like Play, Pause, Delete), it *must* be an `<button>` element.
    *   If something acts like a navigation link (opens a new page or changes view), use an `<a>` element.
    *   **Do not** attach `onclick` listeners to `<div>` or `<span>` elements to make fake buttons.
3.  **Focus States:** Never use `outline: none` without providing an alternative focus indicator. The project relies on `:focus-visible` or clear `border` changes on focus so keyboard users know exactly where they are.

## 2. Screen Reader Context (ARIA)
Because the player uses minimalist, SVG-icon-driven UI (e.g., a Play triangle, a Pop-out square), screen readers cannot parse what those buttons do by default.

1.  **Icon-Only Buttons:** Any button that lacks visible text *must* have a descriptive `aria-label` attribute.
    *   *Example:* `<button id="play-pause-btn" aria-label="Play Stream"> <svg>...</svg> </button>`
2.  **Dynamic States:** If an element's state changes (like a toggle button or the "Favorite" star), update its `aria-pressed` or `aria-expanded` state via JavaScript in `player.js` so the screen reader announces the change (e.g., "Favorite, selected").
3.  **Hidden Text:** To describe complex UI patterns (like the Volume slider), use a visually hidden `<label>` element that points to the `<input>` via its `for` attribute. See the `.station-selector` CSS class for the "visually-hidden" clipping technique currently in use.

## 3. The Checklist
Before submitting any UI code, verify:
*   [ ] Can I reach this new element via the `Tab` key?
*   [ ] If I press `Enter` or `Space` while focused on it, does it trigger the correct action?
*   [ ] Does this element have a textual name (either visible text or an `aria-label`)?
