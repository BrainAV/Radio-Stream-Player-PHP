import { stations, fetchStations, fetchUserFavorites } from './api.js';

const stationSelect = document.getElementById('station-select');
const playPauseBtn = document.getElementById('play-pause-btn');
const volumeSlider = document.getElementById('volume-slider');
const nowPlayingStation = document.getElementById('now-playing-station');
const nowPlayingTrack = document.getElementById('now-playing-track');

const PROXY_URL = 'https://api.djay.ca/';
let metadataInterval = null;

const audio = new Audio();
audio.crossOrigin = 'anonymous';

let isPlaying = false;

// Helper: Determine the actual URL to feed the audio element
function getProxiedAudioUrl(url) {
    if (!url) return '';
    // Route ALL streams through our secure proxy to inject CORS headers.
    return `${PROXY_URL}?url=${encodeURIComponent(url)}`;
}

// --- UI Update Functions ---

function updatePlayPauseIcon(playing) {
    const playIcon = playPauseBtn.querySelector('.icon-play');
    const pauseIcon = playPauseBtn.querySelector('.icon-pause');
    if (playIcon && pauseIcon) {
        playIcon.style.display = playing ? 'none' : 'block';
        pauseIcon.style.display = playing ? 'block' : 'none';
    }
}

function updateVolumeSliderTrack(value) {
    const progress = value * 100;
    // Note: We need to get the CSS variables from the document to use them here.
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
    volumeSlider.style.background = `linear-gradient(to right, ${primaryColor} ${progress}%, ${borderColor} ${progress}%)`;
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
            const stationName = stationSelect.options[stationSelect.selectedIndex]?.text || '';
            nowPlayingTrack.textContent = stationName;
            nowPlayingTrack.classList.remove('marquee-active');
        }

        if (data.bitrate) {
            updateBitrateBadge(parseInt(data.bitrate, 10));
        }
    } catch (error) {
        nowPlayingTrack.textContent = stationSelect.options[stationSelect.selectedIndex]?.text || '';
        nowPlayingTrack.classList.remove('marquee-active');
    }
}

function updateNowPlaying() {
    if (!nowPlayingStation || !nowPlayingTrack) return;

    const selectedOption = stationSelect.options[stationSelect.selectedIndex];
    if (!selectedOption) return;

    nowPlayingStation.textContent = `Now Playing: ${selectedOption.text}`;

    nowPlayingTrack.textContent = "Loading string info...";
    nowPlayingTrack.classList.remove('marquee-active');

    if (metadataInterval) {
        clearInterval(metadataInterval);
        metadataInterval = null;
    }

    const streamUrl = stationSelect.value;

    if (isPlaying) {
        nowPlayingTrack.textContent = "Loading track info...";
        nowPlayingTrack.classList.remove('marquee-active');
        fetchMetadata(streamUrl);
    } else {
        nowPlayingTrack.textContent = "Ready to play...";
        nowPlayingTrack.classList.remove('marquee-active');
        updateBitrateBadge(null); // Clear on stop
    }

    metadataInterval = setInterval(() => {
        if (isPlaying) fetchMetadata(streamUrl);
    }, 12000);
}

// --- Player Logic ---

function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        audio.play().catch(err => {
            console.error('Playback failed:', err);
            if (nowPlayingTrack) nowPlayingTrack.textContent = 'Error: Unable to play stream';
            isPlaying = false;
        });
    } else {
        audio.pause();
    }
    updatePlayPauseIcon(isPlaying);
    updateNowPlaying();
}

// --- Event Listeners ---

playPauseBtn.addEventListener('click', togglePlay);

stationSelect.addEventListener('change', () => {
    updateBitrateBadge(null); // Clear on change
    audio.src = getProxiedAudioUrl(stationSelect.value);
    updateNowPlaying();
    if (isPlaying) {
        audio.play();
    }
});

volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value;
    updateVolumeSliderTrack(audio.volume);
});

// Notify main window when pop-out is closed
window.addEventListener('beforeunload', () => {
    if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'popoutClosed' }, '*');
    }
});

// --- Initialization ---

async function init() {
    // --- Build Station List (mirrors main player logic) ---
    // Since popout.html is same-origin, the PHP session cookie is included
    // automatically in any fetch() to api/favorites.php. If the user is
    // logged in their full DB-backed list is returned; guests get a 401
    // which we catch and fall back to localStorage.

    let favorites = []; // list of URLs that are "favourited"
    let customStations = [];

    try {
        const dbStations = await fetchUserFavorites();
        if (dbStations && dbStations.length > 0) {
            // Logged-in path: DB has the full merged list
            favorites = dbStations.map(s => s.url);
            customStations = dbStations.filter(s => s.type === 'custom');
        }
        // If dbStations is empty array the user may be a guest or just has
        // no saved stations — fall through to localStorage below.
    } catch (e) {
        // Unauthenticated (401) or network error — use localStorage
    }

    if (favorites.length === 0) {
        // Guest path: read from localStorage
        favorites = JSON.parse(localStorage.getItem('favoriteStations')) || [];
        customStations = JSON.parse(localStorage.getItem('customStations')) || [];
    }

    let allStations = [...stations, ...customStations];

    // Remove duplicates (a custom station URL that already appears in defaults)
    const seenUrls = new Set();
    allStations = allStations.filter(s => {
        if (seenUrls.has(s.url)) return false;
        seenUrls.add(s.url);
        return true;
    });

    // Apply "Show Favorites Only" filter (shared via localStorage)
    const showFavoritesOnly = localStorage.getItem('favoritesOnly') === 'true';
    if (showFavoritesOnly) {
        allStations = allStations.filter(s => favorites.includes(s.url));
    }

    // Apply Genre filter (shared via localStorage)
    const selectedGenre = localStorage.getItem('selectedGenre') || 'all';
    if (selectedGenre !== 'all') {
        allStations = allStations.filter(s => s.genre === selectedGenre);
    }

    // Populate the station dropdown
    stationSelect.innerHTML = '';
    allStations.forEach(station => {
        const option = document.createElement('option');
        option.value = station.url;
        const isFav = favorites.includes(station.url);
        option.textContent = (isFav ? '★ ' : '') + station.name;
        stationSelect.appendChild(option);
    });

    // Get initial state from URL
    const params = new URLSearchParams(window.location.search);
    const initialStation = params.get('station');
    const theme = params.get('theme');

    // Apply theme
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    }

    // Apply shared background from main player (passed via ?bg= param)
    const bgParam = params.get('bg');
    if (bgParam) {
        document.body.style.backgroundImage = `url('${bgParam}')`;
    }

    // Set initial station and volume
    if (initialStation) {
        stationSelect.value = initialStation;
        audio.src = getProxiedAudioUrl(initialStation);
    } else {
        if (stationSelect.options.length > 0) {
            audio.src = getProxiedAudioUrl(stationSelect.value);
        }
    }

    // For simplicity, start with a default volume
    const initialVolume = 0.5;
    audio.volume = initialVolume;
    volumeSlider.value = initialVolume;
    updateVolumeSliderTrack(initialVolume);
    updateNowPlaying();
    updatePlayPauseIcon(false);

    // Auto-start playback — the popout opens ready to listen
    togglePlay();
}

async function start() {
    await fetchStations();
    await init();
}

start();