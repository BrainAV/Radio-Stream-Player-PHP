<?php
require_once __DIR__ . '/api/config.php';

$pdo = get_db_connection();
if (!$pdo) {
    die("Error connecting to database.");
}

try {
    // Add is_favorite column if it doesn't exist
    $pdo->exec("ALTER TABLE user_favorites ADD COLUMN is_favorite BOOLEAN DEFAULT TRUE;");
    echo "Successfully added is_favorite column to user_favorites.";
} catch (PDOException $e) {
    echo "Error or column already exists: " . $e->getMessage();
}
?>
