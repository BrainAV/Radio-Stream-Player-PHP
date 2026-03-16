<?php
/**
 * AJAX Authentication Handler
 */

session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['login_submit'])) {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Please enter both email and password.']);
            exit;
        }

        try {
            $pdo = get_db_connection();
            if ($pdo) {
                // Fetch user
                $stmt = $pdo->prepare("SELECT id, user_pass, role, is_premium, vu_style FROM users WHERE user_email = ?");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user && password_verify($password, $user['user_pass'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_role'] = $user['role'];
                    session_regenerate_id(true);

                    // --- Remember Me Logic ---
                    if (isset($input['remember']) && $input['remember'] === true) {
                        $token = bin2hex(random_bytes(32));
                        $tokenHash = hash('sha256', $token);
                        $expires = date('Y-m-d H:i:s', time() + (86400 * 30)); // 30 days

                        $tokenStmt = $pdo->prepare("INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
                        $tokenStmt->execute([$user['id'], $tokenHash, $expires]);

                        // Set the cookie (raw token)
                        setcookie('remember_me', $token, [
                            'expires' => time() + (86400 * 30),
                            'path' => '/',
                            'secure' => true,
                            'httponly' => true,
                            'samesite' => 'Lax'
                        ]);
                    }

                    echo json_encode([
                        'status' => 'success', 
                        'message' => 'Login successful.',
                        'user_id' => $user['id'],
                        'role' => $user['role'],
                        'is_premium' => (bool)$user['is_premium'],
                        'vu_style' => $user['vu_style']
                    ]);
                    exit;
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
                    exit;
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Database connection unavailable.']);
                exit;
            }
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error.']);
            exit;
        }
    }
}

if ($action === 'logout') {
    // Invalidate Remember Me token if exists
    if (isset($_COOKIE['remember_me'])) {
        $tokenHash = hash('sha256', $_COOKIE['remember_me']);
        try {
            $pdo = get_db_connection();
            if ($pdo) {
                $stmt = $pdo->prepare("DELETE FROM user_tokens WHERE token = ?");
                $stmt->execute([$tokenHash]);
            }
        } catch (PDOException $e) {}
        
        setcookie('remember_me', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }

    session_destroy();
    echo json_encode(['status' => 'success', 'message' => 'Logged out.']);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
?>
