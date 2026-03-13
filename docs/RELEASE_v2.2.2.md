# 🚀 Release Notes v2.2.2 - Bitrate & Resiliency Update

## 📝 Overview
Version **2.2.2** is a major reliability and quality-of-life update focused on **Stream Resiliency** and **Audio Quality Transparency**. We've implemented advanced detection for stream drops, improved reconnection logic, and introduced header-based bitrate sniffing to ensure you always know the quality of what you're hearing.

---

## ✨ New Features

### 📡 Advanced Bitrate Handling
- **Header-Based Sniffing** — The player now intelligently extracts bitrate data directly from HTTP headers (like `icy-br`) when real-time metadata is missing. 
- **Directory Persistence** — Stations added from the Global Search now correctly preserve their bitrate badges in your personal collection.
- **Manual Bitrate Entry** — You can now manually specify or edit the bitrate for any custom station in your settings.

### 🛡️ Stream Resiliency
- **Diagnostics & Error Reporting** — The "Now Playing" area now explicitly reports server-side errors (502 Gateway, 404 Not Found) instead of failing silently.
- **Exponential Backoff Reconnection** — Improved automatic reconnection for dropped streams with a retry system that scales up to 5 attempts across 10 seconds.

### ⚡ Optimized Performance
- **Music-First Priority** — We've deferred metadata polling and bitrate sniffing until *after* the audio playback has stabilized. This resolves contention issues and ensures the music starts playing as fast as possible!

---

## 🛠️ Internal Improvements
- **Balanced Mono Visualization** — The VU meter now automatically mirrors active channels for mono streams to maintain a balanced visual aesthetic.
- **Settings Logic Overhaul** — Cleaned up several critical syntax issues and optimized the internal state management for custom stations.
- **API Metadata Sync** — Fully synchronized the bitrate data pipeline between the client and the cloud database.

---

## 📅 What's Next?
We are moving toward **v2.3**, which will focus on **Backend Independence**, including porting the metadata and stream proxies from Cloudflare Workers to native PHP for a 100% self-hosted experience.

---
*Thank you for being part of the Radio Stream Player journey!* 📻✨
