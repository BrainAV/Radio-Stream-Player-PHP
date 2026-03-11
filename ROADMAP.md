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

---

## 🤖 Agent Tooling & Workflow (v1.4+)

*These goals focus on enhancing the AI assistant's context and capabilities.*

-   **[x] Initial Skill Foundation:**
    -   **[x]** Implement `.agent/skills` directory architecture.
    -   **[x]** Create `station-curator` skill for automated stream validation.
    -   **[x]** Create `ui-consistency` skill to enforce Glassmorphism tokens.
-   **[x] Specialized Development Personas:**
    -   **[x] `audio-engineer`, `a11y-auditor`, and `release-manager` workflows.**
    -   **[x] `documentation-sentinel` skill to preserve project history and integrity.**

---

## 🏗️ v2.0 Milestone: The PHP Awakening (COMPLETED)

*Major architectural transition to a full-stack PHP/MySQL environment.*

-   **[x] Migration to Self-Hosted Backend (PHP/SQL):**
    -   **[x]** Migrated away from static GitHub Pages hosting to a full LAMP/LEMP stack environment.
    -   **[x] Goal achieved:** Enabled advanced features like user accounts, server-side station management, and a robust AJAX-powered API.
    -   **[x] Implementation:** Developed a PHP backend with a PDO/MySQL database to store stations and user preferences.
-   **[x] Non-Intrusive Auth Flow:**
    -   **[x]** Implemented AJAX login/logout modals to ensure music playback never stops during authentication.
-   **[x] Station Management Evolution:**
    -   **[x]** Transitioned from hardcoded `stations.js` to a dynamic SQL database backend.
    -   **[x]** Consolidated all station sources (Custom, Directory, Default) into a single, unified database schema.

---

## 🔭 Future Evolution (v2.1+)

*The next generation of self-hosted features.*

-   **[ ] Core Account Management (v2.1):**
    -   **[x] User Registration:** Implement an AJAX-based registration modal and `api/register.php`.
    -   **[x] Account Deletion:** Add a "Delete My Account" feature in the Settings > Account tab (v2.0.x Easy Win).
    -   **[ ] Email Verification (v2.3):** Implement a double-opt-in system to prevent bot registrations and ensure account security.
-   **[ ] Backend Evolution & Decentralization:**
    -   **[ ] PHP-based Metadata Extraction:** Port the Cloudflare Worker ICY metadata logic to a native PHP endpoint (`api/metadata.php`) to remove external dependencies.
    -   **[ ] PHP-based Stream Proxy:** Port the Cloudflare Worker audio proxy logic to a native PHP endpoint (`api/proxy.php`) for true self-hosted independence.
    -   **[ ] Song History (Premium):** Implement a database-backed history of played tracks for logged-in users.
-   **[ ] Admin Dashboard (v2.2):**
    -   **[x]** Build a dedicated UI for managing default stations and system overview.
    -   **[x]** Implement User Management (edit roles, ban/delete users).
    -   **[ ] Stream Crawler/Finder (Admin Utility):**
        -   Implement a tool where admins can input a station's website URL and have the backend attempt to scrape/extract the direct audio stream URL (`.mp3`, `.aac`, `/stream`) for easy addition to the database.
        -   **Quality Detection**: Automatically detect and store stream bitrate/sample rate to provide users with quality selection options (e.g., "High Quality" vs "Data Saver").
    -   **[ ]** Implement UI for managing user feedback and broken stream reports.
-   **[ ] Dynamic Station & Listing Pages (SEO & Sharing):**
    -   **Dynamic Routing**: Implement `.htaccess` and PHP routing to enable SEO-friendly, hierarchical URLs for every station in the database: `/[country]/[locale]/[station-name]`.
    -   **Listing Pages**: Create dynamic index pages that list stations by **Country** and **Genre**, allowing for better discoverability and SEO indexing.
    -   **Station History**: Implement background metadata polling to store "Recently Played" song history for each station, displayed on their dynamic page.
    -   **Sharable Links**: Ensure that visiting a station's dynamic URL automatically initializes the player and starts playback for that station.
-   **[ ] Search & Filtering:**
    -   Implement a global search bar and filter controls (by Genre/Country) to easily find stations within the larger database.
-   **[ ] Personalization & Wallpaper Improvements:**
    -   **Wallpaper Search**: Integrate with the Unsplash API (or similar) to allow users to search for and apply custom backgrounds directly within the player.
    -   **Dynamic Preset Management**: Allow logged-in users to save their own custom collections of wallpaper URLs to their profile.
    -   **[ ] Custom Background Uploads (Local/Cloud).**
-   **[ ] Monetization:**
    -   **[ ]** Add placeholder ads to the player UI to draft layout and test responsiveness gracefully with the "Glassmorphism" aesthetic.
    -   **[ ]** Integrate Google AdSense to capitalize on high session durations while users leave the player open.