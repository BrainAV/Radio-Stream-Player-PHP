import { stations, fetchStations } from './api.js';

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

function init() {
    // Merge default and custom stations
    const customStations = JSON.parse(localStorage.getItem('customStations')) || [];
    const allStations = [...stations, ...customStations];

    // Populate stations
    allStations.forEach(station => {
        const option = document.createElement('option');
        option.value = station.url;
        option.textContent = station.name;
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
}

async function start() {
    await fetchStations();
    init();
}

start();