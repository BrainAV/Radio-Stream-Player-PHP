import { stations as defaultStations } from './api.js';
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
    });


    function populateStations() {
        const state = stateManager.getState();
        const currentVal = stationSelect.value;
        stationSelect.innerHTML = '';

        const favorites = JSON.parse(localStorage.getItem('favoriteStations')) || [];
        const customStations = JSON.parse(localStorage.getItem('customStations')) || [];
        const allStations = [...defaultStations, ...customStations];

        const showFavoritesOnly = localStorage.getItem('favoritesOnly') === 'true';
        let filteredStations = allStations;

        if (showFavoritesOnly) {
            filteredStations = filteredStations.filter(s => favorites.includes(s.url));
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
            stationSelect.appendChild(option);
        });

        if (currentVal && Array.from(stationSelect.options).some(opt => opt.value === currentVal)) {
            stationSelect.value = currentVal;
        } else if (filteredStations.length > 0 && !state.currentStation) {
            // Initial load edge case: no station in state yet
            stationSelect.value = filteredStations[0].url;
            stateManager.setStation(filteredStations[0].url);
        }
        updateFavoriteBtnState(stateManager.getState().currentStation);
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

    function updateFavoriteBtnState(currentUrl) {
        if (!favoriteBtn || !currentUrl) return;
        const favorites = JSON.parse(localStorage.getItem('favoriteStations')) || [];
        const isFav = favorites.includes(currentUrl);

        favoriteBtn.classList.toggle('active', isFav);
        favoriteBtn.title = isFav ? "Remove from Favorites" : "Add to Favorites";
    }

    function updateMediaSession(state) {
        if (!('mediaSession' in navigator)) return;

        const selectedOption = stationSelect.options[stationSelect.selectedIndex];
        if (!selectedOption) return;

        const stationName = selectedOption.text.replace(/^★\s/, '');
        const genre = selectedOption.dataset.genre || 'Live Radio';
        const country = selectedOption.dataset.country || 'Internet';

        navigator.mediaSession.metadata = new MediaMetadata({
            title: stationName,
            artist: genre,
            album: country,
            artwork: [
                { src: 'https://cdn-icons-png.flaticon.com/512/565/565535.png', sizes: '512x512', type: 'image/png' }
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

    
    // --- Audio Event Listeners (Auto-Reconnect) ---
    let reconnectTimeout = null;

    function handleStreamDrop() {
        const state = stateManager.getState();
        if (!state.isPlaying) return;

        if (nowPlayingTrack) {
            nowPlayingTrack.textContent = "Reconnecting...";
            nowPlayingTrack.classList.remove('marquee-active');
        }

        if (reconnectTimeout) clearTimeout(reconnectTimeout);

        console.log("Stream dropped. Attempting to reconnect in 3 seconds...");
        reconnectTimeout = setTimeout(() => {
            const currentState = stateManager.getState();
            if (currentState.isPlaying) {
                console.log("Reconnecting...");
                currentState.audio.src = getProxiedAudioUrl(currentState.currentStation);
                currentState.audio.load();
                currentState.audio.play().catch(err => {
                    console.error('Reconnect failed:', err);
                    if (nowPlayingTrack) nowPlayingTrack.textContent = 'Reconnect failed. Retry play.';
                    stateManager.setPlaying(false);
                });
            }
        }, 3000);
    }

    currentState.audio.addEventListener('error', () => { handleStreamDrop(); });
    currentState.audio.addEventListener('ended', () => { handleStreamDrop(); });
    currentState.audio.addEventListener('playing', () => {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        const st = stateManager.getState();
        if (st.isPlaying && nowPlayingTrack && (nowPlayingTrack.textContent === "Reconnecting..." || nowPlayingTrack.textContent.includes("Reconnect failed"))) {
            fetchMetadata(st.currentStation);
        }
    });

    // --- User UI Interactions ---
    playPauseBtn.addEventListener('click', () => {
        const isCurrentlyPlaying = stateManager.getState().isPlaying;
        stateManager.setPlaying(!isCurrentlyPlaying);
    });

    stationSelect.addEventListener('change', () => {
        stateManager.setStation(stationSelect.value);
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

    favoriteBtn?.addEventListener('click', () => {
        const currentUrl = stateManager.getState().currentStation;
        let favorites = JSON.parse(localStorage.getItem('favoriteStations')) || [];

        if (favorites.includes(currentUrl)) {
            favorites = favorites.filter(url => url !== currentUrl);
        } else {
            favorites.push(currentUrl);
            let customStations = JSON.parse(localStorage.getItem('customStations')) || [];
            const allKnown = [...defaultStations, ...customStations];
            if (!allKnown.some(s => s.url === currentUrl)) {
                const selectedOption = stationSelect.options[stationSelect.selectedIndex];
                const name = selectedOption ? selectedOption.text.replace(/^★\s/, '') : 'Saved Station';
                const genre = selectedOption ? (selectedOption.dataset.genre || '') : '';
                customStations.push({ name, url: currentUrl, genre });
                localStorage.setItem('customStations', JSON.stringify(customStations));
            }
        }

        localStorage.setItem('favoriteStations', JSON.stringify(favorites));
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
            const popoutUrl = `popout.html?station=${encodeURIComponent(st.currentStation)}&theme=${themeClass}`;
            
            const newWindow = window.open(popoutUrl, 'RadioStreamPopout', 'width=300,height=278');
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

            if (data.title) {
                nowPlayingTrack.textContent = data.title;
                if (nowPlayingTrack.scrollWidth > nowPlayingTrack.parentElement.clientWidth) {
                    nowPlayingTrack.classList.add('marquee-active');
                } else {
                    nowPlayingTrack.classList.remove('marquee-active');
                }
            } else {
                const stationName = stationSelect.options[stationSelect.selectedIndex]?.text.replace(/^★\s/, '') || 'Live Stream';
                nowPlayingTrack.textContent = stationName;
                nowPlayingTrack.classList.remove('marquee-active');
            }
        } catch (error) {
            console.error("Failed to fetch stream metadata:", error);
            nowPlayingTrack.textContent = stationSelect.options[stationSelect.selectedIndex]?.text.replace(/^★\s/, '');
            nowPlayingTrack.classList.remove('marquee-active');
        }

        updateMediaSession(stateManager.getState());
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
            fetchMetadata(streamUrl);
        } else {
            nowPlayingTrack.textContent = "Ready to play...";
            nowPlayingTrack.classList.remove('marquee-active');
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