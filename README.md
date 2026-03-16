<div align="center">

# 📻 Radio Stream Player

### A self-hosted, full-stack internet radio player with user accounts, audio visualizations, and a Glassmorphism UI.

[![License](https://img.shields.io/github/license/BrainAV/Radio-Stream-Player-PHP?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-v2.2.7-blue?style=flat-square)](CHANGELOG.md)
[![Last Commit](https://img.shields.io/github/last-commit/BrainAV/Radio-Stream-Player-PHP?style=flat-square)](https://github.com/BrainAV/Radio-Stream-Player-PHP/commits/main)
[![Issues](https://img.shields.io/github/issues/BrainAV/Radio-Stream-Player-PHP?style=flat-square)](https://github.com/BrainAV/Radio-Stream-Player-PHP/issues)
[![Stars](https://img.shields.io/github/stars/BrainAV/Radio-Stream-Player-PHP?style=social)](https://github.com/BrainAV/Radio-Stream-Player-PHP)

**[🔴 Live Demo — radio.djay.ca](https://radio.djay.ca/)**

> [!NOTE]
> The live demo uses a Cloudflare Worker proxy (`api.djay.ca`) to tunnel legacy HTTP streams over HTTPS and extract real-time ICY metadata without browser security warnings.

</div>

---

## ✨ Feature Highlights

### 🎵 Player & Audio
| Feature | Description |
|---|---|
| **7 VU Meter Styles** | Classic Bars, LED, Circular, Waveform, Spectrum, Retro Needle, Neon Glow |
| **Live Metadata** | Real-time "Now Playing" track & artist info via ICY metadata polling |
| **Media Keys** | OS lock screen integration + hardware Play/Pause/Next/Prev support |
| **Pop-out Player** | Compact floating window — syncs background, station list, and filters from the main player. Auto-starts playback. |
| **Streaming Proxy** | Routes `http://` streams through a secure proxy, eliminating Mixed Content warnings |

### 👤 User Accounts & Personalization
| Feature | Description |
|---|---|
| **AJAX Auth** | Login/register/logout without stopping playback or reloading the page |
| **Cloud Favorites** | Favorites and custom stations sync to your account via the PHP/MySQL backend |
| **Custom Backgrounds** | Set any image URL as your wallpaper or choose from curated presets |
| **Light & Dark Themes** | Auto-detects system preference; manually toggleable |
| **Genre & Favorites Filter** | Filter your station list by genre or show favorites only — persists across sessions |

### 🔍 Station Discovery
| Feature | Description |
|---|---|
| **Radio Browser API** | Search 30,000+ community-driven stations by name, tag, or country |
| **Custom Stations** | Add and manage your own private stream URLs |
| **Add to Favorites** | One-click add from search results to your personal library |

### 🛡️ Admin Dashboard
| Feature | Description |
|---|---|
| **User Management** | Edit roles, toggle premium status, ban or delete users |
| **Site Config** | Manage Google Tag (GA4), AdSense ID, and custom head scripts from a UI |
| **Premium Tier** | Mark users as premium to suppress ads server-side |
| **Role-Based Ads** | AdSense automatically disabled for `admin` and `is_premium` users — no refresh required |

---

## 🏗️ Architecture Overview

```
Browser (Vanilla JS + Web Audio API)
    │
    ├── player.js       — Core player state, playback engine, pub/sub StateManager
    ├── settings.js     — Auth modals, user settings, favorites, genre filters
    ├── visualizer.js   — 7 VU meter styles via Web Audio API AnalyserNode
    └── api.js          — Fetch wrappers for all PHP API endpoints
          │
          ▼
PHP / MySQL Backend (LAMP/LEMP)
    │
    ├── index.php           — Entry point; injects session data, ad scripts, user role
    ├── popout.php          — Pop-out entry point; same server-side ad injection pattern
    ├── api/auth.php        — AJAX login / logout / session management
    ├── api/favorites.php   — User favorites CRUD
    ├── api/stations.php    — Default & custom station management
    ├── api/admin/          — Admin-only endpoints (users, settings)
    └── database/schema.sql — Full MySQL schema
          │
          ▼
Cloudflare Worker (api.djay.ca) — optional, for demo/HTTPS deployment
    ├── Audio proxy     — Tunnels http:// streams over HTTPS
    └── ICY metadata    — Extracts Now Playing info from stream headers
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | PHP 8.x, PDO/MySQL |
| **Database** | MySQL 5.7+ / MariaDB |
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| **Audio** | Web Audio API (AnalyserNode, GainNode) |
| **Auth** | PHP Sessions + AJAX (no JWT, no framework) |
| **Proxy** | Cloudflare Workers (optional, for demo) |
| **Directory** | [Radio Browser API](https://www.radio-browser.info/) |

---

## 🚀 Installation

### Prerequisites
- PHP 8.0+
- MySQL 5.7+ or MariaDB
- A standard LAMP / LEMP web server (Apache or Nginx)
- cPanel-compatible hosting **or** a VPS — this is a standard PHP project, no Composer/Node required

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/BrainAV/Radio-Stream-Player-PHP.git .
```

**2. Database**
```bash
# Create a MySQL database and user, then import the schema:
mysql -u youruser -p yourdb < database/schema.sql
```

**3. Configure credentials**

Copy and edit the config file:
```bash
cp api/config.example.php api/config.php
```
Then set your DB host, name, username, and password in `api/config.php`.

**4. Deploy**

Upload to your web root. `index.php` is the entry point — no `.htaccess` rewrites required for basic usage.

**5. First-time Admin Setup**

After deploying, register a user account, then manually set `role = 'admin'` in the `users` table:
```sql
UPDATE users SET role = 'admin' WHERE user_email = 'you@example.com';
```
Then access the Admin Dashboard at `/admin.php`.

### Optional: Upgrade from v2.1.x

Run the migration script to add monetization tables:
```sql
source database/update_v2.2_monetization.sql
```

### Local Development (no PHP)

To test the frontend UI only:
```bash
python -m http.server 8000
# Then open http://localhost:8000
```
> Account features, favorites, and admin require a live PHP/MySQL environment.

---

## 📁 Project Structure

```
Radio-Stream-Player-PHP/
├── index.php               # Main entry point (serves template-player.html with session data)
├── popout.php              # Pop-out window entry point
├── admin.php               # Admin dashboard entry point
├── template-player.html    # Main player HTML template
├── popout.html             # Pop-out player HTML
├── styles.css              # All styles — Glassmorphism design system
│
├── player.js               # Core player: audio engine, StateManager, media keys
├── settings.js             # Settings modal: auth, favorites, custom stations, filters
├── visualizer.js           # Web Audio API VU meter (7 styles)
├── api.js                  # Frontend fetch wrappers
├── admin.js                # Admin dashboard logic
├── popout-script.js        # Pop-out player logic
│
├── api/
│   ├── config.php          # DB credentials (not committed — add to .gitignore)
│   ├── auth.php            # Login/logout AJAX handler
│   ├── favorites.php       # Favorites CRUD
│   ├── stations.php        # Station management
│   ├── register.php        # User registration
│   └── admin/
│       ├── users.php       # Admin: user management
│       └── settings.php    # Admin: site config (GA4, AdSense, custom scripts)
│
├── database/
│   ├── schema.sql                      # Full MySQL schema (fresh install)
│   └── update_v2.2_monetization.sql    # Migration: adds is_premium, site_config table
│
└── docs/
    ├── DEVELOPER_GUIDE.md      # Architecture & contribution guide
    ├── RELEASE_v2.2.3.md       # Release notes
    └── UNSPLASH_GUIDE.md       # Background image formatting guide
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` / Play/Pause Media Key | Toggle playback |
| `Next Track` Media Key | Next station |
| `Prev Track` Media Key | Previous station |
| `Tab` | Navigate all controls |

---

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

Latest: **[v2.2.6](CHANGELOG.md#2.2.6---2026-03-14)** — Favorites Sync & State Integrity

---

## 🤝 Contributing

Issues and PRs are welcome. For significant changes, please open an issue first to discuss the approach.

---

<div align="center">

Built by the **BrainAV** team &nbsp;•&nbsp; [Live Demo](https://radio.djay.ca/) &nbsp;•&nbsp; [Changelog](CHANGELOG.md) &nbsp;•&nbsp; [Roadmap](ROADMAP.md)

</div>