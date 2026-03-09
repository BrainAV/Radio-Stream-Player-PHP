-- Radio Stream Player PHP Database Schema (WP/cPanel Style)

CREATE DATABASE IF NOT EXISTS radio_player;
USE radio_player;

-- Support different types of stations
CREATE TABLE IF NOT EXISTS stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(512) NOT NULL,
    genre VARCHAR(100) DEFAULT 'Unknown',
    country VARCHAR(100) DEFAULT 'Unknown',
    type ENUM('default', 'custom', 'sponsored', 'directory') DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table (Derived directly from core-cms format)
CREATE TABLE IF NOT EXISTS users (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_email varchar(255) NOT NULL,
  user_pass varchar(255) NOT NULL,
  display_name varchar(250) NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'editor',
  avatar varchar(255) DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY user_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Favorites mapping table (Pivot)
CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, station_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Seed default admin user (Password: admin123)
-- IMPORTANT: Change this in production immediately
INSERT IGNORE INTO users (user_email, user_pass, display_name, role) VALUES
('admin@djay.ca', '$2y$10$Q.Oa1n2e15H.YyR/DXZK/ui8N60C0.4v3f.zK2A281L3E5A4s5M9O', 'Site Administrator', 'admin');


-- Seed data for Default Stations
INSERT IGNORE INTO stations (name, url, genre, country, type) VALUES
('CIDC Z103.5 FM', 'https://buf-streamb1-ais-relay1.streamb.live/SB00222/playlist.m3u8', 'Top 40', 'Canada', 'default'),
('ETN-FM Trance', 'https://stream.pcradio.ru/etnfm_trance-hi', 'Trance', 'Canada', 'default'),
('Psyndora Psytrance', 'https://cast.magicstreams.gr/sc/psyndora/stream', 'Psytrance', 'Greece', 'default'),
('DMT-FM', 'https://dc1.serverse.com/proxy/ywycfrxn/stream', 'Psytrance', 'UK', 'default'),
('BOM Psytrance Radio', 'https://strm112.1.fm/psytrance_mobile_mp3?aw_0_req.gdpr=true', 'Psytrance', 'Switzerland', 'default'),
('Melodic House Radio', 'https://stream1-technolovers.radiohost.de/melodic-house-techno', 'Melodic House', 'Germany', 'default'),
('Party~Vibe | Psychedelic Trance Radio', 'https://www.partyvibe.com:8062/;listen.pls?sid=1', 'Psytrance', 'UK', 'default'),
('Radiozora - Psytrance', 'https://trance.out.airtime.pro/trance_a', 'Psytrance', 'Hungary', 'default'),
('Hirsch Radio Psytrance', 'https://hirschmilch.de:7501/psytrance.mp3', 'Psytrance', 'Germany', 'default'),
('Hirsch Radio Progressive', 'https://hirschmilch.de:7501/progressive.mp3', 'Progressive', 'Germany', 'default');
