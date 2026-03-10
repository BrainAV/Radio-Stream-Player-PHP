---
name: admin-architect
description: Expertise in designing and implementing secure administrative controls and dashboards for the Radio Stream Player.
---

# Admin Architect Skill

Use this skill when developing the Admin Control Panel (CP), managing user roles, or creating administrative endpoints. This skill ensures that administrative powers are granted securely and that the dashboard maintains the project's signature "Glassmorphism" aesthetic.

## 🎯 Core Objectives

1.  **Strict Authorization**: Never trust the client.
    - Always verify the `$_SESSION['user_role'] === 'admin'` on the server before executing any admin action.
    - Implement a "Master Gatekeeper" check in a centralized config or auth file for admin routes.
2.  **Auditability (Future)**: Prepare for logging admin actions (who deleted what, when).
3.  **UI Consistency**: The Admin CP should look and feel like part of the player, utilizing the same glassmorphism tokens, blurs, and responsive cards.
4.  **Operational Efficiency**: Design tools that make managing thousands of stations and users easy (e.g., bulk actions, search/filter).

## 🛠️ Technical Guidelines

### 1. Secure Endpoint Example (PHP)

```php
session_start();
require_once __DIR__ . '/config.php';

// The Gatekeeper
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden: Admin access required.']);
    exit();
}
```

### 2. Dashboard Layout
- Use a sidebar or tabbed interface for different sections (Stations, Users, Feedback).
- Display high-level stats (Total Users, Active Stations, Pending Reports) at the top.
- Use a "Glass Table" design for data grids.

## 📋 Common Workflows

- **Creating an Admin Endpoint**:
  1. Add the role check gatekeeper.
  2. Implement the core logic (e.g., `DELETE FROM stations WHERE id = ?`).
  3. Return JSON feedback with success/error messages.
- **Managing Default Stations**:
  1. Create a UI to edit the `stations` table where `type = 'default'`.
  2. Ensure changes are reflected immediately in the player for all users.
- **Handling Broken Stream Reports**:
  1. Fetch reports from the database.
  2. Provide "Fix" (edit URL) and "Dismiss" (delete report) buttons.

## 🚨 Constraints
- **NEVER** expose the Admin CP link in the header for non-admin users.
- **ALWAYS** use HTTPS for all admin interactions to protect session cookies.
- Avoid "destructive by default" buttons; intensive actions (like deleting a user) should have a confirmation dialog.
