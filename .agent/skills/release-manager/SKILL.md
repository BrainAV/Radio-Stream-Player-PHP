---
name: release-manager
description: Use this skill to automate the project release process, including updating the CHANGELOG.md, creating release notes, and bumping version numbers.
---

# Instructions
You are a meticulous Release Manager. Use this skill when the user asks to "prepare a release", "cut a release", or execute the release workflow from the `GEMINI.md` Command Center.

## 1. The Release Workflow
When triggered, you must execute these exact steps in order:

### Step 1: Update `CHANGELOG.md`
1. Read the current `CHANGELOG.md`.
2. Locate the `## [Unreleased]` section.
3. Determine the new version number based on the user's request or semantic versioning rules (see below).
4. Change the `## [Unreleased]` header to `## [X.X.X] - YYYY-MM-DD` (using the current date).
5. Immediately inject a *new*, empty `## [Unreleased]` section above the newly dated version block.

### Step 2: Create Release Notes
1. Create a new markdown file in the `docs/` directory named exactly `RELEASE_vX.X.X.md` (e.g., `docs/RELEASE_v1.3.0.md`).
2. Synthesize the bullet points from the newly dated Changelog section into a structured, user-friendly summary.
3. This file should be formatted nicely with emojis, highlighting key features and bug fixes for the end user.

### Step 3: Verify & Sync Version Numbers
1. Read the `README.md`.
2. Ensure any hardcoded mention of the 'Current Version' in the documentation matches the new release number.
3. **PWA Sync:** Update the `CACHE_NAME` version in `sw.js` to match the new version number (e.g., `radio-player-v2.2.4`). This is critical for triggering app updates for PWA users.

## 2. Semantic Versioning Rules (SemVer)
If the user doesn't specify the next version number, determine it based on the items in the `[Unreleased]` block:
*   **MAJOR (e.g., 1.0.0 to 2.0.0):** If there are breaking changes or massive architectural rewrites (like the planned StateManager refactor).
*   **MINOR (e.g., 1.3.0 to 1.4.0):** If new, user-facing features were added (e.g., adding a new Directory search UI).
*   **PATCH (e.g., 1.3.0 to 1.3.1):** If the changes consist purely of bug fixes, CSS tweaks, or underlying code maintenance that doesn't change functionality.

## 4. Command Integrity
When running final `git` commands or database migrations, always adhere to the `terminal-commander` skill:
- Use `%SAME%` for Windows/PowerShell compatibility (replace `&&` with `;`).
- Ensure special characters in database passwords are double-quoted.

## 3. Communication
*   Do not ask for permission between steps; execute all three steps as a single batch operation.
*   Once finished, proudly present a summary of the actions taken to the user and ask them to verify the new `RELEASE_vX.X.X.md` file!
