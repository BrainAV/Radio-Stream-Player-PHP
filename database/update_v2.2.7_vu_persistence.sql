-- Database Migration: Add vu_style to users table for persistence
-- Version: 2.2.7

ALTER TABLE users ADD COLUMN vu_style VARCHAR(50) DEFAULT 'led' AFTER is_premium;
