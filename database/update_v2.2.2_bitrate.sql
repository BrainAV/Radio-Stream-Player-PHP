-- Migration to add bitrate column to stations
-- Added as part of v2.2.x bitrate badge implementation

ALTER TABLE stations ADD COLUMN bitrate INT DEFAULT NULL AFTER country;

-- Update known bitrates for default stations
UPDATE stations SET bitrate = 192 WHERE name = 'ETN-FM Trance';
UPDATE stations SET bitrate = 128 WHERE name = 'Psyndora Psytrance';
UPDATE stations SET bitrate = 128 WHERE name = 'DMT-FM';
UPDATE stations SET bitrate = 128 WHERE name = 'BOM Psytrance Radio';
UPDATE stations SET bitrate = 128 WHERE name = 'Melodic House Radio';
UPDATE stations SET bitrate = 128 WHERE name = 'Radiozora - Psytrance';
UPDATE stations SET bitrate = 192 WHERE name = 'Hirsch Radio Psytrance';
UPDATE stations SET bitrate = 192 WHERE name = 'Hirsch Radio Progressive';
