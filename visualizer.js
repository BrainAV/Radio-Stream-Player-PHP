export const VU_STYLES = [
    'classic', 'led', 'circular', 'waveform', 'spectrum', 'retro', 'neon'
];

import { stateManager } from './state.js';

let leftVu, rightVu, vuMeters;
let analyserLeft, analyserRight;
let dataArrayLeft, dataArrayRight, frequencyDataLeft, frequencyDataRight;

export function initVisualizer() {
    const state = stateManager.getState();
    
    // Get DOM elements
    leftVu = document.getElementById('left-vu');
    rightVu = document.getElementById('right-vu');
    vuMeters = document.querySelector('.vu-meters');

    // Create and connect analyser nodes
    const splitter = state.audioContext.createChannelSplitter(2);
    analyserLeft = state.audioContext.createAnalyser();
    analyserRight = state.audioContext.createAnalyser();
    analyserLeft.fftSize = 1024;
    analyserRight.fftSize = 1024;

    state.source.connect(splitter);
    splitter.connect(analyserLeft, 0);
    splitter.connect(analyserRight, 1);

    // Store analysers back into state for potential future use by other modules
    stateManager.setAudioInfrastructure(state.audio, state.audioContext, state.source, analyserLeft, analyserRight);

    // Prepare data arrays
    const bufferLength = analyserLeft.frequencyBinCount;
    dataArrayLeft = new Uint8Array(bufferLength);
    dataArrayRight = new Uint8Array(bufferLength);
    frequencyDataLeft = new Uint8Array(bufferLength);
    frequencyDataRight = new Uint8Array(bufferLength);

    // Initial setup
    updateVuStyle(stateManager.getState().vuStyle);
    updateVUMeters();
    
    // React to state changes
    stateManager.subscribe((newState, oldState) => {
        if (newState.vuStyle !== oldState.vuStyle) {
            updateVuStyle(newState.vuStyle);
            if (!newState.isPlaying) {
                 resetVuMeters(newState.vuStyle);
            }
        }
        
        // If playback stops, reset the meters
        if (!newState.isPlaying && oldState.isPlaying) {
            resetVuMeters(newState.vuStyle);
        }
    });
}

function updateVuStyle(vuStyleIndex) {
    const currentStyle = VU_STYLES[vuStyleIndex];
    vuMeters.className = `vu-meters vu-${currentStyle}`;

    // Clear existing content and rebuild based on style
    leftVu.innerHTML = '';
    rightVu.innerHTML = '';

    switch (currentStyle) {
        case 'classic':
            createClassicVu(leftVu, 'left');
            createClassicVu(rightVu, 'right');
            break;
        case 'led':
            createLedVu(leftVu, 'left');
            createLedVu(rightVu, 'right');
            break;
        case 'circular':
            createCircularVu(leftVu, 'left');
            createCircularVu(rightVu, 'right');
            break;
        case 'waveform':
            createWaveformVu(leftVu, 'left');
            createWaveformVu(rightVu, 'right');
            break;
        case 'spectrum':
            createSpectrumVu(leftVu, 'left');
            createSpectrumVu(rightVu, 'right');
            break;
        case 'retro':
            createRetroVu(leftVu, 'left');
            createRetroVu(rightVu, 'right');
            break;
        case 'neon':
            createNeonVu(leftVu, 'left');
            createNeonVu(rightVu, 'right');
            break;
    }
}

function createClassicVu(container, channel) {
    const level = document.createElement('div');
    level.className = 'vu-level';
    level.id = `${channel}-vu-level`;
    container.appendChild(level);
}

function createLedVu(container, channel) {
    const ledContainer = document.createElement('div');
    ledContainer.className = 'led-container';
    for (let i = 0; i < 20; i++) {
        const led = document.createElement('div');
        led.className = 'led-segment';
        led.dataset.index = i;
        ledContainer.appendChild(led);
    }
    container.appendChild(ledContainer);
}

function createCircularVu(container, channel) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 34 34');
    svg.setAttribute('width', '30');
    svg.setAttribute('height', '30');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '17');
    circle.setAttribute('cy', '17');
    circle.setAttribute('r', '13');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', 'currentColor');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('stroke-opacity', '0.2');
    
    const levelCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    levelCircle.setAttribute('cx', '17');
    levelCircle.setAttribute('cy', '17');
    levelCircle.setAttribute('r', '13');
    levelCircle.setAttribute('fill', 'none');
    levelCircle.setAttribute('stroke', '#00ff00');
    levelCircle.setAttribute('stroke-width', '4');
    levelCircle.setAttribute('stroke-linecap', 'round');
    levelCircle.setAttribute('stroke-dasharray', '81.68');
    levelCircle.setAttribute('stroke-dashoffset', '81.68');
    levelCircle.setAttribute('transform', 'rotate(-90 17 17)');
    levelCircle.id = `${channel}-circular-level`;
    levelCircle.setAttribute('class', 'circular-level');
    
    svg.appendChild(circle);
    svg.appendChild(levelCircle);
    container.appendChild(svg);
}

function createWaveformVu(container, channel) {
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 100;
    canvas.className = 'waveform-canvas';
    container.appendChild(canvas);
}

function createSpectrumVu(container, channel) {
    const spectrumContainer = document.createElement('div');
    spectrumContainer.className = 'spectrum-container';
    for (let i = 0; i < 16; i++) {
        const bar = document.createElement('div');
        bar.className = 'spectrum-bar';
        bar.dataset.index = i;
        spectrumContainer.appendChild(bar);
    }
    container.appendChild(spectrumContainer);
}

function createRetroVu(container, channel) {
    const retro = document.createElement('div');
    retro.className = 'retro-vu';
    const needle = document.createElement('div');
    needle.className = 'retro-needle';
    const scale = document.createElement('div');
    scale.className = 'retro-scale';
    scale.innerHTML = '0&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;40&nbsp;&nbsp;&nbsp;60&nbsp;&nbsp;&nbsp;80&nbsp;&nbsp;&nbsp;100';
    retro.appendChild(scale);
    retro.appendChild(needle);
    container.appendChild(retro);
}

function createNeonVu(container, channel) {
    const level = document.createElement('div');
    level.className = 'neon-level';
    level.id = `${channel}-neon-level`;
    container.appendChild(level);
}

function updateVUMeters() {
    const reqId = requestAnimationFrame(updateVUMeters);
    stateManager.setAnimationFrameId(reqId);

    const state = stateManager.getState();

    // If analyser nodes haven't been setup yet or we are paused, abort loop execution
    if (!analyserLeft || !analyserRight || !state.isPlaying) {
        return;
    }

    analyserLeft.getByteTimeDomainData(dataArrayLeft);
    analyserRight.getByteTimeDomainData(dataArrayRight);
    analyserLeft.getByteFrequencyData(frequencyDataLeft);
    analyserRight.getByteFrequencyData(frequencyDataRight);

    let levelLeft = calculateRMSLevel(dataArrayLeft);
    let levelRight = calculateRMSLevel(dataArrayRight);

    // Mono detection: if right channel is silent (~0) but left is active (>1%), 
    // it's likely a mono stream being played through a stereo AnalyserNode.
    // Mirror the left data to the right for a balanced visualization.
    if (levelLeft > 1.0 && levelRight < 0.2) {
        levelRight = levelLeft;
        dataArrayRight.set(dataArrayLeft);
        frequencyDataRight.set(frequencyDataLeft);
    }

    const currentStyle = VU_STYLES[state.vuStyle];
    switch (currentStyle) {
        case 'classic': updateClassicVu(levelLeft, levelRight); break;
        case 'led': updateLedVu(levelLeft, levelRight); break;
        case 'circular': updateCircularVu(levelLeft, levelRight); break;
        case 'waveform': updateWaveformVu(); break;
        case 'spectrum': updateSpectrumVu(); break;
        case 'retro': updateRetroVu(levelLeft, levelRight); break;
        case 'neon': updateNeonVu(levelLeft, levelRight); break;
    }

    // Audio Reactive Logo: Update the --logo-reactivity CSS variable
    updateLogoReactivity(levelLeft, levelRight);
}

function updateLogoReactivity(levelLeft, levelRight) {
    const avgLevel = (levelLeft + levelRight) / 2; // Level is 0-100
    const normalizedLevel = avgLevel / 100; // 0-1
    const logo = document.querySelector('.radio-logo');
    
    if (logo) {
        // Smoothing factor (Lerp)
        const currentReactivity = parseFloat(logo.style.getPropertyValue('--logo-reactivity')) || 0;
        const newReactivity = currentReactivity + (normalizedLevel - currentReactivity) * 0.3;
        
        logo.style.setProperty('--logo-reactivity', newReactivity.toFixed(3));

        // Peak Color Logic: Shift towards Cyan/Bright Blue when audio intensity is high
        if (newReactivity > 0.7) {
            // High energy: use a brighter cyan-like color from the branding guide
            logo.style.setProperty('--logo-peak-color', '#00f2fe'); 
        } else {
            // Low to mid energy: revert to primary color
            logo.style.removeProperty('--logo-peak-color');
        }
    }
}

function calculateRMSLevel(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const sample = (dataArray[i] - 128) / 128;
        sum += sample * sample;
    }
    return Math.min(Math.sqrt(sum / dataArray.length) * 300, 100);
}

function getLevelColor(level) {
    if (level < 60) return '#00ff00';
    if (level < 85) return '#ffff00';
    return '#ff0000';
}

function updateClassicVu(levelLeft, levelRight) {
    const isMobile = window.innerWidth <= 500;

    const updateChannel = (id, level) => {
        const el = document.getElementById(id);
        if (el) {
            if (isMobile) {
                el.style.width = `${level}%`;
            } else {
                el.style.height = `${level}%`;
            }
            el.style.background = getLevelColor(level);
        }
    };

    updateChannel('left-vu-level', levelLeft);
    updateChannel('right-vu-level', levelRight);
}

function updateLedVu(levelLeft, levelRight) {
    updateLedChannel(leftVu, levelLeft);
    updateLedChannel(rightVu, levelRight);
}

function updateLedChannel(container, level) {
    const leds = container.querySelectorAll('.led-segment');
    const activeLeds = Math.floor((level / 100) * leds.length);
    leds.forEach((led, index) => {
        if (index < activeLeds) {
            const ratio = index / leds.length;
            if (ratio < 0.6) led.style.background = '#00ff00';
            else if (ratio < 0.85) led.style.background = '#ffff00';
            else led.style.background = '#ff0000';
            led.style.opacity = '1';
        } else {
            led.style.opacity = '0.1';
        }
    });
}

function updateCircularVu(levelLeft, levelRight) {
    const leftCircle = document.getElementById('left-circular-level');
    const rightCircle = document.getElementById('right-circular-level');
    const circumference = 81.68;
    if (leftCircle) {
        const offset = circumference - (levelLeft / 100) * circumference;
        leftCircle.setAttribute('stroke-dashoffset', offset);
        leftCircle.setAttribute('stroke', getLevelColor(levelLeft));
    }
    if (rightCircle) {
        const offset = circumference - (levelRight / 100) * circumference;
        rightCircle.setAttribute('stroke-dashoffset', offset);
        rightCircle.setAttribute('stroke', getLevelColor(levelRight));
    }
}

function updateWaveformVu() {
    updateWaveformChannel(leftVu, dataArrayLeft);
    updateWaveformChannel(rightVu, dataArrayRight);
}

function updateWaveformChannel(container, dataArray) {
    const canvas = container.querySelector('.waveform-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--console-bg');
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    const sliceHeight = height / dataArray.length;
    let y = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        const x = (v * width / 2) + width / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        y += sliceHeight;
    }
    ctx.stroke();
}

function updateSpectrumVu() {
    updateSpectrumChannel(leftVu, frequencyDataLeft);
    updateSpectrumChannel(rightVu, frequencyDataRight);
}

function updateSpectrumChannel(container, frequencyData) {
    const bars = container.querySelectorAll('.spectrum-bar');
    const barWidth = Math.floor(frequencyData.length / bars.length);
    bars.forEach((bar, index) => {
        let sum = 0;
        const start = index * barWidth;
        for (let i = start; i < start + barWidth; i++) {
            sum += frequencyData[i];
        }
        const average = sum / barWidth;
        const height = (average / 255) * 100;
        bar.style.height = `${height}%`;
        bar.style.background = getLevelColor(height * 1.5);
    });
}

function updateRetroVu(levelLeft, levelRight) {
    updateRetroChannel(leftVu, levelLeft);
    updateRetroChannel(rightVu, levelRight);
}

function updateRetroChannel(container, level) {
    const needle = container.querySelector('.retro-needle');
    if (needle) {
        const rotation = -45 + (level / 100) * 90;
        needle.style.transform = `rotate(${rotation}deg)`;
        needle.style.borderColor = getLevelColor(level);
    }
}

function updateNeonVu(levelLeft, levelRight) {
    const isMobile = window.innerWidth <= 500;
    const updateChannel = (id, level) => {
        const el = document.getElementById(id);
        if (el) {
            if (isMobile) {
                el.style.width = `${level}%`;
            } else {
                el.style.height = `${level}%`;
            }
            const color = getLevelColor(level);
            el.style.background = color;
            el.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
        }
    };
    updateChannel('left-neon-level', levelLeft);
    updateChannel('right-neon-level', levelRight);
}

function resetVuMeters(vuStyleIndex) {
    const isMobile = window.innerWidth <= 500;
    const currentStyle = VU_STYLES[vuStyleIndex];
    switch (currentStyle) {
        case 'classic':
            document.querySelectorAll('.vu-level').forEach(level => {
                if (isMobile) {
                    level.style.width = '0%';
                } else {
                    level.style.height = '0%';
                }
                level.style.background = '#00ff00';
            });
            break;
        case 'led':
            document.querySelectorAll('.led-segment').forEach(led => led.style.opacity = '0.1');
            break;
        case 'circular':
            document.querySelectorAll('.circular-level').forEach(circle => {
                circle.setAttribute('stroke-dashoffset', '81.68');
                circle.setAttribute('stroke', '#00ff00');
            });
            break;
        case 'retro':
            document.querySelectorAll('.retro-needle').forEach(needle => {
                needle.style.transform = 'rotate(-45deg)';
                needle.style.borderColor = '#00ff00';
            });
            break;
        case 'neon':
            document.querySelectorAll('.neon-level').forEach(level => {
                if (isMobile) {
                    level.style.width = '0%';
                } else {
                    level.style.height = '0%';
                }
                level.style.boxShadow = 'none';
            });
            break;
        case 'spectrum':
            document.querySelectorAll('.spectrum-bar').forEach(bar => {
                bar.style.height = '0%';
            });
            break;
        case 'waveform':
            document.querySelectorAll('.waveform-canvas').forEach(canvas => {
                const ctx = canvas.getContext('2d');
                const { width, height } = canvas;
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--console-bg') || '#000';
                ctx.fillRect(0, 0, width, height);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#00ff00';
                ctx.beginPath();
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width / 2, height);
                ctx.stroke();
            });
            break;
    }
}