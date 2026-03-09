<PERSONA_FILE>
.gemini/PERSONA.md
</PERSONA_FILE>
<PROJECT_INFO>
**Name**: Radio Stream Player (PHP Edition)
**Description**: A full-stack, cPanel-compatible radio stream player built with PHP, MySQL, and vanilla JavaScript.
**Live URL**: http://radio.djay.ca/ (Production deployment targeted for cPanel/PHP)
**Goal**: To provide a standalone, user-aware radio experience with persistent cloud-based favorites and station management.
</PROJECT_INFO>
<TECH_STACK>
Refer to `DEVELOPER_GUIDE.md` for architecture details.
- **Backend**: PHP 7.4+ (cPanel/Shared Hosting compatible)
- **Database**: MySQL/MariaDB (PDO for security)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+ Modules)
- **Core APIs**: Web Audio API
- **Cloud Dependency**: Currently relies on `api.djay.ca` (Cloudflare) for metadata/proxy (Targeted for PHP porting).
</TECH_STACK>
<CODING_CONVENTIONS>
- **PHP Layer**: Use `api/config.php` for DB connections. Keep endpoints RESTful where possible.
- **Frontend-Backend Sync**: Use `api.js` to bridge the Gap. The player should handle both `localStorage` (Guest) and PHP API (User) seamlessly.
- **Architecture**: Maintain strict separation of concerns:
    - `player.js`: Core audio and UI control logic.
    - `visualizer.js`: Web Audio API and canvas/DOM drawing logic.
    - `state.js`: Pub/Sub StateManager.
- **Documentation**:
    - Update `ROADMAP.md` with new feature ideas.
    - Update `CHANGELOG.md` after implementing features or fixes.
- **Workflow**:
    - Check `ROADMAP.md` for the current goals.
    - Use `.gemini/GEMINI.md` for specific task prompts.
</CODING_CONVENTIONS>
<ROADMAP>
Refer to `ROADMAP.md` for the active project roadmap, including the hybrid storage migration and future PHP-based proxy/metadata goals.
</ROADMAP>
