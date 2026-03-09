# Project Roadmap

This document outlines the future direction and planned features for the Radio Stream Player. The goals are divided into short-term, mid-term, and long-term milestones.

---

## 🎯 Short-Term Goals (v1.1)

*These are improvements focused on code quality, accessibility, and minor feature additions.*

-   **[x] Code Refactoring:**
    -   Modularize `script.js` by separating the core player logic from the VU meter visualization logic. This will improve maintainability and make it easier to add new visualizers.
-   **[x] Accessibility (A11y) Enhancements:**
    -   Add `aria-label` attributes to all interactive controls (buttons, sliders) for better screen reader support.
    -   Ensure full keyboard navigability for all player functions.
    -   Implement focus-visible states for better keyboard navigation feedback.
-   **[x] UI/UX Improvements:**
    -   **[x]** Add a visual indicator or tooltip to the "Cycle VU Meter" button to show the name of the current style.
    -   **[x]** Improve the pop-out window closing mechanism to be more robust.
-   **[x] Content:**
    -   **[x]** Add more high-quality radio streams to the default list.

---

## 🚀 Mid-Term Goals (v1.2)

*These goals focus on adding significant new user-facing features.*

-   **[x] UI/UX Enhancements:**
    -   **[x]** Redesign the header to reduce its vertical height, improving usability on smaller screens and mobile devices.
    -   **[x]** Modernize the player's look and feel with an updated visual design:
        -   **[x]** Implement a "Glassmorphism" (frosted glass) effect for the main player card.
        -   **[x]** Replace text-based controls (Play/Pause, Pop-out) with modern SVG icons.
        -   **[x]** Redesign the volume slider for a more modern appearance.
        -   **[x]** Re-organize player controls into a more compact, horizontal layout.
        -   **[x]** Apply the modern look and feel to the pop-out player for a consistent UX.
-   **[x] Custom Stations:**
    -   **[x]** Implement a feature allowing users to add their own radio stream URLs.
    -   **[x]** Use `localStorage` to save user-added stations so they persist between sessions.
    -   **[x] Favorites System:**
        -   **[x]** Allow users to mark stations as "favorites" for quick access.
-   **[x] Personalization:**
    -   **[x] Custom Backgrounds:**
        -   **[x]** Allow users to input a URL to set as the player background.
        -   **[x]** Save the preference in `localStorage`.
        -   **[x]** Provide curated background presets.
-   **[x] Community & Feedback:**
    -   **[x] Station Submission:**
        -   **[x]** Add a mechanism (e.g., link to Google Form or GitHub Issue) for users to suggest new radio stations to be added to the default list.
    -   **[x] Issue Reporting:**
        -   **[x]** Add a "Report Broken Stream" button that allows users to flag stations that are offline or malfunctioning.
-   **[x] Stream Metadata Display:**
    -   **[x]** Leverage the Cloudflare Worker proxy (`api.djay.ca`) to parse ICY metadata headers from the stream without causing audio artifacts in the frontend.
    -   **[x]** Implement frontend polling (`player.js`) and UI updates (scrolling marquee) to display the currently playing song and artist.
-   **[x] Radio Browser Directory Integration:**
    -   **[x]** Add a searchable directory using the `radio-browser.info` public API.
    -   **[x]** Build a UI in the Settings modal (or a new panel) to search by tag, name, or country.
    -   **[x]** Leverage the existing Cloudflare Proxy natively to tunnel any `http://` streams returned by the API securely. 
    -   **[x]** Allow users to easily add searched stations to their "Custom Stations" or "Favorites".
-   **[ ] Monetization:**
    -   **[ ]** Add placeholder ads to the player UI to draft layout and test responsiveness gracefully with the "Glassmorphism" aesthetic.
    -   **[ ]** Integrate Google AdSense to capitalize on high session durations while users leave the player open.

---

## 🤖 Agent Tooling & Workflow (v1.4+)

*These goals focus on enhancing the AI assistant's context and capabilities through explicit `SKILL.md` personas, resulting in "easy wins" and consistent development.*

-   **[x] Initial Skill Foundation:**
    -   **[x]** Implement `.agent/skills` directory architecture.
    -   **[x]** Create `station-curator` skill for automated stream validation.
    -   **[x]** Create `ui-consistency` skill to enforce Glassmorphism tokens.
-   **[x] Specialized Development Personas:**
    -   **[x] `audio-engineer`:** A skill dedicated to Web Audio API best practices, preventing memory leaks and managing audio graph connections effectively.
    -   **[x] `a11y-auditor`:** A skill used alongside new UI development to guarantee accessibility standards, keyboard focus paths, and ARIA labels.
    -   **[x] `release-manager`:** A workflow automation skill that dictates exactly how to bump versions, format release notes, and update the changelog.

---

## 🔭 Long-Term Goals (v2.0+)

*These are major architectural changes and features that would represent a significant evolution of the project.*

-   **[x] Advanced State Management:**
    -   Refactored the simple global `radioStreamState` object into a more robust state management pattern (class-based `StateManager` pub/sub) to better handle application complexity.
-   **[ ] UI/UX Design Improvements:**
    -   Implement VU meter rotation to landscape mode (currently portrait-oriented).
-   **[ ] Build Process Integration:**
    -   Introduce a modern build tool like Vite or Parcel to enable features like ES modules, CSS pre-processing, and code minification for production builds.
-   **[x] Backend Service (Cloudflare Worker Proxy):**
    -   **[x]** Implemented a secure proxy using a Cloudflare Worker (`api.djay.ca`) to tunnel insecure HTTP streams over HTTPS.
    -   **[x] Goal achieved:** Application is hosted securely on GitHub Pages with HTTPS while safely playing legacy HTTP streams, solving "Mixed Content" issues.
    -   **[x] Metadata:** Extended the worker with a `/metadata` endpoint to parse ICY metadata server-side, avoiding CORS issues and audio decoding artifacts in the browser.
-   **[ ] Migration to Self-Hosted Backend (PHP/SQL):**
    -   Migrate away from static GitHub Pages hosting to a full LAMP/LEMP stack environment.
    -   **Repository Strategy:** To maintain a clean, dependency-free version for users, this repository will remain **HTML-only**. A new, separate repository (e.g., `Radio-Stream-Player-PHP`) will be created for the full-stack solution.
    -   **Goal:** Enable advanced features like user accounts, server-side playlist management, and a robust API.
    -   **Implementation:** Develop a PHP backend with a MySQL/MariaDB database to store stations, user preferences, and analytics.
    -   **File Uploads:** Allow users to upload custom background images (e.g., WebP) instead of just providing URLs.
    -   **Community Features:**
        -   Store user-submitted station suggestions in the database for review.
        -   Log broken stream reports to an admin dashboard.
    -   **Backend Evolution & Decentralization:**
        -   **PHP-based Metadata Extraction:** Port the Cloudflare Worker ICY metadata logic to a native PHP endpoint (`api/metadata.php`) to remove external dependencies.
        -   **PHP-based Stream Proxy:** Port the Cloudflare Worker audio proxy logic to a native PHP endpoint (`api/proxy.php`) for true self-hosted independence.
        -   **Song History (Premium):** Implement a database-backed history of played tracks for logged-in users, enabling features like "Recently Played" or "Playlists".
    -   **[ ] Station Management & Evolution:**
    -   **[ ]** Transition from hardcoded `stations.js` to a dynamic SQL database backend.
    -   **[ ]** Repurpose `stations.js` as a dedicated configuration for "Sponsored" or promoted stations.
    -   **[ ]** Consolidate all station sources (Custom, Directory, Default) into a single, unified database schema.
    -   **[ ]** Update directory source links to resolve temporary "Custom" handling for legacy streams (e.g., CIDC).
-   **[ ] Database Schema:** Plan for a robust schema including:
        -   `Station ID`
        -   `Genre` (Categorization)
        -   `Country of Origin`
        -   `Bitrate/Format`
-   **[ ] Search & Filtering:** Implement a search bar and filter controls (by Genre/Country) to easily find stations within the larger database.