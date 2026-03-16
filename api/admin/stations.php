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
        // List Stations with favorite counts (popularity)
        $stmt = $pdo->query("
            SELECT s.id, s.name, s.url, s.genre, s.type, COUNT(uf.id) as favorite_count 
            FROM stations s
            LEFT JOIN user_favorites uf ON s.id = uf.station_id
            GROUP BY s.id
            ORDER BY favorite_count DESC, s.name ASC
        ");
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
        // Edit Station (Admin can edit any station)
        $id = intval($input['id'] ?? 0);
        $name = trim($input['name'] ?? '');
        $url = trim($input['url'] ?? '');
        $genre = trim($input['genre'] ?? '');

        if (!$id || !$name || !$url) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid parameters.']);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE stations SET name = ?, url = ?, genre = ? WHERE id = ?");
        $stmt->execute([$name, $url, $genre, $id]);

        echo json_encode(['status' => 'success', 'message' => 'Station updated.']);
        exit();
    }

    if ($method === 'PATCH') {
        // Promote Station to System ('default')
        $id = intval($input['id'] ?? 0);
        $new_type = $input['type'] ?? 'default';

        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid ID.']);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE stations SET type = ? WHERE id = ?");
        $stmt->execute([$new_type, $id]);

        echo json_encode(['status' => 'success', 'message' => "Station type updated to $new_type."]);
        exit();
    }

    if ($method === 'DELETE') {
        // Delete Station
        $id = intval($input['id'] ?? 0);

        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid ID.']);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM stations WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'message' => 'Station deleted.']);
        exit();
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error.']);
}
?>
