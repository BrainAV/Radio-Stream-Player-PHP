---
name: admin-architect
description: Expertise in designing and implementing secure administrative controls and dashboards for the Radio Stream Player.
---

# Admin Architect Skill

Use this skill when developing the Admin Control Panel (CP), managing user roles, creating administrative endpoints, or modifying the Site Config system. This skill ensures that administrative powers are granted securely and that the dashboard maintains the project's signature "Glassmorphism" aesthetic.

## 🎯 Core Objectives

1.  **Strict Authorization**: Never trust the client.
    - Always verify `$_SESSION['user_role'] === 'admin'` on the server before executing any admin action.
    - Implement a "Master Gatekeeper" check at the top of every `api/admin/` file.
2.  **UI Consistency**: The Admin CP uses the same glassmorphism tokens and responsive glass cards as the main player.
3.  **Operational Efficiency**: Design tools that make managing thousands of stations and users easy (bulk actions, search/filter).

## 🏗️ Current Admin Dashboard State (v2.2)

The Admin Dashboard (`admin.php` + `admin.js`) is **fully implemented** with four sections accessible via the sidebar:

| Tab | ID | Status | Description |
|---|---|---|---|
| Dashboard | `dashboard-view` | ✅ Live | Stats: total Users, System Stations, Favorites |
| Users | `users-view` | ✅ Live | Table of all users; Edit role + Premium toggle; Delete with protection |
| Stations | `stations-view` | ✅ Live | Add/Edit/Delete system stations (type=`default`) |
| Site Config | `settings-view` | ✅ Live | Three panels: Analytics (GA4), Advertising (AdSense ID), Advanced (Custom Head Code) |

**API Endpoints:**
- `api/admin/stats.php` — dashboard counts
- `api/admin/users.php` — GET/PUT/DELETE users; PUT supports `role` and `is_premium`
- `api/admin/stations.php` — GET/POST/PUT/DELETE system stations
- `api/admin/settings.php` — GET/POST `site_config` key-value store

**`site_config` table keys:**
- `google_tag_id` — GA4 measurement ID, injected as `gtag.js` in `<head>`
- `adsense_id` — AdSense publisher ID, injected as `adsbygoogle.js` in `<head>`
- `custom_head_code` — raw HTML injected into every page `<head>`

## 🛠️ Technical Guidelines

### 1. Secure Endpoint Pattern (PHP)

```php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

// The Master Gatekeeper
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden.']);
    exit();
}
```

### 2. Site Config Pattern

When reading site config in a page entry point (e.g. `index.php`, `popout.php`):
```php
$stmt = $pdo->query("SELECT config_key, config_value FROM site_config");
$siteConfig = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
$googleTagId = $siteConfig['google_tag_id'] ?? '';
$adsenseId   = $siteConfig['adsense_id'] ?? '';
```
Config is injected into `<head>` server-side — **never** read from JS.

### 3. Premium User Flag

The `is_premium` column on the `users` table controls ad suppression. The Admin Users tab can toggle it via `api/admin/users.php PUT`. When toggling, the session must be invalidated or the user must re-login for it to take effect server-side.

### 4. Dashboard Navigation

Tab switching is pure JS in `admin.js`:
- Show/hide `.admin-view` sections by `id`
- Call data loaders per tab: `loadStats()`, `loadUsers()`, `loadStations()`, `loadSettings()`

## 📋 Common Workflows

- **Adding a new Admin section**:
  1. Add a `<button data-target="new-view">` to the sidebar in `admin.php`.
  2. Add a `<section id="new-view" class="admin-view" style="display:none;">` in the main content area.
  3. Add `if (targetId === 'new-view') loadNewView();` to the nav click handler in `admin.js`.
  4. Create the corresponding `api/admin/new-endpoint.php` with the Gatekeeper pattern.

- **Adding a Site Config field**:
  1. Add the `<input>` or `<textarea>` to `#settings-view` in `admin.php`.
  2. Read/write it in `loadSettings()` / save handler in `admin.js`.
  3. Use it in `index.php` / `popout.php` by reading from `$siteConfig['new_key']`.

## 🚨 Constraints
- **NEVER** expose the Admin CP link in the header for non-admin users.
- **ALWAYS** use HTTPS for all admin interactions to protect session cookies.
- Destructive actions (delete user, delete station) **MUST** have a `confirm()` dialog and server-side ownership checks.
- **DO NOT** allow deleting user ID `1` or the currently logged-in admin (self-lockout prevention).
