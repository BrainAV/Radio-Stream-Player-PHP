<?php
/**
 * AJAX Admin Users Endpoint
 * Handles GET, PUT (edit role), and DELETE for users.
 */

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once dirname(__DIR__) . '/config.php';

// The Gatekeeper
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden: Admin access required.']);
    exit();
}

$loggedInAdminId = intval($_SESSION['user_id']);
$method = $_SERVER['REQUEST_METHOD'];
$pdo = get_db_connection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

try {
    if ($method === 'GET') {
        // List Users (Limit to 100 for simplicity in this version, could add pagination)
        $stmt = $pdo->query("SELECT id, user_email, display_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 100");
        $users = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $users]);
        exit();
    }

    if ($method === 'PUT') {
        // Edit User Role
        $id = intval($input['id'] ?? 0);
        $new_role = $input['role'] ?? '';

        if (!$id || !in_array($new_role, ['user', 'editor', 'admin'])) {
             echo json_encode(['status' => 'error', 'message' => 'Invalid ID or Role.']);
             exit();
        }

        if ($id === 1) {
             echo json_encode(['status' => 'error', 'message' => 'Cannot modify the primary admin.']);
             exit();
        }

        $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
        $stmt->execute([$new_role, $id]);

        echo json_encode(['status' => 'success', 'message' => 'User role updated.']);
        exit();
    }

    if ($method === 'DELETE') {
        // Delete User
        $id = intval($input['id'] ?? 0);

        if (!$id) {
             echo json_encode(['status' => 'error', 'message' => 'Invalid ID.']);
             exit();
        }

        if ($id === 1 || $id === $loggedInAdminId) {
             echo json_encode(['status' => 'error', 'message' => 'Cannot delete the primary admin or yourself.']);
             exit();
        }

        // Favorites are CASCADE deleted in the schema
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'message' => 'User deleted.']);
        exit();
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error.']);
}
?>
