---
name: monetization-guard
description: Enforces the two-layer ad suppression architecture (server-side PHP + client-side JS) for admin and premium users, preventing ads from appearing for privileged accounts at any point in the session lifecycle.
---

# Monetization Guard Skill

Use this skill whenever touching ad containers, authentication flows, the `site_config` system, or the `is_premium` flag. The Radio Stream Player uses a deliberate two-layer approach to ensure ads never appear for `admin` or `is_premium` users — not on page load, and not after AJAX login.

## ⚠️ The Core Problem This Skill Prevents

AdSense ad containers are revealed **server-side at page load** by `index.php` / `popout.php`. After AJAX login (music keeps playing, no page reload), PHP has no opportunity to re-run. Without an explicit client-side update, the ad container remains visible for admins until the user manually refreshes the page.

This bug was fixed with `updateAdVisibility()` in `settings.js`. **Every future auth change must call it.**

---

## 🏗️ The Two-Layer Architecture

### Layer 1: Server-Side (PHP — page load)

`index.php` and `popout.php` read the `site_config` table and PHP session on every page load:

```php
// 1. Inject AdSense library only if adsense_id is configured
if (!empty($adsenseId)) {
    echo '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
       . '?client=' . htmlspecialchars($adsenseId) . '" crossorigin="anonymous"></script>';
}

// 2. Reveal the ad container only for eligible users
$isAdmin     = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
$isPremium   = isset($_SESSION['is_premium']) && $_SESSION['is_premium'];
$showAds     = !empty($adsenseId) && !$isAdmin && !$isPremium;

if ($showAds) {
    echo '<script>document.getElementById("ad-space-main").style.display = "block";</script>';
}
```

### Layer 2: Client-Side (JS — after AJAX login/logout)

`updateAdVisibility()` in `settings.js` must be called after every auth state change:

```javascript
function updateAdVisibility() {
    const adSection = document.getElementById('ad-space-main');
    if (!adSection) return;
    const isPrivileged = window.USER_ROLE === 'admin' || window.IS_PREMIUM === true;
    adSection.style.display = isPrivileged ? 'none' : '';
}
```

**Call order after login success — DO NOT deviate:**
```javascript
window.IS_LOGGED_IN = true;
window.USER_ID      = data.user_id;
window.USER_ROLE    = data.role;
window.IS_PREMIUM   = data.is_premium === true || data.is_premium === 1;
updateAuthButton();
updateAdVisibility(); // ← Layer 2 — hide/show ads immediately
refreshAppData();
```

**Call order after logout success:**
```javascript
window.IS_LOGGED_IN = false;
window.USER_ID      = null;
window.USER_ROLE    = null;
window.IS_PREMIUM   = false;
updateAuthButton();
updateAdVisibility(); // ← restore ads for guests
refreshAppData();
```

---

## 📦 Ad Container Reference

| Container | File | Format | Scope |
|---|---|---|---|
| `#ad-space-main` | `template-player.html` | Responsive display (`data-ad-format="auto"`) | Main player |
| `#ad-space-popout` | `popout.html` | Fixed 300×50 banner | Pop-out window |

Both containers are `display: none` by default. They are revealed only by the server-side PHP script on page load (Layer 1). The JS layer (Layer 2) can only hide them — it never reveals them (revealing is PHP's job).

---

## 🔑 `api/auth.php` Login Response Contract

The login endpoint **MUST** return `is_premium` in its JSON response. Without it, `window.IS_PREMIUM` will be `undefined` and Layer 2 will not function for premium users.

```php
echo json_encode([
    'status'     => 'success',
    'user_id'    => $user['id'],
    'role'       => $user['role'],
    'is_premium' => (bool)$user['is_premium'] // ← required
]);
```

SQL query must SELECT `is_premium`:
```sql
SELECT id, user_pass, role, is_premium FROM users WHERE user_email = ?
```

---

## 🏷️ `is_premium` Flag Lifecycle

| Action | Where |
|---|---|
| **Set in DB** | `api/admin/users.php` PUT — admin toggles per user |
| **Read on page load** | `index.php`, `popout.php` — via PHP session after login |
| **Returned on login** | `api/auth.php` — in JSON login response |
| **Set client-side** | `settings.js` — `window.IS_PREMIUM = data.is_premium` |
| **Checked client-side** | `updateAdVisibility()` in `settings.js` |

---

## ⚠️ Known Limitations (v2.2)

- **Pop-out IS_PREMIUM sync**: `window.IS_PREMIUM` in the pop-out window is not synced if the user logs in/out in the main window after the pop-out is already open. Pop-out ads will only update on next open. Acceptable for v2.2.
- **Auto Ads disabled**: Google AdSense Auto Ads is intentionally disabled. Only `#ad-space-main` and `#ad-space-popout` are used. Do not re-enable Auto Ads without explicit instruction.

---

## 🚨 Constraints

- **NEVER** reveal an ad container in JavaScript — that is PHP's job at page load. JS only hides.
- **ALWAYS** call `updateAdVisibility()` after every login, logout, and registration success.
- **NEVER** modify `api/auth.php` login response without ensuring `is_premium` remains in the output.
- **DO NOT** add new ad placements without also implementing the two-layer suppression for both `admin` and `is_premium` users.
- AdSense client ID and slot IDs are **hardcoded** in `template-player.html` and `popout.html`. The `adsense_id` in `site_config` controls only whether the AdSense library script is injected — it does not control slot IDs.
