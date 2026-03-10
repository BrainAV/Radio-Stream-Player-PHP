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
    $userId = intval($_SESSION['user_id']);
    $userRole = $_SESSION['user_role'] ?? 'editor';
    $loggedInJs = "<script>window.IS_LOGGED_IN = true; window.USER_ID = {$userId}; window.USER_ROLE = '{$userRole}';</script>";
    
    $adminBtn = '';
    if ($userRole === 'admin') {
        $adminBtn = '<a href="admin.php" id="header-admin-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center; text-decoration: none;">Admin CP</a>';
    }
    
    $logoutBtn = '<button id="header-logout-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center;">Logout</button>';
    
    $html = preg_replace('/<\/div>\s*<\/header>/i', "\n" . $adminBtn . "\n" . $logoutBtn . "\n        </div>\n    </header>", $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $loggedInJs, $html);
} else {
    $guestJs = '<script>window.IS_LOGGED_IN = false; window.USER_ID = null; window.USER_ROLE = null;</script>';
    $loginBtn = '<button id="header-login-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center;">Login</button>';
    $html = preg_replace('/<\/div>\s*<\/header>/i', "\n" . $loginBtn . "\n        </div>\n    </header>", $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $guestJs, $html);
}

echo $html;
?>
