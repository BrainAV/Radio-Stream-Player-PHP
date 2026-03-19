# Release Notes — v2.2.9

## 📱 Mobile Navigation Overhaul

This release brings a major improvement to the mobile user experience, ensuring the Radio Stream Player is just as elegant on a smartphone as it is on a desktop.

### 🌟 Key Highlights

- **Glassmorphism Bottom Sheet** — We've replaced the cluttered header icons with a modern, sliding navigation sheet. It's thumb-friendly and perfectly integrates with our project's aesthetic.
- **Responsive Hamburger Toggle** — A clean hamburger menu now appears on small screens (≤ 600px), consolidating all navigation actions into one place.
- **Dynamic Auth Sync** — Whether you sign in on desktop or mobile, your navigation options (Login, Logout, Admin, Account) update instantly across all menus.
- **Smooth Animations** — Enjoy fluid transitions as the mobile menu slides in and out.

### 🛠️ Technical Improvements
- **Responsive Utilities** — Cleanly decoupled desktop and mobile views using new `.desktop-only` and `.mobile-only` CSS standards.
- **PWA Cache Bump** — Service Worker cache has been updated to `v2.2.9` to ensure all users receive the latest UI updates immediately.

### 📂 Files Updated
- `index.php`
- `template-player.html`
- `styles.css`
- `settings.js`
- `sw.js`
- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`

---
*Thank you for supporting the Radio Stream Player project!*
