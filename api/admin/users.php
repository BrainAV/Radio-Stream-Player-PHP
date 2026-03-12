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
        $stmt = $pdo->query("SELECT id, user_email, display_name, role, is_premium, created_at FROM users ORDER BY created_at DESC LIMIT 100");
        $users = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $users]);
        exit();
    }

    if ($method === 'PUT') {
        // Edit User Role or Premium Status
        $id = intval($input['id'] ?? 0);
        $new_role = $input['role'] ?? null;
        $is_premium = isset($input['is_premium']) ? intval($input['is_premium']) : null;

        if (!$id) {
             echo json_encode(['status' => 'error', 'message' => 'Invalid ID.']);
             exit();
        }

        if ($id === 1 && $new_role !== null && $new_role !== 'admin') {
             echo json_encode(['status' => 'error', 'message' => 'Cannot change role of primary admin.']);
             exit();
        }

        $updates = [];
        $params = [];
        if ($new_role !== null && in_array($new_role, ['user', 'editor', 'admin'])) {
            $updates[] = "role = ?";
            $params[] = $new_role;
        }
        if ($is_premium !== null && ($is_premium === 0 || $is_premium === 1)) {
            $updates[] = "is_premium = ?";
            $params[] = $is_premium;
        }

        if (empty($updates)) {
            echo json_encode(['status' => 'error', 'message' => 'Nothing to update.']);
            exit();
        }

        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

        echo json_encode(['status' => 'success', 'message' => 'User updated.']);
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
