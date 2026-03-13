# Release Notes: v2.2.3

We're excited to announce **version 2.2.3** of the Radio Stream Player! 🚀

This update focuses heavily on giving the **Admin Dashboard** a much-needed mobile overhaul, along with some fantastic quality-of-life improvements for all users, including true state persistence across sessions and a cleaner visual identity.

---

### ✨ What's New

*   📱 **Responsive Admin Dashboard:** Managing your station is no longer tethered to a desktop! The Admin Control Panel has been completely re-engineered for mobile devices. Enjoy a smooth, sliding navigation sidebar, touch-optimized forms, and stackable, card-based tables that are easy to read on any screen size.
*   🧠 **State Recovery (Persistence):** The player now remembers exactly where you left off. Your last selected station and preferred volume level are automatically restored the next time you open the player.
*   🧹 **Declutter Mode:** Your library, your rules. You can now toggle "Declutter Mode" in Settings to hide all default system stations you haven't explicitly favorited. This keeps your custom shortcuts and personal favorites front and center!
*   📻 **Visual Polish:** We've replaced the plain text site title with a glowing, custom Retro Radio SVG icon, bringing the header perfectly in line with our minimalist, icon-based design language.

### 🛡️ Under the Hood

*   **Security Hardening:** We've tightened our repository security by removing `api/config.php` from version control and providing a safe `api/config.php.example` template. This ensures database credentials remain strictly within your local or production environment.

---

*Thank you for tuning in! As always, you can check our [CHANGELOG.md](../CHANGELOG.md) for a complete history of updates.*
