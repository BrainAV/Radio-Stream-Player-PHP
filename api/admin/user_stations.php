<?php
/**
 * AJAX Admin User Stations Endpoint
 * Fetches favorites and custom stations for a specific user ID.
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

$pdo = get_db_connection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit();
}

$user_id = intval($_GET['id'] ?? 0);

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid User ID.']);
    exit();
}

try {
    // Fetch favorites for this specific user
    $stmt = $pdo->prepare("
        SELECT s.id, s.name, s.url, s.genre, s.type, uf.created_at as favorited_at
        FROM stations s
        JOIN user_favorites uf ON s.id = uf.station_id
        WHERE uf.user_id = ?
        ORDER BY uf.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $favorites = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => [
            'favorites' => $favorites
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error while fetching user stations.']);
}
?>
