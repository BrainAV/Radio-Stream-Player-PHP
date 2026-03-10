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
        $adminBtn = '<a href="admin.php" id="header-admin-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center; text-decoration: none;" aria-label="Admin Control Panel" title="Admin Control Panel">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
        </a>';
    }
    
    $logoutBtn = '<button id="header-logout-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center;" aria-label="Logout" title="Logout">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
    </button>';
    
    $html = preg_replace('/<\/div>\s*<\/header>/i', "\n" . $adminBtn . "\n" . $logoutBtn . "\n        </div>\n    </header>", $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $loggedInJs, $html);
} else {
    $guestJs = '<script>window.IS_LOGGED_IN = false; window.USER_ID = null; window.USER_ROLE = null;</script>';
    $loginBtn = '<button id="header-login-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center;" aria-label="Login" title="Login">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
        </svg>
    </button>';
    $html = preg_replace('/<\/div>\s*<\/header>/i', "\n" . $loginBtn . "\n        </div>\n    </header>", $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $guestJs, $html);
}

echo $html;
?>
