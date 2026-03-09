<?php
/**
 * Favorites API Endpoint
 * Handles User-specific favorites and custom station linking.
 */

session_start();
require_once __DIR__ . '/config.php';

// Always return JSON
header('Content-Type: application/json; charset=utf-8');

// Basic API Security / CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Please log in.']);
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
// GET REQUEST: Fetch User Favorites
// ---------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT s.id, s.name, s.url, s.genre, s.country, s.type 
            FROM stations s
            JOIN user_favorites uf ON s.id = uf.station_id
            WHERE uf.user_id = :user_id
            ORDER BY uf.created_at DESC
        ");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        $favorites = $stmt->fetchAll();
        
        echo json_encode([
            'status' => 'success',
            'data' => $favorites
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Query failed.']);
    }
    exit();
}

// ---------------------------------------------------------
// POST REQUEST: Add/Link Favorite or Custom Station
// ---------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['url'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing station URL.']);
        exit();
    }

    $url = filter_var($data['url'], FILTER_SANITIZE_URL);
    $name = filter_var($data['name'] ?? 'Unknown Station', FILTER_SANITIZE_STRING);
    $genre = filter_var($data['genre'] ?? 'Unknown', FILTER_SANITIZE_STRING);
    $country = filter_var($data['country'] ?? 'Unknown', FILTER_SANITIZE_STRING);

    try {
        $pdo->beginTransaction();

        // 1. Check if station exists in global database
        $stmt = $pdo->prepare("SELECT id FROM stations WHERE url = ?");
        $stmt->execute([$url]);
        $station = $stmt->fetch();

        if ($station) {
            $station_id = $station['id'];
        } else {
            // 2. Insert as new custom station if not found
            $stmt = $pdo->prepare("INSERT INTO stations (name, url, genre, country, type) VALUES (?, ?, ?, ?, 'custom')");
            $stmt->execute([$name, $url, $genre, $country]);
            $station_id = $pdo->lastInsertId();
        }

        // 3. Link to user favorites (using INSERT IGNORE or ON DUPLICATE)
        $stmt = $pdo->prepare("INSERT IGNORE INTO user_favorites (user_id, station_id) VALUES (?, ?)");
        $stmt->execute([$user_id, $station_id]);

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'Station successfully added to your favorites.',
            'station_id' => $station_id
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

// ---------------------------------------------------------
// DELETE REQUEST: Remove Favorite
// ---------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['url'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing station URL.']);
        exit();
    }

    $url = filter_var($data['url'], FILTER_SANITIZE_URL);

    try {
        // Find station ID first
        $stmt = $pdo->prepare("SELECT id FROM stations WHERE url = ?");
        $stmt->execute([$url]);
        $station = $stmt->fetch();

        if ($station) {
            $stmt = $pdo->prepare("DELETE FROM user_favorites WHERE user_id = ? AND station_id = ?");
            $stmt->execute([$user_id, $station['id']]);
            
            echo json_encode(['status' => 'success', 'message' => 'Favorite removed.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Station not found.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error.']);
    }
    exit();
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
exit();
