<?php
/**
 * api/settings.php - Public Settings Endpoint
 * Returns non-sensitive configuration values.
 */

require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = get_db_connection();
    if (!$pdo) {
        throw new Exception("Database connection failed.");
    }

    // List of keys deemed safe for public consumption
    $public_keys = [
        'social_github',
        'social_twitter',
        'social_facebook',
        'social_instagram',
        'social_support',
        'maintenance_mode'
    ];

    $placeholders = implode(',', array_fill(0, count($public_keys), '?'));
    $stmt = $pdo->prepare("SELECT config_key, config_value FROM site_config WHERE config_key IN ($placeholders)");
    $stmt->execute($public_keys);
    
    $config = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    echo json_encode([
        'status' => 'success',
        'data' => $config
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
