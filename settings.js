import { VU_STYLES } from './visualizer.js';
import { stations as defaultStations, submitCustomStation, fetchUserFavorites, addFavorite, removeFavorite } from './api.js';
import { stateManager } from './state.js';

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const vuStyleSelect = document.getElementById('vu-style-select');
const themeSelect = document.getElementById('theme-select');
const addStationBtn = document.getElementById('add-station-btn');
const favoritesOnlyCheck = document.getElementById('favorites-only-check');
const genreSelect = document.getElementById('genre-select');
const nameInput = document.getElementById('custom-station-name');
const genreInput = document.getElementById('custom-station-genre');
const urlInput = document.getElementById('custom-station-url');
const customStationsList = document.getElementById('custom-stations-list');
const bgUrlInput = document.getElementById('bg-url-input');
const setBgBtn = document.getElementById('set-bg-btn');
const clearBgBtn = document.getElementById('clear-bg-btn');
const bgPresetsContainer = document.getElementById('bg-presets-container');
const favoriteBtn = document.getElementById('favorite-btn');

// Initialize Settings
export function initSettings() {
    // Populate VU Style Dropdown
    if (vuStyleSelect) {
        VU_STYLES.forEach((style) => {
            const option = document.createElement('option');
            option.value = style; // use the string name (e.g. 'neon')
            option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
            vuStyleSelect.appendChild(option);
        });

        // Set initial value from localStorage or default
        const savedStyle = localStorage.getItem('vuStyle');
        if (savedStyle !== null) {
            // Handle backwards compatibility where savedStyle might be an integer "1"
            const numStyle = parseInt(savedStyle, 10);
            if (!isNaN(numStyle) && numStyle >= 0 && numStyle < VU_STYLES.length) {
                vuStyleSelect.value = VU_STYLES[numStyle];
            } else if (VU_STYLES.includes(savedStyle)) {
                vuStyleSelect.value = savedStyle;
            } else {
                vuStyleSelect.value = VU_STYLES[0];
            }
        } else {
            vuStyleSelect.value = VU_STYLES[1]; // LED as default
        }

        // Change Listener
        vuStyleSelect.addEventListener('change', (e) => {
            const selectedStyleName = e.target.value;
            const index = VU_STYLES.indexOf(selectedStyleName);
            if (index !== -1) {
                // Save the string to localStorage for robustness
                localStorage.setItem('vuStyle', selectedStyleName);
                stateManager.setVuStyle(index);
            }
        });
    }

    // Theme Logic
    if (themeSelect) {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        // Function to apply theme
        const applyTheme = (theme) => {
            document.documentElement.classList.toggle('dark-theme', theme === 'dark-theme');
            themeSelect.value = theme;
        };

        // Initial Load
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            applyTheme(prefersDark.matches ? 'dark-theme' : 'light-theme');
        }

        // User Change
        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            localStorage.setItem('theme', theme);
            applyTheme(theme);
        });

        // System Preference Change
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark-theme' : 'light-theme');
            }
        });
    }

    // Favorites Only Logic
    if (favoritesOnlyCheck) {
        const savedFavOnly = localStorage.getItem('favoritesOnly') === 'true';
        favoritesOnlyCheck.checked = savedFavOnly;

        // Initial state: Disable favorite button if filter is active
        if (favoriteBtn) favoriteBtn.disabled = savedFavOnly;

        favoritesOnlyCheck.addEventListener('change', (e) => {
            localStorage.setItem('favoritesOnly', e.target.checked);
            if (favoriteBtn) favoriteBtn.disabled = e.target.checked;
            window.dispatchEvent(new CustomEvent('stationListUpdated'));
        });
    }

    // Genre Filter Logic
    async function populateGenres() {
        if (!genreSelect) return;

        let customStations = [];
        if (window.IS_LOGGED_IN) {
            customStations = await fetchUserFavorites();
        } else {
            customStations = JSON.parse(localStorage.getItem('customStations')) || [];
        }
        
        const allStations = [...defaultStations, ...customStations];

        // Extract unique genres
        const genres = new Set(allStations.map(s => s.genre).filter(g => g));

        // Keep "All" and append sorted genres
        genreSelect.innerHTML = '<option value="all">All Genres</option>';
        Array.from(genres).sort().forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });

        // Restore selection
        const savedGenre = localStorage.getItem('selectedGenre');
        if (savedGenre) {
            genreSelect.value = savedGenre;
        }
    }

    if (genreSelect) {
        populateGenres();
        genreSelect.addEventListener('change', (e) => {
            localStorage.setItem('selectedGenre', e.target.value);
            window.dispatchEvent(new CustomEvent('stationListUpdated'));
        });
    }

    // Render Custom Stations List
    async function renderCustomStations() {
        if (!customStationsList) return;

        let customStations = [];
        if (window.IS_LOGGED_IN) {
            // For logged in users, we treat all favorites as "their" stations for now
            // since favorites and customs are unified in the DB link logic.
            customStations = await fetchUserFavorites();
        } else {
            customStations = JSON.parse(localStorage.getItem('customStations')) || [];
        }
        
        customStationsList.innerHTML = '';

        if (customStations.length === 0) {
            customStationsList.innerHTML = '<div class="no-stations">No custom stations added.</div>';
            return;
        }

        // Filter for 'custom' type specifically if logged in, or just show all if guest
        const displayStations = window.IS_LOGGED_IN ? customStations.filter(s => s.type === 'custom') : customStations;

        if (displayStations.length === 0) {
            customStationsList.innerHTML = '<div class="no-stations">No custom stations added.</div>';
            // We don't return here because we might still want to add new ones.
        }

        displayStations.forEach((station, index) => {
            const item = document.createElement('div');
            item.className = 'station-item';
            item.innerHTML = `
                <span class="station-name" title="${station.url}">${station.name} ${station.genre ? `(${station.genre})` : ''}</span>
                <div class="station-actions">
                    <button class="edit-btn" data-index="${index}" aria-label="Edit station">✎</button>
                    <button class="delete-btn" data-url="${station.url}" data-index="${index}" aria-label="Delete station">&times;</button>
                </div>
            `;
            customStationsList.appendChild(item);
        });

        // Add edit listeners
        customStationsList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                const station = displayStations[index];

                nameInput.value = station.name;
                urlInput.value = station.url;
                if (genreInput) genreInput.value = station.genre || '';

                addStationBtn.textContent = 'Save';
                addStationBtn.dataset.editingIndex = index;
            });
        });

        // Add delete listeners
        customStationsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                const urlToRemove = e.target.dataset.url;

                if (window.IS_LOGGED_IN) {
                    await removeFavorite(urlToRemove);
                } else {
                    const stations = JSON.parse(localStorage.getItem('customStations')) || [];
                    stations.splice(index, 1);
                    localStorage.setItem('customStations', JSON.stringify(stations));
                }

                // Reset edit state if deleting the item currently being edited
                if (addStationBtn.dataset.editingIndex && parseInt(addStationBtn.dataset.editingIndex, 10) === index) {
                    nameInput.value = '';
                    urlInput.value = '';
                    if (genreInput) genreInput.value = '';
                    delete addStationBtn.dataset.editingIndex;
                    addStationBtn.textContent = 'Add';
                }

                populateGenres();
                renderCustomStations();
                renderFavorites();
                window.dispatchEvent(new CustomEvent('stationListUpdated'));
            });
        });
    }

    // Render Favorites List
    async function renderFavorites() {
        const favoritesListContainer = document.getElementById('favorites-list');
        if (!favoritesListContainer) return;

        let favorites = [];
        let allStations = [...defaultStations];

        if (window.IS_LOGGED_IN) {
            favorites = await fetchUserFavorites();
            allStations = [...defaultStations, ...favorites];
        } else {
            const favoriteUrls = JSON.parse(localStorage.getItem('favoriteStations')) || [];
            const customStations = JSON.parse(localStorage.getItem('customStations')) || [];
            allStations = [...defaultStations, ...customStations];
            favorites = allStations.filter(s => favoriteUrls.includes(s.url));
        }

        favoritesListContainer.innerHTML = '';

        if (favorites.length === 0) {
            favoritesListContainer.innerHTML = '<div class="no-stations">No favorite stations added.</div>';
            return;
        }

        favorites.forEach(station => {
            const item = document.createElement('div');
            item.className = 'station-item';
            item.innerHTML = `
                <span class="station-name" title="${station.url}">★ ${station.name}</span>
                <div class="station-actions">
                    <button class="delete-btn remove-fav-btn" data-url="${station.url}" aria-label="Remove from favorites">&times;</button>
                </div>
            `;
            favoritesListContainer.appendChild(item);
        });

        // Add remove listeners
        favoritesListContainer.querySelectorAll('.remove-fav-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const urlToRemove = e.target.dataset.url;
                
                if (window.IS_LOGGED_IN) {
                    await removeFavorite(urlToRemove);
                } else {
                    let currentFavorites = JSON.parse(localStorage.getItem('favoriteStations')) || [];
                    currentFavorites = currentFavorites.filter(url => url !== urlToRemove);
                    localStorage.setItem('favoriteStations', JSON.stringify(currentFavorites));
                }

                renderFavorites();
                renderCustomStations();
                window.dispatchEvent(new CustomEvent('stationListUpdated'));
            });
        });
    }

    renderFavorites();
    renderCustomStations();

    // Listen for updates from player.js (e.g., when a user clicks the star button in main UI)
    window.addEventListener('stationListUpdated', () => {
        renderFavorites();
    });

    // Personalization Logic
    if (bgUrlInput && setBgBtn && clearBgBtn) {
        // Background Presets
        const backgroundPresets = [
            { name: 'Default', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1950' },
            { name: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1950' },
            { name: 'Deep Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1950' },
            { name: 'Abstract', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1950' }
        ];

        if (bgPresetsContainer) {
            bgPresetsContainer.className = 'bg-preset-grid';
            const currentBg = localStorage.getItem('customBackground') || backgroundPresets[0].url;

            backgroundPresets.forEach(preset => {
                const btn = document.createElement('button');
                btn.className = 'bg-preset-btn';
                if (currentBg === preset.url) btn.classList.add('active');
                btn.style.backgroundImage = `url('${preset.url}')`;
                btn.title = preset.name;
                btn.ariaLabel = `Set background to ${preset.name}`;

                btn.onclick = () => {
                    document.body.style.backgroundImage = `url('${preset.url}')`;
                    localStorage.setItem('customBackground', preset.url);
                    bgUrlInput.value = preset.url;

                    // Update active state
                    Array.from(bgPresetsContainer.children).forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                };
                bgPresetsContainer.appendChild(btn);
            });
        }

        const savedBg = localStorage.getItem('customBackground');
        if (savedBg) {
            bgUrlInput.value = savedBg;
        }

        setBgBtn.addEventListener('click', () => {
            const url = bgUrlInput.value.trim();
            if (url) {
                localStorage.setItem('customBackground', url);
                document.body.style.backgroundImage = `url('${url}')`;

                // Update presets active state (deselect all if custom URL doesn't match)
                if (bgPresetsContainer) {
                    Array.from(bgPresetsContainer.children).forEach(b => {
                        b.classList.toggle('active', b.style.backgroundImage.includes(url));
                    });
                }
            }
        });

        clearBgBtn.addEventListener('click', () => {
            localStorage.removeItem('customBackground');
            bgUrlInput.value = '';
            // Reset to default background from CSS
            document.body.style.backgroundImage = '';

            // Reset presets to default (first one)
            if (bgPresetsContainer && bgPresetsContainer.children[0]) {
                Array.from(bgPresetsContainer.children).forEach(b => b.classList.remove('active'));
                bgPresetsContainer.children[0].classList.add('active');
            }
        });
    }

    // Custom Stations Logic
    if (addStationBtn && nameInput && urlInput) {
        addStationBtn.addEventListener('click', async () => {
            const name = nameInput.value.trim();
            const url = urlInput.value.trim();
            const genre = genreInput ? genreInput.value.trim() : '';

            if (name && url) {
                if (window.IS_LOGGED_IN) {
                    // Save to DB
                    await addFavorite({ name, url, genre });
                } else {
                    // Save to localStorage
                    const customStations = JSON.parse(localStorage.getItem('customStations')) || [];

                    if (addStationBtn.dataset.editingIndex !== undefined) {
                        const index = parseInt(addStationBtn.dataset.editingIndex, 10);
                        customStations[index] = { name, url, genre };
                        delete addStationBtn.dataset.editingIndex;
                        addStationBtn.textContent = 'Add';
                    } else {
                        customStations.push({ name, url, genre });
                        // still submit for community indexing if guest
                        submitCustomStation(name, url, genre, '');
                    }

                    localStorage.setItem('customStations', JSON.stringify(customStations));
                }

                // Clear inputs
                nameInput.value = '';
                urlInput.value = '';
                if (genreInput) genreInput.value = '';

                populateGenres(); 
                renderCustomStations();
                renderFavorites();
                // Notify player to refresh list
                window.dispatchEvent(new CustomEvent('stationListUpdated'));
            }
        });
    }

    // Modal Event Listeners
    if (settingsBtn && settingsModal && closeSettingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
        closeSettingsBtn.addEventListener('click', closeSettings);

        // Close when clicking outside the content
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettings();
        });
    }

    // Settings Tabs Logic
    const tabBtns = document.querySelectorAll('.settings-tab-btn');
    const tabContents = document.querySelectorAll('.settings-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.style.display = 'none';
                c.classList.remove('active');
            });

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const tabId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.style.display = 'block';
                targetContent.classList.add('active');
            }
        });
    });

    // --- Radio Browser Directory Integration ---
    const rbSearchBtn = document.getElementById('rb-search-btn');
    const rbSearchInput = document.getElementById('rb-search-input');
    const rbSearchBy = document.getElementById('rb-search-by');
    const rbResultsContainer = document.getElementById('rb-results-container');
    let bestRadioBrowserApiUrl = null;

    if (rbSearchBtn) {
        rbSearchBtn.addEventListener('click', searchRadioBrowser);
    }
    if (rbSearchInput) {
        rbSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchRadioBrowser();
        });
    }

    // 1. Discover the best API server
    async function discoverRadioBrowserApi() {
        if (bestRadioBrowserApiUrl) return bestRadioBrowserApiUrl;

        try {
            // Use DNS-over-HTTPS as recommended by Radio Browser docs
            const response = await fetch('https://de1.api.radio-browser.info/json/servers');
            if (!response.ok) throw new Error('Failed to fetch API servers');

            const servers = await response.json();
            if (servers && servers.length > 0) {
                // Pick a random server from the available list to load balance
                const randomServer = servers[Math.floor(Math.random() * servers.length)];
                bestRadioBrowserApiUrl = `https://${randomServer.name}`;
                console.log('Selected Radio Browser API:', bestRadioBrowserApiUrl);
                return bestRadioBrowserApiUrl;
            }
        } catch (error) {
            console.error('Error discovering Radio Browser servers:', error);
            // Fallback to a known reliable server
            bestRadioBrowserApiUrl = 'https://de1.api.radio-browser.info';
            return bestRadioBrowserApiUrl;
        }
    }

    // 2. Perform the search
    async function searchRadioBrowser() {
        const searchTerm = rbSearchInput.value.trim();
        if (!searchTerm) return;

        const searchType = rbSearchBy.value; // 'tag', 'name', or 'country'
        let endpoint = '';

        if (searchType === 'tag') {
            endpoint = `/json/stations/search?tag=${encodeURIComponent(searchTerm)}&limit=50&hidebroken=true&order=clickcount&reverse=true`;
        } else if (searchType === 'name') {
            endpoint = `/json/stations/search?name=${encodeURIComponent(searchTerm)}&limit=50&hidebroken=true&order=clickcount&reverse=true`;
        } else if (searchType === 'country') {
            endpoint = `/json/stations/search?country=${encodeURIComponent(searchTerm)}&limit=50&hidebroken=true&order=clickcount&reverse=true`;
        }

        rbResultsContainer.innerHTML = '<div class="rb-empty-state">Searching...</div>';
        rbSearchBtn.disabled = true;

        try {
            const apiUrl = await discoverRadioBrowserApi();
            const response = await fetch(`${apiUrl}${endpoint}`);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const stations = await response.json();
            renderRadioBrowserResults(stations);
        } catch (error) {
            console.error('Error fetching from Radio Browser:', error);
            rbResultsContainer.innerHTML = `<div class="rb-empty-state" style="color: #ef4444;">Error fetching results. Please try again.</div>`;
        } finally {
            rbSearchBtn.disabled = false;
        }
    }

    // 3. Render the results
    function renderRadioBrowserResults(stations) {
        rbResultsContainer.innerHTML = '';

        if (!stations || stations.length === 0) {
            rbResultsContainer.innerHTML = '<div class="rb-empty-state">No stations found. Try a different search term.</div>';
            return;
        }

        stations.forEach(station => {
            // Format metadata
            let metaString = '';
            if (station.tags) {
                // Show up to 3 tags
                const tags = station.tags.split(',').slice(0, 3).join(', ');
                metaString += tags;
            }
            if (station.country) metaString += (metaString ? ' • ' : '') + station.country;
            if (station.bitrate && station.bitrate > 0) metaString += (metaString ? ' • ' : '') + `${station.bitrate} kbps`;

            const item = document.createElement('div');
            item.className = 'rb-result-item';
            item.innerHTML = `
                <div class="rb-result-info">
                    <div class="rb-result-name" title="${station.name}">${station.name}</div>
                    <div class="rb-result-meta" title="${metaString}">${metaString}</div>
                </div>
                <button class="rb-add-btn" data-url="${station.url_resolved}" data-name="${station.name}" data-tags="${station.tags}">Add</button>
            `;
            rbResultsContainer.appendChild(item);
        });

        // Add event listeners for the "Add" buttons
        rbResultsContainer.querySelectorAll('.rb-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.target;
                const name = targetBtn.getAttribute('data-name');
                const url = targetBtn.getAttribute('data-url');

                // Get the first tag as the genre (or default to 'Radio')
                const allTags = targetBtn.getAttribute('data-tags');
                let genre = 'Radio';
                if (allTags && allTags.trim() !== '') {
                    genre = allTags.split(',')[0].trim();
                    // Capitalize first letter
                    genre = genre.charAt(0).toUpperCase() + genre.slice(1);
                }

                addStationFromDirectory(name, url, genre);

                // Visual feedback
                const originalText = targetBtn.textContent;
                targetBtn.textContent = 'Added ✓';
                targetBtn.style.backgroundColor = 'var(--primary-color)';
                targetBtn.style.color = 'white';

                setTimeout(() => {
                    targetBtn.textContent = originalText;
                    targetBtn.style.backgroundColor = 'transparent';
                    targetBtn.style.color = 'var(--primary-color)';
                }, 2000);
            });
        });
    }

    // 4. Add to Custom Stations
    function addStationFromDirectory(name, url, genre) {
        const customStations = JSON.parse(localStorage.getItem('customStations')) || [];

        // Avoid duplicate exact URLs
        const exists = customStations.some(s => s.url === url);
        if (!exists) {
            customStations.push({ name, url, genre });
            localStorage.setItem('customStations', JSON.stringify(customStations));

            // Re-render the custom stations UI
            populateGenres();
            renderCustomStations();

            // Notify player to refresh the dropdown list
            window.dispatchEvent(new CustomEvent('stationListUpdated'));
        }
    }

    // --- Account Management Integration ---
    const accountTabBtn = document.getElementById('account-tab-btn');
    const profileEmailInput = document.getElementById('profile-email');
    const profileNewPassInput = document.getElementById('profile-new-password');
    const profileCurrPassInput = document.getElementById('profile-current-password');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const profileMsg = document.getElementById('profile-msg');
    
    const dangerZoneSection = document.getElementById('danger-zone-section');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteAccountPass = document.getElementById('delete-account-password');

    // Load current data when opening settings
    window.addEventListener('settingsOpened', async () => {
        if (accountTabBtn) {
            if (window.IS_LOGGED_IN) {
                accountTabBtn.style.display = 'block';
                if (window.USER_ID && window.USER_ID !== 1) {
                    if (dangerZoneSection) dangerZoneSection.style.display = 'block';
                } else {
                    if (dangerZoneSection) dangerZoneSection.style.display = 'none';
                }

                try {
                    const response = await fetch('api/profile.php');
                    const data = await response.json();
                    if (data.status === 'success') {
                        profileEmailInput.value = data.data.user_email;
                    }
                } catch (e) {
                    console.error("Failed to fetch profile", e);
                }
            } else {
                accountTabBtn.style.display = 'none';
                // If we're on the account tab but just logged out, switch to general
                if (accountTabBtn.classList.contains('active')) {
                    const generalTabBtn = document.querySelector('.settings-tab-btn[data-tab="general-tab"]');
                    if (generalTabBtn) generalTabBtn.click();
                }
            }
        }
    });

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const current_password = profileCurrPassInput.value;
            if (!current_password) {
                showProfileMessage('Current password is required.', 'error');
                return;
            }

            const payload = {
                current_password,
                new_email: profileEmailInput.value,
                new_password: profileNewPassInput.value
            };

            saveProfileBtn.disabled = true;
            saveProfileBtn.textContent = 'Saving...';

            try {
                const response = await fetch('api/profile.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (data.status === 'success') {
                    showProfileMessage('Profile updated successfully!', 'success');
                    profileNewPassInput.value = '';
                    profileCurrPassInput.value = '';
                } else {
                    showProfileMessage(data.message || 'Update failed.', 'error');
                }
            } catch (e) {
                showProfileMessage('Network error. Try again.', 'error');
            } finally {
                saveProfileBtn.disabled = false;
                saveProfileBtn.textContent = 'Save Changes';
            }
        });
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            const password = deleteAccountPass.value;
            if (!password) {
                showProfileMessage('Confirm your password to delete account.', 'error');
                return;
            }
            if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
                return;
            }

            deleteAccountBtn.disabled = true;
            deleteAccountBtn.textContent = 'Deleting...';

            try {
                const response = await fetch('api/profile.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete_account', current_password: password })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    // Log out locally and reset UI
                    window.IS_LOGGED_IN = false;
                    window.USER_ID = null;
                    window.USER_ROLE = null;
                    updateAuthButton();
                    refreshAppData();
                    deleteAccountPass.value = '';
                    closeSettings();
                    alert("Your account has been successfully deleted.");
                } else {
                    showProfileMessage(data.message || 'Deletion failed.', 'error');
                    deleteAccountBtn.disabled = false;
                    deleteAccountBtn.textContent = 'Delete My Account';
                }
            } catch (e) {
                showProfileMessage('Network error. Try again.', 'error');
                deleteAccountBtn.disabled = false;
                deleteAccountBtn.textContent = 'Delete My Account';
            }
        });
    }

    let messageTimeout;
    function showProfileMessage(msg, type) {
        if (!profileMsg) return;
        
        clearTimeout(messageTimeout);
        
        profileMsg.textContent = msg;
        profileMsg.style.display = 'block';
        
        // Use classes instead of inline styles for better control
        profileMsg.className = 'profile-msg ' + type;
        
        // Auto-hide after 5 seconds if success
        if (type === 'success') {
            messageTimeout = setTimeout(() => {
                profileMsg.style.display = 'none';
            }, 5000);
        }
    }
    // --- Non-Intrusive Auth Logic ---
    const loginModal = document.getElementById('login-modal');
    const closeLoginBtn = document.getElementById('close-login-btn');
    const authLoginBtn = document.getElementById('auth-login-btn');
    const loginEmailInput = document.getElementById('login-email');
    const loginPassInput = document.getElementById('login-password');
    const loginErrorMsg = document.getElementById('login-error-msg');

    function updateAuthButton() {
        const header = document.querySelector('.tool-header');
        if (!header) return;

        // Find existing auth button (either login or logout)
        let authBtn = document.getElementById('header-login-btn') || document.getElementById('header-logout-btn');
        
        if (!authBtn) {
            // If for some reason it's missing, create it
            authBtn = document.createElement('button');
            authBtn.className = 'theme-btn';
            authBtn.style.fontSize = '14px';
            authBtn.style.marginLeft = '10px';
            authBtn.style.display = 'flex';
            authBtn.style.alignItems = 'center';
            header.appendChild(authBtn);
        }

        // Update properties based on state
        if (window.IS_LOGGED_IN) {
            authBtn.id = 'header-logout-btn';
            authBtn.textContent = 'Logout';
            authBtn.onclick = handleLogout;
        } else {
            authBtn.id = 'header-login-btn';
            authBtn.textContent = 'Login';
            authBtn.onclick = () => {
                if (loginModal) loginModal.style.display = 'flex';
            };
        }
    }

    async function handleLogout() {
        try {
            const response = await fetch('api/auth.php?action=logout');
            const data = await response.json();
            if (data.status === 'success') {
                window.IS_LOGGED_IN = false;
                updateAuthButton();
                refreshAppData();
            }
        } catch (e) {
            console.error('Logout failed', e);
        }
    }

    function refreshAppData() {
        populateGenres();
        renderCustomStations();
        renderFavorites();
        window.dispatchEvent(new CustomEvent('stationListUpdated'));
        window.dispatchEvent(new CustomEvent('settingsOpened'));
    }

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) loginModal.style.display = 'none';
        });
    }

    if (authLoginBtn) {
        authLoginBtn.addEventListener('click', async () => {
            const email = loginEmailInput.value;
            const password = loginPassInput.value;

            if (!email || !password) {
                showLoginError('Please enter both email and password.');
                return;
            }

            authLoginBtn.disabled = true;
            authLoginBtn.textContent = 'Logging in...';

            try {
                const response = await fetch('api/auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login_submit: 1, email, password })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    window.IS_LOGGED_IN = true;
                    if (loginModal) loginModal.style.display = 'none';
                    updateAuthButton();
                    refreshAppData();
                } else {
                    showLoginError(data.message || 'Login failed.');
                }
            } catch (e) {
                showLoginError('Network error. Try again.');
            } finally {
                authLoginBtn.disabled = false;
                authLoginBtn.textContent = 'Login';
            }
        });
    }

    function showLoginError(msg) {
        if (loginErrorMsg) {
            loginErrorMsg.textContent = msg;
            loginErrorMsg.style.display = 'block';
        }
    }

    // Initialize the button state on load
    updateAuthButton();

    // --- Registration Logic ---
    const registerModal = document.getElementById('register-modal');
    const closeRegisterBtn = document.getElementById('close-register-btn');
    const openRegisterLink = document.getElementById('open-register-link');
    const backToLoginLink = document.getElementById('back-to-login-link');
    const authRegisterBtn = document.getElementById('auth-register-btn');
    const registerNameInput = document.getElementById('register-name');
    const registerEmailInput = document.getElementById('register-email');
    const registerPassInput = document.getElementById('register-password');
    const registerConfirmPassInput = document.getElementById('register-confirm-password');
    const registerWebsiteHoneypot = document.getElementById('register-website');
    const registerErrorMsg = document.getElementById('register-error-msg');

    if (openRegisterLink) {
        openRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModal) loginModal.style.display = 'none';
            if (registerModal) registerModal.style.display = 'flex';
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerModal) registerModal.style.display = 'none';
            if (loginModal) loginModal.style.display = 'flex';
        });
    }

    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', () => {
            if (registerModal) registerModal.style.display = 'none';
        });
    }

    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) registerModal.style.display = 'none';
        });
    }

    function showRegisterError(msg) {
        if (registerErrorMsg) {
            registerErrorMsg.textContent = msg;
            registerErrorMsg.style.display = 'block';
        }
    }

    if (authRegisterBtn) {
        authRegisterBtn.addEventListener('click', async () => {
            const display_name = registerNameInput.value;
            const email = registerEmailInput.value;
            const password = registerPassInput.value;
            const confirm_password = registerConfirmPassInput.value;
            const website_url = registerWebsiteHoneypot ? registerWebsiteHoneypot.value : '';

            // Basic frontend validation
            if (!email || !password || !confirm_password) {
                showRegisterError('Please fill in all required fields.');
                return;
            }

            if (password.length < 6) {
                showRegisterError('Password must be at least 6 characters.');
                return;
            }

            if (password !== confirm_password) {
                showRegisterError('Passwords do not match.');
                return;
            }

            // Hide error state
            if (registerErrorMsg) registerErrorMsg.style.display = 'none';
            authRegisterBtn.disabled = true;
            authRegisterBtn.textContent = 'Creating Account...';

            try {
                const response = await fetch('api/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        display_name,
                        email,
                        password,
                        confirm_password,
                        website_url
                    })
                });
                
                const data = await response.json();

                if (data.status === 'success') {
                    // Auto-login successful
                    window.IS_LOGGED_IN = true;
                    if (data.user) {
                        window.USER_ID = data.user.id;
                        window.USER_ROLE = data.user.role;
                    }
                    
                    if (registerModal) registerModal.style.display = 'none';
                    
                    // Clear form
                    registerNameInput.value = '';
                    registerEmailInput.value = '';
                    registerPassInput.value = '';
                    registerConfirmPassInput.value = '';
                    
                    updateAuthButton();
                    refreshAppData();
                } else {
                    showRegisterError(data.message || 'Registration failed.');
                }
            } catch (e) {
                showRegisterError('Network error. Please try again later.');
            } finally {
                authRegisterBtn.disabled = false;
                authRegisterBtn.textContent = 'Create Account';
            }
        });
    }

    // --- Password Reset Logic ---
    const forgotModal = document.getElementById('forgot-password-modal');
    const openForgotLink = document.getElementById('open-forgot-pass-link');
    const closeForgotBtn = document.getElementById('close-forgot-pass-btn');
    const backToLoginFromForgot = document.getElementById('back-to-login-from-forgot-link');
    const authForgotBtn = document.getElementById('auth-forgot-btn');
    const forgotEmailInput = document.getElementById('forgot-email');
    const forgotMsg = document.getElementById('forgot-msg');

    const resetModal = document.getElementById('reset-password-modal');
    const closeResetBtn = document.getElementById('close-reset-pass-btn');
    const authResetBtn = document.getElementById('auth-reset-btn');
    const resetNewPassInput = document.getElementById('reset-new-password');
    const resetConfirmPassInput = document.getElementById('reset-confirm-password');
    const resetTokenInput = document.getElementById('reset-token-input');
    const resetEmailInput = document.getElementById('reset-email-input');
    const resetMsg = document.getElementById('reset-msg');

    // UI Event Listeners for Forgot Password
    if (openForgotLink) {
        openForgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModal) loginModal.style.display = 'none';
            if (forgotModal) forgotModal.style.display = 'flex';
        });
    }

    if (backToLoginFromForgot) {
        backToLoginFromForgot.addEventListener('click', (e) => {
            e.preventDefault();
            if (forgotModal) forgotModal.style.display = 'none';
            if (loginModal) loginModal.style.display = 'flex';
        });
    }

    if (closeForgotBtn) {
        closeForgotBtn.addEventListener('click', () => {
             if (forgotModal) forgotModal.style.display = 'none';
        });
    }
    
    // Forgot Password Action
    if (authForgotBtn) {
        authForgotBtn.addEventListener('click', async () => {
            const email = forgotEmailInput.value;
            if (!email) {
                showAuthMessage(forgotMsg, 'Please enter your email.', 'error');
                return;
            }

            authForgotBtn.disabled = true;
            authForgotBtn.textContent = 'Sending...';
            if (forgotMsg) forgotMsg.style.display = 'none';

            try {
                const response = await fetch('api/forgot-password.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    showAuthMessage(forgotMsg, data.message, 'success');
                    forgotEmailInput.value = '';
                } else {
                    showAuthMessage(forgotMsg, data.message, 'error');
                }
            } catch (e) {
                showAuthMessage(forgotMsg, 'Network error. Try again.', 'error');
            } finally {
                authForgotBtn.disabled = false;
                authForgotBtn.textContent = 'Send Reset Link';
            }
        });
    }

    // Checking for URL Params to auto-open Reset Modal
    window.addEventListener('load', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('reset_token');
        const email = urlParams.get('email');

        if (token && email && resetModal) {
            resetTokenInput.value = token;
            resetEmailInput.value = email;
            resetModal.style.display = 'flex';

            // Clean up the URL without reloading the page
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path:newUrl}, '', newUrl);
        }
    });

    if (closeResetBtn) {
        closeResetBtn.addEventListener('click', () => {
            if (resetModal) resetModal.style.display = 'none';
        });
    }

    // Reset Password Action
    if (authResetBtn) {
        authResetBtn.addEventListener('click', async () => {
            const password = resetNewPassInput.value;
            const confirm_password = resetConfirmPassInput.value;
            const token = resetTokenInput.value;
            const email = resetEmailInput.value;

            if (!password || !confirm_password) {
                showAuthMessage(resetMsg, 'Please fill all fields.', 'error');
                return;
            }
            if (password.length < 6) {
                showAuthMessage(resetMsg, 'Password must be at least 6 characters.', 'error');
                return;
            }
            if (password !== confirm_password) {
                showAuthMessage(resetMsg, 'Passwords do not match.', 'error');
                return;
            }

            authResetBtn.disabled = true;
            authResetBtn.textContent = 'Resetting...';
            if (resetMsg) resetMsg.style.display = 'none';

            try {
                const response = await fetch('api/reset-password.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, token, password, confirm_password })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    showAuthMessage(resetMsg, data.message, 'success');
                    resetNewPassInput.value = '';
                    resetConfirmPassInput.value = '';
                    
                    // After 3 seconds, close reset modal and open login
                    setTimeout(() => {
                        resetModal.style.display = 'none';
                        if (loginModal) {
                            document.getElementById('login-email').value = email;
                            loginModal.style.display = 'flex';
                        }
                    }, 3000);
                } else {
                    showAuthMessage(resetMsg, data.message, 'error');
                }
            } catch (e) {
               showAuthMessage(resetMsg, 'Network error. Try again.', 'error');
            } finally {
                authResetBtn.disabled = false;
                authResetBtn.textContent = 'Reset Password';
            }
        });
    }

    // Helper for auth messages
    function showAuthMessage(element, msg, type) {
        if (!element) return;
        element.textContent = msg;
        element.style.display = 'block';
        if (type === 'error') {
            element.style.background = 'rgba(239, 68, 68, 0.1)';
            element.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            element.style.color = '#f87171';
        } else {
             element.style.background = 'rgba(16, 185, 129, 0.1)';
             element.style.border = '1px solid rgba(16, 185, 129, 0.3)';
             element.style.color = '#34d399';
        }
    }

}

function openSettings() {
    settingsModal.style.display = 'flex';
    window.dispatchEvent(new CustomEvent('settingsOpened'));
}

function closeSettings() {
    settingsModal.style.display = 'none';
}