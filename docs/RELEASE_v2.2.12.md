# Release Notes — v2.2.12 🚀

This release introduces a major overhaul of the **Immersive Fullscreen Mode**, bringing a premium aesthetic and significantly improved user experience to the Radio Stream Player. We've also addressed several long-standing visual glitches and refined the audio visualization engine for all users.

## ✨ Key Features & Improvements

### 📺 Premium Fullscreen Redesign
- **Hero Visualizers**: VU meters are now the absolute center of attention, displayed at 42% of the viewport height for maximum visual impact.
- **Ambient Glow**: Added a soft, pulsing ambient glow behind the visualizers that reacts to the audio intensity, creating a more immersive listening environment.
- **Minimalist UI**: Now Playing information is pinned to the top with a cleaned-up typography, stripped of redundant "Now Playing:" labels.
- **Glassmorphism Control Dock**: A new floating, frosted-glass control bar that auto-fades when not in use, keeping the focus on the visuals.
- **Improved Navigation**: Added a dedicated, circular glass "Exit" button and relocated the entry trigger to a more intentional spot next to the bitrate badge.

### 🔊 Audio Engine Refinements
- **Global Sensitivity**: The Visualizer Sensitivity setting now correctly scales *all* meter types, including Classic Bars, LED, Retro, and Circular VU styles.
- **Smart Reconnection**: Enhanced logic to automatically recover from proxy connection drops (`ERR_CONNECTION_CLOSED`) with intelligent retry mechanisms.

### 📱 PWA & Ad Optimization
- **Modern Standards**: Synchronized PWA meta tags across all player views for better cross-device installation.
- **Stable Layouts**: Implemented mobile ad constraints to prevent annoying layout shifts when ads load on smaller screens.

## 🛠️ Bug Fixes
- **Esc Key Support**: Pressing the escape key now reliably exits fullscreen mode across all browsers.
- **UI Centering**: Fixed an issue where the station name would appear off-center in certain browser widths.
- **Ad Display**: Resolved an issue where guest ads were being cropped or resized incorrectly in immersive mode.

---
*Thank you for using Radio Stream Player! Enjoy the new visuals.* 📻✨
