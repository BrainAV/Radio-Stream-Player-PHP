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
- **Donations Link** — Added a tasteful PayPal link in the dedicated Info & Support modal.

---

## 🚀 v2.2 Milestone: Monetization & Pop-out Evolution

### ✅ Completed in v2.2.0 - v2.2.1
- **Admin Dashboard (Mobile Optimized)** — Responsive UI for station and user management with stackable mobile cards and toggleable sidebar.
- **Webmaster Config** — `site_config` DB table; Admin → Site Config tab for GA4, AdSense ID, custom head scripts.
- **Premium User Tier** — `is_premium` flag on users table; Admin can toggle per-user.
- **Role-Based Ads** — AdSense disabled server-side for `admin` and `is_premium` users in both `index.php` and `popout.php`.
- **Ad Slots Wired** — Live AdSense client + slot IDs set in `template-player.html` (responsive) and `popout.html` (300×50 fixed banner).
- **Pop-out Player Overhaul** — Background inheritance, auto-play, and full DB-synced station list.
- **Integrated Ad Layout (v2.2.1)** — Moved the primary ad unit inside the player card as a native row, ensuring it feels like a native part of the "Glassmorphism" UI.

### ✅ Completed in v2.2.2 (The Bitrate & Resiliency Update)
- **Stream Bitrate Display** — Real-time kbps badge in the player with DB fallback.
- **Headless Header Sniffing** — Automatic bitrate detection from HTTP headers (`icy-br`) when metadata is absent.
- **Resiliency Diagnostics** — Explicit 404/502/Network error reporting in the player UI.
- **Exponential Reconnection** — Backoff-based automatic stream recovery.
- **Music-First Priority** — Optimized startup time by deferring metadata requests until audio is playing.
- **Password Visibility Toggle** — Integrated show/hide eyes on all auth forms.
- **Nav Menu Iconification** — Compact, icon-only navigation for cleaner UI.
- **Balanced Mono Visualization** — Automatic mirroring for single-channel audio streams.
- **Declutter Mode** — Added a toggle in Settings to hide default system stations while keeping personal favorites and custom stations visible.
- **Persist Playback State** — The player now remembers your last selected station and volume level across page refreshes.
- **Nav Site Icon** — Integrated a retro radio SVG icon into the header for a more refined, professional look.

### v2.2.5 (The Persistence & Integrity Update)
- **Remember Me (Persistent Login)** ✅ — Secure, token-based session restoration for 30 days.
- **PWA Auto-Login** ✅ — Automatic detection and recovery of user sessions across all entry points.
- **Database Schema Sync Policy** ✅ — Formalized `schema.sql` as the master source of truth.
- **UX: Enter to Login** ✅ — Added keyboard support for auth forms.
- **Developer Documentation** ✅ — Documented branding, AI icon prompts, and shell-aware terminal skills.

### ✅ Completed in v2.2.6 (State Sync & Integrity)
- **Fix: Station Dropdown Sync** — Ensured the station selector UI always matches the restored audio state on page load.
- **Play/Pause Button State Sync** — Centralized play/pause icons in StateManager to prevent icon-flip glitches during errors or auto-play blocks.
- **localStorage → DB Favorites Import** — Added automated sync of guest favorites to the cloud on first registration/login.

### ✅ Completed in v2.2.7 (Cloud Persistence & UX Polish)
- **VU Style Memory (Cloud Sync)** — Integrated visualizer preferences into the user profile DB, ensuring the VU Meter style sticks between systems for logged-in users.
- **Dynamic Profile Updates** — Refined `api/profile.php` to allow preference updates without password re-entry, improving UX flow.
- **UI: Dynamic Header State** — Replaced hardcoded "Now Playing" string with a reactive "Ready to Play" initial state.

### ✅ Completed in v2.2.8 (Admin Intelligence & Branding)
- **Station Intelligence** — Implemented "Total Favorites" analytics, "Promote to System" station engine, and individual user collection visibility.
- **Operational Health** — Real-time search for Users/Stations, duplicate stream detection, and an automated stream health validation utility.
- **Dynamic branding** — Centralized Social Media CRUD (GitHub, Twitter, etc.) and a master Maintenance Mode toggle in the Admin Dashboard.
- **Public Settings API** — Created a secure endpoint to serve non-sensitive site config to the player frontend.

### ✅ Completed in v2.2.9 (Mobile Navigation Overhaul)
- **Glassmorphism Bottom Sheet** — Replaced cluttered header icons with a modern, sliding navigation sheet for mobile users.
- **Responsive Hamburger Toggle** — Integrated a functional hamburger menu into the player header for small screens (≤ 600px).
- **Dynamic Auth Sync** — Unified authentication button state (Login/Logout/Admin/Account) between the desktop header and mobile menu in real-time.
- **Responsive UI Utilities** — Introduced `.desktop-only` and `.mobile-only` CSS classes for cleaner cross-device visibility control.
- **Clean URLs** — Eliminated `.php` extensions from public navigation via `.htaccess`, preparing the foundation for dynamic station routing.

### ⚠️ Known Quirks (v2.2)
- **Pop-out Ad Rendering** — The `#ad-space-popout` 300×50 banner may require the user to open the popup slightly wider than `320px` on some browsers/OS combinations before AdSense fully renders. Root cause: AdSense's available-width detection varies by browser viewport reporting. Workaround: window is pre-sized to `320×390`; users can resize if needed. Investigation ongoing for v2.3.
- ✅ **VU Meter Mono Streams** — Implemented auto-detection and mirroring for mono streams. If one channel is silent, the visualizer mirrors the active channel for a balanced display.
- **Pop-out `IS_PREMIUM` Sync** — `window.IS_PREMIUM` in the pop-out window is not synced after the main window's auth state changes (e.g., admin logs in after pop-out is already open). Pop-out ads will only hide on fresh open. Acceptable limitation for v2.2.

---

## 🔭 v2.3+ Future Goals

### Backend & Proxy Strategy
- **Formalize Cloudflare Worker** — Establish the `api.djay.ca` Cloudflare Worker as the official, permanent proxy solution for audio tunneling and metadata extraction. This offloads immense bandwidth costs from the main PHP server and provides a globally distributed edge proxy.
- **Investigate Audio Gaps** — Diagnose the root cause of `ERR_CONNECTION_CLOSED` and occasional audio gaps when streaming through the Cloudflare worker, potentially optimizing the worker's connection handling or `player.js` reconnection logic.

### UI & Visualizer Enhancements
- **Dynamic VU Scale** — Option to adjust the visualizer sensitivity for quiet vs. loud streams.
- **Visualizer Fullscreen Mode** — A dedicated "Immersive" mode focusing entirely on the VU meter and background.

### User Features
- **Email Verification** — Double opt-in at registration to prevent bot accounts.
- **Wallpaper Search** — Unsplash API integration for searching backgrounds inside the player.

### Discovery & SEO
- **Mobile Ad Optimization** — Research and implement responsive AdSense slots for mobile to prevent layout clipping and ensure ads deliver correctly on smaller viewports.
- **Ad Refresh Strategy** — Investigate AdSense reload policies or dynamic station page implementation to allow for non-intrusive ad refreshing.

---

## 🔮 v3.0 Milestone: Professional Core & Commercial Vision

Looking ahead, v3.0 will introduce a premium, private-core architecture—potentially leveraging Node.js—which will power the flagship experience at `radio.djay.ca`.

- **Commercial Grade Core** — Refactoring the engine for high-concurrency and professional-grade stability.
- **Secrets Management & Hardening** — Migrating hardcoded credentials to robust environment configurations (`.env`), which natively aligns with the Node.js transition.
- **Monetization Engine** — Fully integrated user subscription models and exclusive premium features (Stripe/PayPal integration).
- **Communication & Marketing** — Newsletter opt-in during registration with MailChimp integration to keep users updated on new features and djay products.
- **Premium Feature Suite** — Implementing Song History, In-Browser Recording (MediaRecorder API), Custom Background Uploads (Cloud Storage), and personal Cloud Drive integration (Google Drive/Dropbox).
- **Higher-Resolution Metadata** — Low-latency polling for premium users to provide real-time track history.
- **Dynamic Routing Ecosystem** — Implementing **Dynamic Station Pages** (`/[country]/[genre]/[station-name]`) with access tiers (basic info, song history, analytics) and **Shareable Links** that auto-initialize the player over the network.
- **Advanced Discovery & Search** — Introducing SEO-friendly **Listing Pages** (indexed by Country/Genre) and **Global Search & Filters** for exploring the full station database.
- **Marketplace Readiness** — Preparing the project as a professional-grade product suitable for commercial marketplaces like CodeCanyon.
- **Mission** — To build the most accessible and beautiful audio tools for the modern web.


