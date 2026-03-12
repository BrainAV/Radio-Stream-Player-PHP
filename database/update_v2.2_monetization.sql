-- Database Update Script: Monetization & Webmaster Config (v2.2)
-- Apply this if you have an existing v2.1 database.

USE radio_player;

-- 1. Add is_premium column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium TINYINT(1) NOT NULL DEFAULT 0 AFTER role;

-- 2. Create site_config table
CREATE TABLE IF NOT EXISTS site_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed default site configuration (using INSERT IGNORE to avoid duplicates)
INSERT IGNORE INTO site_config (config_key, config_value) VALUES
('google_tag_id', 'G-T93274MPPZ'),
('adsense_id', 'ca-pub-0633259514526906'),
('custom_head_code', '');
