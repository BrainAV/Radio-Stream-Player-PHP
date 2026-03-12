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
                $stmt = $pdo->prepare("SELECT id, user_pass, role, is_premium FROM users WHERE user_email = ?");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user && password_verify($password, $user['user_pass'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_role'] = $user['role'];
                    session_regenerate_id(true);

                    echo json_encode([
                        'status' => 'success', 
                        'message' => 'Login successful.',
                        'user_id' => $user['id'],
                        'role' => $user['role'],
                        'is_premium' => (bool)$user['is_premium']
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
    session_destroy();
    echo json_encode(['status' => 'success', 'message' => 'Logged out.']);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
?>
