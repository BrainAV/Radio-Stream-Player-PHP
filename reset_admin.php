<?php
/**
 * Admin Password Reset Tool
 * Delete this file after use!
 */
require_once __DIR__ . '/api/config.php';

$email = 'admin@djay.ca';
$password = 'Fleming0!?';
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $pdo = get_db_connection();
    if (!$pdo) {
        die("Database connection failed. Check api/config.php");
    }

    $stmt = $pdo->prepare("UPDATE users SET user_pass = ? WHERE user_email = ?");
    $stmt->execute([$hash, $email]);

    if ($stmt->rowCount() > 0) {
        echo "Password for $email has been reset to: $password<br>";
        echo "<strong>IMPORTANT: DELETE THIS FILE IMMEDIATELY!</strong>";
    } else {
        // If user doesn't exist, try to insert
        $stmt = $pdo->prepare("INSERT IGNORE INTO users (user_email, user_pass, display_name, role) VALUES (?, ?, 'Admin', 'admin')");
        $stmt->execute([$email, $hash]);
        echo "Admin user $email created with password: $password<br>";
        echo "<strong>IMPORTANT: DELETE THIS FILE IMMEDIATELY!</strong>";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
