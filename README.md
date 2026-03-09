# Radio Stream Player

![GitHub](https://img.shields.io/github/license/BrainAV/Radio-Stream-Player)
![GitHub last commit](https://img.shields.io/github/last-commit/BrainAV/Radio-Stream-Player)
![GitHub issues](https://img.shields.io/github/issues/BrainAV/Radio-Stream-Player)
![GitHub stars](https://img.shields.io/github/stars/BrainAV/Radio-Stream-Player?style=social)

A sleek, modern, and feature-rich web-based radio stream player built with vanilla JavaScript and the Web Audio API. It provides a great listening experience with dynamic audio visualizations.

![Radio Stream Player Screenshot](docs/images/app-screenshot.webp)

**[🔴 Live Demo](https://radio.djay.ca/)**

> [!NOTE]
> The live demo is securely hosted via HTTPS! It utilizes a custom Cloudflare Worker proxy (`api.djay.ca`) to seamlessly tunnel legacy HTTP radio streams and extract real-time track metadata without triggering browser security warnings.

## ✨ Features

- **Multiple Stations**: Comes pre-loaded with a selection of high-quality electronic music radio streams.
- **Radio Browser Directory**: Integrated public API to natively search and add tens of thousands of community-driven radio stations.
- **Custom Stations**: Add your own radio stream URLs. Manage your private collection and "Favorites" in a dedicated UI.
- **Dynamic Audio Visualization**: Real-time VU meters powered by the Web Audio API.
- **Multiple VU Meter Styles**: Cycle through six different visualizer styles:
  - Classic (Vertical Bars)
  - LED (Segmented Display)
  - Circular (Radial Progress)
  - Waveform (Oscilloscope)
  - Spectrum (Frequency Bars)
  - Retro (Analog Needle)
  - Neon (Glowing Bars)
- **Light & Dark Themes**: Automatically detects the user's system preference and allows manual toggling.
- **Personalization**: Customize the player with your own background images or choose from curated presets.
- **Favorites System**: Save your top stations for quick access.
- **Backend Streaming Proxy**: Natively bypasses "Mixed Content" warnings by routing insecure HTTP radio streams through a secure Cloudflare Worker.
- **Live Metadata Extraction**: Displays real-time "Now Playing" track and artist information fetched directly from the streams.
- **Media Integration**: Displays station info on your OS lock screen and supports hardware media keys (Play/Pause/Next/Prev).
- **Pop-out Player**: Open the player in a separate, compact window for easy multitasking.
- **Accessible**: Built with accessibility in mind, featuring screen reader support and full keyboard navigation.
- **Responsive Design**: Looks and works great on both desktop and mobile devices.
- **Session-Aware**: Remembers your selected theme across browser sessions using `localStorage`. Volume and station are maintained within the current session, including when using the pop-out player.

## 🛠️ Technologies Used

- **HTML5**: For the structure of the player.
- **CSS3**: For styling, including custom properties for theming and responsive design.
- **Vanilla JavaScript (ES6+)**: For all player logic, interactivity, and a robust Pub/Sub State Manager to ensure perfect UI synchronization.
- **Web Audio API**: For audio processing and creating the dynamic visualizations.

## 🔌 Powered By

- **[Cloudflare Workers](https://workers.cloudflare.com/)**: Enables our secure backend streaming proxy and ICY metadata extraction.
- **[Radio Browser API](https://www.radio-browser.info/)**: Provides the massive, community-driven database of global radio stations available natively in the app directory.

## ⌨️ Keyboard Shortcuts

The player is designed to be fully accessible and keyboard-friendly:

- **`Spacebar` / `Play/Pause Media Key`**: Toggle Play/Pause.
- **`Next Track Media Key`**: Skips to the next station in the current list.
- **`Previous Track Media Key`**: Skips to the previous station in the current list.
- **`Tab`**: Standard browser focus navigation through all UI elements.

## 🚀 Getting Started

This project is designed to be run directly in a web browser. No build step is required.

1.  Clone the repository:
    ```bash
    git clone https://github.com/BrainAV/Radio-Stream-Player.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd Radio-Stream-Player
    ```
3.  Open the `index.html` file in your favorite web browser.

Due to browser security policies (CORS) regarding audio streaming, you might need to run it from a local web server for all features to work correctly. A simple way to do this is using Python:

```bash
# For Python 3
python -m http.server

# For Python 2
python -m SimpleHTTPServer
```
Then, navigate to `http://localhost:8000` in your browser.