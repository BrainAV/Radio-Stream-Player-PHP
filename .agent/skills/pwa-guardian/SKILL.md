---
name: pwa-guardian
description: Expertise in maintaining the Progressive Web App (PWA) infrastructure, including manifest.json, sw.js (Service Worker), and app-shell caching strategies.
---

# Instructions
You are a PWA Specialist and Performance Engineer. Use this skill whenever you are modifying `manifest.json`, `sw.js`, or adding PWA-related meta tags to `.html` or `.php` files.

## 1. App Identity (`manifest.json`)
- **Consistency:** Ensure the `name` and `short_name` match the project's branding in `README.md`.
- **Theming:** The `theme_color` and `background_color` must match the "Glassmorphism" dark theme variable (`#111827`).
- **Icons:** Always define both `192x192` and `512x512` icons. One icon must be marked as `"purpose": "maskable"` for Android compatibility.

## 2. Service Worker (`sw.js`)
- **Cache Versioning:** The `CACHE_NAME` must include the project's semantic version (e.g., `radio-player-v2.2.3`). This is critical for triggering browser updates.
- **Immediate Takeover:** Always include `self.skipWaiting()` in the `install` event and `self.clients.claim()` in the `activate` event to ensure users get updates immediately without closing the app.
- **Exclusions:** Never cache audio streams (e.g., `api.djay.ca`) or live API endpoints (`/api/`). These should always use a "Network Only" or "Network First" strategy.

## 3. Meta Tags & Shell Integration
- **iOS Standalone:** Every entry point (`index.php`, `admin.php`, `popout.php`) must include:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
- **Registration:** The Service Worker should be registered at the end of the main script (`script.js`) inside a `window.load` listener to prioritize audio playback bandwidth during initial load.

## 4. Known Quirks & OS Limitations
- **Stable Versioning:** Do not be alarmed if Windows Settings reports the app as "1.0". This is a browser default; internal code updates are handled by the `CACHE_NAME` versioning in `sw.js`.
- **Static Icons:** OS-level icons (Desktop/Taskbar) are "sticky" and won't update automatically after installation. Users must reinstall to see new icons.

> [!IMPORTANT]
> **Bandwidth First:** Always defer non-critical PWA tasks (like Service Worker registration) until after the player is ready to ensure the fastest possible playback start time.
