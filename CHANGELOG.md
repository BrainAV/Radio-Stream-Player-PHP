# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

### Changed

### Fixed


## [2.2.12] - 2026-03-20

### Added
- **Persistent Playback State** — The player now saves `isPlaying` and the last active station to `localStorage`, allowing for a seamless "resume" experience across page refreshes.
- **Dynamic VU Sensitivity** — Added a "Visualizer Sensitivity" slider in the General settings, allowing users to fine-tune the VU response for high-latency or low-gain streams.
- **Immersive Fullscreen Mode** — Implemented a dedicated fullscreen toggle that optimizes the UI for visualizer-heavy listening on desktops and tablets.
- **v3.0 Casting Proposal** — Drafted and integrated a technical proposal for Google Cast and AirPlay support (`docs/CASTING_PROPOSAL_v3.0.md`).
- **Roadmap Expansion** — Formally added "Integrated Casting & Remote Playback" to the v3.0 milestone in `ROADMAP.md`.
- **Premium Fullscreen Mode** — Completely redesigned the immersive fullscreen experience. VU meters are now the central hero element, absolutely centered on screen at `42vh` tall. Station name and track title are pinned to the top. The background uses a deep navy-to-black radial gradient with a soft animated ambient glow behind the visualizers.
- **Fullscreen Control Dock** — The control bar in fullscreen is now a compact frosted-glass pill, fixed to the bottom center of the screen. It fades to 25% opacity and fully reveals on hover for a clean, non-intrusive experience.
- **Exit Fullscreen Button** — A `×` circular glass button is now shown at the top-right of the screen when in fullscreen mode; it reliably appears and disappears via the `fullscreenchange` event listener (which also handles the `Esc` key correctly).
- **Fullscreen Entry Button Relocated** — The fullscreen toggle icon (`⛶`) has been moved from the control bar to the `now-playing-header`, positioned to the right of the stream quality (kbps) badge for a cleaner, more intentional UX.

### Changed
- **PWA Meta Tag Modernization** — Replaced deprecated meta tags in `template-player.html`, `popout.html`, and `admin.php` with modern PWA-compliant standards to improve cross-browser installation.
- **Mobile Ad Performance Fixes** — Implemented `min-height` constraints on AdSense slots in `styles.css` to prevent significant layout shifts and ensure ads render correctly on mobile devices.
- **VU Sensitivity Scope Expanded** — `applySensitivity()` in `visualizer.js` now updates a `sensitivityMult` multiplier used by `calculateRMSLevel()`, ensuring the sensitivity slider correctly affects Classic, LED, Retro, and Circular VU meters — not just the frequency-domain analysers.
- **Fullscreen "Now Playing" Label** — The redundant "Now Playing: " prefix is now stripped from the station label when entering fullscreen (restored on exit), so only the station name is displayed prominently.
- **Ad Placement in Fullscreen (Non-Premium)** — Ad unit is repositioned to a fixed slot above the control dock in fullscreen mode with a dark glassmorphism backdrop, ensuring it is visible without blocking the visualizers.
- **Roadmap Updated** — `ROADMAP.md` updated to reflect v2.3 as fully completed and v2.2.10/11 properly documented as historical milestones.

### Fixed
- **Audio Resiliency (Proxy Errors)** — Added an intelligent error handling layer in `player.js` that detects `ERR_CONNECTION_CLOSED` and other proxy-related drops, triggering an automatic reconnection with exponential backoff.
- **Esc Key Exits Fullscreen** — Replaced the manual class-toggle approach with a `fullscreenchange` event listener that syncs the `.fullscreen-mode` CSS class with the browser Fullscreen API, so pressing `Esc` correctly restores the normal layout.
- **Exit Fullscreen Button Now Visible** — The `#exit-fullscreen-btn` element was placed outside `.radiostream-player` in the DOM, making the original CSS selector (`.fullscreen-mode #exit-fullscreen-btn`) unreachable. Fixed by explicitly setting `style.display` via JavaScript in the `fullscreenchange` listener.
- **Station Name Centred in Fullscreen** — The `now-playing-header` flex row was preventing centred alignment. Added an override to switch it to `flex-direction: column` in fullscreen mode so the station name and bitrate badge stack centrally.


## [2.2.11] - 2026-03-19

### Added
- **Reactive Audio Logo (Enhanced)** — Overhauled the radio logo's audio reactivity with a higher 15% scale factor, dynamic shadow expansion, and "peak-aware" color shifting that triggers a bright Cyan glow during high-intensity audio moments (BPM tracking).
- **New Agent Skill: Branding Architect** — Created a formalized instruction set at `.agent/skills/branding-architect/SKILL.md` to ensure future logo iterations maintain audio connectivity, premium animation standards, and SVG structural integrity.
- **Roadmap Refinement** — Performed a major strategic restructuring of `ROADMAP.md`, clearly delineating between the v2.x LAMP core and the v3.0 professional-grade milestone.
- **Architecture Strategy** — Formalized the Cloudflare Worker (`api.djay.ca`) as the permanent, official proxy solution for audio and metadata. This decision prioritizes edge performance and minimizes server bandwidth costs compared to a self-hosted PHP proxy.

### Changed
- **Logo Animation Refinement** — Polished the user's manual logo animation with a smoother, more subtle pulse and a dynamic glow effect in `styles.css`.
- **Roadmap Hygiene** — Cleaned up the roadmap by moving legacy completed items (Clean URLs, State Sync) to their respective milestones and accurately categorizing remaining v2.x goals.


## [2.2.10] - 2026-03-19

### Added
- **Clean URLs Implementation** — Integrated Apache `.htaccess` rewrites to enable professional, extension-less paths (e.g., `/admin`, `/popout`, `/`). Updated all internal application links, PWA `start_url`, and Service Worker caching to support the new structure.
- **PWA Meta Tag Synchronization** — Added the modern `mobile-web-app-capable` and other standard PWA tags to both `template-player.html` and `popout.html` for improved cross-platform installation.

### Changed
- **Strategic Roadmap Updates** — Added new future goals to `ROADMAP.md` for Mobile Ad Optimization, Ad Refresh Strategy, and Network Resiliency (converting Cloudflare Worker proxy to native PHP).

### Fixed
- **Mobile Navigation Listeners** — Added missing event listeners for `mobile-account-btn` and `mobile-logout-btn` to ensure they correctly trigger modals and logout actions while closing the mobile navigation sheet.

## [2.2.9] - 2026-03-19

### Added
- **Mobile Navigation Bottom Sheet** — Implemented a modern glassmorphism sliding menu for mobile users, replacing cluttered header icons.
- **Responsive Hamburger Menu** — Added a functional hamburger toggle button that appears on screens ≤ 600px.
- **Unified Navigation Sheet** — Consolidated 'Info', 'Settings', 'Admin', and 'Account' links into a single, thumb-friendly mobile interface.

### Changed
- **Dynamic Header Logic** — Updated `index.php` and `settings.js` to synchronize authentication buttons (Login/Logout/Admin/Account) between the desktop header and mobile navigation sheet in real-time.
- **Responsive UI Utilities** — Introduced `.desktop-only` and `.mobile-only` CSS classes for cleaner cross-device visibility control.

## [2.2.8] - 2026-03-16

### Added
- **Station Intelligence & Analytics** — Implemented "Total Favorites" tracking for all stations, allowing admins to see popularity rankings at a glance.
- **One-Click Station Promotion** — Added a "Promote to System" feature for admins to instantly convert popular user-added stations into public system defaults.
- **Improved Duplicate Detection** — Implemented bi-directional conflict detection. URLs with same contents but different formatting (trailing slashes/semicolons) are flagged as exact duplicates, while shared names are flagged as potential mirrors.
- **User Collection Visibility** — Admins can now view individual user collections (favorites and custom stations) directly from the User Management panel.
- **Real-Time Search & Filtering** — Implemented live searching for both User and Station tables and added advanced filtering for System vs. User-added stations.
- **Automated Stream Health Check** — Developed a stream validation utility that pings URLs to detect alive, dead, or failing streams directly from the dashboard.
- **Duplicate Station Detection** — Added UI highlighting for duplicate stream URLs to help admins maintain a clean station directory.
- **Dynamic Social Branding** — Moved hardcoded social links (GitHub, Twitter, Facebook, Instagram, PayPal) into the database, manageable via the Site Config panel.
- **Maintenance Mode** — Implemented a master toggle to redirect non-admin users to a maintenance landing page during system updates.
- **Public Settings API** — Created `api/settings.php` to securely provide non-sensitive site configuration to the player frontend.

### Fixed
- **Duplicate Detection False Negatives** — Refined the detection logic to strip SHOUTcast-style trailing semicolons (`;`) and slashes (`/`), ensuring URLs like `...:8130/` and `...:8130/;` are correctly identified as duplicates.
- **CSS & JS Syntax Integrity** — Resolved missing closing braces in `admin.css` and `settings.js` discovered during the Branding implementation.
- **Social Link Accessibility** — Updated the "About" modal to dynamically toggle social icons based on whether a URL is provided in the dashboard.

## [2.2.7] - 2026-03-16

### Added
- **Cloud VU Style Persistence** — Logged-in users' VU Meter visualization preferences are now stored in the database, allowing settings to persist across different browsers and systems.
- **Dynamic Profile Updates** — Refined the Profile API to allow updating preferences (like VU style) seamlessly without requiring a password confirmation for non-sensitive fields.

### Fixed
- **UI Hardcoding** — Replaced the hardcoded "Now Playing: ETN-FM Trance" message with a dynamic "Ready to Play" header and "Select a station to begin" subtitle for a better initial user experience.

## [2.2.6] - 2026-03-14

### Added
- **localStorage → DB Favorites Import** — Integrated an automated migration flow that detects guest favorites/custom stations and offers to sync them to the user's permanent account upon first login or registration.
- **Station Search: Enter to Search** — Added keyboard support for the Radio Browser search input.
- **Lock Screen Enhancements** — Improved the Media Session integration to display real-time song information and the PWA app icon on the OS lock screen and media controls.

### Fixed
- **Station Dropdown Sync** — Resolved an issue where the station selector UI would remain set to the first station on page load, even if a different station was restored via persistence.
- **Play/Pause Icon Integrity** — Fixed intermittent "icon-flipping" where the play/pause button would show the wrong state during auto-play blocks or stream errors. The icon is now strictly driven by the centralized `StateManager`.

## [2.2.5] - 2026-03-14

### Added
- **Remember Me (Persistent Login)** — Implemented a long-lived authentication system that keeps users logged in even after closing the browser or PWA. Uses secure, hashed database tokens and HttpOnly cookies valid for 30 days.
- **Session recovery logic** — Created `api/session_check.php` to automatically restore user state across `index.php`, `admin.php`, and `popout.php` without requiring manual logout/login cycles.
- **Database Schema Sync Policy** — Formalized the "Source of Truth" rule where `database/schema.sql` must always match migration scripts. Updated the `database-architect` skill and `DEVELOPER_GUIDE.md` to enforce this standard.

### Fixed
- **PWA versioning** — Bumped `sw.js` and `manifest.json` in lockstep to ensure immediate update triggers for the new persistence features.

## [2.2.4] - 2026-03-14

### Added
- **PWA (Progressive Web App) Support** — The Radio Stream Player can now be "installed" on mobile homescreens (iOS/Android) and desktop. Features include a standalone display mode, custom app icons (192px/512px), and a Service Worker for faster app-shell loading.
- **iOS Home Screen Optimization** — Added specific meta tags (`apple-mobile-web-app-capable`) to ensure the player opens in a true full-screen "standalone" mode on iPhones without browser chrome.
- **Immediate PWA Updates** — Implemented "Skip Waiting" and "Clients Claim" logic to ensure users receive the latest code updates instantly as soon as a new version is pushed.

## [2.2.3] - 2026-03-13

### Added
- **Declutter Mode** — Added a new "Declutter Mode" toggle in Settings. When enabled, the player hides any default system stations that haven't been favorited by the user, while keeping custom added stations visible. This allows users to focus on their personal collection without losing access to their custom shortcuts.
- **Responsive Admin Dashboard** — Re-engineered the Admin Control Panel for full mobile compatibility. Features a sliding menu sidebar on small screens, stackable card-based table layouts with labeled fields, and touch-optimized form controls.
- **Persistence & State Recovery** — The player now automatically restores the last selected station and volume level upon page reload, utilizing the centralized `StateManager` for consistent cross-session persistence.
- **Visual Branding** — Added a custom Retro Radio SVG icon to the site header, complementing the minimalist icon-based control scheme.

### Changed
- **Security Hardening** — Removed `api/config.php` from Git tracking to prevent accidental exposure of database credentials. Added `api/config.php.example` as a secure template for environment-based configuration.

## [2.2.2] - 2026-03-13

### Added
- **Deferred Metadata Polling** — Optimized stream startup by prioritizing audio bandwidth. Metadata and bitrate sniffing are now deferred until after the audio buffer has stabilized, significantly reducing playback start delay and connection contention.
- **Stream Diagnostics & Resiliency** — The player now identifies specific HTTP errors (like 502 Bad Gateway or 404 Not Found) when a stream fails to load via the proxy. Error messages are displayed in the "Now Playing" area to inform the user if the issue is server-side.
- **Exponential Backoff Reconnection** — Improved the stream drop recovery logic with a multi-attempt retry system (up to 5 attempts) that increases wait time between retries (2s to 10s).
- **Bitrate Persistence & Fallback** — Added a `bitrate` column to the `stations` database. The player now uses this stored metadata as a fallback if the live metadata proxy doesn't return a bitrate, ensuring the quality badge is shown more consistently.
- **Header-Based Bitrate Detection** — Implemented logic to extract bitrate directly from HTTP stream headers (e.g., `icy-br`) when real-time JSON metadata is unavailable.
- **Directory Search Bitrate Preservation** — Stations added through the Global Station Directory search now correctly preserve and display their bitrate information.
- **Manual Bitrate Support** — Added a bitrate field to the manual "Add New Station" form in settings.

### Changed
- **Balanced Mono Visualization** — Implemented an "Auto-Mirror" feature in the VU meter engine. If a station broadcasts in mono (one channel silent), the visualizer automatically mirrors the active channel's data to the silent one, preventing one-sided VU displays.

### Fixed
- **Bitrate Display Reliability** — Normalized bitrate detection logic to handle various proxy response formats and ensured the badge correctly updates or clears during station transitions.
- **Settings Logic Integrity** — Fixed critical syntax errors and redundant dynamic imports in `settings.js` that were interfering with station management.
- **API Metadata Sync** — Updated the Favorites API to correctly synchronize and persist bitrate data for cloud-synced accounts.

---

## [2.2.1] - 2026-03-12

### Added
- **Quick Wins & UX Improvements**
    - **Header Home Link** — Wrapped the "Radio Stream Player" header title in a link back to `/` for standard navigation convenience.
    - **Station Auto-Play** — The player now automatically starts playback when a new station is selected from the dropdown, reducing user friction.
    - **Dynamic Browser Title** — The browser tab title now dynamically updates to show the currently playing track or station name.
    - **Integrated Ad Layout** — Moved the primary ad unit inside the player card as a native Bottom Row. This ensures a cohesive "Glassmorphism" look and prevents layout shifts.
    - **Desktop Centering Fix** — Restored vertical centering for the player on desktop, particularly for admins and premium users where ads are suppressed.
    - **Donations Link** — Added a "Support the Project" section to the General settings tab with a direct PayPal link (`https://www.paypal.com/paypalme/jasonbrain`).
- **SEO Foundation** — Added `sitemap.xml` (root URL only; includes roadmap comments for future dynamic station/country/genre pages), `robots.txt` (blocks `/api/`, `/admin.php`, `/popout.php`, `/database/`, tooling dirs), `<meta name="description">`, and `<link rel="canonical" href="https://radio.djay.ca/">` to `template-player.html`. Submitted sitemap to Google Search Console via the `djay.ca` Domain Property (which auto-covers all subdomains including `radio.djay.ca`).
- **Mobile UX Overhaul** — Comprehensive improvements to the mobile experience in `styles.css`:
    - **iOS wallpaper fix** — `background-attachment: fixed` replaced with a `position: fixed` pseudo-element workaround on `≤ 768px`. Eliminates the iOS Safari wallpaper flash/scroll bug.
    - **Touch tap feedback** — All `.console-btn` and `.theme-btn` now scale to `0.93` on `:active` for instant visual tap confirmation.
    - **Safe area insets** — Header and main content now respect iPhone notch/Dynamic Island/home indicator via `env(safe-area-inset-*)` on all four sides.
    - **VU meters** — Switched from fixed-pixel widths to `flex: 1` on mobile so Classic, LED, Neon, Waveform, and Spectrum bars stretch full-width. Height increased to `64px` strip (up from `50px`). Circular and Retro bumped to `60×60px`.
    - **Now Playing** — Track text increased to `1.15em / font-weight: 600` for better readability at arm's length.
    - **Play button** — Rounded to `border-radius: 50%` (circle) on mobile, minimum touch target `52×52px`.
    - **Volume slider thumb** — Enlarged to `26px` for easier dragging on touchscreens.
    - **Ad container** — `margin-top` reduced to `12px`, tighter padding, full-width on mobile.
    - **Scroll behaviour** — `body` and `.main-content` set to `overflow: auto` + `height: auto` on mobile so the ad below the player is reachable. Scrollbars hidden via `scrollbar-width: none` for a clean look.
- **Favicon** — Added headphones favicon (`favicon.png`) to all pages: main player (`template-player.html`), Admin Dashboard (`admin.php`), and Pop-out (`popout.html`).
- **`.gitignore`** — Added project `.gitignore` covering `*.ffs_lock` (FreeFileSync), `api/config.php` (credentials), OS junk, and editor files.

### Changed
- **AdSense Auto Ads disabled** — switched from Auto Ads to manually placed ad slots only (`#ad-space-main` and `#ad-space-popout`). Keeps ad placement intentional and prevents Google from injecting ads into arbitrary positions in the UI.
- **Admin → Site Config UI polished** — reorganized the flat form into three distinct glass panels (📊 Analytics / 💰 Advertising / ⚙️ Advanced) with descriptive hint text under each field and a "Changes take effect on next page load" note.
- **README rewritten** — full rewrite with hero section, centered badges, feature tables by category, ASCII architecture diagram, tech stack table, detailed install guide (prerequisites, first-admin setup, upgrade path), project file tree, and Contributing section.

### Fixed
- **Ads not hiding after AJAX login** — `updateAdVisibility()` added to `settings.js`, wired into login/logout/register handlers so admins and premium users see ads disappear immediately without a page refresh.
- **`api/auth.php` missing `is_premium`** — login response now includes `is_premium` boolean so the client-side ad state is always in sync after authentication.

---

## [2.2.0] - 2026-03-11

### Added
- **Monetization & Ad Strategy:**
    - Role-based ad disabling (automatically hidden for `admin` role and `is_premium` users).
    - Premium User tier support via new `is_premium` database flag.
    - Glassmorphism-styled ad container (`#ad-space-main`) below the player card in `template-player.html`.
    - **Pop-out Ad Space:** Created `popout.php` as a PHP entry point for the popout window. Added `#ad-space-popout` (300×50 mobile banner) below the player card. Ads are hidden for `admin` and `is_premium` users via the same server-side session check used in `index.php`.
    - **Live Ad Slots:** Wired real AdSense client ID (`ca-pub-0633259514526906`) and slot IDs (`5986925744` main, `6258388483` popout) into `template-player.html` and `popout.html`.
- **Webmaster Configuration:**
    - Centralized management of Google Tag (GA4), AdSense ID, and custom head scripts via the database (`site_config` table).
    - New "Site Config" tab in the Admin Dashboard for dynamic site settings.
- **Admin Dashboard:**
    - User Management now supports toggling "Premium" status.
    - New API endpoint `api/admin/settings.php` for site configuration.
- **Database Migration**: Added `database/update_v2.2_monetization.sql` for easy upgrades.
- **Pop-out Player Enhancements:**
    - Pop-out inherits user's active background wallpaper via `?bg=` URL parameter passed from `player.js`.
    - Pop-out auto-starts playback on open.
    - Pop-out station list is now DB-aware: uses `fetchUserFavorites()` with the shared PHP session cookie for logged-in users; falls back to `localStorage` for guests.
    - Pop-out respects the `favoritesOnly` and genre filters from Settings.
    - Favorites marked with `★` in the pop-out dropdown.
    - Pop-out entry point changed from `popout.html` → `popout.php` for server-side ad injection.

### Changed
- **Settings**: Replaced obsolete "Suggest a Station" and "Report a Stream" links with a unified GitHub repository link and icon.
- **Pop-out window size**: Updated from `300×278` to `320×390` to accommodate the ad banner and account for browser window chrome.

### Fixed
- **Admin UI Accessibility**: Fixed contrast issues (black on black text) in User Edit modals and Settings labels.
- **Layout & Alignment**:
    - Fixed ad container appearing to the right of the player on wide screens.
    - Optimized mobile layout by removing large top gaps and top-aligning content.
    - Fixed page-level scrolling regression on home page; restored full-page no-scroll layout (`height: 100vh` + `box-sizing: border-box` on `.main-content`, `overflow: hidden` on `body`).
- **Ad Rendering:**
    - Fixed `TagError: No slot size for availableWidth=0` on main player — added `width: 100%` to the `<ins>` element so the AdSense library can measure a non-zero width inside the flex `.ad-placeholder` container.
    - Fixed pop-out ad not rendering: removed duplicate hardcoded GA tag from `popout.html` (now managed by `popout.php`), moved `adsbygoogle.push()` to a `window.load` listener to ensure the async AdSense library is ready before initialization.
    - Fixed pop-out ad clipped by `overflow: hidden` — added `body.popout-body` CSS overrides (`overflow-x: hidden; overflow-y: auto`) and `.ad-container`/`.ad-placeholder` width overrides to remove the main player's `width: 90%` centering constraint inside the narrow popup window.
- **Auth & Ad Sync:**
    - Fixed ads not hiding immediately after AJAX login as admin/premium — added `updateAdVisibility()` to `settings.js`, wired to login/logout/register handlers.
    - Fixed `api/auth.php` not returning `is_premium` in login response — SQL query and JSON response now include it, enabling instant client-side ad state sync.

---

## [2.1.1] - 2026-03-10

### Added
- **Roadmap**: Added long-term goals for a **Stream Crawler/Finder** with quality detection (High Quality vs Data Saver), and **Dynamic Routing/Listing Pages** for stations, countries, and genres.
- **Personalization**: Added "Wallpaper Search" and "Dynamic Preset Management" goals to the roadmap.
- **Documentation**: Created `docs/UNSPLASH_GUIDE.md` to help users/devs format direct image links from Unsplash.

### Changed
- **Presets**: Replaced the "Abstract" wallpaper preset in `settings.js` with a "Serene Nature" theme for a better glassmorphism fit.

### Fixed
- **Settings**: Fixed a critical bug where the "My Collection" tab would not refresh after logging in or out without a full page reload. This was caused by the UI refresh logic calling legacy function names (`renderCustomStations`, `renderFavorites`) instead of the consolidated `renderMyCollection` function.
- **Agent Skills**: Updated the `state-architect` and `profile-manager` skills to explicitly mandate reactive UI refreshes and the use of global lifecycle events (`stationListUpdated`) after authentication or data changes. Corrected a redundant event listener in `settings.js`.
- **Developer Guide**: Updated `DEVELOPER_GUIDE.md` to remove the "Future Plan" for state management, as the class-based `StateManager` is now the established core architecture.

---

## [2.1.0] - 2026-03-09

### Added
- **Admin Dashboard (Phase 1)**: Shipped the initial version of the Admin Control Panel (`admin.php`) allowing admins to view system stats, manage user roles, delete users, and manage system-wide default radio stations.
- **Password Reset**: Implemented a secure "Forgot Password" flow utilizing secure tokens (`random_bytes`), native PHP `mail()`, and automated token cleanup. Added "Forgot Password" and "Reset Password" UI modals.
- **Core Account Management**: Complete User Registration flow (v2.1 preview) featuring an AJAX-powered modal, secure password hashing, duplicate email checking, and basic honeypot bot protection. New accounts are automatically logged in upon creation.
- **Account Deletion**: Added a "Danger Zone" block to the Settings > Account tab allowing self-registered users to permanently delete their accounts and associated favorites.
- **Agent Skill (admin-architect)**: Introduced a new persona focused on designing and securing the future Admin Dashboard and administrative endpoints.

### Changed
- **Auth Flow Visibility**: The backend `index.php` wrapper now explicitly exposes `USER_ID` and `USER_ROLE` to the frontend `window` object for authenticated users, allowing for conditional rendering of sensitive UI elements (like hiding the delete button from the primary admin).

### Fixed
- **Directory**: Fixed an issue where logged-in users were unable to save stations from the Radio Browser Directory to their account.
- **My Collection**: Addressed an issue where Custom Stations appeared redundantly beneath the Favorites list for logged-in users by consolidating them and implementing an `is_favorite` database flag.
- **Admin UI**: Fixed a bug where the Admin icon button wouldn't dynamically appear or disappear when logging in or out as an admin without refreshing the page.

## [2.0.0] - 2026-03-09

### Added
- **Agent Skill (documentation-sentinel)**: Introduced a specialized skill to enforce documentation integrity. It prevents "cropping" of Markdown files and ensures the project's historical context (roadmap goals, changelog entries) is never lost during AI interactions.
- **Non-Intrusive AJAX Login**: Implemented a new modal-based login system that allows users to sign in or out without stopping the music or reloading the page.
- **Dedicated Auth API**: Created `api/auth.php` to handle secure, asynchronous authentication requests.
- **User Profile Management**: Logged-in users can now update their email and password directly from a new "Account" tab in the Settings modal.
- **Premium UI Polish**: Full Glassmorphism redesign of the Settings overlay with high-blur backdrops, sleek tabs, and ultra-slim custom scrollbars.
- **Improved Notifications**: Elegant inline notification system for profile updates with color-coded feedback and auto-hiding success alerts.
- **Agent Skill (profile-manager)**: Introduced a specialized skill for managing user profiles, authentication, and session security.
- **Hybrid Storage System**: The player now dynamically chooses between `localStorage` (for guests) and the MySQL database (for registered users) to save favorite stations and custom entries.

### Changed
- **Dark Mode Visibility**: Improved dropdown and select menu readability in dark mode by adding `color-scheme` support and explicit option styling.
- **Settings UX**: Redesigned all dropdown selectors with custom visuals and added scale-up animations for background presets.
- **Light Theme Contrast**: Optimized color palettes and opacity in Light mode to ensure maximum readability against translucent backdrops.
- **Unified Input Styling**: Standardized all form inputs and selects with consistent glassmorphism tokens, focus states, and box-sizing.
- **Login Flow**: Transitioned from a standalone login page to an integrated AJAX modal, ensuring perfect UI synchronization in the header when authentication state changes.

### Fixed
- **Radio Browser Search**: Restored the broken search button and enabled "Enter" key support for quick searching.
- **Login Navigation**: Added a missing close (X) button to the login overlay for easier navigation back to the main player.
- **Tab Consistency**: Implemented logic to hide the "Account" tab for guests and automatically redirect them to "General" if they log out while viewing profile settings.
- **Architectural Overhaul**: Transitioned the entire project to a full-stack PHP/MySQL architecture within the new `Radio-Stream-Player-PHP` repository.
- **cPanel Compatibility**: Flattened the directory structure, moving `index.html` (now `index.php`), CSS, and JS modules directly to the web root for immediate drop-in compatibility with shared hosting environments.
- **Backend API**: Removed hardcoded `stations.js` state. Implemented a secure PDO connection (`api/config.php`) and a RESTful endpoint (`api/stations.php`) for dynamic fetching and storage of custom user stations to a MySQL database.
- **Authentication**: Added an `index.php` wrapper utilizing the `core-cms` login paradigm to protect the player interface while allowing guest access by default.
- **UI Refinement**: Integrated login/logout actions into the player header and added a tabbed Settings interface to accommodate new management features.

---

## [1.4.0] - 2026-03-07

### Added (Development & Tooling)
-   **Agent Skills framework:** Introduced a `.agent/skills/` directory to establish explicit, file-based instructions for AI coding assistants (like myself). These `SKILL.md` files act as "personas" to maintain consistency across the codebase without needing massive context prompts.
    -   `station-curator`: Guides the AI to strictly validate, format, and structure new stream URLs according to the exact schema expected by `stations.js` (`name`, `url`, `genre`, `country`), preventing frontend breakages.
    -   `ui-consistency`: Enforces the project's signature "Glassmorphism" aesthetic. It instructs the AI to reuse existing CSS variables, specific blur values, responsive breakpoints, and accessibility standards whenever modifying `styles.css` or HTML components.
    -   `state-architect`: Enforces the Pub/Sub state management pattern.
    -   `a11y-auditor`: Guarantees accessibility standards.
    -   `audio-engineer`: Provides Web Audio API best practices.
    -   `release-manager`: Automates the Changelog and version-bumping workflows.

### Changed (v2.0 Architecture Refactor)
-   **Advanced State Management (The "Modern Restaurant" Refactor):**
    -   Replaced the chaotic global `window.radioStreamState` object with a centralized `StateManager` (Pub/Sub pattern) class in `state.js`.
    -   Decoupled DOM updating logic from click event listeners. UI components (like the Play button, Volume Slider, and Visualizer) now automatically re-render by *subscribing* to state mutations rather than polling or triggering each other manually.
    -   Fixed visualizer behavior where changing styles while paused caused the UI to completely disappear.

### Fixed
-   Fixed a bug where assigning a non-integer value to the visualizer style in `localStorage` caused the Settings dropdown to go completely blank.

---

## [1.3.0] - 2026-03-07

### Added
-   **Directory:** Integrated the public Radio Browser API, allowing users to search and add tens of thousands of community-driven radio stations natively from the Settings modal.
-   **Custom Stations:** Created a new "My Stations" tab in the Settings modal. It now includes a dedicated UI to manage and delete "Favorite" stations alongside custom URLs.
-   **UI/UX:** Organized the Settings modal into a tabbed interface ("General", "My Stations", "Directory") to improve usability and reduce vertical scrolling.

### Fixed
-   **Playback:** Implemented robust auto-reconnect logic. Long-running streams or network drops will no longer silently freeze the player; the audio element will now automatically detect unexpected disconnects and seamlessly restart the stream buffer in the background without requiring user interaction.
---

## [1.2.1] - 2026-03-02

### Added
-   **Custom Stations:** Added the ability to edit the Name, URL, and Genre of existing custom stations directly within the Settings modal.
-   **Content:** Added "Hirsch Radio Psytrance" and "Hirsch Radio Progressive" to the default stations list.

### Changed
-   **Audio Routing:** `player.js` now routes *all* streams (both HTTP and HTTPS) through the Cloudflare proxy (`api.djay.ca`). This ensures the Web Audio API always receives the correct `Access-Control-Allow-Origin: *` headers required to render the VU meters without CORS errors.
-   **Popout Player:** Updated the popout player (`popout.html` & `popout-script.js`) to achieve feature parity with the main player. It now supports the scrolling "Now Playing" metadata marquee, Custom Stations, and secure proxy routing for CORS.

### Fixed
-   **UI/UX:** Fixed an issue where very long track names (like continuous DJ mixes or Progressive Psytrance titles) would stretch the glassmorphism player layout horizontally.
-   **Backend:** Prevented the frontend from polling the `/metadata` endpoint when playback is paused or stopped to save unnecessary Cloudflare requests.
-   **Codebase:** Cleaned up unused CSS rulesets.

### Documentation
-   **Backend:** Added a "Request Limits & Usage Estimation" section to `DEVELOPER_GUIDE.md` and `server/cloudflare-worker/README.md` to explain how Cloudflare Free Tier limits impact concurrent listener capacity.
-   **Backend:** Added instructions on how to optimize the frontend polling interval (`12000` ms) to drastically reduce Cloudflare Request volume.

---

## [1.2.0] - 2026-03-01

### Added
-   **Backend / Security:** Created a Cloudflare Worker script (`api.djay.ca`) to act as a secure proxy, tunneling insecure HTTP radio streams over HTTPS to bypass Mixed Content restrictions natively. The Worker also includes security checks to only allow traffic from the `djay.ca` and `localhost` domains.
-   **Metadata:** Implemented a new `/metadata` endpoint on the Cloudflare Worker that securely fetches and parses `Icy-MetaData` blocks.
-   **UI / UX:** Added a new "Now Playing" area to the player header. If the track name is too long, a CSS marquee animation is automatically applied.
-   **State Management:** The global `radioStreamState` now tracks a `metadataInterval` polling timer.

### Changed
-   **Audio Routing:** `player.js` now automatically detects `http://` stream URLs and dynamically routes them through the `api.djay.ca` proxy.
-   **Metadata Polling:** `player.js` now polls the `/metadata` endpoint every 12 seconds to fetch the current track name and gracefully falls back to the station name if metadata is unavailable.
-   **Media Integration:** The OS media lock screen (via Media Session API) now dynamically updates with the currently playing track name fetched from the proxy.

### Fixed

### Documentation
-   **Roadmap:** Moved "Stream Metadata Display" and "Backend Service (Cloudflare Worker Proxy)" from Mid/Long-Term goals to Completed status.
-   **Developer Guide:** Updated the Deployment Considerations section to reflect the active Cloudflare Worker architecture.

---

## [1.1.2] - 2026-02-28

### Added
-   **Personalization:** Added "Custom Backgrounds" feature. Users can now set a custom image URL as the player background via the Settings modal.
-   **Personalization:** Added a "Background Presets" grid in Settings, allowing users to quickly switch between curated high-quality themes (Default, Cyberpunk, Deep Space, Abstract).
-   **Community:** Added "Suggest a New Station" and "Report a Broken Stream" links to the Settings modal, pointing to GitHub issue templates.
-   **Visualizer:** Added a new "Neon" VU meter style with a glowing effect.
-   **Metadata:** Implemented Media Session API support. The player now displays station information (Name, Genre, Country) on the OS lock screen and media controls, and supports hardware media keys (Play/Pause/Next/Prev).

### Changed
-   **UI/UX:** The "Favorite" button is now disabled when "Show Favorites Only" is active to prevent accidental removal of the currently playing station from the filtered list.

### Fixed
-   **Visualizer:** Fixed an issue where the "Circular" VU meter was not displaying correctly due to incorrect CSS selectors and SVG class assignment.
-   **Mobile:** Fixed "Classic" and "Neon" VU meters not animating correctly on mobile devices (animating width instead of height).
-   **UI/UX:** Fixed a layout issue where the settings modal was not scrollable on small screens, preventing access to all options.

### Documentation
-   **Roadmap:** Updated the "Backend Service" goal to specifically target a Cloudflare Worker solution for handling HTTP streams on HTTPS sites.
-   **General:** Migrated changelog from `PROGRESS.md` to `CHANGELOG.md`.
-   **Roadmap:** Added plans for "Custom Backgrounds" (Mid-Term) and image uploads (Long-Term).
-   **Roadmap:** Added plans for "Community & Feedback" features, including station submission and broken stream reporting.

## [1.1.1] - 2025-12-10

### Changed
-   **UI/UX:** Redesigned the header to be more compact, reducing its vertical height to save screen space.
-   **UI/UX:** Implemented a "Glassmorphism" (frosted glass) effect for the main player card and header for a more modern look.
-   **UI/UX:** Replaced text-based "Play/Pause" and "Pop-out" buttons with clean SVG icons.
-   **UI/UX:** Redesigned the volume slider with a dynamic "fill" track and updated thumb for a more modern appearance.
-   **UI/UX:** Re-organized player controls into a compact, horizontal layout for a sleeker appearance.
-   **UI/UX:** Applied the modern "Glassmorphism" design and horizontal control layout to the pop-out player for a consistent user experience.

---

## [1.1.0] - 2025-12-09

### Added
-   **Accessibility:** Added `aria-label` attributes to all icon-only buttons for screen reader support.
-   **Accessibility:** Implemented `:focus-visible` CSS states for clear keyboard navigation outlines.
-   **UI/UX:** The VU meter style-cycle button now has a dynamic tooltip that displays the name of the current style.
-   **Content:** Added several new high-quality Trance and Psytrance radio streams.

### Changed
-   **Code Refactoring:** Modularized the monolithic `script.js` into `player.js`, `visualizer.js`, and `stations.js` to improve maintainability.
-   **Pop-out Player:** Refactored the pop-out player logic to reuse the main player module and made the closing mechanism more reliable with a polling fallback.

---

## [1.0.0] - 2025-12-07

### Added
-   **Core Player:** Audio playback, volume controls, and station selector.
-   **State Management:** Remembers last station and volume.
-   **Visualizer Engine:** Real-time audio analysis with 6 initial styles (Classic, LED, Circular, Waveform, Spectrum, Retro).
-   **UI/UX:** Light/Dark themes with auto-detection.
-   **Pop-out Player:** Ability to launch the player in a compact, separate window.
-   **Documentation:** Initial `README.md` and `DEVELOPER_GUIDE.md`.