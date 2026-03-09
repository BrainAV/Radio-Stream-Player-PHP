# Release Notes - v2.0.0 🚀

**Date:** 2026-03-09
**Codename:** *The PHP Awakening*

We are proud to announce the official release of **Radio Stream Player v2.0.0**. This milestone represents a complete architectural evolution from a static frontend to a full-stack PHP/MySQL application.

## 🌟 Key Highlights

### 🐘 Full PHP Backend Migration
The player has moved away from simple `localStorage` to a robust, self-hosted PHP backend. This enables persistent user accounts, cloud-synced favorites, and a scalable foundation for future community features.

### 🎵 Non-Intrusive "Stay-in-the-Groove" Login
Our new **AJAX Authentication** system allows you to log in and out through a sleek modal overlay. Best of all? **The music never stops.** No page reloads, no stream interruptions—just seamless access to your account.

### 🌗 Dark Mode UI Polish
We've squashed visibility bugs in dark mode. Dropdown menus and form elements now feature native `color-scheme` support and refined contrast, making late-night listening sessions easier on the eyes.

## 🛠️ What's New in v2.0.0

- **New features:**
    - Dedicated `api/auth.php` for secure sessions.
    - Cloud-synced "Favorites" and "Custom Stations" (saved to DB).
    - "Account" tab in settings for easy profile updates.
    - Standardized "Glassmorphism" form components.
- **Improvements:**
    - Instant header UI updates after login/logout.
    - Fixed high-contrast issues for dropdowns in Dark Mode.
    - Optimized "Radio Browser" search integration.

## 🏗️ Technical Notes
Users migrating from v1.x will need to create a database using the provided `database/schema.sql` (if applicable) and configure `api/config.php`.

---
*Thank you for being part of the Radio Stream Player journey!*
