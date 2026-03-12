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

### 4. Initialization & Lifecycle
When a module boots up, it should perform an initial read of the state (e.g., `const initialState = stateManager.getState()`) to set its UI to the correct starting values before attaching its subscription.

### 5. Global Lifecycle Events
For UI components that rely on external data sync (like PHP API calls) rather than just simple state toggles, use Custom Events to trigger broad refreshes across modules:
1.  **Event Names:** Use standard names like `stationListUpdated` (when favorites/custom stations change) or `settingsOpened`.
2.  **Usage:** Dispatch the event after a successful API write or auth state change:
    ```javascript
    window.dispatchEvent(new CustomEvent('stationListUpdated'));
    ```
3.  **Consumption:** Modules (like the Station Dropdown or Settings List) should listen for these events to re-fetch/re-render their content.

### 2. Frontend-Backend Sync
When modifying the "Account" tab in the settings modal (`settings.js`), ensure it correctly fetches data from `api/profile.php` and handles the "Guest" state gracefully (e.g., by prompting the user to log in).

### 3. Session Management
Always start the session with `session_start()` at the top of API files that require authentication.

## 📋 Common Workflows

- **Adding a Profile Field**:
  1. Update `database/schema.sql`.
  2. Update `api/profile.php` to handle the new field in GET and POST requests.
  3. Update `settings.js` to render the new field in the UI.
- **User Registration**:
  1. Ensure `user_email` is unique and valid.
  2. Hash passwords using `PASSWORD_DEFAULT`.
  3. Assign the default `role` (usually 'editor').
- **Account Deletion**:
  1. Verify the current password before proceeding.
  2. Delete the user record from the `users` table.
  3. Rely on database `ON DELETE CASCADE` for secondary table cleanup (like favorites).
  4. Destroy the session and redirect to the home page (or update home page state).
- **Debugging Auth**:
  1. Check `api/config.php` for DB connectivity.
  2. Verify session variables in `index.php` (login wrapper).
  3. Inspect XHR/Fetch requests in the browser console for 401/403 errors.

## 🚨 Constraints
- Do **NOT** use `root` or `admin` user hardcoded in the codebase for DB connections (use `config.php` variables).
- Do **NOT** bypass `api.js` for data fetching; maintain the service layer abstraction where possible.
- Registration **MUST** include basic throttle/honeypot protection where applicable to prevent simple bot spam.
- **UI Refresh After Auth**: After every successful login or logout, you **MUST** call the following in this order in `settings.js`:
  1. Update global state: `window.IS_LOGGED_IN`, `window.USER_ID`, `window.USER_ROLE`, `window.IS_PREMIUM`.
  2. Call `updateAdVisibility()` — hides or restores `#ad-space-main` immediately for admin/premium users **without a page refresh**. Omitting this causes ads to remain visible for admins until they manually reload the page.
  3. Call `updateAuthButton()` — updates the login/logout button in the header.
  4. Call `refreshAppData()` — re-fetches station/favorites data and dispatches `stationListUpdated`.
  
  ```javascript
  // Correct login success sequence — DO NOT change the order
  window.IS_LOGGED_IN = true;
  window.USER_ID = data.user_id;
  window.USER_ROLE = data.role;
  window.IS_PREMIUM = data.is_premium === true || data.is_premium === 1;
  if (loginModal) loginModal.style.display = 'none';
  updateAuthButton();
  updateAdVisibility(); // ← MUST be here — not optional
  refreshAppData();
  ```
  
- **`api/auth.php` login response MUST include `is_premium`**: The PHP login endpoint must return `"is_premium": true/false` alongside `role` and `user_id` so the client can set `window.IS_PREMIUM` immediately. Without this, `updateAdVisibility()` cannot function correctly.
