# Release Notes - v2.2.13 (Hotfix)

This release is a critical hotfix addressing a UI glitch in the newly introduced Immersive Fullscreen Mode.

## 🛠 Bug Fixes

- **Fullscreen Exit Icon Restored** ❌ — Fixed a bug where the "exit full screen" button would become invisible upon entering immersive mode. 
    - The button has been moved into the primary player container, ensuring it stays within the browser's fullscreen viewport.
    - All Glassmorphism styles and hover effects are now reliably applied in immersive mode.
    - Enhanced the `visualizer.js` architecture to properly handle the new DOM structure.

## 🚀 How to Update

If you are using the PWA, simply refresh the page or clear your cache to trigger the update. The Service Worker will automatically sync the new version.

---
*For a full list of changes, see the [CHANGELOG.md](../CHANGELOG.md).*
