<?php
/**
 * Persistent Session Recovery (Remember Me)
 * Checks for remember_me cookie and restores session if valid.
 */

require_once __DIR__ . '/config.php';

function check_persistent_session() {
    if (isset($_SESSION['user_id'])) {
        return; // Already logged in
    }

    if (!isset($_COOKIE['remember_me'])) {
        return; // No persistence requested
    }

    $token = $_COOKIE['remember_me'];
    $tokenHash = hash('sha256', $token);

    try {
        $pdo = get_db_connection();
        if (!$pdo) return;

        // Find valid token
        $stmt = $pdo->prepare("
            SELECT t.user_id, u.role, u.is_premium, u.vu_style 
            FROM user_tokens t
            JOIN users u ON t.user_id = u.id
            WHERE t.token = ? AND t.expires_at > NOW()
        ");
        $stmt->execute([$tokenHash]);
        $data = $stmt->fetch();

        if ($data) {
            // Restore session
            $_SESSION['user_id'] = $data['user_id'];
            $_SESSION['user_role'] = $data['role'];
            $_SESSION['is_premium'] = (bool)$data['is_premium'];
            $_SESSION['vu_style'] = $data['vu_style'];
            
            // Optional: Rotate token for improved security (skipped for simplicity in this MVP)
        } else {
            // Token invalid or expired, clear cookie
            setcookie('remember_me', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
        }
    } catch (PDOException $e) {
        // Log error if needed
    }
}

// Auto-run when included
check_persistent_session();
?>
