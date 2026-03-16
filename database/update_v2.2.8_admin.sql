-- Radio Stream Player v2.2.8 Admin & Branding Update
-- Adds social media links and maintenance mode keys to site_config

INSERT IGNORE INTO site_config (config_key, config_value) VALUES
('social_github', ''),
('social_twitter', ''),
('social_facebook', ''),
('social_instagram', ''),
('social_support', ''),
('maintenance_mode', '0');
