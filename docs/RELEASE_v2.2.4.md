# Release Notes - v2.2.4

## 📱 The PWA "Side Quest" Release

This release officially transforms the Radio Stream Player into a **Progressive Web App (PWA)**, allowing you to install it directly onto your Home Screen (iOS/Android) or Desktop for a native-app experience.

### ✨ What's New

-   **Installable App Experience** — Use the "Add to Home Screen" prompt on Android or Chrome, or the "Share > Add to Home Screen" option in Safari to install the player as a standalone app.
-   **Full-Screen Standalone Mode** — On mobile, the browser address bar and controls disappear, giving the music and visualizer the entire screen.
-   **Fast App-Shell Loading** — A new Service Worker handles caching of core assets (CSS, JS, icons) for near-instant load times on repeat visits.
-   **High-Res Icons** — Beautiful neon-purple headphone icons (192px/512px) optimized for various device displays.
-   **Immediate Auto-Updates** — We've implemented advanced "Skip Waiting" logic. As soon as a new version is pushed, your app will update its internal code instantly the next time you use it.

### 🛠️ Developer Improvements
-   **`pwa-guardian` Skill** — Formalized maintenance rules for manifest and service worker management.
-   **Version Sync Architecture** — Automated the process of keeping the Service Worker cache, manifest version, and documentation in lockstep.

---
*To see the new icons and OS-level branding, existing PWA users may need to uninstall and reinstall the app. Code updates will happen automatically!*
