import { VU_STYLES } from './visualizer.js';
import { stations as defaultStations, submitCustomStation, fetchUserFavorites, addFavorite, removeFavorite } from './api.js';
import { stateManager } from './state.js';

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const infoBtn = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const closeInfoBtn = document.getElementById('close-info-btn');
const accountBtn = document.getElementById('header-account-btn');
const accountModal = document.getElementById('account-modal');
const closeAccountBtn = document.getElementById('close-account-btn');
const vuStyleSelect = document.getElementById('vu-style-select');
const themeSelect = document.getElementById('theme-select');
const addStationBtn = document.getElementById('add-station-btn');
const favoritesOnlyCheck = document.getElementById('favorites-only-check');
const declutterModeCheck = document.getElementById('declutter-mode-check');
const genreSelect = document.getElementById('genre-select');
const nameInput = document.getElementById('custom-station-name');
const genreInput = document.getElementById('custom-station-genre');
const urlInput = document.getElementById('custom-station-url');
const bitrateInput = document.getElementById('custom-station-bitrate');
const customStationsList = document.getElementById('custom-stations-list');
const bgUrlInput = document.getElementById('bg-url-input');
const setBgBtn = document.getElementById('set-bg-btn');
const clearBgBtn = document.getElementById('clear-bg-btn');
const bgPresetsContainer = document.getElementById('bg-presets-container');
const favoriteBtn = document.getElementById('favorite-btn');

// Initialize Settings
export function initSettings() {
    // Password Toggle Logic
    const initPasswordToggles = () => {
        const toggleBtns = document.querySelectorAll('.toggle-password');
        const eyeIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
        const eyeOffIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.39 2.59-3.26 3.14-5.24-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent potential form submission
                const wrapper = btn.closest('.password-wrapper');
                const input = wrapper ? wrapper.querySelector('input') : null;
                if (input) {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    btn.innerHTML = isPassword ? eyeOffIcon : eyeIcon;
                    btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
                }
            });
        });
    };

    initPasswordToggles();

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

    // Declutter Mode Logic
    if (declutterModeCheck) {
        const savedDeclutter = localStorage.getItem('declutterMode') === 'true';
        declutterModeCheck.checked = savedDeclutter;

        declutterModeCheck.addEventListener('change', (e) => {
            localStorage.setItem('declutterMode', e.target.checked);
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

    // Render My Collection List
    async function renderMyCollection() {
        if (!customStationsList) return;

        let collection = [];
        let allStations = [...defaultStations];

        if (window.IS_LOGGED_IN) {
            collection = await fetchUserFavorites();
        } else {
            const customStations = JSON.parse(localStorage.getItem('customStations')) || [];
            const favoriteUrls = JSON.parse(localStorage.getItem('favoriteStations')) || [];
            
            // Guest collection is: Custom Stations + Any Default Station marked as Favorite
            let guestCollection = [...customStations];
            defaultStations.forEach(ds => {
                if (favoriteUrls.includes(ds.url)) {
                    // Include default stations but tag them as default so we disable Edit
                    guestCollection.push({...ds, type: 'default'});
                }
            });
            // Assign is_favorite flag for UI rendering
            guestCollection = guestCollection.map(station => ({
                ...station,
                is_favorite: favoriteUrls.includes(station.url) ? 1 : 0
            }));
            
            collection = guestCollection;
        }
        
        customStationsList.innerHTML = '';

        if (collection.length === 0) {
            customStationsList.innerHTML = '<div class="no-stations">Your collection is empty. Add stations from the Directory or Custom entries.</div>';
            return;
        }

        collection.forEach((station, index) => {
            const isFav = station.is_favorite == 1;
            const canEdit = station.type === 'custom' || (!station.type && !defaultStations.some(d => d.url === station.url));
            
            const item = document.createElement('div');
            item.className = 'station-item';
            item.innerHTML = `
                <span class="station-name" title="${station.url}">${station.name} ${station.genre ? `(${station.genre})` : ''}</span>
                <div class="station-actions" style="display:flex; gap: 5px;">
                    <button class="toggle-fav-btn" data-url="${station.url}" data-isfav="${isFav}" aria-label="Toggle favorite" style="color: ${isFav ? 'gold' : 'gray'}; background: none; border: none; cursor: pointer; font-size: 1.2em;">${isFav ? '★' : '☆'}</button>
                    ${canEdit ? `<button class="edit-btn" data-index="${index}" aria-label="Edit station">✎</button>` : ''}
                    <button class="delete-btn" data-url="${station.url}" data-index="${index}" aria-label="Delete station">&times;</button>
                </div>
            `;
            customStationsList.appendChild(item);
        });

        // Toggle Favorite listeners
        customStationsList.querySelectorAll('.toggle-fav-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const url = e.target.dataset.url;
                const currentIsFav = e.target.dataset.isfav === 'true';
                const newIsFav = !currentIsFav;

                if (window.IS_LOGGED_IN) {
                    // Import toggleFavorite at top if not done, or call api
                    try {
                         // We need toggleFavorite from api.js
                         const { toggleFavorite } = await import('./api.js');
                         await toggleFavorite(url, newIsFav);
                    } catch(e) { console.error(e); }
                } else {
                    let favoriteUrls = JSON.parse(localStorage.getItem('favoriteStations')) || [];
                    if (newIsFav && !favoriteUrls.includes(url)) {
                        favoriteUrls.push(url);
                    } else if (!newIsFav) {
                        favoriteUrls = favoriteUrls.filter(u => u !== url);
                    }
                    localStorage.setItem('favoriteStations', JSON.stringify(favoriteUrls));
                }
                
                populateGenres();
                renderMyCollection();
                window.dispatchEvent(new CustomEvent('stationListUpdated'));
            });
        });

        // Add edit listeners
        customStationsList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                const station = collection.filter(s => s.type === 'custom' || (!s.type && !defaultStations.some(d => d.url === s.url)))[index] || collection[index];

                if (nameInput) nameInput.value = station.name || '';
                if (urlInput) urlInput.value = station.url || '';
                if (genreInput) genreInput.value = station.genre || '';
                if (bitrateInput) bitrateInput.value = station.bitrate || '';
                
                if (addStationBtn) {
                    addStationBtn.textContent = 'Update';
                    addStationBtn.dataset.editingIndex = index;
                }
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
                    let stations = JSON.parse(localStorage.getItem('customStations')) || [];
                    stations = stations.filter(s => s.url !== urlToRemove);
                    localStorage.setItem('customStations', JSON.stringify(stations));
                    
                    let favoriteUrls = JSON.parse(localStorage.getItem('favoriteStations')) || [];
                    favoriteUrls = favoriteUrls.filter(u => u !== urlToRemove);
                    localStorage.setItem('favoriteStations', JSON.stringify(favoriteUrls));
                }

                // Reset edit state if deleting the item currently being edited
                if (addStationBtn.dataset.editingIndex && parseInt(addStationBtn.dataset.editingIndex, 10) === index) {
                    nameInput.value = '';
                    urlInput.value = '';
                    if (genreInput) genreInput.value = '';
                    if (bitrateInput) bitrateInput.value = '';
                    delete addStationBtn.dataset.editingIndex;
                    addStationBtn.textContent = 'Add';
                }

                populateGenres();
                renderMyCollection();
                window.dispatchEvent(new CustomEvent('stationListUpdated'));
            });
        });
    }

    renderMyCollection();

    // Listen for updates from player.js (e.g., when a user clicks the star button in main UI)
    window.addEventListener('stationListUpdated', () => {
        renderMyCollection();
    });

    // Personalization Logic
    if (bgUrlInput && setBgBtn && clearBgBtn) {
        // Background Presets
        const backgroundPresets = [
            { name: 'Default', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1950' },
            { name: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1950' },
            { name: 'Deep Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1950' },
            { name: 'Serene Nature', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1950' }
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
            const genre = genreInput ? genreInput.value.trim() : 'Radio';
            const bitrate = bitrateInput ? parseInt(bitrateInput.value, 10) : null;

            if (name && url) {
                if (window.IS_LOGGED_IN) {
                    // Save to DB (addFavorite is imported at top level)
                    await addFavorite({ name, url, genre, bitrate });
                } else {
                    // Save to localStorage
                    const customStations = JSON.parse(localStorage.getItem('customStations')) || [];

                    if (addStationBtn.dataset.editingIndex !== undefined) {
                        const index = parseInt(addStationBtn.dataset.editingIndex, 10);
                        customStations[index] = { name, url, genre, bitrate };
                        delete addStationBtn.dataset.editingIndex;
                        addStationBtn.textContent = 'Add';
                    } else {
                        customStations.push({ name, url, genre, bitrate });
                        // still submit for community indexing if guest
                        submitCustomStation(name, url, genre, '', bitrate);
                    }

                    localStorage.setItem('customStations', JSON.stringify(customStations));
                }

                // Clear inputs
                nameInput.value = '';
                urlInput.value = '';
                if (genreInput) genreInput.value = '';
                if (bitrateInput) bitrateInput.value = '';

                populateGenres(); 
                renderMyCollection();
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

    if (infoBtn && infoModal && closeInfoBtn) {
        infoBtn.addEventListener('click', openInfo);
        closeInfoBtn.addEventListener('click', closeInfo);

        // Close when clicking outside
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) closeInfo();
        });
    }

    if (accountBtn && accountModal && closeAccountBtn) {
        accountBtn.addEventListener('click', openAccount);
        closeAccountBtn.addEventListener('click', closeAccount);

        // Close when clicking outside
        accountModal.addEventListener('click', (e) => {
            if (e.target === accountModal) closeAccount();
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
                <button class="rb-add-btn" data-url="${station.url_resolved}" data-name="${station.name}" data-tags="${station.tags}" data-bitrate="${station.bitrate || ''}">Add</button>
            `;
            rbResultsContainer.appendChild(item);
        });

        // Add event listeners for the "Add" buttons
        rbResultsContainer.querySelectorAll('.rb-add-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const targetBtn = e.target;
                const name = targetBtn.getAttribute('data-name');
                const url = targetBtn.getAttribute('data-url');
                const bitrate = targetBtn.getAttribute('data-bitrate');

                // Get the first tag as the genre (or default to 'Radio')
                const allTags = targetBtn.getAttribute('data-tags');
                let genre = 'Radio';
                if (allTags && allTags.trim() !== '') {
                    genre = allTags.split(',')[0].trim();
                    // Capitalize first letter
                    genre = genre.charAt(0).toUpperCase() + genre.slice(1);
                }

                await addStationFromDirectory(name, url, genre, bitrate);

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
    async function addStationFromDirectory(name, url, genre, bitrate = null) {
        if (window.IS_LOGGED_IN) {
            await addFavorite({ name, url, genre, bitrate: bitrate ? parseInt(bitrate, 10) : null });
            
            populateGenres();
            renderMyCollection();
            window.dispatchEvent(new CustomEvent('stationListUpdated'));
        } else {
            const customStations = JSON.parse(localStorage.getItem('customStations')) || [];
            let favoriteUrls = JSON.parse(localStorage.getItem('favoriteStations')) || [];

            // Avoid duplicate exact URLs
            const exists = customStations.some(s => s.url === url);
            if (!exists) {
                customStations.push({ name, url, genre, bitrate: bitrate ? parseInt(bitrate, 10) : null });
                localStorage.setItem('customStations', JSON.stringify(customStations));
                
                // Add to favorites automatically from directory
                if (!favoriteUrls.includes(url)) {
                    favoriteUrls.push(url);
                    localStorage.setItem('favoriteStations', JSON.stringify(favoriteUrls));
                }

                // Re-render the custom stations UI
                populateGenres();
                renderMyCollection();

                // Notify player to refresh the dropdown list
                window.dispatchEvent(new CustomEvent('stationListUpdated'));
            }
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
        const btnGroup = document.getElementById('header-btn-group');
        if (!btnGroup) return;

        let authBtn = document.getElementById('header-login-btn') || document.getElementById('header-logout-btn');
        let adminBtn = document.getElementById('header-admin-btn');
        let accountBtnHeader = document.getElementById('header-account-btn');
        
        const loginSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>`;
        const logoutSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`;
        const adminSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`;

        if (!authBtn) {
            authBtn = document.createElement('button');
            authBtn.className = 'theme-btn';
            authBtn.style.fontSize = '14px';
            authBtn.style.display = 'flex';
            authBtn.style.alignItems = 'center';
            // Insert auth btn before settings btn
            btnGroup.insertBefore(authBtn, document.getElementById('settings-btn'));
        }

        // Handle Admin Button Visibility
        if (window.IS_LOGGED_IN && window.USER_ROLE === 'admin') {
             if (!adminBtn) {
                 adminBtn = document.createElement('a');
                 adminBtn.id = 'header-admin-btn';
                 adminBtn.href = 'admin.php';
                 adminBtn.className = 'theme-btn';
                 adminBtn.style.fontSize = '14px';
                 adminBtn.style.display = 'flex';
                 adminBtn.style.alignItems = 'center';
                 adminBtn.style.textDecoration = 'none';
                 adminBtn.setAttribute('aria-label', 'Admin Control Panel');
                 adminBtn.title = 'Admin Control Panel';
                 adminBtn.innerHTML = adminSvg;
                 // Insert admin btn before auth btn
                 btnGroup.insertBefore(adminBtn, authBtn);
             }
        } else if (adminBtn) {
             adminBtn.remove();
        }

        // Handle Account Button Visibility
        const accountSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
        if (window.IS_LOGGED_IN) {
            if (!accountBtnHeader) {
                accountBtnHeader = document.createElement('button');
                accountBtnHeader.id = 'header-account-btn';
                accountBtnHeader.className = 'theme-btn';
                accountBtnHeader.style.fontSize = '14px';
                accountBtnHeader.style.display = 'flex';
                accountBtnHeader.style.alignItems = 'center';
                accountBtnHeader.setAttribute('aria-label', 'My Account');
                accountBtnHeader.title = 'My Account';
                accountBtnHeader.innerHTML = accountSvg;
                accountBtnHeader.onclick = openAccount;
                // Insert before logout/login button
                btnGroup.insertBefore(accountBtnHeader, authBtn);
            }
        } else if (accountBtnHeader) {
            accountBtnHeader.remove();
        }

        // Update properties based on state
        if (window.IS_LOGGED_IN) {
            authBtn.id = 'header-logout-btn';
            authBtn.innerHTML = logoutSvg;
            authBtn.setAttribute('aria-label', 'Logout');
            authBtn.title = 'Logout';
            authBtn.onclick = handleLogout;
        } else {
            authBtn.id = 'header-login-btn';
            authBtn.innerHTML = loginSvg;
            authBtn.setAttribute('aria-label', 'Login');
            authBtn.title = 'Login';
            authBtn.onclick = () => {
                if (loginModal) loginModal.style.display = 'flex';
            };
        }
    }

    // Hide or show #ad-space-main based on current auth state.
    // Needed because ads are injected server-side at page-load;
    // AJAX login/logout can't re-render PHP, so we update the DOM directly.
    function updateAdVisibility() {
        const adSection = document.getElementById('ad-space-main');
        if (!adSection) return;

        const isPrivileged = window.USER_ROLE === 'admin' || window.IS_PREMIUM === true;
        adSection.style.display = isPrivileged ? 'none' : '';
    }

    async function handleLogout() {
        try {
            const response = await fetch('api/auth.php?action=logout');
            const data = await response.json();
            if (data.status === 'success') {
                window.IS_LOGGED_IN = false;
                window.USER_ID = null;
                window.USER_ROLE = null;
                window.IS_PREMIUM = false;
                updateAuthButton();
                updateAdVisibility(); // restore ads for guests
                refreshAppData();
            }
        } catch (e) {
            console.error('Logout failed', e);
        }
    }

    async function refreshAppData() {
        await populateGenres();
        await renderMyCollection();
        window.dispatchEvent(new CustomEvent('stationListUpdated'));
        window.dispatchEvent(new CustomEvent('settingsOpened'));
    }

    /**
     * Detects guest favorites in localStorage and offers to sync them to the DB.
     */
    async function triggerFavoritesImport() {
        const customStations = JSON.parse(localStorage.getItem('customStations')) || [];
        const favoriteStations = JSON.parse(localStorage.getItem('favoriteStations')) || [];

        if (customStations.length === 0 && favoriteStations.length === 0) return;

        // Non-intrusive prompt
        if (confirm("Sync Local Favorites?\n\nWe found saved stations in this browser. Would you like to sync them to your account for access on any device?")) {
            try {
                const response = await fetch('api/import_favorites.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customStations, favoriteStations })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    // Successful sync: wipe localStorage to prevent duplicate prompts
                    localStorage.removeItem('customStations');
                    localStorage.removeItem('favoriteStations');
                    
                    // Re-render the collection to show combined results
                    await refreshAppData();
                    alert(data.message);
                } else {
                    console.error('Import API error:', data.message);
                }
            } catch (e) {
                console.error('Network error during favorites import:', e);
            }
        }
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

    if (loginPassInput) {
        loginPassInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                authLoginBtn.click();
            }
        });
    }

    if (authLoginBtn) {
        authLoginBtn.addEventListener('click', async () => {
            const email = loginEmailInput.value;
            const password = loginPassInput.value;
            const remember = document.getElementById('login-remember')?.checked || false;

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
                    body: JSON.stringify({ 
                        login_submit: 1, 
                        email, 
                        password,
                        remember
                    })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    window.IS_LOGGED_IN = true;
                    window.USER_ID = data.user_id;
                    window.USER_ROLE = data.role;
                    window.IS_PREMIUM = data.is_premium === true || data.is_premium === 1;
                    if (loginModal) loginModal.style.display = 'none';
                    updateAuthButton();
                    updateAdVisibility(); // hide ads immediately for admin/premium
                    await refreshAppData();
                    await triggerFavoritesImport();
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
                        window.IS_PREMIUM = data.user.is_premium === true || data.user.is_premium === 1;
                    }
                    
                    if (registerModal) registerModal.style.display = 'none';
                    
                    // Clear form
                    registerNameInput.value = '';
                    registerEmailInput.value = '';
                    registerPassInput.value = '';
                    registerConfirmPassInput.value = '';
                    
                    updateAuthButton();
                    updateAdVisibility(); // hide ads if new user is somehow privileged
                    await refreshAppData();
                    await triggerFavoritesImport();
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

function openInfo() {
    if (infoModal) infoModal.style.display = 'flex';
}

function closeInfo() {
    if (infoModal) infoModal.style.display = 'none';
}

function openAccount() {
    if (accountModal) accountModal.style.display = 'flex';
}

function closeAccount() {
    if (accountModal) accountModal.style.display = 'none';
}
