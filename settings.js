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

    // Bind search UI events
    if (rbSearchBtn && rbSearchInput) {
        rbSearchBtn.addEventListener('click', searchRadioBrowser);
        rbSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchRadioBrowser();
            }
        });
    }
}

function openSettings() {
    settingsModal.style.display = 'flex';
}

function closeSettings() {
    settingsModal.style.display = 'none';
}