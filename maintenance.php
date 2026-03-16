<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Under Maintenance - Radio Stream Player</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #111827;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: white;
            text-align: center;
        }
        .maintenance-container {
            padding: 40px;
            max-width: 500px;
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .icon {
            font-size: 64px;
            margin-bottom: 24px;
            display: inline-block;
            filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5));
        }
        h1 { margin-bottom: 20px; font-weight: 700; }
        p { opacity: 0.8; line-height: 1.6; margin-bottom: 30px; }
        .admin-link {
            font-size: 0.8em;
            opacity: 0.5;
            text-decoration: none;
            color: white;
            transition: opacity 0.2s;
        }
        .admin-link:hover { opacity: 1; }
    </style>
</head>
<body>
    <div class="maintenance-container">
        <div class="icon">⚙️</div>
        <h1>Under Maintenance</h1>
        <p>We're currently performing some scheduled maintenance to improve your listening experience. We'll be back shortly!</p>
        <a href="admin.php" class="admin-link">Admin Access</a>
    </div>
</body>
</html>
