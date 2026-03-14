import { fetchStations } from './api.js';
import { initPlayer } from './player.js';
import { initVisualizer } from './visualizer.js';
import { stateManager } from './state.js';
import { initSettings } from './settings.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Apply custom background if saved
    const savedBg = localStorage.getItem('customBackground');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
    }

    if (document.getElementById('station-select')) {
        
        // Wait for database stations before initializing player and settings
        await fetchStations();
        
        // Initialize settings logic (genres, modals, listeners)
        initSettings();

        // Initialize the core player logic
        initPlayer();

        // Once the player has created the audio context and source, initialize the visualizer
        const state = stateManager.getState();
        if (state.audioContext && state.source) {
            initVisualizer();
        }
    }
});

// Service Worker Registration for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('[PWA] Service Worker registered', reg))
            .catch(err => console.log('[PWA] Service Worker registration failed', err));
    });
}

