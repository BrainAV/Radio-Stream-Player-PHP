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
        });
    });

    // Helper to format dates
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function getRoleBadge(role) {
        return `<span class="badge badge-${role.toLowerCase()}">${role}</span>`;
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
                        <td>${user.id}</td>
                        <td>${user.user_email}</td>
                        <td>${user.display_name}</td>
                        <td>${getRoleBadge(user.role)}</td>
                        <td>${formatDate(user.created_at)}</td>
                        <td style="display: flex; gap: 5px;">
                            <button class="console-btn btn-small edit-user-btn" data-id="${user.id}" data-role="${user.role}" data-email="${user.user_email}">Edit Role</button>
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
        const editDisplay = document.getElementById('edit-user-display');
        const editMsg = document.getElementById('edit-user-msg');

        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const role = e.target.getAttribute('data-role');
                const email = e.target.getAttribute('data-email');
                
                editIdInput.value = id;
                editRoleInput.value = role;
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

                saveEditBtn.disabled = true;
                saveEditBtn.textContent = 'Saving...';
                
                try {
                    const res = await fetch('api/admin/users.php', {
                         method: 'PUT',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ id: userId, role: newRole })
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
                        <td>${station.id}</td>
                        <td>${station.name}</td>
                        <td>${station.genre || '-'}</td>
                        <td class="truncate" title="${station.url}">${station.url}</td>
                        <td style="display: flex; gap: 5px;">
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


    // Initial load
    loadStats();
});
