# Release Notes - v2.2.5

## 🔒 The "Persistence & Integrity" Release

This release focuses on user experience stability and architectural rigor, ensuring the Radio Stream Player is as reliable as it is beautiful.

### ✨ What's New

-   **Stay Logged In (Remember Me)** — You can now check "Remember Me" during login to stay authenticated for 30 days. This is especially useful for PWA users who want to jump straight back into their music without re-entering credentials.
-   **Press Enter to Login** — Added a convenient keyboard shortcut; you can now press "Enter" in the password field to submit your login.
-   **Seamless Session Recovery** — The app now intelligently restores your session across the main player, admin panel, and pop-out window.
-   **Architectural "Source of Truth"** — We've formalized our database schema management. The master `schema.sql` is now always in sync with our update migrations, ensuring a flawless setup experience for new installations.

### 🛠️ Developer Improvements
-   **`database-architect` Skill** — Reinforced with strict synchronization rules to prevent environment drift.
-   **Developer Guide v8.0** — Added a dedicated Database Management section detailing our schema integrity policy.

---
*Version 2.2.5 is now live. Your PWA will automatically update to the latest version on your next visit!*
