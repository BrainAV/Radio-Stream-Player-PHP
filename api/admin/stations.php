<?php
/**
 * AJAX Admin Stations Endpoint
 * Handles GET, POST, PUT, DELETE for system-level default stations.
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
        // List System Stations (type = 'default' implies it's a system station)
        $stmt = $pdo->query("SELECT id, name, url, genre FROM stations WHERE type = 'default' ORDER BY name ASC");
        $stations = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $stations]);
        exit();
    }

    if ($method === 'POST') {
        // Add System Station
        $name = trim($input['name'] ?? '');
        $url = trim($input['url'] ?? '');
        $genre = trim($input['genre'] ?? '');

        if (!$name || !$url) {
            echo json_encode(['status' => 'error', 'message' => 'Name and URL are required.']);
            exit();
        }

        $stmt = $pdo->prepare("INSERT INTO stations (name, url, genre, type) VALUES (?, ?, ?, 'default')");
        $stmt->execute([$name, $url, $genre]);

        echo json_encode(['status' => 'success', 'message' => 'System station added.']);
        exit();
    }

    if ($method === 'PUT') {
        // Edit System Station
        $id = intval($input['id'] ?? 0);
        $name = trim($input['name'] ?? '');
        $url = trim($input['url'] ?? '');
        $genre = trim($input['genre'] ?? '');

        if (!$id || !$name || !$url) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid parameters.']);
            exit();
        }

        // Ensure we only edit a system station (type = 'default')
        $stmt = $pdo->prepare("UPDATE stations SET name = ?, url = ?, genre = ? WHERE id = ? AND type = 'default'");
        $stmt->execute([$name, $url, $genre, $id]);

        echo json_encode(['status' => 'success', 'message' => 'Station updated.']);
        exit();
    }

    if ($method === 'DELETE') {
        // Delete System Station
        $id = intval($input['id'] ?? 0);

        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid ID.']);
            exit();
        }

        // Favorites pointing to this station will CASCADE delete if the DB supports it, or become orphaned
        $stmt = $pdo->prepare("DELETE FROM stations WHERE id = ? AND type = 'default'");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'message' => 'Station deleted.']);
        exit();
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error.']);
}
?>
