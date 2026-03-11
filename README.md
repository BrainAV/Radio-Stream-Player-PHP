# Radio Stream Player

![GitHub](https://img.shields.io/github/license/BrainAV/Radio-Stream-Player-PHP)
![GitHub last commit](https://img.shields.io/github/last-commit/BrainAV/Radio-Stream-Player-PHP)
![GitHub issues](https://img.shields.io/github/issues/BrainAV/Radio-Stream-Player-PHP)
![GitHub stars](https://img.shields.io/github/stars/BrainAV/Radio-Stream-Player-PHP?style=social)

A sleek, modern, and feature-rich full-stack radio stream player built with PHP, MySQL, and vanilla JavaScript. Version 2.0 represents the official transition to a self-hosted backend, enabling cloud-synced accounts while maintaining the premium Glassmorphism aesthetic.

**[🔴 Live Demo](https://radio.djay.ca/)**

> [!NOTE]
> The live demo is securely hosted via HTTPS! It utilizes a custom Cloudflare Worker proxy (`api.djay.ca`) to seamlessly tunnel legacy HTTP radio streams and extract real-time track metadata without triggering browser security warnings.

## ✨ Features

- **PHP/MySQL Backend (v2.0)**: Version 2.0 introduces secure user accounts with persistent, cloud-synced favorites and custom stations.
- **Non-Intrusive Auth**: A custom AJAX-powered login modal allows you to sign in or sign out without stopping the music or reloading the page.
- **Multiple Stations**: Comes pre-loaded with a selection of high-quality electronic music radio streams.
- **Radio Browser Directory**: Integrated public API to natively search and add tens of thousands of community-driven radio stations.
- **Custom Stations**: Add your own radio stream URLs. Manage your private collection and "Favorites" in a dedicated UI.
- **Dynamic Audio Visualization**: Real-time VU meters powered by the Web Audio API. 
- **Multiple VU Meter Styles**: Cycle through seven different visualizer styles:
  - Classic (Vertical Bars)
  - LED (Segmented Display)
  - Circular (Radial Progress)
  - Waveform (Oscilloscope)
  - Spectrum (Frequency Bars)
  - Retro (Analog Needle)
  - Neon (Glowing Bars)
- **Light & Dark Themes**: Automatically detects the user's system preference and allows manual toggling.
- **Personalization**: Customize the player with your own background images or choose from curated presets.
- **Favorites System**: Save your top stations for quick access, now synced to your user account.
- **Backend Streaming Proxy**: Natively bypasses "Mixed Content" warnings by routing insecure HTTP radio streams through a secure proxy.
- **Live Metadata Extraction**: Displays real-time "Now Playing" track and artist information fetched directly from the streams.
- **Media Integration**: Displays station info on your OS lock screen and supports hardware media keys (Play/Pause/Next/Prev).
- **Pop-out Player**: Open the player in a separate, compact window for easy multitasking.
- **Accessible**: Built with accessibility in mind, featuring screen reader support and full keyboard navigation.
- **Responsive Design**: Looks and works great on both desktop and mobile devices.
- **Session-Aware**: Remembers your selected theme and state across browser sessions.

## 🛠️ Technologies Used

- **PHP 8.x**: Back-end API and session management.
- **MySQL 5.7+**: Reliable storage for stations and users.
- **HTML5 & CSS3**: For the structure and "Glassmorphism" styling.
- **Vanilla JavaScript (ES6+)**: For all player logic and a robust Pub/Sub State Manager.
- **Web Audio API**: For high-performance audio processing and visualizations.

## 🔌 Powered By

- **[Radio Browser API](https://www.radio-browser.info/)**: Provides the massive, community-driven database of global radio stations.
- **[Cloudflare Workers](https://workers.cloudflare.com/)**: Enables our secure backend streaming proxy and ICY metadata extraction for the demo environment.

## ⌨️ Keyboard Shortcuts

The player is designed to be fully accessible and keyboard-friendly:

- **`Spacebar` / `Play/Pause Media Key`**: Toggle Play/Pause.
- **`Next Track Media Key`**: Skips to the next station in the current list.
- **`Previous Track Media Key`**: Skips to the previous station in the current list.
- **`Tab`**: Standard browser focus navigation through all UI elements.

## 🚀 Installation & Setup (v2.1.1)

This project is cPanel-compatible and requires a standard LAMP/LEMP stack (Linux, Apache/Nginx, MySQL, PHP).

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/BrainAV/Radio-Stream-Player-PHP.git .
    ```
2.  **Database Setup**:
    - Create a MySQL database and user.
    - Import the SQL schema located in `/database/schema.sql`.
    - Set your credentials in `api/config.php`.
3.  **Deploy**:
    - Upload to your web root and ensure `index.php` is the entry point.

### Local Development fallback
If you want to test the frontend UI without PHP, you can run a simple mock server:
```bash
# For Python 3
python -m http.server
```
Then, navigate to `http://localhost:8000` in your browser. Note that account features require a live PHP/DB environment.

---
*Developed by the BrainAV team. v2.1.1 - The PHP Awakening.*