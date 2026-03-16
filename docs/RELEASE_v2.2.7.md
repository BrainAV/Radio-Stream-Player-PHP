# Release v2.2.7 — Cloud Persistence & UX Polish ☁️✨

I am excited to announce the release of **Radio Stream Player v2.2.7**! This update focuses on making your listening experience more seamless across all your devices and polishing the initial setup.

## 🌟 What's New?

### ☁️ Cloud VU Style Persistence
Your visualizer preferences are no longer tied to a single browser! Logged-in users will now have their **VU Meter visualization style** saved directly to their account. Whether you prefer the retro LED look or the modern Circular display, your choice will follow you wherever you log in.

### 💨 Seamless Profile Updates
We've streamlined how your preferences are saved. Updating non-sensitive settings like your VU style now happens instantly in the background, without requiring you to re-enter your password.

### 🎨 UI Refresh: "Ready to Play"
The player's initial state has been cleaned up. We've removed hardcoded station names in favor of a clean "Ready to Play" greeting, making it clearer how to get started with your favorite streams.

## 🛠️ Technical Improvements
- **Database Schema**: Added `vu_style` column to the `users` table for permanent storage.
- **Service Worker**: Bumped PWA cache version to `v2.2.7` to ensure all users receive these updates immediately.
- **REST API**: Refined `api/profile.php` to handle preference updates more intelligently.

---
*Thank you for being part of the Radio Stream Player community! Keep the music playing.* 📻🎶
