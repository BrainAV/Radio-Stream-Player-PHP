# 🚀 Release v2.2.6 - Favorites Sync & State Integrity

This release introduces the highly requested **localStorage → DB Favorites Import** feature, allowing guest users to seamlessly migrate their saved stations to a permanent account. We've also hardened the player's UI state management for a smoother playback experience.

## ✨ What's New?

### 🔄 Multi-Device Favorites Sync
- **Guest Migration**: Added an automated flow that detects favorites and custom stations stored in your browser's `localStorage` and offers to sync them to your cloud account upon login or registration.
- **Deduplication Engine**: Smarter backend logic that merges local data into your account without creating duplicate station entries.

### 📱 Premium Lock Screen Experience
- **Media Session Sync**: The player now transmits real-time "Now Playing" metadata and the high-resolution PWA icon to your OS lock screen (iOS, Android, Windows, macOS). Experience a native-app feel with full song info and album-art style branding on your device.

### ⌨️ Enhanced Search UX
- **Search on Enter**: You can now trigger station directory searches by simply pressing the "Enter" key in the search field.

## 🛠️ Bug Fixes & Improvements

- **Station Dropdown Sync**: Fixed a persistent bug where the station selector UI would lose sync with the actual playing station after a page reload or state restoration.
- **Play/Pause Icon Integrity**: Centralized play/pause state in the `StateManager` to eliminate "icon-flipping" glitches during stream errors or browser auto-play blocks.
- **Documentation Refresh**: Fully updated the project Roadmap and Developer Guide to reflect current architecture and roadmap milestones.

---
*Ready to upgrade? Simply pull the latest changes and ensure your `sw.js` version is updated to trigger the PWA refresh!*
