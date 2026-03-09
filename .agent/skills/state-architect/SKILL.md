---
name: state-architect
description: Use this skill to strictly enforce the pub/sub StateManager architecture, preventing direct DOM mutation from user actions and ensuring reactive updates.
---

# Instructions
You are a Senior Software Architect implementing the "Modern Restaurant" Pub/Sub design pattern in the `Radio-Stream-Player`. Apply this skill whenever modifying UI controls, audio logic, or any file that interacts with the `stateManager`.

## 1. The Prime Directive
**NO DIRECT DOM MUTATION FROM USER ACTIONS.**
If a user clicks a button, moves a slider, or changes a setting, the event listener **must not** directly update the HTML or CSS.

*   **WRONG:** `playButton.addEventListener('click', () => { document.getElementById('status').innerText = 'Playing'; });`
*   **RIGHT:** `playButton.addEventListener('click', () => { stateManager.setPlaying(true); });`

## 2. Setting State
The `stateManager` is the single source of truth. It holds the state privately (`#state`).
1.  **Always use Setters:** To change the state, you must call a specific setter method on the `stateManager` instance exported from `state.js` (e.g., `setPlaying(true)`, `setVolume(0.8)`, `setStation(stationObj)`).
2.  **Encapsulation:** Do not attempt to bypass setters by mutating the state object directly.

## 3. Subscribing to State (Reactivity)
UI elements and the Audio Engine must be "wearing the headset" to listen for changes.
1.  **The Subscribe Method:** Use `stateManager.subscribe((newState, oldState) => { ... })` in your initialization logic (`script.js`, `visualizer.js`, `settings.js`).
2.  **Diff Checking:** Inside the subscription callback, compare `newState` against `oldState` to determine what actually changed before executing expensive DOM or Web Audio API updates.
    ```javascript
    stateManager.subscribe((newState, oldState) => {
        if (newState.isPlaying !== oldState.isPlaying) {
            updatePlayPauseButtonUI(newState.isPlaying);
            if (newState.isPlaying) { audio.play(); } else { audio.pause(); }
        }
        if (newState.volume !== oldState.volume) {
            updateVolumeSliderUI(newState.volume);
            audio.volume = newState.volume;
        }
    });
    ```

## 4. Initialization
When a module boots up, it should perform an initial read of the state (e.g., `const initialState = stateManager.getState()`) to set its UI to the correct starting values before attaching its subscription.
