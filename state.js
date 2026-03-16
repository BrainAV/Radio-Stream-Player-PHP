export class StateManager {
    #state;
    #subscribers;

    constructor(initialState = {}) {
        this.#state = {
            audio: null,
            audioContext: null,
            source: null,
            analyserLeft: null,
            analyserRight: null,
            isPlaying: false,
            currentStation: localStorage.getItem('lastStation') || null,
            volume: (() => {
                const sv = parseFloat(localStorage.getItem('volume'));
                return isNaN(sv) ? 0.5 : sv;
            })(),
            vuStyle: (() => {
                if (window.USER_VU_STYLE) {
                    const idx = ['classic', 'led', 'circular', 'waveform', 'spectrum', 'retro', 'neon'].indexOf(window.USER_VU_STYLE);
                    if (idx !== -1) return idx;
                }
                const ls = parseInt(localStorage.getItem('vuStyle'), 10);
                if (!isNaN(ls)) return ls;
                
                // Also check if string was saved to localStorage
                const lsStr = localStorage.getItem('vuStyle');
                const idx = ['classic', 'led', 'circular', 'waveform', 'spectrum', 'retro', 'neon'].indexOf(lsStr);
                return idx !== -1 ? idx : 1;
            })(),
            metadataInterval: null,
            popoutWindow: null,
            animationFrameId: null,
            currentBitrate: null,
            ...initialState
        };
        this.#subscribers = [];
    }

    /**
     * Get a read-only copy of the current state.
     */
    getState() {
        // Return a shallow copy so subscribers don't accidentally mutate the private state object directly
        return { ...this.#state };
    }

    /**
     * Subscribe to state changes.
     * @param {Function} callback - A function that receives (newState, oldState)
     * @returns {Function} unsubscribe function
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            console.error("StateManager: Subscribe requires a callback function.");
            return () => {};
        }

        this.#subscribers.push(callback);

        // Return unsubscribe mechanism
        return () => {
            this.#subscribers = this.#subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Internal generic setter that triggers notifications if changes occur.
     */
    #setState(partialState) {
        const oldState = this.getState();
        let stateChanged = false;

        // Only update if the value actually changed to prevent infinite loops
        for (const key in partialState) {
            if (this.#state[key] !== partialState[key]) {
                this.#state[key] = partialState[key];
                stateChanged = true;
            }
        }

        if (stateChanged) {
            this.#notify(this.getState(), oldState);
        }
    }

    /**
     * Internal method to alert all headsets.
     */
    #notify(newState, oldState) {
        this.#subscribers.forEach(callback => {
            try {
                callback(newState, oldState);
            } catch (err) {
                console.error("StateManager: Subscription callback error:", err);
            }
        });
    }

    // --- Specific Domain Setters ---

    setPlaying(isPlaying) {
        this.#setState({ isPlaying: Boolean(isPlaying) });
    }

    setVolume(volume) {
        // Clamp volume between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, parseFloat(volume)));
        this.#setState({ volume: clampedVolume });
    }

    setStation(url) {
        this.#setState({ currentStation: url });
    }

    setVuStyle(index) {
        const parsed = parseInt(index, 10);
        this.#setState({ vuStyle: isNaN(parsed) ? 1 : parsed });
    }

    // We still allow direct setter/getter for complex API objects (like audio Contexts) 
    // that don't need UI reactivity, but it's safer to keep them centralized.
    setAudioInfrastructure(audio, context, source, left, right) {
         this.#setState({
             audio: audio,
             audioContext: context,
             source: source,
             analyserLeft: left,
             analyserRight: right
         });
    }

    setPopoutWindow(windowRef) {
        this.#setState({ popoutWindow: windowRef });
    }
    
    setMetadataInterval(intervalId) {
        this.#setState({ metadataInterval: intervalId });
    }

    setAnimationFrameId(id) {
         this.#setState({ animationFrameId: id });
    }

    setBitrate(kbps) {
        this.#setState({ currentBitrate: kbps });
    }
}

// Export a singleton instance
export const stateManager = new StateManager();
