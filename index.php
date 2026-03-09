<?php
/**
 * Radio Stream Player (cPanel Edition)
 * Main Entry Point
 */

session_start();
require_once __DIR__ . '/api/config.php';

// --- Login Logic (Ported from core-cms) ---
$error_message = '';

// Handle Logout via query parameter (?action=logout)
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header("Location: index.php");
    exit;
}

// Check POST logic
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_submit'])) {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error_message = "Please enter both email and password.";
    } else {
        try {
            $pdo = get_db_connection();
            if ($pdo) {
                // Fetch user
                $stmt = $pdo->prepare("SELECT id, user_pass, role FROM users WHERE user_email = ?");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user && password_verify($password, $user['user_pass'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_role'] = $user['role'];
                    session_regenerate_id(true);

                    // Login successful, refresh to drop POST data
                    header("Location: index.php");
                    exit;
                } else {
                    $error_message = "Invalid email or password.";
                }
            } else {
                $error_message = "Fatal: Database connection unavailable. Check config.";
            }
        } catch (PDOException $e) {
            $error_message = "Database error. Check config.";
        }
    }
}

// --- View Rendering ---

// Handle Login Page Trigger
$showLogin = (isset($_GET['action']) && $_GET['action'] === 'login');

// If action=login is requested AND user is NOT logged in, render the login screen
if ($showLogin && !isset($_SESSION['user_id'])) {
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Radio Stream Player</title>
    <!-- Basic styling inherited from core-cms admin setup -->
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #121212; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; color: #fff;}
        .login-container { background: rgba(30,30,40, 0.9); padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); width: 100%; max-width: 400px; border: 1px solid rgba(255,255,255,0.1); position: relative; }
        .close-login { position: absolute; top: 15px; right: 20px; font-size: 28px; color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.2s; line-height: 1; }
        .close-login:hover { color: #fff; }
        h1 { font-size: 2em; text-align: center; margin-bottom: 25px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; font-weight: bold; margin-bottom: 5px; }
        .form-group input { width: 100%; padding: 10px; border: 1px solid #444; border-radius: 4px; box-sizing: border-box; background: #222; color: #fff; }
        .btn { display: block; width: 100%; background-color: #3b82f6; color: #fff; padding: 12px; border: none; border-radius: 4px; font-size: 1.1em; cursor: pointer; transition: background-color 0.2s; }
        .btn:hover { background-color: #2563eb; }
        .error-message { background-color: rgba(217, 48, 37, 0.2); color: #ff6b6b; padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; border: 1px solid #ff6b6b; }
    </style>
</head>
<body>
    <div class="login-container">
        <a href="index.php" class="close-login" title="Cancel">&times;</a>
        <h1>Radio Login</h1>
        <?php if ($error_message): ?>
            <div class="error-message">
                <?php echo htmlspecialchars($error_message, ENT_QUOTES, 'UTF-8'); ?>
            </div>
        <?php endif; ?>
        <form action="index.php?action=login" method="post">
            <input type="hidden" name="login_submit" value="1">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn">Login</button>
        </form>
    </div>
</body>
</html>
<?php 
    exit; 
} 

// --- User IS Logged in or Guest ---
// Serve the actual Glassmorphism Radio Player HTML UI using template-player.html
$html = file_get_contents(__DIR__ . '/template-player.html');

if (isset($_SESSION['user_id'])) {
    $loggedInJs = '<script>window.IS_LOGGED_IN = true;</script>';
    $logoutBtn = '<a href="index.php?action=logout" class="theme-btn" style="text-decoration: none; font-size: 14px; margin-left: 10px; display: flex; align-items: center;">Logout</a>';
    $html = str_replace('</header>', $logoutBtn . '</header>', $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $loggedInJs, $html);
} else {
    $guestJs = '<script>window.IS_LOGGED_IN = false;</script>';
    $loginBtn = '<a href="index.php?action=login" class="theme-btn" style="text-decoration: none; font-size: 14px; margin-left: 10px; display: flex; align-items: center;">Login</a>';
    $html = str_replace('</header>', $loginBtn . '</header>', $html);
    $html = preg_replace('/<body[^>]*>/i', "$0\n" . $guestJs, $html);
}

echo $html;
?>
