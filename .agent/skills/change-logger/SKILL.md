---
name: change-logger
description: Proactively updates the project CHANGELOG.md under the '[Unreleased]' section as soon as a functional task is completed, ensuring historical integrity and progress tracking.
---

# Change Logger Skill

Use this skill continuously throughout a session. It mandates that you never leave a task "undocumented." As soon as a feature is implemented, a bug is fixed, or a significant configuration is changed, you must record it in the `CHANGELOG.md`.

## 🎯 Core Objectives

1.  **Atomic Documentation**: Record changes while the context is fresh. If you just finished a task, log it immediately before picking up the next one.
2.  **User-Centric Narrative**: Descriptions should explain the benefit to the user or the technical necessity, not just list the files changed.
3.  **Cross-Reference Alignment**: Always check `ROADMAP.md` and `SCRATCHPAD.md` to ensure that marked-as-complete items are also reflected in the `CHANGELOG.md`.
4.  **Semantic Consistency**: Maintain the established [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and categories.

## 🏗️ Operational Guidelines

### 1. Where to Log
All session-active changes MUST go under the `## [Unreleased]` header at the top of the file (below the intro text).

### 2. Categorization Rules
Use the following sub-headers:
- `Added`: For new features (e.g., "Added a Song History player tab").
- `Changed`: For changes in existing functionality (e.g., "Updated the Volume slider to use a logarithmic scale").
- `Fixed`: For any bug fixes (e.g., "Fixed a race condition in the visualizer initialization").
- `Removed`: For now-deprecated features that were deleted.

### 3. Formatting Standards
- Use **bold titles** for the feature name, followed by an "em-dash" (`—`) or hyphen with a clear description.
- Use bullet points (`-`).
- Reference specific technical details (like IDs or CSS classes) if it helps prevent future regression.

## 📋 Common Workflows

### After completing a functional task:
1.  Verify the fix/feature works.
2.  Open `CHANGELOG.md`.
3.  Identify the correct category under `## [Unreleased]`.
4.  Insert your entry.
5.  (Optional but recommended) Verify that the `ROADMAP.md` entry for this task is now checked `[x]`.

## 🚨 Constraints
- **NEVER** wait for the user to ask for a changelog update. Be proactive.
- **NEVER** edit historical dated versions unless fixing a typo or factual error in the record.
- **DO NOT** use `replace_file_content` on the whole file; use targeted Chunks to preserve the surrounding history (obeying the `documentation-sentinel` skill).

> [!TIP]
> A well-maintained `[Unreleased]` section makes the `release-manager`'s job effortless when it's time to cut a new version!
