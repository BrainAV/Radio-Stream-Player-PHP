<?php
/**
 * Import Favorites API
 * Migrates localStorage guest favorites/custom stations to the DB after login.
 */

session_start();
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit();
}

$user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['status' => 'success', 'message' => 'No data to import.']);
    exit();
}

$customStations = $input['customStations'] ?? [];
$favoriteUrls = $input['favoriteStations'] ?? []; // Array of URLs

$pdo = get_db_connection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Process Custom Stations from Guest localStorage
    foreach ($customStations as $station) {
        $url = filter_var($station['url'], FILTER_SANITIZE_URL);
        $name = filter_var($station['name'] ?? 'Imported Station', FILTER_SANITIZE_STRING);
        $genre = filter_var($station['genre'] ?? 'Radio', FILTER_SANITIZE_STRING);
        $bitrate = filter_var($station['bitrate'] ?? null, FILTER_VALIDATE_INT);

        if (empty($url)) continue;

        // Check if station already exists in global table
        $stmt = $pdo->prepare("SELECT id FROM stations WHERE url = ?");
        $stmt->execute([$url]);
        $existing = $stmt->fetch();

        if ($existing) {
            $station_id = $existing['id'];
        } else {
            // Insert new custom station
            $stmt = $pdo->prepare("INSERT INTO stations (name, url, genre, type, bitrate) VALUES (?, ?, ?, 'custom', ?)");
            $stmt->execute([$name, $url, $genre, $bitrate]);
            $station_id = $pdo->lastInsertId();
        }

        // Link to user's favorites
        // Guest custom stations are implicitly "favorites" in their view
        $is_fav = in_array($url, $favoriteUrls) ? 1 : 1; 

        $stmt = $pdo->prepare("INSERT INTO user_favorites (user_id, station_id, is_favorite) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE is_favorite = VALUES(is_favorite)");
        $stmt->execute([$user_id, $station_id, $is_fav]);
    }

    // 2. Process Favorite Default Stations
    foreach ($favoriteUrls as $url) {
        $url = filter_var($url, FILTER_SANITIZE_URL);
        if (empty($url)) continue;

        // We only care about default stations here, as custom ones were handled above
        // But the check is the same: find by URL
        $stmt = $pdo->prepare("SELECT id FROM stations WHERE url = ?");
        $stmt->execute([$url]);
        $station = $stmt->fetch();

        if ($station) {
            $stmt = $pdo->prepare("INSERT INTO user_favorites (user_id, station_id, is_favorite) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE is_favorite = 1");
            $stmt->execute([$user_id, $station['id']]);
        }
    }

    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Your local favorites have been successfully synced to your account.'
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Import failed: ' . $e->getMessage()]);
}
