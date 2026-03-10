<?php
/**
 * AJAX Registration Handler
 * Handles new user account creation.
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

// 1. Honeypot check (Bot protection)
if (!empty($input['website_url'])) {
    // If the honeypot is filled, silently succeed so bots don't know they failed.
    echo json_encode(['status' => 'success', 'message' => 'Registration successful.']);
    exit();
}

// 2. Input extraction and Sanitization
$email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
$password = $input['password'] ?? '';
$confirm_password = $input['confirm_password'] ?? '';
$display_name = trim(filter_var($input['display_name'] ?? '', FILTER_SANITIZE_STRING));

if (empty($display_name)) {
    $display_name = 'User'; // Fallback
}

// 3. Validation
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Please provide a valid email address.']);
    exit();
}

if (strlen($password) < 6) {
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters long.']);
    exit();
}

if ($password !== $confirm_password) {
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
    // 4. Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE user_email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'This email address is already registered.']);
        exit();
    }

    // 5. Hash password and Insert User
    $hashed_pass = password_hash($password, PASSWORD_DEFAULT);
    $role = 'editor'; // Default role for new users

    $insertStmt = $pdo->prepare("INSERT INTO users (user_email, user_pass, display_name, role) VALUES (?, ?, ?, ?)");
    $insertStmt->execute([$email, $hashed_pass, $display_name, $role]);

    $new_user_id = $pdo->lastInsertId();

    // 6. Auto-login the new user
    $_SESSION['user_id'] = $new_user_id;
    $_SESSION['user_role'] = $role;
    session_regenerate_id(true);

    echo json_encode([
        'status' => 'success', 
        'message' => 'Registration successful. Welcome!',
        'user' => [
            'id' => $new_user_id,
            'role' => $role
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error during registration.']);
}
?>
