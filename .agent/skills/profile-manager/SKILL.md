---
name: profile-manager
description: Expertise in managing user profiles, authentication, and session security within the Radio-Stream-Player-PHP ecosystem.
---

# User Profile Manager Skill

Use this skill when modifying user profile systems, authentication flows, or database interactions involving user data. This skill ensures that the application maintains security, consistency with the `core-cms` schema, and a seamless hybrid storage experience.

## 🎯 Core Objectives

1.  **Security First**: Always prioritize secure operations.
    - Use PDO with prepared statements for all database interactions.
    - Never expose raw passwords. Use `password_hash()` and `password_verify()`.
    - Sensitive updates (email/password) **MUST** require validation of the current password.
2.  **Schema Consistency**: Adhere to the `users` table schema defined in `database/schema.sql`.
    - Primary fields: `id`, `user_email`, `user_pass`, `display_name`, `role`, `avatar`.
3.  **Hybrid Experience**: Ensure the player correctly handles both Guests and Users.
    - Guests: Rely on `localStorage` for favorites and settings.
    - Users: Sync data with the MySQL database via `api/`.
4.  **Error Handling**: Provide clear, JSON-formatted error responses from PHP endpoints.
    - Use appropriate HTTP status codes (200, 400, 401, 403, 500).

## 🛠️ Technical Guidelines

### 1. Database Interactions (PHP)
Always include `api/config.php` and use the `get_db_connection()` function.

```php
require_once __DIR__ . '/config.php';
$pdo = get_db_connection();
// ... use prepared statements
```

### 2. Frontend-Backend Sync
When modifying the "Account" tab in the settings modal (`settings.js`), ensure it correctly fetches data from `api/profile.php` and handles the "Guest" state gracefully (e.g., by prompting the user to log in).

### 3. Session Management
Always start the session with `session_start()` at the top of API files that require authentication.

## 📋 Common Workflows

- **Adding a Profile Field**:
  1. Update `database/schema.sql`.
  2. Update `api/profile.php` to handle the new field in GET and POST requests.
  3. Update `settings.js` to render the new field in the UI.
- **Debugging Auth**:
  1. Check `api/config.php` for DB connectivity.
  2. Verify session variables in `index.php` (login wrapper).
  3. Inspect XHR/Fetch requests in the browser console for 401/403 errors.

## 🚨 Constraints
- Do **NOT** use `root` or `admin` user hardcoded in the codebase for DB connections (use `config.php` variables).
- Do **NOT** bypass `api.js` for data fetching; maintain the service layer abstraction where possible.
