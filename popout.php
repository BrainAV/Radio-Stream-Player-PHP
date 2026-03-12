<?php
/**
 * Radio Stream Player - Pop-out Window
 * Serves popout.html with server-side ad injection (mirrors index.php pattern).
 * Admins and premium users will NOT see ads.
 */

session_start();
require_once __DIR__ . '/api/config.php';

$html = file_get_contents(__DIR__ . '/popout.html');

// Determine user role and premium status from session
$userRole = null;
$isPremium = 0;

if (isset($_SESSION['user_id'])) {
    $userId = intval($_SESSION['user_id']);
    $userRole = $_SESSION['user_role'] ?? 'editor';

    $pdo = get_db_connection();
    if ($pdo) {
        $stmt = $pdo->prepare("SELECT is_premium FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        if ($user) {
            $isPremium = intval($user['is_premium']);
        }
    }
}

// --- Fetch Site Configuration & Inject Scripts ---
$pdo = $pdo ?? get_db_connection();
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

    // AdSense — only for non-admin, non-premium users
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

    // Reveal the ad container for eligible users (client ID & slot are hardcoded in popout.html)
    if ($userRole !== 'admin' && !$isPremium && !empty($config['adsense_id'])) {
        $html = str_replace(
            'id="ad-space-popout" class="ad-container" style="display: none; margin-top: 8px;"',
            'id="ad-space-popout" class="ad-container" style="margin-top: 8px;"',
            $html
        );
    }
}

echo $html;
?>
