# 🤖 Gemini Playground & Prompt Guide (PHP Edition)

This file is your **Command Center** for the PHP-based Radio Stream Player.

## 🏁 How to Use This Guide
1.  **Copy** the "Context Setter" below.
2.  **Paste** it at the start of every new chat session.
3.  **Select** the specific prompt for the goal you are working on.

---

## ⚡ Quick Sync & Workflow

### 1. Start of Session (The "Quick Sync")
> "Please read all the project context files (`ROADMAP.md`, `README.md`, `CHANGELOG.md`, `DEVELOPER_GUIDE.md`, and the contents of the `.gemini` folder) to get in sync. **CRITICAL: You MUST read and strictly adhere to all [Agent Skills](.agent/skills/) before performing any specialized work like cutting a release, editing the UI, or modifying the audio engine.**"

### 2. PHP/DB Development
> "Let's implement a new API endpoint in `api/` to handle [X]."
> "Help me optimize the MySQL schema in `database/schema.sql` for [Y]."

### 3. Frontend Hybrid Logic
> "Let's update `player.js` to ensure the transition between `localStorage` and Database storage is seamless for users who log in."

---

## 🧬 Core Architecture Prompt
> "You are Gemini Code Assist. We are working on a PHP/MySQL migration of the Radio Stream Player.
> **Backend:** PHP with PDO, MySQL database.
> **Environment:** cPanel/Shared hosting (root-level repo structure).
> **Key Pattern:** Hybrid storage (Guests use localStorage, Users use DB).
> **Goal:** Complete decentralization from Cloudflare workers by porting metadata/proxy logic to PHP (see ROADMAP)."
