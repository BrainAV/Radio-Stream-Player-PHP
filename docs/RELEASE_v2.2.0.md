# 🎉 Release Notes — v2.2.0: Monetization & Pop-out Evolution

**Released:** 2026-03-11

This release introduces the full monetization infrastructure, a significantly upgraded pop-out player, and a real-time fix for ad visibility when logging in as an admin or premium user.

---

## 💰 Monetization & Ad Infrastructure

The Radio Stream Player now has a proper, production-ready advertising setup that's fully role-aware:

- **Two live ad slots** wired and ready:
  - Main player — responsive display ad below the player card
  - Pop-out window — 300×50 fixed mobile banner below the compact player
- **Role-based suppression** — ads are automatically disabled for `admin` users and `is_premium` account holders, both at page-load (server-side, via `index.php` / `popout.php`) *and* immediately after AJAX login (client-side, via the new `updateAdVisibility()` helper in `settings.js`) — **no page refresh required**.
- **Premium user tier** — admins can now toggle `is_premium` status per user in the Admin Dashboard.

---

## 🖥️ Admin Dashboard & Webmaster Config

- **Site Config tab** in the Admin Dashboard lets you manage Google Tag (GA4), AdSense ID, and custom head scripts from a UI — no file editing required.
- **User Management** now includes a Premium toggle per user.
- New `api/admin/settings.php` endpoint powers the Site Config UI.
- Database migration script: `database/update_v2.2_monetization.sql`.

---

## 📻 Pop-out Player Overhaul

The pop-out player is now a first-class citizen:

- 🖼️ **Background sync** — inherits your active wallpaper (custom URL or preset) automatically on open.
- ▶️ **Auto-starts** playback immediately on launch.
- 📋 **Full station list** — for logged-in users, fetches your complete DB-backed favorites list using the shared PHP session. Guests fall back to `localStorage`.
- ⭐ **Favorites marked with ★** in the dropdown.
- 🔍 **Filter-aware** — respects your "Show Favorites Only" and genre filter settings from the main player.
- 🌐 Served by the new `popout.php` for server-side ad injection (same pattern as `index.php`).

---

## 🐛 Bug Fixes

| Fix | Detail |
|---|---|
| Page scrolling regression | Restored full-page no-scroll layout with `overflow: hidden` on `body` and `height: 100vh` on `.main-content` |
| Ad `availableWidth=0` error | Added `width: 100%` to main player `<ins>` to fix zero-width flex child issue |
| Pop-out ad not rendering | Removed duplicate GA tag; moved `adsbygoogle.push()` to `window.load` event |
| Pop-out ad width constraint | Added `body.popout-body` CSS overrides to remove `width: 90%` ad container style in the narrow window |
| Ads visible after admin login | `api/auth.php` now returns `is_premium` in login response; `updateAdVisibility()` hides ads instantly |
| Admin UI contrast | Fixed black-on-black text in User Edit modals and Settings labels |

---

## ⚠️ Known Quirks

- The pop-out 300×50 banner may require manual window widening on some browser/OS combinations before AdSense fully renders. Investigation ongoing for v2.3.
- `IS_PREMIUM` state in the pop-out window is not synced if the user logs in or out *after* the pop-out is already open. Ads will only update on next pop-out open.

---

## 🗃️ Database

If upgrading from v2.1.x, run the migration script:
```sql
-- database/update_v2.2_monetization.sql
```

---

*Thank you for using Radio Stream Player! 🎵*
