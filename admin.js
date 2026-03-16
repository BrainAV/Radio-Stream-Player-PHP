/**
 * admin.js - Frontend Logic for the Admin Control Panel
 */

document.addEventListener('DOMContentLoaded', () => {
    // Basic navigation
    const navItems = document.querySelectorAll('.admin-nav-item[data-target]');
    const views = document.querySelectorAll('.admin-view');
    let cachedStations = []; // Cache for filtering stations
    let cachedUsers = [];    // Cache for filtering users

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch view
            const targetId = item.getAttribute('data-target');
            views.forEach(view => {
                if (view.id === targetId) {
                    view.style.display = 'block';
                } else {
                    view.style.display = 'none';
                }
            });

            // Refresh data based on view
            if (targetId === 'dashboard-view') loadStats();
            if (targetId === 'users-view') loadUsers();
            if (targetId === 'stations-view') loadStations();
            if (targetId === 'settings-view') loadSettings();

            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 768) {
                document.querySelector('.admin-sidebar').classList.remove('open');
                document.getElementById('sidebar-overlay').classList.remove('active');
            }
        });
    });

    // Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const adminSidebar = document.querySelector('.admin-sidebar');

    if (sidebarToggle && sidebarOverlay && adminSidebar) {
        sidebarToggle.addEventListener('click', () => {
            adminSidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
        });

        sidebarOverlay.addEventListener('click', () => {
            adminSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Helper to format dates
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function getRoleBadge(role) {
        return `<span class="badge badge-${role.toLowerCase()}">${role}</span>`;
    }

    function getPremiumBadge(isPremium) {
        if (!isPremium || isPremium == 0) return '';
        return `<span class="badge" style="background: linear-gradient(135.41deg, #FFD700 0%, #FFA500 100%); color: #000; font-weight: bold; margin-left: 5px;">PREMIUM</span>`;
    }

    // --- Dashboard Load ---
    async function loadStats() {
        try {
            const res = await fetch('api/admin/stats.php');
            const data = await res.json();
            if (data.status === 'success') {
                document.getElementById('stat-total-users').textContent = data.data.users || 0;
                document.getElementById('stat-total-system-stations').textContent = data.data.system_stations || 0;
                document.getElementById('stat-total-favorites').textContent = data.data.favorites || 0;
            }
        } catch (e) {
            console.error('Failed to load stats', e);
        }
    }

    async function loadUsers() {
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading users...</td></tr>';
        
        try {
            const res = await fetch('api/admin/users.php');
            const data = await res.json();
            
            if (data.status === 'success') {
                cachedUsers = data.data;
                applyUserFilter();
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ef4444;">Error: ${data.message}</td></tr>`;
            }
        } catch (e) {
             tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">Network Error.</td></tr>';
        }
    }

    function renderUsersTable(usersToRender) {
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';
        
        if (usersToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found matching this search.</td></tr>';
            return;
        }

        usersToRender.forEach(user => {
            const tr = document.createElement('tr');
            const isProtected = (user.id == 1 || user.id == window.USER_ID);
            
            tr.innerHTML = `
                <td data-label="ID">${user.id}</td>
                <td data-label="Email">${user.user_email}</td>
                <td data-label="Display Name">${user.display_name}</td>
                <td data-label="Role">${getRoleBadge(user.role)}${getPremiumBadge(user.is_premium)}</td>
                <td data-label="Joined">${formatDate(user.created_at)}</td>
                <td data-label="Actions" style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="console-btn btn-small view-user-stations-btn" data-id="${user.id}" data-name="${user.display_name}">Stations</button>
                    <button class="console-btn btn-small edit-user-btn" data-id="${user.id}" data-role="${user.role}" data-email="${user.user_email}" data-premium="${user.is_premium}">Edit</button>
                    ${!isProtected ? `<button class="console-btn btn-small btn-danger delete-user-btn" data-id="${user.id}" data-email="${user.user_email}">Delete</button>` : `<span style="font-size: 0.8em; opacity: 0.5; padding: 4px;">Protected</span>`}
                </td>
            `;
            tbody.appendChild(tr);
        });

        bindUserActionButtons();
    }

    function applyUserFilter() {
        const searchTerm = document.getElementById('user-search-input').value.toLowerCase();
        const filtered = cachedUsers.filter(user => 
            user.user_email.toLowerCase().includes(searchTerm) || 
            user.display_name.toLowerCase().includes(searchTerm)
        );
        renderUsersTable(filtered);
    }

    function bindUserActionButtons() {
        const editBtns = document.querySelectorAll('.edit-user-btn');
        const deleteBtns = document.querySelectorAll('.delete-user-btn');
        const viewStationsBtns = document.querySelectorAll('.view-user-stations-btn');

        // Edit Modal
        const editModal = document.getElementById('edit-user-modal');
        const closeEditBtn = document.getElementById('close-edit-user-btn');
        const saveEditBtn = document.getElementById('save-user-role-btn');
        const editIdInput = document.getElementById('edit-user-id');
        const editRoleInput = document.getElementById('edit-user-role');
        const editPremiumInput = document.getElementById('edit-user-premium');
        const editDisplay = document.getElementById('edit-user-display');
        const editMsg = document.getElementById('edit-user-msg');

        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const role = e.target.getAttribute('data-role');
                const email = e.target.getAttribute('data-email');
                const isPremium = e.target.getAttribute('data-premium') == 1;
                
                editIdInput.value = id;
                editRoleInput.value = role;
                editPremiumInput.checked = isPremium;
                editDisplay.textContent = email;
                editMsg.style.display = 'none';

                // Prevent changing role of ID 1
                if (id == 1) {
                    editRoleInput.disabled = true;
                    saveEditBtn.disabled = true;
                    editMsg.textContent = "Cannot edit the role of the primary administrator.";
                    editMsg.style.display = 'block';
                    editMsg.style.color = '#ef4444';
                } else {
                    editRoleInput.disabled = false;
                    saveEditBtn.disabled = false;
                }

                editModal.style.display = 'flex';
            });
        });

        if (closeEditBtn) {
            closeEditBtn.addEventListener('click', () => editModal.style.display = 'none');
        }

        // Save Role
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', async () => {
                const userId = editIdInput.value;
                const newRole = editRoleInput.value;
                const isPremium = editPremiumInput.checked ? 1 : 0;

                saveEditBtn.disabled = true;
                saveEditBtn.textContent = 'Saving...';
                
                try {
                    const res = await fetch('api/admin/users.php', {
                         method: 'PUT',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ id: userId, role: newRole, is_premium: isPremium })
                    });
                    const data = await res.json();
                    
                    if (data.status === 'success') {
                        editModal.style.display = 'none';
                        loadUsers(); // Refresh
                    } else {
                        editMsg.textContent = data.message;
                        editMsg.style.display = 'block';
                        editMsg.style.color = '#ef4444';
                    }
                } catch (e) {
                    editMsg.textContent = 'Network error.';
                    editMsg.style.display = 'block';
                    editMsg.style.color = '#ef4444';
                } finally {
                    saveEditBtn.disabled = false;
                    saveEditBtn.textContent = 'Save Changes';
                }
            });
        }

        // Delete User
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const email = e.target.getAttribute('data-email');
                
                if (!confirm(`Are you sure you want to PERMANENTLY delete user ${email}? This will also delete their favorites.`)) {
                    return;
                }

                try {
                    const res = await fetch('api/admin/users.php', {
                         method: 'DELETE',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ id: id })
                    });
                    const data = await res.json();
                    
                    if (data.status === 'success') {
                        loadUsers(); // Refresh
                        loadStats();
                    } else {
                        alert(data.message || 'Error deleting user.');
                    }
                } catch (e) {
                    alert('Network error while deleting user.');
                }
            });
        });

        // View User Stations Modal logic
        const userStationsModal = document.getElementById('user-stations-modal');
        const closeUserStationsBtn = document.getElementById('close-user-stations-btn');
        const userStationsDisplay = document.getElementById('user-stations-display');
        const userStationsTbody = document.getElementById('user-stations-tbody');

        viewStationsBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                
                userStationsDisplay.textContent = name;
                userStationsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading collection...</td></tr>';
                userStationsModal.style.display = 'flex';

                try {
                    const res = await fetch(`api/admin/user_stations.php?id=${id}`);
                    const data = await res.json();
                    
                    if (data.status === 'success') {
                        userStationsTbody.innerHTML = '';
                        if (data.data.favorites.length === 0) {
                            userStationsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">User has no saved stations.</td></tr>';
                            return;
                        }

                        data.data.favorites.forEach(station => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td data-label="Station">${station.name}</td>
                                <td data-label="Genre">${station.genre || '-'}</td>
                                <td data-label="Type"><span class="badge ${station.type}">${station.type}</span></td>
                                <td data-label="Actions">
                                    <button class="console-btn btn-small" onclick="window.open('${station.url}', '_blank')">Test</button>
                                </td>
                            `;
                            userStationsTbody.appendChild(tr);
                        });
                    }
                } catch (e) {
                    userStationsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">Error loading collection.</td></tr>';
                }
            });
        });

        if (closeUserStationsBtn) {
            closeUserStationsBtn.addEventListener('click', () => userStationsModal.style.display = 'none');
        }
        if (userStationsModal) {
            userStationsModal.addEventListener('click', (e) => {
                if (e.target === userStationsModal) userStationsModal.style.display = 'none';
            });
        }
    }

    // Bind Search/Filter Listeners
    const userSearchInput = document.getElementById('user-search-input');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', applyUserFilter);
    }

    // --- Station Rendering Engine ---
    function renderStationsTable(stationsToRender) {
        const tbody = document.getElementById('stations-tbody');
        tbody.innerHTML = '';
        
        if (stationsToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No stations found matching this filter.</td></tr>';
            return;
        }

        /**
         * Advanced Normalization for duplicate detection
         * Strips trailing slashes and semicolons (SHOUTcast artifacts)
         */
        const normalizeUrl = (u) => u.toLowerCase().trim().replace(/[\/;]+$/, '');
        const normalizeName = (n) => n.toLowerCase().trim();

        // Populate counts based on FULL cached list for global context
        const urlCounts = {};
        const nameCounts = {};
        
        cachedStations.forEach(s => {
            const normUrl = normalizeUrl(s.url);
            const normName = normalizeName(s.name);
            urlCounts[normUrl] = (urlCounts[normUrl] || 0) + 1;
            nameCounts[normName] = (nameCounts[normName] || 0) + 1;
        });

        stationsToRender.forEach(station => {
            const tr = document.createElement('tr');
            const isCustom = station.type === 'custom';
            const popularity = station.favorite_count || 0;
            
            const normUrl = normalizeUrl(station.url);
            const normName = normalizeName(station.name);
            
            const hasUrlDuplicate = urlCounts[normUrl] > 1;
            const hasNameConflict = nameCounts[normName] > 1;

            let badgeHtml = '';
            if (hasUrlDuplicate) {
                badgeHtml += '<span class="badge" title="Exact stream match (normalized)" style="background:rgba(239, 68, 68, 0.2); color:#ef4444; font-size:0.75em; margin-left:5px; border:1px solid rgba(239,68,68,0.3);">Duplicate URL</span>';
            } else if (hasNameConflict) {
                // Only show Name Conflict if it's NOT already an exact URL duplicate
                badgeHtml += '<span class="badge" title="Multiple streams sharing this name (potential mirrors)" style="background:rgba(245, 158, 11, 0.2); color:#f59e0b; font-size:0.75em; margin-left:5px; border:1px solid rgba(245,158,11,0.3);">Mirror?</span>';
            }
            
            tr.innerHTML = `
                <td data-label="ID">${station.id}</td>
                <td data-label="Name">
                    <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
                        <span>${station.name}</span>
                        ${badgeHtml}
                    </div>
                </td>
                <td data-label="Genre">${station.genre || '-'}</td>
                <td data-label="Type"><span class="badge ${station.type}">${station.type}</span></td>
                <td data-label="Popularity" style="text-align:center;" id="pop-col-${station.id}">
                    <span class="badge popularity-badge" style="background: ${popularity > 0 ? 'rgba(79, 70, 229, 0.4)' : 'rgba(255,255,255,0.1)'}">
                        ${popularity} ❤️
                    </span>
                </td>
                <td data-label="Actions" style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="console-btn btn-small check-health-single" data-url="${station.url}" data-id="${station.id}">Scan</button>
                    <button class="console-btn btn-small edit-station-btn" data-id="${station.id}" data-name="${station.name}" data-genre="${station.genre || ''}" data-url="${station.url}">Edit</button>
                    ${isCustom ? `<button class="console-btn btn-small btn-promote promote-station-btn" data-id="${station.id}" data-name="${station.name}">Promote</button>` : ''}
                    <button class="console-btn btn-small btn-danger delete-station-btn" data-id="${station.id}" data-name="${station.name}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        bindStationActionButtons();
    }

    // --- Stations Load ---
    async function loadStations() {
        const tbody = document.getElementById('stations-tbody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading stations...</td></tr>';
        
        try {
            const res = await fetch('api/admin/stations.php');
            const data = await res.json();
            
            if (data.status === 'success') {
                cachedStations = data.data; // Cache the full list
                applyStationFilter(); // Render based on current filter
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ef4444;">Error: ${data.message}</td></tr>`;
            }
        } catch (e) {
             tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">Network Error.</td></tr>';
        }
    }

    function applyStationFilter() {
        const filterValue = document.getElementById('station-type-filter').value;
        const searchTerm = document.getElementById('station-search-input').value.toLowerCase();
        
        let filtered = cachedStations;
        
        // Apply Type Filter
        if (filterValue !== 'all') {
            filtered = filtered.filter(s => s.type === filterValue);
        }
        
        // Apply Search Term
        if (searchTerm) {
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(searchTerm) || 
                s.genre.toLowerCase().includes(searchTerm) || 
                s.url.toLowerCase().includes(searchTerm)
            );
        }
        
        renderStationsTable(filtered);
    }

    // Bind Filter Listeners
    const stationFilter = document.getElementById('station-type-filter');
    const stationSearchInput = document.getElementById('station-search-input');
    const checkAllBtn = document.getElementById('check-health-btn');

    if (stationFilter) stationFilter.addEventListener('change', applyStationFilter);
    if (stationSearchInput) stationSearchInput.addEventListener('input', applyStationFilter);
    
    if (checkAllBtn) {
        checkAllBtn.addEventListener('click', async () => {
             const scanBtns = document.querySelectorAll('.check-health-single');
             if (scanBtns.length === 0) return;
             
             if (!confirm(`This will scan all ${scanBtns.length} visible stations. Proceed?`)) return;
             
             checkAllBtn.disabled = true;
             checkAllBtn.textContent = 'Scanning...';
             
             for (const btn of scanBtns) {
                 btn.click(); // Trigger individual check
                 await new Promise(r => setTimeout(r, 200)); // Rate limit 5/sec
             }
             
             checkAllBtn.disabled = false;
             checkAllBtn.textContent = 'Scan Stream Health';
        });
    }

    // --- Station Add/Edit Form Logic ---
    const addStationOpenBtn = document.getElementById('add-station-open-btn');
    const stationFormWrapper = document.getElementById('station-form-wrapper');
    const stationFormTitle = document.getElementById('station-form-title');
    const stationFormId = document.getElementById('admin-station-id');
    const stationFormName = document.getElementById('admin-station-name');
    const stationFormGenre = document.getElementById('admin-station-genre');
    const stationFormUrl = document.getElementById('admin-station-url');
    const saveStationBtn = document.getElementById('save-station-btn');
    const cancelStationBtn = document.getElementById('cancel-station-btn');
    const stationMsg = document.getElementById('station-form-msg');

    if (addStationOpenBtn) {
        addStationOpenBtn.addEventListener('click', () => {
             stationFormId.value = '';
             stationFormName.value = '';
             stationFormGenre.value = '';
             stationFormUrl.value = '';
             stationFormTitle.textContent = 'Add System Station';
             stationMsg.style.display = 'none';
             stationFormWrapper.style.display = 'block';
        });
    }

    if (cancelStationBtn) {
         cancelStationBtn.addEventListener('click', () => {
             stationFormWrapper.style.display = 'none';
         });
    }

    if (saveStationBtn) {
         saveStationBtn.addEventListener('click', async () => {
             const id = stationFormId.value; // Empty means POST, filled means PUT
             const name = stationFormName.value.trim();
             const genre = stationFormGenre.value.trim();
             const url = stationFormUrl.value.trim();

             if (!name || !url) {
                 showStationMsg('Name and URL are required.', 'error');
                 return;
             }

             const payload = { name, genre, url };
             if (id) payload.id = id;

             const method = id ? 'PUT' : 'POST';

             saveStationBtn.disabled = true;
             saveStationBtn.textContent = 'Saving...';
             stationMsg.style.display = 'none';

             try {
                const res = await fetch('api/admin/stations.php', {
                     method: method,
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(payload)
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    stationFormWrapper.style.display = 'none';
                    loadStations();
                    loadStats();
                } else {
                    showStationMsg(data.message, 'error');
                }
            } catch (e) {
                showStationMsg('Network error.', 'error');
            } finally {
                saveStationBtn.disabled = false;
                saveStationBtn.textContent = 'Save Station';
            }
         });
    }

    function showStationMsg(msg, type) {
        stationMsg.textContent = msg;
        stationMsg.style.display = 'block';
        stationMsg.style.color = type === 'error' ? '#ef4444' : '#34d399';
    }

    function bindStationActionButtons() {
        const editBtns = document.querySelectorAll('.edit-station-btn');
        const deleteBtns = document.querySelectorAll('.delete-station-btn');
        const promoteBtns = document.querySelectorAll('.promote-station-btn');
        const healthBtns = document.querySelectorAll('.check-health-single');

        // Health Scan Single
        healthBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const b = e.target;
                const url = b.getAttribute('data-url');
                const id = b.getAttribute('data-id');
                const popCol = document.getElementById(`pop-col-${id}`);
                
                b.textContent = '...';
                b.disabled = true;

                try {
                    const res = await fetch(`api/admin/health_check.php?url=${encodeURIComponent(url)}`);
                    const data = await res.json();
                    
                    if (data.status === 'success') {
                        if (data.is_alive) {
                            b.textContent = 'OK';
                            b.style.color = '#34d399';
                        } else {
                            b.textContent = 'DEAD';
                            b.style.color = '#ef4444';
                            // Add warning to name cell area or stats
                        }
                    } else {
                        b.textContent = 'FAIL';
                    }
                } catch (e) {
                    b.textContent = 'ERR';
                }
            });
        });

        // Edit
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const b = e.target;
                stationFormId.value = b.getAttribute('data-id');
                stationFormName.value = b.getAttribute('data-name');
                stationFormGenre.value = b.getAttribute('data-genre');
                stationFormUrl.value = b.getAttribute('data-url');
                
                stationFormTitle.textContent = 'Edit System Station';
                stationMsg.style.display = 'none';
                stationFormWrapper.style.display = 'block';
                
                // scroll to top where form is
                document.querySelector('.admin-main').scrollTo(0, 0);
            });
        });

        // Delete
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                
                if (!confirm(`Are you sure you want to delete station "${name}"?`)) {
                    return;
                }

                try {
                    const res = await fetch('api/admin/stations.php', {
                         method: 'DELETE',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ id: id })
                    });
                    const data = await res.json();
                    
                    if (data.status === 'success') {
                        loadStations(); // Refresh
                        loadStats();
                    } else {
                        alert(data.message || 'Error deleting station.');
                    }
                } catch (e) {
                    alert('Network error while deleting station.');
                }
            });
        });

        // Promote Station
        promoteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');

                if (!confirm(`Are you sure you want to promote "${name}" to a System Station? It will become visible to all users.`)) {
                    return;
                }

                try {
                    const res = await fetch('api/admin/stations.php', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: id, type: 'default' })
                    });
                    const data = await res.json();
                    if (data.status === 'success') {
                        loadStations();
                    } else {
                        alert(data.message || 'Promotion failed.');
                    }
                } catch (e) {
                    alert('Network error during promotion.');
                }
            });
        });
    }

    // --- Site Configuration ---
    const configGoogleTag = document.getElementById('config-google-tag');
    const configAdSenseId = document.getElementById('config-adsense-id');
    const configCustomHead = document.getElementById('config-custom-head');
    
    const configSocialGithub = document.getElementById('config-social-github');
    const configSocialTwitter = document.getElementById('config-social-twitter');
    const configSocialFacebook = document.getElementById('config-social-facebook');
    const configSocialInstagram = document.getElementById('config-social-instagram');
    const configSocialSupport = document.getElementById('config-social-support');
    const configMaintenanceMode = document.getElementById('config-maintenance-mode');

    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const settingsMsg = document.getElementById('settings-msg');

    async function loadSettings() {
        if (!configGoogleTag) return;
        try {
            const res = await fetch('api/admin/settings.php');
            const data = await res.json();
            if (data.status === 'success') {
                configGoogleTag.value = data.data.google_tag_id || '';
                configAdSenseId.value = data.data.adsense_id || '';
                configCustomHead.value = data.data.custom_head_code || '';
                
                if (configSocialGithub) configSocialGithub.value = data.data.social_github || '';
                if (configSocialTwitter) configSocialTwitter.value = data.data.social_twitter || '';
                if (configSocialFacebook) configSocialFacebook.value = data.data.social_facebook || '';
                if (configSocialInstagram) configSocialInstagram.value = data.data.social_instagram || '';
                if (configSocialSupport) configSocialSupport.value = data.data.social_support || '';
                if (configMaintenanceMode) configMaintenanceMode.checked = data.data.maintenance_mode == '1';
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', async () => {
            const settings = {
                google_tag_id: configGoogleTag.value.trim(),
                adsense_id: configAdSenseId.value.trim(),
                custom_head_code: configCustomHead.value.trim(),
                social_github: configSocialGithub.value.trim(),
                social_twitter: configSocialTwitter.value.trim(),
                social_facebook: configSocialFacebook.value.trim(),
                social_instagram: configSocialInstagram.value.trim(),
                social_support: configSocialSupport.value.trim(),
                maintenance_mode: configMaintenanceMode.checked ? '1' : '0'
            };

            saveSettingsBtn.disabled = true;
            saveSettingsBtn.textContent = 'Saving...';
            settingsMsg.style.display = 'none';

            try {
                const res = await fetch('api/admin/settings.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ settings: settings })
                });
                const data = await res.json();
                
                settingsMsg.textContent = data.message;
                settingsMsg.style.display = 'block';
                settingsMsg.style.backgroundColor = data.status === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)';
                settingsMsg.style.color = data.status === 'success' ? '#34d399' : '#ef4444';
            } catch (e) {
                settingsMsg.textContent = 'Network error.';
                settingsMsg.style.display = 'block';
                settingsMsg.style.color = '#ef4444';
            } finally {
                saveSettingsBtn.disabled = false;
                saveSettingsBtn.textContent = 'Save Configuration';
            }
        });
    }

    // Initial load
    loadStats();
});
