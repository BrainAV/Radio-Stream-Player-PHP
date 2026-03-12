# Project Roadmap

This document outlines the future direction and planned features for the Radio Stream Player. The goals are divided into versioned milestones.

---

## ✅ Completed Milestones

### v1.x — Foundation & UX
- Code refactoring: modular `player.js` / `visualizer.js` / `settings.js` split.
- Accessibility (A11y): ARIA labels, keyboard nav, focus-visible states.
- Glassmorphism UI redesign with SVG controls, compact layout, pop-out player.
- Custom Stations, Favorites system, localStorage persistence.
- Custom Backgrounds with URL input and curated presets.
- Stream Metadata display via Cloudflare Worker proxy (ICY metadata polling, marquee).
- Radio Browser Directory integration (search by tag, name, country).
- Agent tooling: `.agent/skills` architecture with `station-curator`, `ui-consistency`, `audio-engineer`, `a11y-auditor`, `release-manager`, `documentation-sentinel`.

### v2.0 — The PHP Awakening
- Migrated to self-hosted PHP/MySQL/LAMP stack from static GitHub Pages.
- Non-intrusive AJAX login/logout modal (music never stops during auth).
- Dynamic station management via SQL database (replaces `stations.js`).
- User registration (`api/register.php`) and account deletion.

### v2.1 — Account & Community
- Full user account management (profile editing, email/password update).
- Admin Dashboard with User Management (roles, ban, delete).

---

## 🚀 v2.2 Milestone: Monetization & Pop-out Evolution

### ✅ Completed in v2.2
- **Admin Dashboard** — Dedicated UI for station and user management.
- **Webmaster Config** — `site_config` DB table; Admin → Site Config tab for GA4, AdSense ID, custom head scripts.
- **Premium User Tier** — `is_premium` flag on users table; Admin can toggle per-user.
- **Role-Based Ads** — AdSense disabled server-side for `admin` and `is_premium` users in both `index.php` and `popout.php`.
- **Ad Slots Wired** — Live AdSense client + slot IDs set in `template-player.html` (responsive) and `popout.html` (300×50 fixed banner).
- **Pop-out Player Overhaul:**
    - Inherits user background via `?bg=` URL param.
    - Auto-starts playback on open.
    - Station list is DB-aware (uses session cookie → `api/favorites.php`); respects `favoritesOnly` and genre filters.
    - Served by `popout.php` for server-side ad injection.

### 🔲 Remaining for v2.2
- **AdSense Ad Slot Review** — Verify both ad units are approved and serving in AdSense console, adjust slot IDs or formats if needed.
- **Webmaster Settings (Admin)** — Dynamic management of tracking codes via Admin → Site Config (partial — needs UI polish).
- **Stream Crawler/Finder (Admin Utility)** — Tool to extract direct stream URLs from a station website; auto-detect bitrate/quality.
- **Broken Stream Reports UI** — Admin interface for reviewing user-flagged stations.

### ⚠️ Known Quirks (v2.2)
- **Pop-out Ad Rendering** — The `#ad-space-popout` 300×50 banner may require the user to open the popup slightly wider than `320px` on some browsers/OS combinations before AdSense fully renders. Root cause: AdSense's available-width detection varies by browser viewport reporting. Workaround: window is pre-sized to `320×390`; users can resize if needed. Investigation ongoing for v2.3.
- **Pop-out `IS_PREMIUM` Sync** — `window.IS_PREMIUM` in the pop-out window is not synced after the main window's auth state changes (e.g., admin logs in after pop-out is already open). Pop-out ads will only hide on fresh open. Acceptable limitation for v2.2.

---

## 🔭 v2.3+ Future Goals

### Backend Independence
- **PHP Metadata Proxy** — Port Cloudflare Worker ICY metadata logic to `api/metadata.php`.
- **PHP Stream Proxy** — Port Cloudflare Worker audio proxy to `api/proxy.php` for full self-hosting.

### User Features
- **Song History (Premium)** — DB-backed track history for logged-in users.
- **Email Verification** — Double opt-in at registration to prevent bot accounts.
- **Custom Background Uploads** — Allow users to upload images (local/cloud storage).
- **Wallpaper Search** — Unsplash API integration for searching backgrounds inside the player.

### Discovery & SEO
- **Dynamic Station Pages** — `.htaccess` + PHP routing for `/[country]/[genre]/[station-name]` URLs.
- **Listing Pages** — Index pages by Country and Genre for SEO discoverability.
- **Global Search & Filters** — Search bar + Genre/Country filter controls for the full station database.

### Monetization
- **Premium Subscription** — Stripe or PayPal integration to let users upgrade and remove ads.