document.addEventListener('DOMContentLoaded', () => {
    const piano = document.getElementById('piano');
    const waveformSelector = document.getElementById('waveformSelector');
    const octaveDownButton = document.getElementById('octaveDown');
    const octaveUpButton = document.getElementById('octaveUp');
    const octaveValueDisplay = document.getElementById('octaveValue');
    const keyLabelSelector = document.getElementById('keyLabelSelector');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const statusBar = document.getElementById('statusBar');
    const reverbToggle = document.getElementById('reverbToggle');
    const oscilloscopeCanvas = document.getElementById('oscilloscope');
    const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
    const visualizerContainer = document.getElementById('visualizerContainer');

    let audioCtx;
    let mainGainNode; 
    let analyserNode; 
    let convolverNode; 
    let reverbBuffer = null;
    let reverbEnabled = false;
    let wetGainNode; 

    let currentWaveform = 'sine';
    const FIXED_MASTER_VOLUME = 0.3; 
    let currentOctave = 0;
    let baseOctave = 4;
    let currentLabelType = 'keyboard';
    const activeOscillators = {}; 

    const envelope = {
        attack: 0.005, 
        release: 0.45 
    };
    let visualizerActive = false;
    let visualizerFadeTimeout;
    let animationFrameId;

    const BASE_WHITE_KEY_WIDTH_PX = 55; 
    const BASE_BLACK_KEY_WIDTH_PX = 32; 
    const MIN_WHITE_KEY_WIDTH_PX = 40;  
    const MAX_WHITE_KEY_WIDTH_PX = 65; 
    const BLACK_KEY_HEIGHT_PERCENT = 60;
    const EDGE_KEY_MARGIN_PX = 1;

    const keyLayout = [
        { note: 'C', key: 'A', type: 'white' }, { note: 'C#', key: 'W', type: 'black' },
        { note: 'D', key: 'S', type: 'white' }, { note: 'D#', key: 'E', type: 'black' },
        { note: 'E', key: 'D', type: 'white' },
        { note: 'F', key: 'F', type: 'white' }, { note: 'F#', key: 'T', type: 'black' },
        { note: 'G', key: 'G', type: 'white' }, { note: 'G#', key: 'Y', type: 'black' },
        { note: 'A', key: 'H', type: 'white' }, { note: 'A#', key: 'U', type: 'black' },
        { note: 'B', key: 'J', type: 'white' },
        { note: 'C', key: 'K', type: 'white', nextOctave: true }
    ];
    const noteFrequencies = {
        'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63,
        'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00,
        'A#': 466.16, 'B': 493.88
    };

    function initAudio() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                mainGainNode = audioCtx.createGain();
                mainGainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
                mainGainNode.gain.linearRampToValueAtTime(FIXED_MASTER_VOLUME, audioCtx.currentTime + 0.01);
                
                analyserNode = audioCtx.createAnalyser();
                analyserNode.fftSize = 2048; 
                analyserNode.smoothingTimeConstant = 0.25; 
                analyserNode.minDecibels = -100; 
                analyserNode.maxDecibels = -20;  

                mainGainNode.connect(analyserNode); 
                analyserNode.connect(audioCtx.destination); 

                convolverNode = audioCtx.createConvolver();
                wetGainNode = audioCtx.createGain(); 
                wetGainNode.gain.value = 0.9; 

                convolverNode.connect(wetGainNode);
                wetGainNode.connect(mainGainNode); 

                loadReverbImpulse();
                if (visualizerContainer) visualizerContainer.style.opacity = '0'; 
                startVisualizerLoop(); 
            } catch (e) {
                console.error("Error initializing Web Audio API:", e);
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(e => console.error("Error resuming AudioContext:", e));
        }
    }

    async function loadReverbImpulse() {
        if (!audioCtx) return;
        try {
            const sampleRate = audioCtx.sampleRate;
            const length = sampleRate * 2.5; 
            const impulse = audioCtx.createBuffer(2, length, sampleRate);
            const L = impulse.getChannelData(0);
            const R = impulse.getChannelData(1);
            for (let i = 0; i < length; i++) {
                const t = i / length;
                const e = Math.pow(1 - t, 3.5) * Math.exp(-3 * t); 
                L[i] = (Math.random() * 2 - 1) * e * 0.7; 
                R[i] = (Math.random() * 2 - 1) * e * 0.7;
            }
            reverbBuffer = impulse;
            if (convolverNode) convolverNode.buffer = reverbBuffer;
        } catch (e) {
            console.error("Error creating reverb impulse:", e);
        }
    }

    function getFrequency(note, octaveOffset) {
        let baseFreq = noteFrequencies[note];
        if (!baseFreq) return null;
        return baseFreq * Math.pow(2, octaveOffset);
    }
    
    const MAX_POLYPHONY = 8; 
    let notePlayOrder = [];

    function forceStopNote(uniqueNoteId, immediate = false) {
        if (activeOscillators[uniqueNoteId]) {
            const existing = activeOscillators[uniqueNoteId];
            const now = audioCtx.currentTime;
            try {
                existing.gain.gain.cancelScheduledValues(now);
                if (immediate) {
                    existing.gain.gain.setValueAtTime(0.00001, now);
                    existing.osc.stop(now + 0.005);
                } else {
                    existing.gain.gain.setValueAtTime(existing.gain.gain.value, now);
                    existing.gain.gain.linearRampToValueAtTime(0.0001, now + 0.02);
                    existing.osc.stop(now + 0.03);
                }
                
                existing.osc.onended = () => { 
                    try {
                        existing.gain.disconnect();
                        if(existing.reverbSend) existing.reverbSend.disconnect();
                        existing.osc.disconnect();
                    } catch(e) {}
                };
            } catch(e) {}
            delete activeOscillators[uniqueNoteId];
            notePlayOrder = notePlayOrder.filter(item => item !== uniqueNoteId);
        }
    }

    function playNote(note, keyElement) {
        if (!audioCtx) initAudio(); 
        if (!audioCtx) return; 

        const octaveForNote = baseOctave + currentOctave + (keyElement.dataset.nextOctave === 'true' ? 1 : 0);
        const uniqueNoteId = note + octaveForNote;

        if (activeOscillators[uniqueNoteId]) { 
            forceStopNote(uniqueNoteId, true); 
        }
        
        if (Object.keys(activeOscillators).length >= MAX_POLYPHONY) {
            const oldestNoteId = notePlayOrder.shift(); 
            if (oldestNoteId) {
                forceStopNote(oldestNoteId); 
            }
        }

        const frequency = getFrequency(note, currentOctave + (keyElement.dataset.nextOctave === 'true' ? 1 : 0));
        if (!frequency) return;

        const oscillator = audioCtx.createOscillator();
        oscillator.type = currentWaveform;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        const noteSpecificGain = audioCtx.createGain(); 
        noteSpecificGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

        oscillator.connect(noteSpecificGain);
        noteSpecificGain.connect(mainGainNode); 
        
        const noteData = { osc: oscillator, gain: noteSpecificGain, playState: 1 };
        if (reverbEnabled && convolverNode && reverbBuffer) {
            const reverbSend = audioCtx.createGain();
            reverbSend.gain.value = 0.7; 
            noteSpecificGain.connect(reverbSend);
            reverbSend.connect(convolverNode);
            noteData.reverbSend = reverbSend;
        }
        activeOscillators[uniqueNoteId] = noteData;
        notePlayOrder.push(uniqueNoteId);

        const now = audioCtx.currentTime;
        noteSpecificGain.gain.linearRampToValueAtTime(1.0, now + envelope.attack); 
        
        oscillator.start(now);
        keyElement.classList.add('active');
        
        visualizerActive = true;
        if (visualizerContainer) visualizerContainer.style.opacity = '1';
        clearTimeout(visualizerFadeTimeout);
    }

    function stopNote(note, keyElement) {
        if (!audioCtx) return;
        const octaveForNote = baseOctave + currentOctave + (keyElement.dataset.nextOctave === 'true' ? 1 : 0);
        const uniqueNoteId = note + octaveForNote;

        if (activeOscillators[uniqueNoteId] && activeOscillators[uniqueNoteId].playState === 1) {
            const now = audioCtx.currentTime;
            const noteData = activeOscillators[uniqueNoteId];
            noteData.playState = 0; 

            noteData.gain.gain.cancelScheduledValues(now); 
            noteData.gain.gain.setValueAtTime(noteData.gain.gain.value, now); 
            noteData.gain.gain.linearRampToValueAtTime(0.0001, now + envelope.release);

            const stopTime = now + envelope.release + 0.05; 
            noteData.osc.stop(stopTime); 

            noteData.osc.onended = () => { 
                const currentNoteData = activeOscillators[uniqueNoteId]; 
                if (currentNoteData && currentNoteData.playState === 0 && currentNoteData.osc === noteData.osc) { 
                    try {
                        noteData.gain.disconnect();
                        if (noteData.reverbSend) {
                            noteData.reverbSend.disconnect();
                        }
                        noteData.osc.disconnect();
                    } catch (e) {}
                    delete activeOscillators[uniqueNoteId];
                    notePlayOrder = notePlayOrder.filter(item => item !== uniqueNoteId);

                    if (Object.keys(activeOscillators).filter(id => activeOscillators[id] && activeOscillators[id].playState === 1).length === 0) {
                        visualizerFadeTimeout = setTimeout(() => {
                           if (visualizerContainer) visualizerContainer.style.opacity = '0';
                           visualizerActive = false;
                        }, 300); 
                    }
                }
            };
        }
        keyElement.classList.remove('active');
    }

    function startVisualizerLoop() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        function loop() {
            drawOscilloscope();
            animationFrameId = requestAnimationFrame(loop);
        }
        animationFrameId = requestAnimationFrame(loop);
    }

    function drawOscilloscope() {
        if (!audioCtx || !analyserNode || !oscilloscopeCanvas.width || !oscilloscopeCanvas.height ) {
            return;
        }
        
        if (!visualizerActive && visualizerContainer && parseFloat(visualizerContainer.style.opacity || "0") < 0.01) {
             if (oscilloscopeCtx && oscilloscopeCanvas.width && oscilloscopeCanvas.height) {
                oscilloscopeCtx.clearRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);
             }
             return; 
        }

        const bufferLength = analyserNode.frequencyBinCount; 
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray); 

        oscilloscopeCtx.clearRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

        const W = oscilloscopeCanvas.width;
        const H = oscilloscopeCanvas.height;
        const cellSize = 15; 
        const gridMargin = 5; 

        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--oscilloscope-grid-color').trim();
        oscilloscopeCtx.strokeStyle = gridColor;
        oscilloscopeCtx.lineWidth = 0.5; 
        
        oscilloscopeCtx.beginPath(); 

        for (let y = gridMargin + cellSize; y < H - gridMargin; y += cellSize) {
            if (y < H - gridMargin) { 
                oscilloscopeCtx.moveTo(gridMargin, y);
                oscilloscopeCtx.lineTo(W - gridMargin, y);
            }
        }
        for (let x = gridMargin + cellSize; x < W - gridMargin; x += cellSize) {
             if (x < W - gridMargin) { 
                oscilloscopeCtx.moveTo(x, gridMargin);
                oscilloscopeCtx.lineTo(x, H - gridMargin);
            }
        }
        oscilloscopeCtx.stroke();
        
        oscilloscopeCtx.lineWidth = 1.0; 
        let lineColor = getComputedStyle(document.documentElement).getPropertyValue('--oscilloscope-line-color').trim();
        const currentOpacity = visualizerContainer ? parseFloat(visualizerContainer.style.opacity || "1") : 1;
        const lineOpacity = 0.5 * currentOpacity; 

        if (lineColor.startsWith('rgb(')) {
            oscilloscopeCtx.strokeStyle = lineColor.replace('rgb(', 'rgba(').replace(')', `, ${lineOpacity})`); 
        } else if (lineColor.startsWith('#') && (lineColor.length === 7 || lineColor.length === 4)) { 
            const alphaHex = Math.round(lineOpacity * 255).toString(16).padStart(2, '0');
            oscilloscopeCtx.strokeStyle = lineColor.length === 4 ? `#${lineColor[1]}${lineColor[1]}${lineColor[2]}${lineColor[2]}${lineColor[3]}${lineColor[3]}${alphaHex}` : `${lineColor}${alphaHex}`;
        } else {
            oscilloscopeCtx.strokeStyle = lineColor; 
        }

        oscilloscopeCtx.beginPath();
        const sliceWidth = oscilloscopeCanvas.width * 1.0 / bufferLength;
        let x = 0;
        let triggerIndex = -1;
        for (let i = 0; i < bufferLength - 1; i++) {
            if (dataArray[i] < 128 && dataArray[i+1] >= 128) {
                triggerIndex = i;
                break;
            }
        }
        if (triggerIndex === -1) triggerIndex = 0; 

        for (let i = 0; i < bufferLength; i++) {
            const dataIndex = (triggerIndex + i) % bufferLength; 
            const v = dataArray[dataIndex] / 128.0; 
            const y = (v - 1) * (oscilloscopeCanvas.height / 2.2) + (oscilloscopeCanvas.height / 2); 
            
            if (i === 0) oscilloscopeCtx.moveTo(x, y);
            else oscilloscopeCtx.lineTo(x, y);
            x += sliceWidth;
        }
        oscilloscopeCtx.stroke();
    }

    function resizeOscilloscope() {
        if (!oscilloscopeCanvas || !visualizerContainer) return;
        oscilloscopeCanvas.width = visualizerContainer.clientWidth;
        oscilloscopeCanvas.height = visualizerContainer.clientHeight;
    }
    window.addEventListener('resize', () => {
        createPianoKeys(); 
        resizeOscilloscope();
    });
    function createPianoKeys() {
        if (!piano) { console.error("Piano element not found!"); return; }
        piano.innerHTML = ''; 
        const keyElementsData = []; 
        let totalWhiteKeysInLayout = 0;
        if (!keyLayout || keyLayout.length === 0) { console.error("keyLayout is missing!"); return; }
        keyLayout.forEach(keyData => { if (keyData.type === 'white') totalWhiteKeysInLayout++; });

        keyLayout.forEach((keyData) => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key', keyData.type);
            keyElement.dataset.note = keyData.note;
            keyElement.dataset.key = keyData.key.toUpperCase();
            if (keyData.nextOctave) keyElement.dataset.nextOctave = "true";
            
            keyElement.addEventListener('mousedown', (e) => { e.preventDefault(); playNote(keyData.note, keyElement); });
            keyElement.addEventListener('mouseup', () => stopNote(keyData.note, keyElement));
            keyElement.addEventListener('mouseleave', () => { if(keyElement.classList.contains('active')) stopNote(keyData.note, keyElement); });
            keyElement.addEventListener('touchstart', (e) => { e.preventDefault(); playNote(keyData.note, keyElement); }, { passive: false });
            keyElement.addEventListener('touchend', (e) => { e.preventDefault(); stopNote(keyData.note, keyElement); });

            piano.appendChild(keyElement);
            keyElementsData.push({ element: keyElement, data: keyData });
        });

        const pianoContainer = piano.parentElement;
        if (!pianoContainer) return; 
        
        const pianoContainerStyle = getComputedStyle(pianoContainer);
        const pianoContainerPaddingLeft = parseFloat(pianoContainerStyle.paddingLeft) || 0;
        const pianoContainerPaddingRight = parseFloat(pianoContainerStyle.paddingRight) || 0;
        const availableWidthForPianoDiv = pianoContainer.clientWidth - pianoContainerPaddingLeft - pianoContainerPaddingRight; 
        const availableWidthForKeysContent = availableWidthForPianoDiv - (EDGE_KEY_MARGIN_PX * 2);
        
        let calculatedWhiteKeyWidth = totalWhiteKeysInLayout > 0 ? (availableWidthForKeysContent / totalWhiteKeysInLayout) : MAX_WHITE_KEY_WIDTH_PX;
        let finalWhiteKeyWidth = Math.min(calculatedWhiteKeyWidth, MAX_WHITE_KEY_WIDTH_PX);
        finalWhiteKeyWidth = Math.max(finalWhiteKeyWidth, MIN_WHITE_KEY_WIDTH_PX);
        
        let totalKeysWidth = (finalWhiteKeyWidth * totalWhiteKeysInLayout) - (totalWhiteKeysInLayout > 1 ? (totalWhiteKeysInLayout -1) * 1 : 0) ;
        const totalPianoDivWidth = totalKeysWidth + (EDGE_KEY_MARGIN_PX * 2);
        piano.style.width = `${totalPianoDivWidth}px`;
        
        const blackKeyWidthRatio = BASE_BLACK_KEY_WIDTH_PX / BASE_WHITE_KEY_WIDTH_PX;
        const finalBlackKeyWidth = finalWhiteKeyWidth * blackKeyWidthRatio;
        
        let whiteKeyRenderIndex = 0;
        keyElementsData.forEach(item => {
            const { element, data } = item;
            if (data.type === 'white') {
                element.style.width = `${finalWhiteKeyWidth}px`;
                whiteKeyRenderIndex++;
            } else { 
                element.style.width = `${finalBlackKeyWidth}px`;
                element.style.height = `${BLACK_KEY_HEIGHT_PERCENT}%`;
                let leftPosition = (whiteKeyRenderIndex * finalWhiteKeyWidth) - (finalBlackKeyWidth / 2);
                leftPosition -= (whiteKeyRenderIndex > 0 ? (whiteKeyRenderIndex -1) * 1 : 0);
                leftPosition += EDGE_KEY_MARGIN_PX; 
                element.style.left = `${leftPosition}px`;
            }
        });
        updateKeyLabels(); 
    }
    function updateKeyLabels() {
        if (!piano) return;
        const keys = piano.querySelectorAll('.key');
        keys.forEach(keyElement => {
            const note = keyElement.dataset.note;
            const keyboardKey = keyElement.dataset.key;
            const isNextOctave = keyElement.dataset.nextOctave === 'true';
            if (currentLabelType === 'keyboard') {
                keyElement.textContent = keyboardKey;
            } else {
                const displayOctave = baseOctave + currentOctave + (isNextOctave ? 1 : 0);
                keyElement.textContent = note.replace('#', '♯') + displayOctave;
            }
        });
    }
    function updateStatusBar() {
        if(statusBar) statusBar.textContent = `Wave: ${currentWaveform}, Oct: ${currentOctave}, Labels: ${currentLabelType}, Reverb: ${reverbEnabled ? 'On' : 'Off'}`;
    }
    if (waveformSelector) {
        waveformSelector.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button && button.dataset.wave) {
                currentWaveform = button.dataset.wave;
                waveformSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateStatusBar();
            }
        });
    }
    if (octaveDownButton && octaveUpButton && octaveValueDisplay) {
        octaveDownButton.addEventListener('click', () => { if (currentOctave > -2) { currentOctave--; octaveValueDisplay.textContent = currentOctave; updateKeyLabels(); updateStatusBar(); } });
        octaveUpButton.addEventListener('click', () => { if (currentOctave < 2) { currentOctave++; octaveValueDisplay.textContent = currentOctave; updateKeyLabels(); updateStatusBar(); } });
    }
    if (keyLabelSelector) {
         keyLabelSelector.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button && button.dataset.labeltype) {
                currentLabelType = button.dataset.labeltype;
                keyLabelSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateKeyLabels(); updateStatusBar();
            }
        });
    }
    if(reverbToggle) {
        reverbToggle.addEventListener('click', () => {
            if (!audioCtx) initAudio(); 
            reverbEnabled = !reverbEnabled;
            reverbToggle.textContent = reverbEnabled ? 'On' : 'Off';
            reverbToggle.classList.toggle('active', reverbEnabled);
            updateStatusBar();
        });
    }
    function applyDarkModePreference() {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedPreference = localStorage.getItem('darkMode');
        if (storedPreference === 'true' || (storedPreference === null && prefersDark)) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        resizeOscilloscope(); 
    }
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            resizeOscilloscope(); 
        });
    }
    const keyboardMap = {};
    keyLayout.forEach(k => { keyboardMap[k.key.toUpperCase()] = { note: k.note, nextOctave: k.nextOctave || false }; });
    document.addEventListener('keydown', (e) => {
        if (Object.keys(keyboardMap).includes(e.key.toUpperCase()) && !e.metaKey && !e.ctrlKey && !e.altKey) {
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && !document.activeElement.isContentEditable) {
                 e.preventDefault();
            }
        }
        const key = e.key.toUpperCase();
        if (keyboardMap[key] && !e.repeat) {
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && !document.activeElement.isContentEditable) {
                const keyElement = piano.querySelector(`.key[data-key="${key}"]`);
                if (keyElement && !keyElement.classList.contains('active')) { 
                    playNote(keyboardMap[key].note, keyElement);
                }
            }
        }
    });
    document.addEventListener('keyup', (e) => {
        const key = e.key.toUpperCase();
        if (keyboardMap[key]) {
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && !document.activeElement.isContentEditable) {
                const keyElement = piano.querySelector(`.key[data-key="${key}"]`);
                if (keyElement) {
                    stopNote(keyboardMap[key].note, keyElement);
                }
            }
        }
    });
    
    try {
        createPianoKeys(); 
        applyDarkModePreference(); 
        updateStatusBar(); 
        initAudio(); 
    } catch (e) {
        console.error("Error during initial setup:", e);
    }
});