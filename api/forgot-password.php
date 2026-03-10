<?php
/**
 * AJAX Forgot Password Handler
 * Generates a reset token and emails it to the user.
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

if (!$input || empty($input['email'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please provide an email address.']);
    exit();
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format.']);
    exit();
}

$pdo = get_db_connection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit();
}

try {
    // 1. Check if user exists
    $stmt = $pdo->prepare("SELECT id, display_name FROM users WHERE user_email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Obscure error if user doesn't exist for security
        echo json_encode(['status' => 'success', 'message' => 'If an account exists for this email, a reset link has been sent.']);
        exit();
    }

    // 2. Generate secure token
    $raw_token = bin2hex(random_bytes(32));
    $hashed_token = password_hash($raw_token, PASSWORD_DEFAULT);

    // 3. Delete existing tokens for this email to prevent spam/clutter
    $delStmt = $pdo->prepare("DELETE FROM password_resets WHERE email = ?");
    $delStmt->execute([$email]);

    // 4. Insert new token
    $insertStmt = $pdo->prepare("INSERT INTO password_resets (email, token) VALUES (?, ?)");
    $insertStmt->execute([$email, $hashed_token]);

    // 5. Send Email
    // In production, configure your absolute URL here or read from $_SERVER
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    // Assumes script is inside api/ directory
    $base_dir = dirname(dirname($_SERVER['PHP_SELF'])); 
    $base_url = rtrim($protocol . "://" . $host . $base_dir, '/');

    $reset_link = $base_url . "/?reset_token=" . $raw_token . "&email=" . urlencode($email);

    $to = $email;
    $subject = "Password Reset Request - Radio Stream Player";
    
    // HTML Message
    $message = "
    <html>
    <head>
      <title>Password Reset</title>
    </head>
    <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
      <div style='background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
        <h2 style='color: #333;'>Hello {$user['display_name']},</h2>
        <p>You recently requested to reset your password for your Radio Stream Player account.</p>
        <p>Click the button below to reset it. This link is valid for 1 hour.</p>
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{$reset_link}' style='background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;'>Reset Password</a>
        </div>
        <p style='font-size: 12px; color: #777;'>If you did not request a password reset, please ignore this email.</p>
        <hr style='border: none; border-top: 1px solid #eee; margin-top: 20px;'>
        <p style='font-size: 10px; color: #aaa; text-align: center;'>Radio Stream Player Admin</p>
      </div>
    </body>
    </html>
    ";

    // Headers for HTML Mail
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: no-reply@" . $host . "\r\n";

    // Send Mail
    if (mail($to, $subject, $message, $headers)) {
        echo json_encode(['status' => 'success', 'message' => 'If an account exists for this email, a reset link has been sent.']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to send email. Check server mail configuration.']);
        // For local testing, we could fallback to displaying the link, but that's insecure in production.
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error.']);
}
?>
