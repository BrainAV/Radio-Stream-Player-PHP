<?php
// Secure Database Configuration utilizing PDO (WP/cPanel Style)

// Try to parse .env file if it exists (for local dev)
function parseEnv($filePath)
{
    if (!file_exists($filePath)) {
        return;
    }
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0)
            continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}
parseEnv(__DIR__ . '/../.env');

// In cPanel, you might hardcode these, or use php-fpm environment variables.
// Defaulting to environment vars with local fallback.
$dbHost = $_ENV['DB_HOST'] ?? 'localhost';
$dbPort = $_ENV['DB_PORT'] ?? '3306';
$dbName = $_ENV['DB_NAME'] ?? 'jasonbra_radio';
$dbUser = $_ENV['DB_USER'] ?? 'jasonbra_radio';
$dbPass = $_ENV['DB_PASS'] ?? 'CHANGEME'; // Set to '' for local testing

function get_db_connection()
{
    global $dbHost, $dbPort, $dbName, $dbUser, $dbPass;

    $dsn = "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
        return $pdo;
    } catch (\PDOException $e) {
        // Return null or throw on failure
        return null;
    }
}
?>
