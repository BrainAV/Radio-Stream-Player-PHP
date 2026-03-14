<?php
session_start();
require_once __DIR__ . '/api/config.php';
require_once __DIR__ . '/api/session_check.php';

// The Master Gatekeeper
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: index.php");
    exit();
}

$userId = intval($_SESSION['user_id']);
$userRole = $_SESSION['user_role'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Radio Stream Player</title>
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="shortcut icon" href="favicon.png">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="admin.css">
    
    <!-- PWA / Mobile Theme -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#111827">
    <link rel="apple-touch-icon" href="favicon.png">
</head>
<body class="admin-body">
    <!-- Expose user context for admin.js -->
    <script>
        window.IS_LOGGED_IN = true;
        window.USER_ID = <?php echo $userId; ?>;
        window.USER_ROLE = '<?php echo $userRole; ?>';
    </script>
    
    <!-- Mobile Header -->
    <header class="admin-mobile-header glass-panel">
        <div class="admin-brand">
            <h2>Admin CP</h2>
        </div>
        <button id="sidebar-toggle" class="sidebar-toggle" aria-label="Toggle Menu">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
        </button>
    </header>

    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <div class="admin-layout">
        <!-- Sidebar Navigation -->
        <aside class="admin-sidebar glass-panel">
            <div class="admin-brand">
                <h2>Admin CP</h2>
            </div>
            <nav class="admin-nav">
                <button class="admin-nav-item active" data-target="dashboard-view">Dashboard</button>
                <button class="admin-nav-item" data-target="users-view">Users</button>
                <button class="admin-nav-item" data-target="stations-view">Stations</button>
                <button class="admin-nav-item" data-target="settings-view">Site Config</button>
                <a href="index.php" class="admin-nav-item return-btn">Back to Player</a>
            </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="admin-main">
            <!-- Dashboard View -->
            <section id="dashboard-view" class="admin-view active">
                <header class="admin-header">
                    <h1>System Overview</h1>
                </header>
                <div class="stats-grid">
                    <div class="stat-card glass-panel">
                        <h3>Total Users</h3>
                        <div class="stat-value" id="stat-total-users">--</div>
                    </div>
                    <div class="stat-card glass-panel">
                        <h3>System Stations</h3>
                        <div class="stat-value" id="stat-total-system-stations">--</div>
                    </div>
                    <div class="stat-card glass-panel">
                        <h3>Total Favorites</h3>
                        <div class="stat-value" id="stat-total-favorites">--</div>
                    </div>
                </div>
            </section>

            <!-- Users View -->
            <section id="users-view" class="admin-view" style="display: none;">
                <header class="admin-header">
                    <h1>User Management</h1>
                </header>
                <div class="glass-panel table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Display Name</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="users-tbody">
                            <!-- Populated via admin.js -->
                            <tr><td colspan="6" style="text-align:center;">Loading users...</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Stations View -->
            <section id="stations-view" class="admin-view" style="display: none;">
                <header class="admin-header" style="justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                    <h1>Station Management</h1>
                    <button id="add-station-open-btn" class="console-btn">Add System Station</button>
                </header>
                
                <!-- Add/Edit Station Form (Inline) -->
                <div id="station-form-wrapper" class="glass-panel" style="display: none; margin-bottom: 20px;">
                    <h3 id="station-form-title">Add System Station</h3>
                    <input type="hidden" id="admin-station-id">
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="text" id="admin-station-name" class="settings-input" placeholder="Station Name" style="flex: 1;" required>
                        <input type="text" id="admin-station-genre" class="settings-input" placeholder="Genre" style="flex: 1;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <input type="url" id="admin-station-url" class="settings-input" placeholder="Stream URL (https://...)" required>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="save-station-btn" class="console-btn">Save Station</button>
                        <button id="cancel-station-btn" class="console-btn" style="background-color: transparent; border: 1px solid var(--border-color); color: var(--text-color);">Cancel</button>
                    </div>
                    <div id="station-form-msg" style="margin-top: 10px; font-size: 0.9em; display: none;"></div>
                </div>

                <div class="glass-panel table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Genre</th>
                                <th>URL</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="stations-tbody">
                            <!-- Populated via admin.js -->
                            <tr><td colspan="5" style="text-align:center;">Loading stations...</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Site Settings View -->
            <section id="settings-view" class="admin-view" style="display: none;">
                <header class="admin-header">
                    <h1>Site Configuration</h1>
                </header>

                <!-- Analytics Section -->
                <div class="glass-panel" style="padding: 25px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 18px; font-size: 1em; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.6; color: white;">📊 Analytics</h3>
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label for="config-google-tag" style="display: block; margin-bottom: 6px; font-weight: 600; color: white;">Google Analytics Tag ID</label>
                        <input type="text" id="config-google-tag" class="settings-input" placeholder="e.g. G-T93274MPPZ">
                        <p style="margin: 6px 0 0; font-size: 0.82em; opacity: 0.55;">The measurement ID from your Google Analytics 4 property. Injected as a <code>gtag.js</code> script into every page's <code>&lt;head&gt;</code>.</p>
                    </div>
                </div>

                <!-- Advertising Section -->
                <div class="glass-panel" style="padding: 25px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 18px; font-size: 1em; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.6; color: white;">💰 Advertising</h3>
                    <div class="form-group" style="margin-bottom: 6px;">
                        <label for="config-adsense-id" style="display: block; margin-bottom: 6px; font-weight: 600; color: white;">AdSense Client ID</label>
                        <input type="text" id="config-adsense-id" class="settings-input" placeholder="e.g. ca-pub-0633259514526906">
                        <p style="margin: 6px 0 0; font-size: 0.82em; opacity: 0.55;">Your publisher ID from Google AdSense. When set, the AdSense library is injected into the page head and ad containers are revealed for non-admin, non-premium users. Admins and premium users never see ads.</p>
                    </div>
                </div>

                <!-- Advanced Section -->
                <div class="glass-panel" style="padding: 25px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 18px; font-size: 1em; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.6; color: white;">⚙️ Advanced</h3>
                    <div class="form-group" style="margin-bottom: 6px;">
                        <label for="config-custom-head" style="display: block; margin-bottom: 6px; font-weight: 600; color: white;">Custom Head Code</label>
                        <textarea id="config-custom-head" class="settings-input" style="height: 130px; font-family: monospace; font-size: 13px;" placeholder="<!-- Paste supplemental tracking scripts, meta tags, or verification tags here -->"></textarea>
                        <p style="margin: 6px 0 0; font-size: 0.82em; opacity: 0.55;">Raw HTML injected into <code>&lt;head&gt;</code> on every page. Use for third-party pixels, Search Console verification tags, or custom stylesheets.</p>
                    </div>
                </div>

                <div id="settings-msg" style="margin-bottom: 16px; font-size: 0.9em; display: none; padding: 10px 14px; border-radius: 6px;"></div>
                <div class="settings-action-row" style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                    <button id="save-settings-btn" class="console-btn" style="padding: 12px 28px; min-width: 200px;">Save Configuration</button>
                    <span style="font-size: 0.82em; opacity: 0.5;">Changes take effect on the next page load.</span>
                </div>
            </section>
        </main>
    </div>

    <!-- Edit User Modal -->
    <div id="edit-user-modal" class="settings-modal" style="display: none;">
        <div class="settings-content" style="max-width: 400px; background: rgba(20, 20, 20, 0.95);">
            <div class="settings-header">
                <h3>Edit User Role</h3>
                <button id="close-edit-user-btn" class="close-btn">&times;</button>
            </div>
            <div class="settings-body" style="padding: 20px; color: white;">
                <input type="hidden" id="edit-user-id">
                <p style="margin-bottom: 10px;">Editing user: <strong id="edit-user-display" style="color: var(--primary-color);"></strong></p>
                
                <div class="form-group" style="margin-top: 15px; margin-bottom: 20px;">
                    <select id="edit-user-role" class="settings-input">
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="edit-user-premium" style="width: 18px; height: 18px; cursor: pointer;">
                    <label for="edit-user-premium" style="font-size: 0.9em; cursor: pointer; color: #eee;">Premium User (Ad-Free)</label>
                </div>
                
                <div id="edit-user-msg" style="margin-bottom: 15px; font-size: 0.9em; display: none; padding: 10px; border-radius: 4px;"></div>
                <button id="save-user-role-btn" class="console-btn" style="width: 100%; padding: 10px;">Save Changes</button>
            </div>
        </div>
    </div>

    <script src="admin.js"></script>
</body>
</html>
