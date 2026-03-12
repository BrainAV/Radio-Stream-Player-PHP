# Release v2.2.1 📦

This release focuses on UI/UX polish, fixing a desktop centering regression, and integrating advertisements natively into the player card for a cleaner "Glassmorphism" experience.

## ✨ Key Features & Improvements

- **💰 Integrated Ad Layout**: Moved the primary ad unit inside the player card as a native Bottom Row. This ensures a cohesive look and prevents layout shifts.
- **📐 Desktop Centering Fix**: Restored vertical centering for the player on desktop, particularly for admins and premium users where ads are suppressed.
- **⚡ Station Auto-Play**: The player now automatically starts playback when a new station is selected from the dropdown, reducing user friction.
- **🏷️ Dynamic Browser Title**: The browser tab title now dynamically updates to show the currently playing track or station name.
- **☕ Donations Link**: Added a "Support the Project" section to the General settings tab with a direct PayPal link.

## 🛠️ SEO & Mobile Optimization

- Added `sitemap.xml`, `robots.txt`, and canonical tags for better search engine indexing.
- Comprehensive mobile UX overhaul including iOS-specific background fixes, safe area inset support, and enlarged touch targets.
- Improved VU meter responsiveness on small screens.

## 🐞 Bug Fixes

- Fixed ads not hiding immediately after AJAX login for admins/premium users.
- Resolved AdSense "No slot size" error and layout overlap issues.
- Fixed `api/auth.php` missing `is_premium` flag in login response.

---
*For a full list of changes, see the [Changelog](../CHANGELOG.md).*
