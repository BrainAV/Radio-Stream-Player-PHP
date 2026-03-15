import { stations as defaultStations, fetchUserFavorites, addFavorite, removeFavorite } from './api.js';
import { stateManager } from './state.js';

export function initPlayer() {
    // DOM Elements
    const stationSelect = document.getElementById('station-select');
    const favoriteBtn = document.getElementById('favorite-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const popoutBtn = document.getElementById('popout-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const nowPlayingStation = document.getElementById('now-playing-station');
    const nowPlayingTrack = document.getElementById('now-playing-track');
    const popoutNotice = document.getElementById('popout-notice');

    const PROXY_URL = 'https://api.djay.ca/';

    // 1. Audio Infrastructure Setup MUST happen before any state subscriptions that might use it
    let currentState = stateManager.getState();
    if (!currentState.audio) {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(audioContext.destination);
        
        // Save infrastructure to state instantly
        stateManager.setAudioInfrastructure(audio, audioContext, source, null, null);
    }

    // --- State Reactivity (The Waiter's Headset) ---
    stateManager.subscribe((newState, oldState) => {
        // Play/Pause Changed
        if (newState.isPlaying !== oldState.isPlaying) {
            updatePlayPauseIcon(newState.isPlaying);
            updateMediaSession(newState);
            
            if (newState.isPlaying && newState.audio) {
                 const currentAudio = newState.audio;
                 if (newState.audioContext && newState.audioContext.state === 'suspended') {
                     newState.audioContext.resume();
                 }
                 currentAudio.play().catch(err => {
                     console.error('Playback failed:', err);
                     if (nowPlayingTrack) nowPlayingTrack.textContent = 'Error: Unable to play stream';
                     // Revert state if play failed
                     stateManager.setPlaying(false);
                 });
            } else if (!newState.isPlaying && newState.audio) {
                 newState.audio.pause();
            }
            updateNowPlaying(newState);
        }

        // Volume Changed
        if (newState.volume !== oldState.volume && newState.audio) {
            updateVolumeSliderTrack(newState.volume);
            newState.audio.volume = newState.volume;
            localStorage.setItem('volume', newState.volume);
            // Also keep the UI slider in sync if the state was changed programmatically via Media Keys
            if (volumeSlider.value != newState.volume) {
                volumeSlider.value = newState.volume;
            }
        }

        // Station Changed
        if (newState.currentStation !== oldState.currentStation) {
            if (newState.audio) {
                newState.audio.src = getProxiedAudioUrl(newState.currentStation);
            }
            localStorage.setItem('lastStation', newState.currentStation);
            
            // Sync the dropdown UI
            if (stationSelect.value !== newState.currentStation) {
                stationSelect.value = newState.currentStation;
            }

            updateFavoriteBtnState(newState.currentStation);
            updateNowPlaying(newState);
            
            if (newState.isPlaying && newState.audio) {
                newState.audio.play().catch(err => {
                    console.error('Playback failed:', err);
                    if (nowPlayingTrack) nowPlayingTrack.textContent = 'Error: Unable to play stream';
                    stateManager.setPlaying(false);
                });
            }
        }
        
        // Popout Changed
        if (newState.popoutWindow !== oldState.popoutWindow) {
             const playerContent = document.querySelector('.radiostream-player .player-content');
             if (newState.popoutWindow) {
                 playerContent.style.display = 'none';
                 if (popoutNotice) popoutNotice.style.display = 'block';
             } else {
                 playerContent.style.display = 'flex';
                 if (popoutNotice) popoutNotice.style.display = 'none';
             }
        }

        // Bitrate Changed
        if (newState.currentBitrate !== oldState.currentBitrate) {
            updateBitrateBadge(newState.currentBitrate);
        }
    });


    async function populateStations() {
        const state = stateManager.getState();
        const currentVal = stationSelect.value;
        stationSelect.innerHTML = '';

        let favorites = [];
        let customStations = [];

        if (window.IS_LOGGED_IN) {
            const dbStations = await fetchUserFavorites();
            favorites = dbStations.map(s => s.url);
            customStations = dbStations.filter(s => s.type === 'custom');
        } else {
            favorites = JSON.parse(localStorage.getItem('favoriteStations')) || [];
            customStations = JSON.parse(localStorage.getItem('customStations')) || [];
        }

        const allStations = [...defaultStations, ...customStations];

        const showFavoritesOnly = localStorage.getItem('favoritesOnly') === 'true';
        const declutterMode = localStorage.getItem('declutterMode') === 'true';
        let filteredStations = allStations;

        if (showFavoritesOnly) {
            filteredStations = filteredStations.filter(s => favorites.includes(s.url));
        } else if (declutterMode) {
            // Hide system stations (default type) if they aren't in favorites
            filteredStations = filteredStations.filter(s => 
                s.type !== 'default' || favorites.includes(s.url)
            );
        }

        const selectedGenre = localStorage.getItem('selectedGenre') || 'all';
        if (selectedGenre !== 'all') {
            filteredStations = filteredStations.filter(s => s.genre === selectedGenre);
        }

        filteredStations.forEach((station) => {
            const option = document.createElement('option');
            option.value = station.url;
            const isFav = favorites.includes(station.url);
            option.textContent = (isFav ? '★ ' : '') + station.name;
            option.dataset.genre = station.genre || '';
            option.dataset.country = station.country || '';
            option.dataset.bitrate = station.bitrate || '';
            stationSelect.appendChild(option);
        });

        // prioritize state.currentStation (the source of truth) over the previous DOM value
        const targetStation = state.currentStation || currentVal;
        
        if (targetStation && Array.from(stationSelect.options).some(opt => opt.value === targetStation)) {
            stationSelect.value = targetStation;
        } else if (filteredStations.length > 0) {
            // Default to first available if nothing is set or current selection is filtered out
            stationSelect.value = filteredStations[0].url;
            if (!state.currentStation) {
                stateManager.setStation(filteredStations[0].url);
            }
        }
        updateFavoriteBtnState(stateManager.getState().currentStation, favorites);
        updateMediaSession(stateManager.getState());
    }

    populateStations();
    window.addEventListener('stationListUpdated', populateStations);

    function updatePlayPauseIcon(isPlaying) {
        const playIcon = playPauseBtn.querySelector('.icon-play');
        const pauseIcon = playPauseBtn.querySelector('.icon-pause');
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }

    function updateVolumeSliderTrack(value) {
        const progress = value * 100;
        const bg = `linear-gradient(to right, var(--primary-color) ${progress}%, var(--border-color) ${progress}%)`;
        volumeSlider.style.background = bg;
    }

    function updateBitrateBadge(bitrate) {
        const badge = document.getElementById('bitrate-badge');
        if (!badge) return;

        if (bitrate && bitrate > 0) {
            badge.textContent = `${bitrate} kbps`;
            badge.style.display = 'block';
            
            // Apply quality colors
            badge.classList.remove('bitrate-high', 'bitrate-mid', 'bitrate-low');
            if (bitrate >= 192) {
                badge.classList.add('bitrate-high');
                badge.title = 'High Quality Stream';
            } else if (bitrate >= 128) {
                badge.classList.add('bitrate-mid');
                badge.title = 'Standard Quality Stream';
            } else {
                badge.classList.add('bitrate-low');
                badge.title = 'Low Quality / Mobile Stream';
            }
        } else {
            badge.style.display = 'none';
        }
    }

    async function updateFavoriteBtnState(currentUrl, cachedFavorites = null) {
        if (!favoriteBtn || !currentUrl) return;

        let favorites = [];
        if (cachedFavorites) {
            favorites = cachedFavorites;
        } else if (window.IS_LOGGED_IN) {
            const dbStations = await fetchUserFavorites();
            favorites = dbStations.map(s => s.url);
        } else {
            favorites = JSON.parse(localStorage.getItem('favoriteStations')) || [];
        }

        const isFav = favorites.includes(currentUrl);

        favoriteBtn.classList.toggle('active', isFav);
        favoriteBtn.title = isFav ? "Remove from Favorites" : "Add to Favorites";
    }

    function updateMediaSession(state, metadataTitle = null) {
        if (!('mediaSession' in navigator)) return;

        const selectedOption = stationSelect.options[stationSelect.selectedIndex];
        if (!selectedOption) return;

        const stationName = selectedOption.text.replace(/^★\s/, '');
        const genre = selectedOption.dataset.genre || 'Live Radio';
        const country = selectedOption.dataset.country || 'Internet';

        let displayTitle = stationName;
        let displayArtist = genre;
        let displayAlbum = country;

        if (metadataTitle) {
            // Try to split "Artist - Song"
            const parts = metadataTitle.split(' - ');
            if (parts.length >= 2) {
                displayArtist = parts[0].trim();
                displayTitle = parts.slice(1).join(' - ').trim();
                displayAlbum = stationName; // Use station name as Album when showing song info
            } else {
                displayTitle = metadataTitle;
                displayArtist = stationName;
                displayAlbum = genre;
            }
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: displayTitle,
            artist: displayArtist,
            album: displayAlbum,
            artwork: [
                { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }
            ]
        });

        navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
    }

    function getProxiedAudioUrl(url) {
        if (!url) return '';
        return `${PROXY_URL}?url=${encodeURIComponent(url)}`;
    }

    // Initial explicit UI sync based on starting state
    currentState = stateManager.getState();
    
    if (!currentState.currentStation) {
         stateManager.setStation(stationSelect.value);
    }
    
    // Set explicit starting volumes so UI catches up
    volumeSlider.value = currentState.volume;
    updateVolumeSliderTrack(currentState.volume);
    currentState.audio.volume = currentState.volume;
    updatePlayPauseIcon(currentState.isPlaying);
    
    if (currentState.currentStation) {
        currentState.audio.src = getProxiedAudioUrl(currentState.currentStation);
    }
    
    // Explicit sync for Play/Pause state from audio element back to StateManager
    // This handles cases where the browser pauses the audio (e.g. backgrounding, errors, or auto-play blocks)
    currentState.audio.addEventListener('play', () => {
        if (!stateManager.getState().isPlaying) {
            stateManager.setPlaying(true);
        }
    });

    currentState.audio.addEventListener('pause', () => {
        // Only set playing to false if we weren't just switching stations
        const st = stateManager.getState();
        if (st.isPlaying && st.audio.readyState >= 2) { // 2 = HAVE_CURRENT_DATA
            stateManager.setPlaying(false);
        }
    });

    // --- Audio Event Listeners (Auto-Reconnect) ---
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    async function checkStreamStatus(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, { 
                method: 'GET', // Using GET but with a small range to avoid downloading the whole stream
                headers: { 'Range': 'bytes=0-0' },
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            return response.status;
        } catch (err) {
            console.error("Status check failed:", err);
            return 0; // Network error
        }
    }

    async function handleStreamDrop(explicitError = null) {
        const state = stateManager.getState();
        if (!state.isPlaying) return;

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.log("Max reconnect attempts reached.");
            if (nowPlayingTrack) {
                nowPlayingTrack.textContent = "Stream disconnected. Tap Play to retry.";
                nowPlayingTrack.classList.remove('marquee-active');
            }
            stateManager.setPlaying(false);
            reconnectAttempts = 0;
            return;
        }

        reconnectAttempts++;
        const delay = Math.min(reconnectAttempts * 2000, 10000); // Backoff: 2s, 4s, 6s... max 10s

        if (nowPlayingTrack) {
            nowPlayingTrack.textContent = `Stream dropped. Retrying... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;
            nowPlayingTrack.classList.remove('marquee-active');
        }

        if (reconnectTimeout) clearTimeout(reconnectTimeout);

        console.log(`Stream dropped. Attempting to reconnect in ${delay/1000} seconds... (Attempt ${reconnectAttempts})`);
        
        // Diagnostic check
        const proxiedUrl = getProxiedAudioUrl(state.currentStation);
        const status = await checkStreamStatus(proxiedUrl);
        
        if (status === 502) {
            if (nowPlayingTrack) nowPlayingTrack.textContent = "Station Offline (502 Gateway Error)";
        } else if (status === 404) {
            if (nowPlayingTrack) nowPlayingTrack.textContent = "Stream Not Found (404 Error)";
        } else if (status === 0) {
            if (nowPlayingTrack) nowPlayingTrack.textContent = "Network error. Checking connection...";
        }

        reconnectTimeout = setTimeout(() => {
            const currentState = stateManager.getState();
            if (currentState.isPlaying) {
                console.log("Reconnecting...");
                currentState.audio.src = getProxiedAudioUrl(currentState.currentStation);
                currentState.audio.load();
                currentState.audio.play().catch(err => {
                    console.error('Reconnect failed:', err);
                    // Don't stop playing here, let the 'error' event trigger the next retry
                });
            }
        }, delay);
    }

    currentState.audio.addEventListener('error', (e) => { 
        console.error("Audio Element Error:", currentState.audio.error);
        handleStreamDrop(currentState.audio.error); 
    });
    currentState.audio.addEventListener('ended', () => { handleStreamDrop(); });
    currentState.audio.addEventListener('playing', () => {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        reconnectAttempts = 0;
        
        // Defer metadata fetch slightly to ensure audio buffer has priority
        const st = stateManager.getState();
        if (st.isPlaying && nowPlayingTrack) {
            setTimeout(() => {
                const latestState = stateManager.getState();
                if (latestState.isPlaying) {
                    fetchMetadata(latestState.currentStation);
                }
            }, 2000);
        }
    });

    // --- User UI Interactions ---
    playPauseBtn.addEventListener('click', () => {
        const isCurrentlyPlaying = stateManager.getState().isPlaying;
        stateManager.setPlaying(!isCurrentlyPlaying);
    });

    stationSelect.addEventListener('change', () => {
        stateManager.setBitrate(null); // Reset quality badge
        stateManager.setStation(stationSelect.value);
        // Auto-play on selection
        stateManager.setPlaying(true);
    });

    volumeSlider.addEventListener('input', () => {
        stateManager.setVolume(volumeSlider.value);
    });

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => stateManager.setPlaying(true));
        navigator.mediaSession.setActionHandler('pause', () => stateManager.setPlaying(false));
        navigator.mediaSession.setActionHandler('stop', () => stateManager.setPlaying(false));
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            let newIndex = stationSelect.selectedIndex - 1;
            if (newIndex < 0) newIndex = stationSelect.options.length - 1;
            stationSelect.selectedIndex = newIndex;
            stateManager.setStation(stationSelect.value);
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            let newIndex = stationSelect.selectedIndex + 1;
            if (newIndex >= stationSelect.options.length) newIndex = 0;
            stationSelect.selectedIndex = newIndex;
            stateManager.setStation(stationSelect.value);
        });
    }

    favoriteBtn?.addEventListener('click', async () => {
        const currentUrl = stateManager.getState().currentStation;
        const selectedOption = stationSelect.options[stationSelect.selectedIndex];
        const name = selectedOption ? selectedOption.text.replace(/^★\s/, '') : 'Saved Station';
        const genre = selectedOption ? (selectedOption.dataset.genre || '') : '';
        const country = selectedOption ? (selectedOption.dataset.country || '') : '';

        if (window.IS_LOGGED_IN) {
            // Check if already favorite
            const favorites = await fetchUserFavorites();
            const isFav = favorites.some(s => s.url === currentUrl);

            if (isFav) {
                await removeFavorite(currentUrl);
            } else {
                const bitrate = selectedOption.dataset.bitrate ? parseInt(selectedOption.dataset.bitrate, 10) : null;
                await addFavorite({ name, url: currentUrl, genre, country, bitrate });
            }
        } else {
            let favorites = JSON.parse(localStorage.getItem('favoriteStations')) || [];

            if (favorites.includes(currentUrl)) {
                favorites = favorites.filter(url => url !== currentUrl);
            } else {
                favorites.push(currentUrl);
                let customStations = JSON.parse(localStorage.getItem('customStations')) || [];
                const allKnown = [...defaultStations, ...customStations];
                if (!allKnown.some(s => s.url === currentUrl)) {
                    const bitrate = selectedOption.dataset.bitrate ? parseInt(selectedOption.dataset.bitrate, 10) : null;
                    customStations.push({ name, url: currentUrl, genre, bitrate });
                    localStorage.setItem('customStations', JSON.stringify(customStations));
                }
            }
            localStorage.setItem('favoriteStations', JSON.stringify(favorites));
        }

        populateStations();
        window.dispatchEvent(new CustomEvent('stationListUpdated'));
    });


    // --- Popout Logic ---
    if (popoutBtn) {
        popoutBtn.addEventListener('click', () => {
            const st = stateManager.getState();
            if (st.popoutWindow && !st.popoutWindow.closed) {
                st.popoutWindow.focus();
                return;
            }

            if (st.isPlaying) {
                stateManager.setPlaying(false);
            }

            const themeClass = document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light';
            const savedBg = localStorage.getItem('customBackground') || '';
            const popoutUrl = `popout.php?station=${encodeURIComponent(st.currentStation)}&theme=${themeClass}&bg=${encodeURIComponent(savedBg)}`;
            
            const newWindow = window.open(popoutUrl, 'RadioStreamPopout', 'width=320,height=390');
            stateManager.setPopoutWindow(newWindow);

            const popoutCheckInterval = setInterval(() => {
                const updatedState = stateManager.getState();
                if (updatedState.popoutWindow && updatedState.popoutWindow.closed) {
                    clearInterval(popoutCheckInterval);
                    handlePopoutClose();
                }
            }, 500);
        });

        window.addEventListener('message', (event) => {
            if (event.data.type === 'popoutClosed') {
                handlePopoutClose();
            }
        });
    }

    window.addEventListener('beforeunload', cleanup);

    function handlePopoutClose() {
        const st = stateManager.getState();
        if (!st.popoutWindow && !window.opener) return;
        
        stateManager.setPopoutWindow(null);
        stateManager.setPlaying(true);
    }

    // --- Metadata Polling ---
    async function fetchMetadata(streamUrl) {
        if (!nowPlayingTrack) return;

        try {
            const response = await fetch(`${PROXY_URL}metadata?url=${encodeURIComponent(streamUrl)}`);
            const data = await response.json();

            if (data.status === 'error') {
                console.warn("Metadata proxy returned error:", data.message);
                // If the proxy says the stream is offline, we should know
                if (data.message && data.message.includes('502')) {
                    if (nowPlayingTrack) nowPlayingTrack.textContent = "Station Offline (502)";
                }
            }

            if (data.title) {
                nowPlayingTrack.textContent = data.title;
                document.title = `${data.title} | Radio Stream Player`;
                if (nowPlayingTrack.scrollWidth > nowPlayingTrack.parentElement.clientWidth) {
                    nowPlayingTrack.classList.add('marquee-active');
                } else {
                    nowPlayingTrack.classList.remove('marquee-active');
                }
            } else {
                const stationName = stationSelect.options[stationSelect.selectedIndex]?.text.replace(/^★\s/, '') || 'Live Stream';
                nowPlayingTrack.textContent = stationName;
                document.title = `Now Playing: ${stationName} | Radio Stream Player`;
                nowPlayingTrack.classList.remove('marquee-active');
            }

            // Update bitrate if available in metadata
            // Normalize bitrate key if it varies by proxy implementation
            let bitrate = data.bitrate || data.br || null;
            
            // If still missing, attempt to sniff from headers
            if (!bitrate) {
                bitrate = await sniffBitrateFromHeaders(streamUrl);
            }

            if (bitrate) {
                stateManager.setBitrate(parseInt(bitrate, 10));
            }

            updateMediaSession(stateManager.getState(), data.title || null);
        } catch (error) {
            console.error("Failed to fetch stream metadata:", error);
            // Don't overwrite the "Reconnecting" text if we are in a drop state
            if (!reconnectAttempts) {
                nowPlayingTrack.textContent = stationSelect.options[stationSelect.selectedIndex]?.text.replace(/^★\s/, '');
            }
            nowPlayingTrack.classList.remove('marquee-active');
            updateMediaSession(stateManager.getState());
        }
    }

    /**
     * Diagnostic: Try to extract bitrate from HTTP headers (ICY-BR)
     */
    async function sniffBitrateFromHeaders(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for sniff

        try {
            const proxiedUrl = getProxiedAudioUrl(url);
            const response = await fetch(proxiedUrl, { 
                method: 'GET', 
                headers: { 'Range': 'bytes=0-0' },
                signal: controller.signal
            });
            
            // Immediately abort the stream after receiving headers
            controller.abort();
            
            // Check common bitrate headers
            const brHeaders = ['icy-br', 'bitrate', 'x-audiocast-bitrate'];
            for (const h of brHeaders) {
                const val = response.headers.get(h);
                if (val) return val;
            }
            return null;
        } catch (e) {
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function updateNowPlaying(state) {
        if (!nowPlayingStation || !nowPlayingTrack) return;

        const selectedOption = stationSelect.options[stationSelect.selectedIndex];
        if (!selectedOption) return;

        const stationName = selectedOption.text.replace(/^★\s/, '');
        nowPlayingStation.textContent = `Now Playing: ${stationName}`;

        if (state.metadataInterval) {
            clearInterval(state.metadataInterval);
            stateManager.setMetadataInterval(null);
        }

        const streamUrl = state.currentStation;

        if (state.isPlaying) {
            nowPlayingTrack.textContent = "Loading track info...";
            nowPlayingTrack.classList.remove('marquee-active');
            
            // Set initial bitrate from station metadata if available as a fallback
            const staticBitrate = selectedOption.dataset.bitrate;
            if (staticBitrate) {
                stateManager.setBitrate(parseInt(staticBitrate, 10));
            }

            // We no longer call fetchMetadata(streamUrl) here immediately.
            // It will be triggered by the 'playing' event or the interval below
            // to ensure the music gets bandwidth priority first.
        } else {
            nowPlayingTrack.textContent = "Ready to play...";
            document.title = "Radio Stream Player";
            nowPlayingTrack.classList.remove('marquee-active');
            stateManager.setBitrate(null); // Clear badge on stop
            updateMediaSession(state);
        }

        const newInterval = setInterval(() => {
            if (stateManager.getState().isPlaying) {
                fetchMetadata(streamUrl);
            }
        }, 12000);
        
        stateManager.setMetadataInterval(newInterval);
    }

    function cleanup() {
        const st = stateManager.getState();
        if (st.isPlaying) {
            stateManager.setPlaying(false);
        }
        if (st.animationFrameId) {
            cancelAnimationFrame(st.animationFrameId);
        }
        if (st.metadataInterval) {
            clearInterval(st.metadataInterval);
        }
    }
}