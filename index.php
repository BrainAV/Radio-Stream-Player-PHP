<?php
/**
 * Radio Stream Player (cPanel Edition)
 * Main Entry Point
 */

session_start();
require_once __DIR__ . '/api/config.php';

// --- User IS Logged in or Guest ---
// Serve the actual Glassmorphism Radio Player HTML UI using template-player.html
$html = file_get_contents(__DIR__ . '/template-player.html');

if (isset($_SESSION['user_id'])) {
    $loggedInJs = '<script>window.IS_LOGGED_IN = true;</script>';
    $logoutBtn = '<button id="header-logout-btn" class="theme-btn" style="font-size: 14px; margin-left: 10px; display: flex; align-items: center;">Logout</button>';
    $html = str_replace('</header>', $logoutBtn . '</header>', $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $loggedInJs, $html);
} else {
    $guestJs = '<script>window.IS_LOGGED_IN = false;</script>';
    $loginBtn = '<button id="header-login-btn" class="theme-btn" style="font-size: 14px; margin-left: 10px; display: flex; align-items: center;">Login</button>';
    $html = str_replace('</header>', $loginBtn . '</header>', $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $guestJs, $html);
}

echo $html;
?>
