<?php
/**
 * AJAX Reset Password Handler
 * Validates the token and updates the password.
 */

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON payload.']);
    exit();
}

$email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
$token = $input['token'] ?? '';
$new_password = $input['password'] ?? '';
$confirm_password = $input['confirm_password'] ?? '';

if (empty($email) || empty($token) || empty($new_password)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
    exit();
}

if (strlen($new_password) < 6) {
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters long.']);
    exit();
}

if ($new_password !== $confirm_password) {
    echo json_encode(['status' => 'error', 'message' => 'Passwords do not match.']);
    exit();
}

$pdo = get_db_connection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit();
}

try {
    // 1. Fetch the token for this email
    // Delete any tokens older than 1 hour as a cleanup measure
    $pdo->exec("DELETE FROM password_resets WHERE created_at < (NOW() - INTERVAL 1 HOUR)");

    $stmt = $pdo->prepare("SELECT token FROM password_resets WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $resetData = $stmt->fetch();

    if (!$resetData || !password_verify($token, $resetData['token'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired reset token.']);
        exit();
    }

    // 2. Hash new password and update user
    $hashed_pass = password_hash($new_password, PASSWORD_DEFAULT);
    
    $updateStmt = $pdo->prepare("UPDATE users SET user_pass = ? WHERE user_email = ?");
    $updateStmt->execute([$hashed_pass, $email]);

    if ($updateStmt->rowCount() === 0) {
       echo json_encode(['status' => 'error', 'message' => 'User not found or password is the same.']);
       exit();
    }

    // 3. Clear token
    $delStmt = $pdo->prepare("DELETE FROM password_resets WHERE email = ?");
    $delStmt->execute([$email]);

    echo json_encode(['status' => 'success', 'message' => 'Password reset successfully. You can now log in.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error.']);
}
?>
