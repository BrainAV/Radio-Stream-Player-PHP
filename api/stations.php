<?php
/**
 * Stations API Endpoint
 * Handles GET (fetch) and POST (create) requests for Radio Stations.
 */

// Include config (which sets up get_db_connection)
require_once __DIR__ . '/config.php';

// Always return JSON
header('Content-Type: application/json; charset=utf-8');

// Basic API Security / CORS (Adjust origin for production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$pdo = get_db_connection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit();
}

// ---------------------------------------------------------
// GET REQUEST: Fetch Stations
// ---------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = isset($_GET['type']) ? $_GET['type'] : 'default';

    try {
        // Prepare statement to select stations safely
        $stmt = $pdo->prepare("SELECT id, name, url, genre, country, bitrate, type FROM stations WHERE type = :type ORDER BY id ASC");
        $stmt->bindParam(':type', $type, PDO::PARAM_STR);
        $stmt->execute();
        
        $stations = $stmt->fetchAll();
        
        echo json_encode([
            'status' => 'success',
            'data' => $stations
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Query failed.']);
    }
    exit();
}

// If not GET
http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
exit();
?>
