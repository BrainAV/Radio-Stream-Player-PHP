# Radio Stream Player Style Guide

This document provides the coding style guidelines for the project. A consistent style makes the code easier to read and maintain.

---

## 1. JavaScript

-   **Variables**: Use `const` by default. Use `let` only for variables that need to be reassigned. Avoid `var`.
-   **Modules**: Use ES6 modules (`import`/`export`) for all JavaScript files. The main entry point is `script.js`.
-   **Naming**:
    -   Use `camelCase` for variables and functions (e.g., `currentStation`, `updateVolume`).
    -   Use `PascalCase` for classes if they are introduced later (e.g., `StateManager`).
    -   Use `UPPER_SNAKE_CASE` for constants that are hard-coded and reused across the application (e.g., `const DEFAULT_VOLUME = 0.5;`).
-   **Functions**: Prefer standard function declarations or arrow functions where appropriate. Add JSDoc-style comments to public/exported functions to explain their purpose, parameters, and return values.
    ```javascript
    /**
     * Sets the volume for the audio player.
     * @param {number} newVolume - A value between 0.0 and 1.0.
     */
    function setVolume(newVolume) {
      // ...
    }
    ```
-   **DOM Manipulation**: Cache DOM element selectors in variables at the top of the module rather than re-querying the DOM repeatedly.

## 2. CSS

-   **Variables**: Use CSS Custom Properties (variables) defined in the `:root` and `.dark-theme` selectors for all colors, fonts, and spacing. This is critical for theming.
-   **Selectors**:
    -   Use class selectors instead of ID selectors for styling to ensure reusability.
    -   Use a BEM-like naming convention to create a clear relationship between components (e.g., `.player-content`, `.player-content__title`, `.player-content--modified`).
-   **Formatting**: Keep CSS organized by component. For example, all styles related to the volume slider should be grouped together.
-   **Responsiveness**: Use a mobile-first approach. Define base styles for mobile and use `@media (min-width: ...)` queries for larger screens.

## 3. HTML

-   **Semantics**: Use semantic HTML5 tags (`<header>`, `<main>`, `<section>`, `<label>`, etc.) to improve structure and accessibility.
-   **Accessibility**: All interactive elements (`<button>`, `<a>`, `<input>`) must be accessible.
    -   Provide `aria-label` for icon-only buttons.
    -   Use `<label>` for all form inputs, even if visually hidden.
    -   Ensure a logical tab order.

## 4. Commit Messages

Follow the Conventional Commits specification. This helps automate changelog generation and makes the project history easy to understand.

**Examples:**
-   `feat: add custom station support with localStorage`
-   `fix: correct volume slider thumb position in Firefox`
-   `docs: update DEVELOPER_GUIDE with state management plan`
-   `refactor: modularize VU meter drawing functions`
-   `style: reformat CSS to group by component`