<?php
/**
 * admin/settings.php - Manage Site Configuration (Webmaster Settings)
 */

session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

// Check Admin role
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = get_db_connection();
    if (!$pdo) {
        throw new Exception("Database connection failed.");
    }

    if ($method === 'GET') {
        // Fetch all config
        $stmt = $pdo->query("SELECT config_key, config_value FROM site_config");
        $config = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo json_encode(['status' => 'success', 'data' => $config]);
        exit;
    }

    if ($method === 'POST' || $method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['settings']) || !is_array($input['settings'])) {
            throw new Exception("Invalid input format.");
        }

        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO site_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)");
        
        foreach ($input['settings'] as $key => $value) {
            $stmt->execute([$key, $value]);
        }
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Site configuration updated.']);
        exit;
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}
