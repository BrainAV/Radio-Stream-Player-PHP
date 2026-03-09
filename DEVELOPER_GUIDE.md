# Developer Guide: Radio Stream Player

Welcome to the developer guide for the Radio Stream Player. This document is intended for developers and AI assistants who want to understand, maintain, or contribute to the project.

## 1. Project Overview

This project is a single-page web application that plays radio streams and provides real-time audio visualizations. It is built with vanilla HTML, CSS, and JavaScript, with no external frameworks or build steps, making it lightweight and easy to run.

**Core Goals:**
- Provide a simple, elegant user interface.
- Offer dynamic and engaging audio visualizations using the Web Audio API.
- Be self-contained and easy to deploy.

## 2. Codebase Structure

The project consists of a few key files:

- `index.html`: The main entry point and structure for the application. It contains the player UI, station list, and control buttons.
- `popout.html`: A minimal version of the UI for the pop-out player window. It communicates with the main window via `postMessage`.
- `stations.js`: A simple ES module that exports the array of default radio stations.
- `player.js`: An ES module that handles all core player logic, including audio playback, UI controls (play, volume, station select), and state management.
- `visualizer.js`: An ES module responsible for all Web Audio API analysis, canvas/DOM drawing, and VU meter style logic.
- `styles.css`: Contains all styling for the application, including layout, theming (light/dark modes), and the appearance of all VU meter styles.
- `script.js`: The main entry point. It imports the other modules (`player.js`, `visualizer.js`) and initializes the application.
- `settings.js`: Handles the logic for the settings modal, including theme toggling, custom stations, background preferences, and favorites filtering.
- `popout-script.js`: The entry point for the pop-out window. It reuses `player.js` logic but adapts it for the secondary window context.
- `CHANGELOG.md`: The history of changes and versions (formerly `PROGRESS.md`).
- `README.md`: The user-facing documentation.
- `DEVELOPER_GUIDE.md`: (This file) The technical documentation for contributors.

## 3. Core Architecture & Concepts

### 3.1. Global State Management (`radioStreamState`)

To manage state across different contexts (main window vs. pop-out) and to persist state if the script were re-initialized, a single global object `radioStreamState` is attached to the `window` object. It is defined and exported from `player.js`.

```javascript
const radioStreamState = window.radioStreamState || {
    audio: null,
    isPlaying: false,
    currentStation: null,
    volume: 0.5,
    audioContext: null,
    // ... other audio nodes
    vuStyle: 1
};
window.radioStreamState = radioStreamState;
```

- **Purpose**: It acts as a singleton, holding all critical application state like the current station, volume, playback status, and references to the `AudioContext` and its nodes.
- **Limitation**: This is a simple approach. For larger applications, this could become difficult to manage. Future work could involve refactoring this into a more robust state management pattern (e.g., a class-based service or a pub/sub model).

### 3.1.1. Future Refactoring Plan: Class-Based State Service

To address the limitations of the global state object and align with the long-term roadmap, the state management will be upgraded to a class-based service. This will improve encapsulation, scalability, and maintainability.

**Key Concepts:**

1.  **Encapsulation**: The state will be held privately within a `StateManager` class. Direct mutation from outside the class will be prevented.
2.  **Controlled Mutations**: The class will expose public methods (e.g., `setPlaying(status)`, `setVolume(level)`) as the only way to modify the state. This creates a single, predictable source of truth for state changes.
3.  **Reactivity (Pub/Sub)**: The `StateManager` will implement a simple publish-subscribe pattern.
    -   A `subscribe(callback)` method will allow different modules (like the UI) to listen for state changes.
    -   When the state is modified via a setter method, a private `notify()` method will be called, which in turn executes all registered subscriber callbacks.

**Implementation Steps:**

1.  **Create `state.js`**: A new file will house the `StateManager` class. A single, shared instance (singleton) of this class will be created and exported.

    ```javascript
    // Example structure for state.js
    class StateManager {
        #state;
        #subscribers;
        // ... constructor, getters, setters, subscribe, notify
    }
    export const stateManager = new StateManager({ /* initial state */ });
    ```

2.  **Refactor Modules**:
    -   In `player.js`, `visualizer.js`, and `script.js`, replace the import and use of the global `radioStreamState` with the new `stateManager` instance.
    -   Update code that directly modifies state (e.g., `state.isPlaying = true`) to use the new setter methods (e.g., `stateManager.setPlaying(true)`).
    -   Refactor UI update logic. Instead of manually updating the DOM after every action, the UI components will `subscribe` to the `stateManager`. The subscription callback will receive the new state and update the DOM accordingly, ensuring the UI is always in sync with the state.

### 3.2. Web Audio API Graph

The audio visualization is powered by the Web Audio API. The audio signal flows through a series of connected nodes, all of which are created and managed within `visualizer.js`.

1.  **`<audio>` Element**: The source of the stream.
2.  **`MediaElementAudioSourceNode`**: Connects the `<audio>` element to the Web Audio API graph.
3.  **`ChannelSplitterNode`**: Splits the stereo source into two separate mono channels (Left and Right).
4.  **`AnalyserNode` (x2)**: One for each channel. These nodes do not affect the audio but provide data for visualization (time-domain and frequency-domain).
5.  **`AudioDestinationNode`**: The output, which is the user's speakers. The original source is connected directly to the destination so the analysis doesn't interfere with playback.

**Diagram:**
```
                   ┌──────────────────────────┐
<audio> element -> │ MediaElementAudioSource  ├─> speakers (AudioDestination)
                   └──────────────────────────┘
                                │
                   ┌──────────────────────────┐
                   │    ChannelSplitter       │
                   └──────────────────────────┘
                                │
           ┌────────────────────┴────────────────────┐
           │ (Channel 0)                  (Channel 1) │
           ▼                                          ▼
┌───────────────────┐                      ┌───────────────────┐
│ AnalyserNode (L)  │                      │ AnalyserNode (R)  │
└───────────────────┘                      └───────────────────┘
           │                                          │
           ▼                                          ▼
     (JS Analysis)                            (JS Analysis)
```

### 3.3. Visualization Engine

The visualization is handled by a `requestAnimationFrame` loop inside the `updateVUMeters` function within `visualizer.js`.

- **Loop**: On each frame, it gets the latest audio data from the `AnalyserNode`s.
- **Style Switching**: A `switch` statement checks the current `state.vuStyle` and calls the appropriate rendering function (e.g., `updateClassicVu`, `updateLedVu`).
- **DOM Manipulation**: The rendering functions update the DOM directly—by changing CSS properties (`height`, `transform`), updating SVG attributes, or drawing on a `<canvas>`.

### 3.4. Pop-out Player

The pop-out feature uses `window.open()` to create a new, smaller browser window.

- **State Transfer**: The main window is paused, and the new pop-out window is initialized with the current station URL passed as a query parameter.
- **Communication**: When the pop-out window is closed, it uses `window.opener.postMessage()` to notify the main window. The main window listens for this message to restore its UI and resume playback if necessary.

## 4. How to Contribute

### 4.1. Adding a New Radio Station

This is the simplest contribution. The station list is now managed in its own file.
1.  Open `stations.js`.
2.  Add a new object to the `stations` array.
3.  The object must have a `name` (string) and a `url` (string) to the audio stream.

```javascript
export const stations = [
    // ... existing stations
    { name: "My New Station", url: "https://your-stream-url/stream" }
];
```

### 4.2. Adding a New VU Meter Style

Follow these steps to add a new visualization style (e.g., "neon").

1.  **`visualizer.js` - Register the Style**: Add your new style name to the `VU_STYLES` array at the top of the file.
    ```javascript
    const VU_STYLES = ['classic', 'led', /*...*/, 'retro', 'neon'];
    ```
2.  **`visualizer.js` - Create Setup Function**: Create a function `createNeonVu(container, channel)` that builds the initial HTML/SVG/Canvas structure for one channel of your new meter. Add a call to it in the `updateVuStyle` function's `switch` statement.
3.  **`visualizer.js` - Create Update Function**: Create a function `updateNeonVu(levelLeft, levelRight)` that updates your meter's visuals based on the audio data. Add a call to it in the `updateVUMeters` function's `switch` statement.
4.  **`visualizer.js` - Create Reset Function** (Optional): If your meter needs to be reset to a zero state when paused, add logic to the `resetVuMeters` function.
5.  **`styles.css` - Add Styling**: Add the necessary CSS rules to style your new meter. Use a class selector based on the style name (e.g., `.vu-meters.vu-neon`).

## 5. Deployment Considerations

### 5.1. mixed Content & The Cloudflare Worker Proxy (`api.djay.ca`)

Many online radio stations (especially older Shoutcast/Icecast servers) still broadcast over **HTTP**. Modern web browsers enforce a security policy called **Mixed Content**, which blocks insecure HTTP resources (like audio streams) from loading on a secure HTTPS page.

To solve this, the application natively utilizes a **Cloudflare Worker Proxy** hosted at `api.djay.ca`.

**How it works:**
1.  **Frontend Routing:** When `player.js` attempts to play a stream, it checks the URL. If the URL starts with `http://`, it intercepts the request and re-routes it through the secure proxy: `https://api.djay.ca/?url=http://...`.
2.  **Worker Proxying:** The Cloudflare Worker receives the request, strips any `Icy-MetaData` headers (which cause audio playback artifacts in simple `<audio>` tags), fetches the insecure stream server-side, and pipes the pure audio response back to the browser over HTTPS with permissive CORS headers.
3.  **Metadata Extraction:** The Worker also hosts a separate endpoint at `https://api.djay.ca/metadata?url=...`. The frontend polls this endpoint every 12 seconds. The Worker fetches the stream, explicitly asks for `Icy-MetaData`, reads only the stream headers to extract the `StreamTitle`, and returns it as a clean JSON object for the UI to display in the "Now Playing" marquee.

**Worker Security:**
The Worker script checks the `Origin` and `Referer` headers. It will return a `403 Forbidden` response to any request that does not originate from `localhost` or a `*.djay.ca` domain, preventing abuse of the proxy bandwidth.

### 5.2. Request Limits & Usage Estimation (Cloudflare Free Tier)

Cloudflare's **Free Tier** allows for **100,000 requests per day**. It's important to understand how the player utilizes these requests to estimate your maximum concurrent user capacity.

**How Requests Are Triggered:**
When a user listens to a station, requests are made in two ways:
1.  **Audio Stream (1 Request):** The initial connection to the `/` proxy endpoint consumes exactly **1 request**. Because it is a continuous streaming connection, it stays open and does not generate additional requests, regardless of how long they listen.
2.  **Metadata Polling (Multiple Requests):** To display live track information, the frontend polls the `/metadata` endpoint every **12 seconds**.

**Usage Math per User:**
*   1 User listening for 1 Minute = 1 (Audio) + 5 (Metadata) = **6 Requests**
*   1 User listening for 1 Hour = 60 mins / 12 secs = 300 Metadata requests. Total = **301 Requests / Hour**.

**Capacity Estimation:**
With a limit of 100,000 requests per day:
*   Maximum total listening hours per day: `100,000 / 301` ≈ **332 Hours**
*   **Scenario A (Dedicated Listeners):** If your average user listens for 3 hours a day, you can support roughly **~110 daily active users** on the completely free tier.
*   **Scenario B (Casual Listeners):** If your average user listens for 1 hour a day, you can support roughly **~330 daily active users**.

**How to Optimize (Reduce Requests):**
If you are approaching the 100k daily limit, you can safely decrease the metadata polling frequency in the frontend code. 
1. Open `player.js` and `popout-script.js`.
2. Locate the `setInterval` function inside `updateNowPlaying()` (around line 365 in `player.js`).
3. Change the `12000` (12 seconds) value to something higher, like `30000` (30 seconds) or `60000` (1 minute). 
*Note: A 60-second interval drops the usage from 301 requests/hour down to just 61 requests/hour, effectively quintupling your user capacity!*

*Note: If your application grows beyond these limits, you can easily upgrade to Cloudflare Workers Paid ($5/month for 10 million requests).*

## 6. Release Process

When preparing a new release (incrementing the version number):

1.  **Update `CHANGELOG.md`**: Move the content from `[Unreleased]` to a new section with the version number and date (e.g., `[1.2.0] - 2025-12-25`).
2.  **Create Release Notes**: Create a new file in `docs/` named `RELEASE_vX.X.X.md` (e.g., `docs/RELEASE_v1.2.0.md`).
    -   This file should contain a user-friendly summary of the release, highlighting key features and changes.
    -   It serves as the source for GitHub Release notes or announcements.
3.  **Update Version**: Ensure any version numbers in the code or `README.md` (if applicable) are updated.

---
*This guide should be kept up-to-date with any significant architectural changes.*