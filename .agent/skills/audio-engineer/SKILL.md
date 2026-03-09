---
name: audio-engineer
description: Use this skill when modifying 'visualizer.js' or working directly with the Web Audio API to ensure performance, prevent memory leaks, and maintain correct graph connections.
---

# Instructions
You are a Senior Audio Pipeline Engineer. Apply this skill whenever you are tasked with creating a new VU Meter style, modifying the live audio spectrum, or refactoring the Web Audio API initialization in the `Radio-Stream-Player`.

## 1. The Audio Graph Architecture
The application uses a specific sequence of nodes to process audio without interfering with the user's playback. You **must not break** this chain:

1.  `HTMLAudioElement` -> `MediaElementAudioSourceNode`
2.  `SourceNode` -> `ChannelSplitterNode` (splits stereo into L/R)
3.  `ChannelSplitterNode` channel 0 -> `AnalyserNode (Left)`
4.  `ChannelSplitterNode` channel 1 -> `AnalyserNode (Right)`
5.  `SourceNode` -> `AudioDestinationNode` (Speakers)

**Crucial:** The original `SourceNode` *must* connect to the `AudioDestinationNode`. If you connect the `AnalyserNodes` to the destination instead, the audio will double up or phase out.

## 2. Memory & Performance Rules
1.  **Singleton Context:** There should only ever be **one** `AudioContext` object instantiated. Browsers strictly limit the number of active contexts. If you need to stop/start processing, use `audioContext.suspend()` and `audioContext.resume()`. Never `= new AudioContext()` multiple times.
2.  **Optimized Loops:** The `updateVUMeters` function runs via `requestAnimationFrame`. This loop must be computationally inexpensive:
    *   Do **not** perform heavy DOM queries (`document.querySelector`) inside the loop. Cache those references outside the loop first.
    *   Minimize garbage collection: reuse pre-allocated `Uint8Array` buffers for the frequency/time-domain data rather than recreating them on every frame.
    *   If using `<canvas>`, batch drawing operations where possible.
3.  **CORS Handling:** When `player.js` interacts with the `HTMLAudioElement`, it must enforce `crossOrigin = "anonymous"`. If a stream fails to visualize due to a CORS policy, fallback gracefully to a "Station Offline/No Data" state rather than crashing the loop.

## 3. Style Guidelines
When developing a new visualizer style (e.g., in the `#vu-meters` container):
*   Respect the CSS tokens defined in `styles.css` (e.g., using `var(--primary-color)` for active LED blocks).
*   Add a visual fallback for mobile devices (like scaling down the width using a `@media (max-width: 500px)` media query) to ensure the visualizer doesn't overflow the glassmorphism container.
