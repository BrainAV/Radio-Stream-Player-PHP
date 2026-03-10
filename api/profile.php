<?php
/**
 * User Profile API
 * Handles fetching and updating user email/password.
 */

session_start();
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

// Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized.']);
    exit();
}

$user_id = $_SESSION['user_id'];
$pdo = get_db_connection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit();
}

// ---------------------------------------------------------
// GET REQUEST: Fetch Current User Info
// ---------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT user_email, display_name FROM users WHERE id = :id");
        $stmt->bindParam(':id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch();

        if ($user) {
            echo json_encode([
                'status' => 'success',
                'data' => $user
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Query failed.']);
    }
    exit();
}

// ---------------------------------------------------------
// POST REQUEST: Update Profile
// ---------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['current_password'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Current password is required to make changes.']);
        exit();
    }

    $current_pass = $data['current_password'];
    
    // ---------------------------------------------------------
    // ACCOUNT DELETION LOGIC
    // ---------------------------------------------------------
    if (isset($data['action']) && $data['action'] === 'delete_account') {
        if ($user_id == 1) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'The primary administrator account cannot be deleted.']);
            exit();
        }

        // Verify current password
        $stmt = $pdo->prepare("SELECT user_pass FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($current_pass, $user['user_pass'])) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Incorrect password.']);
            exit();
        }

        // Delete user
        $delStmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $delStmt->execute([$user_id]);

        session_destroy();

        echo json_encode(['status' => 'success', 'message' => 'Account deleted successfully.']);
        exit();
    }
    // ---------------------------------------------------------

    $new_email = filter_var($data['new_email'] ?? '', FILTER_SANITIZE_EMAIL);
    $new_pass = $data['new_password'] ?? '';

    try {
        // 1. Verify current password
        $stmt = $pdo->prepare("SELECT user_pass FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($current_pass, $user['user_pass'])) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Incorrect current password.']);
            exit();
        }

        // 2. Prepare update
        $updates = [];
        $params = [];

        if (!empty($new_email) && $new_email !== '') {
            $updates[] = "user_email = ?";
            $params[] = $new_email;
        }

        if (!empty($new_pass)) {
            $updates[] = "user_pass = ?";
            $params[] = password_hash($new_pass, PASSWORD_DEFAULT);
        }

        if (empty($updates)) {
            echo json_encode(['status' => 'error', 'message' => 'No changes provided.']);
            exit();
        }

        $params[] = $user_id;
        $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Profile updated successfully.'
            ]);
        } else {
            // Check if user exists but data was identical
            echo json_encode([
                'status' => 'success',
                'message' => 'No changes were necessary (data is identical).'
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        // Handle duplicate email error
        if ($e->getCode() == 23000) {
            echo json_encode(['status' => 'error', 'message' => 'Email address is already in use.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
    }
    exit();
}

http_response_code(405);
exit();
