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
        $stmt = $pdo->prepare("SELECT id, name, url, genre, country, type FROM stations WHERE type = :type ORDER BY id ASC");
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

// ---------------------------------------------------------
// POST REQUEST: Add Custom Station
// ---------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read raw JSON body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON payload.']);
        exit();
    }

    // Sanitize input
    $name = filter_var($data['name'] ?? '', FILTER_SANITIZE_STRING);
    $url = filter_var($data['url'] ?? '', FILTER_SANITIZE_URL);
    $genre = filter_var($data['genre'] ?? 'Unknown', FILTER_SANITIZE_STRING);
    $country = filter_var($data['country'] ?? 'Unknown', FILTER_SANITIZE_STRING);

    // Validate absolute minimums
    if (empty($name) || empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Valid Name and URL are required.']);
        exit();
    }

    try {
        // Insert as 'custom' allowing community directory expansion
        $stmt = $pdo->prepare("INSERT INTO stations (name, url, genre, country, type) VALUES (:name, :url, :genre, :country, 'custom')");
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':url', $url);
        $stmt->bindParam(':genre', $genre);
        $stmt->bindParam(':country', $country);
        
        $stmt->execute();

        echo json_encode([
            'status' => 'success',
            'message' => 'Station scheduled for community directory.',
            'id' => $pdo->lastInsertId()
        ]);
    } catch (PDOException $e) {
        // Error code 23000 is integrity constraint violation (Duplicate URLs)
        if ($e->getCode() == 23000) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'Station URL already exists in database.']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error during insert.']);
        }
    }
    exit();
}

// If not GET or POST
http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
exit();
?>
