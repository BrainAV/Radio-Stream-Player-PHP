# 📻 Radio Stream Player v2.1.0 Release Notes

Welcome to **v2.1.0**! This milestone release finalizes our **Core Account Management** features, empowering users to take full control of their accounts and providing a seamlessly unified collection management experience.

---

## 🚀 What's New

### 👤 Self-Service Account Management
*   **User Registration**: Brand new seamless, AJAX-powered registration flow within the player. Includes secure password hashing, duplicate email checks, and honeypot bot protection. Users are automatically logged in upon creation!
*   **Password Resets**: Forgot your password? No problem. A secure, token-based "Forgot Password" flow utilizing native PHP `mail()` and automated token cleanup is now fully functional.
*   **Account Deletion**: Users now have full ownership over their data. We've added a "Danger Zone" in the Account settings, allowing self-registered users to permanently delete their accounts and wipe all associated favorites.

### 🤖 Expand Agentic Capabilities
*   **New Agent Persona (`admin-architect`)**: Introduced a specialized skill to enforce security strictly and help design our future Admin Dashboard and backend control endpoints.

### 🛡️ Admin Dashboard (Phase 1)
*   **System Admin Control Panel**: We've launched the first iteration of the dedicated Admin Dashboard! Administrators can now safely access `admin.php` to view system-wide stats, modify user roles (escalate users to editors/admins), delete rogue accounts, and globally manage the list of default stations available to all users.

---

## 🔄 Improvements & Changes

*   **⚡ Dynamic Authorization State**: The `index.php` wrapper has been augmented to expose `USER_ID` and `USER_ROLE` straight to the frontend window object. This enables snappy, conditional rendering of sensitive UI elements—for example, instantly hiding the account "Delete" button from the primary system admin without a reload.

---

## 🛠️ Bug Fixes

*   **📂 Unified "My Collection"**: Fixed the confusing UI redundancy where "Custom Stations" and "Favorites" overlapped for logged-in users. Everything is now consolidated into a sleek "My Collection" list! You can now save stations *without* starring them on the player, via the new `is_favorite` database flag.
*   **📡 Directory Save Fix**: Crushed a bug that was preventing logged-in users from saving new stations discovered in the Radio Browser Directory directly to their accounts.
*   **⚙️ Admin UI Visibility**: Addressed a caching snag where the Admin Control icon button wouldn't dynamically toggle on/off when logging in/out without a hard page refresh.

---

*Thank you for listening! We're already gearing up for our next major milestone involving the Admin Dashboard. Tune in soon!*
