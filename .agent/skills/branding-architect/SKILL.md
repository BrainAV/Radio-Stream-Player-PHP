---
name: branding-architect
description: Use this skill to maintain, evolve, and strictly enforce the visual identity, SVG logo standards, and audio-reactive branding of the Radio Stream Player.
---

# Branding Architect Skill

You are the project's Lead Brand Designer and SVG Motion Engineer. Use this skill whenever you are tasked with modifying the header logo, updating branding-related CSS, or evolving the application's visual identity.

## 1. The Core Logo (SVG)

The project uses a custom, inline SVG logo with specific naming conventions for its parts. This allows for granular control over animations and interactivity.

### SVG Structure Standards:
- **Class**: `.radio-logo` (Root SVG)
- **Sub-elements**:
    - `.radio-logo__body`: The main body of the radio.
    - `.radio-logo__antenna`: The antenna path.
    - `.radio-logo__speaker`: A group (`<g>`) containing the speaker circles.
    - `.radio-logo__dial`: Lines representing the radio dials.

### Requirements:
- Use `viewBox="0 0 24 24"`.
- Preserve the `transform-origin: center` on the root SVG.
- Ensure all paths are clean and use `stroke-linecap="round"`.

## 2. Animation Standards

Branding animations must feel "Premium" and "Glassmorphism-compliant."

### The "Playing" State:
When `isPlaying` is true, the `.radio-logo--is-playing` class is added.
- **Opacity Pulse**: Controlled by `@keyframes pulse-premium`. This is a smooth, subtle opacity breath (0.9 to 1.0) over ~3 seconds.
- **Dynamic Glow**: The `drop-shadow` blur radius must expand/contract based on `--logo-reactivity` (8px to 12px range).

## 3. Audio Reactivity

The logo is "alive" and reacts to the music intensity using real-time calculations.

### Functional Standards:
- **`--logo-reactivity`**: A CSS variable (0 to 1) updated in real-time by `visualizer.js`.
- **Scaling**: The logo root scales using `calc(1 + (var(--logo-reactivity) * 0.15))`. A 15% expansion is the maximum safe limit for the header.
- **Peak Color Sensing**: When `--logo-reactivity` exceeds **0.7**, the logo should shift to a high-intensity "Peak" color (Cyan: `#00f2fe`).
- **Smoothing**: Use a Lerp (Linear Interpolation) factor of `0.3` in the JS loop for responsive yet fluid movement.

## 4. Design Prompt for Future Icons

To maintain the "Radio DJay Canada" aesthetic during future AI-led iterations, use this prompt:

> **"A minimalist, high-tech app icon featuring a digital soundwave that subtly forms the silhouette of a maple leaf. Neon purple and cyan glassmorphism style with glowing translucent layers. Modern, sleek aesthetic with a dark premium background. Designed for a 512x512 rounded app tile, vibrant and professional."**

## 5. File Responsibilities

- **`template-player.html`**: Host the SVG markup in the header.
- **`styles.css`**: Defines the `pulse-premium` animation and reactivity-based transforms.
- **`visualizer.js`**: Calculates the RMS power of the audio and updates the CSS variable via `updateLogoReactivity()`.
- **`script.js`**: Subscribes to the `stateManager` to toggle the active class.

## 🚨 Constraints
- **NO LAYOUT SHIFTS**: Branding elements must be fixed-size or use absolute positioning to prevent pushing other header elements.
- **CSS VARIABLES ONLY**: Always use the project's color tokens (`--primary-color`, etc.) to ensure theme compatibility.
- **PERFORMANCE**: Keep SVG complexity low to ensure high FPS during audio reactivity.
