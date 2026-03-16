# Release Notes: v2.2.8 - Admin Intelligence & Branding 🚀

This release focuses on empowering site administrators with data-driven insights, operational tools, and dynamic branding controls.

## 📊 Station Intelligence
- **Popularity Tracking**: Added a "Total Favorites" column to the admin station list to identify popular streams.
- **Station Promotion**: A new one-click engine to promote popular user-added stations into public system defaults.
- **User Station View**: Admins can now audit individual user collections (favorites and custom stations) directly from the dashboard.

## 🛡️ Operational Health & Resiliency
- **Advanced Duplicate Detection**: Bi-directional conflict marking for both exact URL matches (with SHOUTcast normalization) and Name overlaps (potential mirrors).
- **Stream Health Checker**: Integrated utility to ping and validate stream status (Alive, Dead, Failing) from the UI.
- **Real-Time Table Filtering**: Instant search across users and stations.

## 🎨 Dynamic Site Branding
- **Social Media CRUD**: Manage GitHub, Twitter, Facebook, Instagram, and PayPal links via Site Config. No more hardcoded links!
- **Maintenance Mode**: Master toggle to redirect guests to a landing page during updates.
- **Public Settings API**: Secure endpoint to serve non-sensitive site config to the player frontend.

## 🛠️ Internal Fixes
- **SHOUTcast Normalization**: Improved duplicate detection to handle trailing semicolon (`;`) and slash (`/`) edge cases.
- **UI Integrity**: Fixed missing CSS/JS closing braces and optimized the "About" modal's dynamic icons.

---
**Deployment Note**: Run `database/update_v2.2.8_admin.sql` (if created) or ensure your `site_config` table supports the new social media and maintenance keys.
