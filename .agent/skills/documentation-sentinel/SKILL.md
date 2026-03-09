---
name: documentation-sentinel
description: Enforces the integrity of project documentation. Treats README, ROADMAP, and CHANGELOG as immutable code records that must be preserved, not cropped or arbitrarily modified.
---

# Documentation Sentinel Skill

Use this skill whenever you are reading from or writing to any project documentation, including `README.md`, `ROADMAP.md`, `CHANGELOG.md`, or any `.md` file in the repository. This skill ensures that the "soul" and history of the project are never lost.

## 🎯 Core Objectives

1.  **Documentation is Gold**: Treat documentation with the same (or higher) level of precision as source code. A deleted roadmap goal is as bad as a deleted function.
2.  **Zero-Cropping Policy**: Never remove content from a documentation file unless explicitly requested by the USER. "Completed" items in a roadmap are historical milestones and must remain for context.
3.  **Preservation of History**: Maintain the chronological flow of `CHANGELOG.md` and the structural history of `ROADMAP.md`. 
4.  **Formatting Consistency**: Adhere strictly to the existing Markdown style, header hierarchy, and bullet point conventions.

## 🛠️ Operational Guidelines

### 1. Updating the Roadmap (`ROADMAP.md`)
- **Add, Don't Delete**: When adding a new goal, insert it into the appropriate section (Short/Mid/Long-Term).
- **Mark, Don't Remove**: When a goal is completed, change `[ ]` to `[x]`. Do **NOT** delete the line.
- **Maintain Context**: Keep the version headers and descriptions intact. They provide the narrative of the project's evolution.

### 2. Updating the Changelog (`CHANGELOG.md`)
- **Prepend New Versions**: New versions should always be added at the top, just below the main header.
- **Categorize Changes**: Use sub-headers like `Added`, `Changed`, `Fixed`, and `Removed` (if applicable).
- **Date Everything**: Always include the date of the release/update.

### 3. Modifying the README (`README.md`)
- **Respect the Layout**: Keep the key sections (Introduction, Features, Installation, Usage) in their established order.
- **Update with Precision**: When adding a feature, ensure it is placed in the logical sub-section.

## 📋 Common Workflows

- **Updating Progress**:
  1. Open `ROADMAP.md`.
  2. Locate the specific task.
  3. Toggle the checkbox `[ ]` -> `[x]`.
  4. Save without touching any other part of the file.

- **Adding a New Milestone**:
  1. Define the scope of the new milestone.
  2. Identify the logical position (e.g., after the latest version).
  3. Insert the new header and bullet points, mirroring the existing aesthetic.

## 🚨 Constraints

- **DO NOT** "summarize" or "shorten" long documentation files. If a file is long, it is because it contains valuable history.
- **DO NOT** assume a goal is "obsolete" just because it hasn't been touched in a while.
- **DO NOT** change the "tone" of the documentation. Maintain the established voice of the project.
- **NEVER** use `replace_file_content` to overwrite a whole documentation file if you are only changing a few lines; use targeted chunks or multi-replace to minimize the footprint of the change.

> [!IMPORTANT]  
> If you find yourself thinking "this roadmap is getting too long, I should clean it up," **STOP**. You are an agent, not the editor-in-chief. Ask the user before removing any historical record.
