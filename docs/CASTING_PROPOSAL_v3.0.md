# Technical Proposal: Casting & Remote Playback (v3.0)

Adding casting capabilities to the **Radio Stream Player** will significantly elevate the v3.0 "Professional Core" vision, allowing users to move their music from their browser to home theater systems and smart speakers.

## 🏗️ Proposed Approaches

There are two primary ways to implement this, depending on whether we want to prioritize development speed or brand experience.

### 1. The Lightweight Approach (Default Media Receiver)
*   **Mechanism**: Uses the **Remote Playback API** or the Google Cast **Default Media Receiver**.
*   **Experience**: The browser sends the stream URL to the Chromecast. The TV shows a generic "Casting" screen with basic metadata (Station Name, Track).
*   **Pros**: 
    - Quick to implement (1-2 days).
    - No need for a Google Developer account or hosted receiver app.
    - Low maintenance.
*   **Cons**:
    - **No Visualizers**: The TV will only show a static background or default Google UI.
    - **Local Mute**: Local audio analysis (for the browser visualizers) might stop depending on the browser's implementation.

### 2. The Premium Approach (Custom Web Receiver)
*   **Mechanism**: We build a small, secondary web application (a "Receiver App") specifically for Chromecast.
*   **Experience**: When a user clicks "Cast," the TV loads our custom receiver app, which mirrors the Radio Stream Player's **Glassmorphism UI** and **Audio Visualizers**.
*   **Pros**:
    - **Wow Factor**: High-fidelity visualizers on the big screen.
    - **Brand Consistency**: Uses our social branding and neon aesthetics.
    - **v3.0 Commercial Ready**: A unique selling point for a premium product.
*   **Cons**:
    - Requires a **Google Cast Developer** account ($25 one-time fee).
    - Requires hosting the receiver app on an HTTPS domain.

---

## 🛠️ Technical Implementation Strategy

### A. The "Cast" Button
We would integrate the **Google Cast Web Sender SDK**. 
- Add a new `<google-cast-launcher>` button in the player header.
- This button automatically handles device discovery and the picker UI.

### B. State Management Integration
The `StateManager` (`state.js`) would be updated to track a new `isCasting` property.
- When `isCasting` is true, we can choose to either:
    - **Mute Local**: Stop local playback to save bandwidth.
    - **Shared Control**: The browser becomes a "remote control" for the TV.

### C. The Visualizer Challenge
The Web Audio API `AnalyserNode` requires the audio to be processed locally. 
- **Solution for Premium**: The Custom Receiver app would have its own `visualizer.js` module. We send the `currentStation` URL to the receiver, and *it* performs the analysis and rendering on the TV's hardware.

---

## 📋 Recommended Path for v3.0

I recommend a **Hybrid Phase**:
1.  **v3.0 Alpha**: Implement basic **Remote Playback API** support (AirPlay/Default Cast) to get the feature in users' hands.
2.  **v3.0 Gold**: Launch the **Custom Receiver** to provide the full "Glassmorphism" experience on TV.

> [!NOTE]
> For AirPlay (iOS/Safari), the browser handles most of the heavy lifting natively if we maintain a standard `<audio>` element, which we already do in `player.js`.
