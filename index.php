<?php
/**
 * Radio Stream Player (cPanel Edition)
 * Main Entry Point
 */

session_start();
require_once __DIR__ . '/api/config.php';
require_once __DIR__ . '/api/session_check.php';

// --- User IS Logged in or Guest ---
// Serve the actual Glassmorphism Radio Player HTML UI using template-player.html
$html = file_get_contents(__DIR__ . '/template-player.html');

if (isset($_SESSION['user_id'])) {
    $userId = intval($_SESSION['user_id']);
    $userRole = $_SESSION['user_role'] ?? 'editor';
    
    // Fetch user details including premium status
    $isPremium = 0;
    $pdo = get_db_connection();
    if ($pdo) {
        $stmt = $pdo->prepare("SELECT is_premium FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        if ($user) {
            $isPremium = intval($user['is_premium']);
        }
    }

    $isPremiumJs = $isPremium ? 'true' : 'false';
    $loggedInJs = "<script>window.IS_LOGGED_IN = true; window.USER_ID = {$userId}; window.USER_ROLE = '{$userRole}'; window.IS_PREMIUM = {$isPremiumJs};</script>";
    
    $adminBtn = '';
    if ($userRole === 'admin') {
        $adminBtn = '<a href="admin.php" id="header-admin-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center; text-decoration: none;" aria-label="Admin Control Panel" title="Admin Control Panel">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
        </a>';
    }

    $accountBtn = '<button id="header-account-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center;" aria-label="My Account" title="My Account">';
    $accountBtn .= '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">';
    $accountBtn .= '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>';
    $accountBtn .= '</svg>';
    $accountBtn .= '</button>';
    
    $logoutBtn = '<button id="header-logout-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center;" aria-label="Logout" title="Logout">';
    $logoutBtn .= '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">';
    $logoutBtn .= '<path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>';
    $logoutBtn .= '</svg>';
    $logoutBtn .= '</button>';
    
    $html = preg_replace('/<\/div>\s*<\/header>/i', "\n" . $adminBtn . "\n" . $accountBtn . "\n" . $logoutBtn . "\n        </div>\n    </header>", $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $loggedInJs, $html);
} else {
    $guestJs = '<script>window.IS_LOGGED_IN = false; window.USER_ID = null; window.USER_ROLE = null; window.IS_PREMIUM = false;</script>';
    $isPremium = 0; // Guests are not premium
    $userRole = null;
    $loginBtn = '<button id="header-login-btn" class="theme-btn" style="font-size: 14px; display: flex; align-items: center;" aria-label="Login" title="Login">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
        </svg>
    </button>';
    $html = preg_replace('/<\/div>\s*<\/header>/i', "\n" . $loginBtn . "\n        </div>\n    </header>", $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $guestJs, $html);
}

// --- Fetch Site Configuration & Inject Scripts ---
$pdo = get_db_connection();
if ($pdo) {
    $stmt = $pdo->query("SELECT config_key, config_value FROM site_config");
    $config = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $headScripts = "";
    
    // Google Tag (gtag.js)
    if (!empty($config['google_tag_id'])) {
        $tagId = htmlspecialchars($config['google_tag_id']);
        $headScripts .= "<!-- Google tag (gtag.js) -->\n";
        $headScripts .= "<script async src=\"https://www.googletagmanager.com/gtag/js?id={$tagId}\"></script>\n";
        $headScripts .= "<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', '{$tagId}');\n</script>\n";
    }

    // AdSense (only if NOT admin and NOT premium)
    if ($userRole !== 'admin' && !$isPremium && !empty($config['adsense_id'])) {
        $adsenseId = htmlspecialchars($config['adsense_id']);
        $headScripts .= "<!-- AdSense -->\n";
        $headScripts .= "<script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={$adsenseId}\" crossorigin=\"anonymous\"></script>\n";
    }

    // Custom Head Code
    if (!empty($config['custom_head_code'])) {
        $headScripts .= $config['custom_head_code'] . "\n";
    }

    if (!empty($headScripts)) {
        $html = preg_replace('/<\/head>/i', $headScripts . "</head>", $html);
    }

    // Show Ad Container if ads are active
    if ($userRole !== 'admin' && !$isPremium && !empty($config['adsense_id'])) {
        $html = str_replace('id="ad-space-main" class="ad-row" style="display: none;"', 'id="ad-space-main" class="ad-row"', $html);
    }
}

echo $html;
?>
