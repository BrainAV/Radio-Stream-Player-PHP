/**
 * admin.js - Frontend Logic for the Admin Control Panel
 */

document.addEventListener('DOMContentLoaded', () => {
    // Basic navigation
    const navItems = document.querySelectorAll('.admin-nav-item[data-target]');
    const views = document.querySelectorAll('.admin-view');

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

    // --- Users Load ---
    async function loadUsers() {
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading users...</td></tr>';
        
        try {
            const res = await fetch('api/admin/users.php');
            const data = await res.json();
            
            if (data.status === 'success') {
                tbody.innerHTML = '';
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found.</td></tr>';
                    return;
                }

                data.data.forEach(user => {
                    const tr = document.createElement('tr');
                    
                    // Disable delete for ID 1 and for the currently logged in admin to prevent self-lockout
                    const isProtected = (user.id == 1 || user.id == window.USER_ID);
                    
                    tr.innerHTML = `
                        <td data-label="ID">${user.id}</td>
                        <td data-label="Email">${user.user_email}</td>
                        <td data-label="Display Name">${user.display_name}</td>
                        <td data-label="Role">${getRoleBadge(user.role)}${getPremiumBadge(user.is_premium)}</td>
                        <td data-label="Joined">${formatDate(user.created_at)}</td>
                        <td data-label="Actions" style="display: flex; gap: 5px;">
                            <button class="console-btn btn-small edit-user-btn" data-id="${user.id}" data-role="${user.role}" data-email="${user.user_email}" data-premium="${user.is_premium}">Edit</button>
                            ${!isProtected ? `<button class="console-btn btn-small btn-danger delete-user-btn" data-id="${user.id}" data-email="${user.user_email}">Delete</button>` : `<span style="font-size: 0.8em; opacity: 0.5; padding: 4px;">Protected</span>`}
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                bindUserActionButtons();
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ef4444;">Error: ${data.message}</td></tr>`;
            }
        } catch (e) {
             tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">Network Error.</td></tr>';
        }
    }

    function bindUserActionButtons() {
        const editBtns = document.querySelectorAll('.edit-user-btn');
        const deleteBtns = document.querySelectorAll('.delete-user-btn');

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
    }

    // --- Stations Load ---
    async function loadStations() {
        const tbody = document.getElementById('stations-tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading stations...</td></tr>';
        
        try {
            const res = await fetch('api/admin/stations.php');
            const data = await res.json();
            
            if (data.status === 'success') {
                tbody.innerHTML = '';
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No system stations found.</td></tr>';
                    return;
                }

                data.data.forEach(station => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td data-label="ID">${station.id}</td>
                        <td data-label="Name">${station.name}</td>
                        <td data-label="Genre">${station.genre || '-'}</td>
                        <td data-label="URL" class="truncate" title="${station.url}">${station.url}</td>
                        <td data-label="Actions" style="display: flex; gap: 5px;">
                            <button class="console-btn btn-small edit-station-btn" data-id="${station.id}" data-name="${station.name}" data-genre="${station.genre || ''}" data-url="${station.url}">Edit</button>
                            <button class="console-btn btn-small btn-danger delete-station-btn" data-id="${station.id}" data-name="${station.name}">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                bindStationActionButtons();
            } else {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ef4444;">Error: ${data.message}</td></tr>`;
            }
        } catch (e) {
             tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Network Error.</td></tr>';
        }
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
                
                if (!confirm(`Are you sure you want to delete system station "${name}"?`)) {
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
    }

    // --- Site Configuration ---
    const configGoogleTag = document.getElementById('config-google-tag');
    const configAdSenseId = document.getElementById('config-adsense-id');
    const configCustomHead = document.getElementById('config-custom-head');
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
                custom_head_code: configCustomHead.value.trim()
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
