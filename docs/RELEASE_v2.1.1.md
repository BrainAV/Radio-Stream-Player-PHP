# Release Notes - v2.1.1 (The Reactive Refresh)

Version 2.1.1 focus on resolving critical UI synchronization issues introduced in the v2.0 migration and expanding the strategic roadmap for future SEO and media capabilities.

## 🚀 What's New?

### 🛠️ Critical Bug Fixes
- **Settings Sync**: Resolved a high-priority bug where the "My Collection" tab remained stale after login/logout. The UI now refreshes instantly without requiring a page reload.
- **Agent Autonomy**: Updated the `.agent/skills` framework to ensure all future coding assistants maintain architectural integrity regarding state reactivity and lifecycle events.

### 🎨 Personalization
- **New Preset**: Replaced the "Abstract" wallpaper preset with a more harmonious **"Serene Nature"** theme that better complements the Glassmorphism UI.
- **Unsplash Integration Guide**: Added `docs/UNSPLASH_GUIDE.md` to help users and developers correctly format direct image links for custom backgrounds.

### 🗺️ Strategic Roadmap Expansion
We've laid the groundwork for significant infrastructure growth:
- **Stream Crawler/Finder**: A planned admin utility to automatically extract and analyze streams (bitrate, quality detection).
- **Dynamic SEO Routing**: Advanced planning for hierarchical URLs (`/[country]/[locale]/[station-name]`) and dynamic index pages for Genres and Countries.
- **Station History**: Planned background metadata polling to build a "Recently Played" archive for every station.

---
*For a full list of technical changes, please refer to the [CHANGELOG.md](../CHANGELOG.md).*
