<?php
/**
 * AJAX Admin Stats Endpoint
 * Returns high-level numbers for the dashboard.
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

try {
    $stats = [];

    // Total Users
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $stats['users'] = $stmt->fetchColumn();

    // Total System Stations (where type = 'default')
    $stmt = $pdo->query("SELECT COUNT(*) FROM stations WHERE type = 'default'");
    $stats['system_stations'] = $stmt->fetchColumn();

    // Total Favorites
    $stmt = $pdo->query("SELECT COUNT(*) FROM user_favorites");
    $stats['favorites'] = $stmt->fetchColumn();

    echo json_encode(['status' => 'success', 'data' => $stats]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error executing stats.']);
}
?>
