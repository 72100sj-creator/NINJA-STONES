/**
 * audio.js
 * Utilise les données Base64 générées par sounds.js pour contourner les blocages de sécurité de Safari.
 * Entouré de try/catch pour que si un son échoue, le jeu continue de tourner.
 */
window.NS_Audio = (function() {
    let isUnlocked = false;
    let fadeIntervals = {};

    function _createAudio(dataString) {
        try {
            const audio = new Audio(dataString);
            audio.preload = 'auto';
            return audio;
        } catch(e) {
            console.warn("Erreur audio (le son est ignoré) :", e);
            return null;
        }
    }

    async function unlock() {
        if (isUnlocked) return;
        isUnlocked = true;

        // Déverrouille le contexte audio (Requis par iOS)
        if (!window.AudioContext) window.AudioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (window.AudioContext.state === 'suspended') await window.AudioContext.resume();

        // Préparation des éléments audio en mémoire
        _createAudio(window.SOUNDS_DATA['breeze-loop']);
        _createAudio(window.SOUNDS_DATA['fountain-plop']);

        startAmbient();
    }

    function startAmbient() {
        if (!isUnlocked) return;
        _playLoop('breeze-loop', 0.15);
        _playLoop('fountain-plop', 0.12);
        scheduleBird();
        scheduleLeaf();
    }

    function stopAmbient() {
        _fadeOut('breeze-loop');
        _fadeOut('fountain-plop');
        clearTimeout(birdTimeout);
        clearTimeout(leafTimeout);
    }

    // --- LOGIQUE INTERNE ---

    function _playLoop(name, targetVolume) {
        const audio = _createAudio(window.SOUNDS_DATA[name]);
        if (!audio) return;
        
        audio.loop = true;
        audio.volume = 0; 
        audio.play().catch(e => {}); 

        // Fondu entrant
        let currentVol = 0;
        if (fadeIntervals[name]) clearInterval(fadeIntervals[name]);
        
        fadeIntervals[name] = setInterval(() => {
            if (currentVol < targetVolume) {
                currentVol += 0.005; 
                if (currentVol > targetVolume) currentVol = targetVolume;
                if (audio) audio.volume = currentVol;
            } else {
                clearInterval(fadeIntervals[name]);
                delete fadeIntervals[name];
            }
        }, 30); 
    }

    function _fadeOut(name) {
        if (fadeIntervals[name]) clearInterval(fadeIntervals[name]);
        const audio = _createAudio(window.SOUNDS_DATA[name]);
        if (!audio) return;

        let currentVol = audio.volume;
        fadeIntervals[name] = setInterval(() => {
            if (currentVol > 0.005) {
                currentVol -= 0.005;
                if (audio) audio.volume = currentVol;
            } else {
                if (audio) {
                    audio.pause();
                    audio.volume = 0;
                }
                clearInterval(fadeIntervals[name]);
                delete fadeIntervals[name];
            }
        }, 30);
    }

    function _playOneShot(name, volume) {
        if (!isUnlocked) return;
        const audio = _createAudio(window.SOUNDS_DATA[name]);
        if (!audio) return;

        // Si le son est déjà en cours (ex: oiseau trop rapide), on le clone
        if (!audio.paused) {
            audio = audio.cloneNode(true);
        }

        audio.volume = volume;
        audio.play().catch(e => {}); 

        // Nettoie la copie temporaire
        if (audio !== _createAudio(window.SOUNDS_DATA[name])) {
            audio.addEventListener('ended', () => {}, { once: true });
        }
    }

    // --- EFFETS SONORES ---

    function playStoneMove() { _playOneShot('stone-move', 0.25); }
    function playInvalidToc() { _playOneShot('invalid-toc', 0.15); }
    function playVictoryBell() { _playOneShot('victory-bell', 0.4); }
    function playElementRestored() { _playOneShot('leaf-rustle', 0.2); }

    // --- LOGIQUE SPORADIQUE ---

    let birdTimeout = null;
    let leafTimeout = null;

    function scheduleBird() {
        const delay = 20000 + Math.random() * 20000;
        birdTimeout = setTimeout(() => {
            if (!isUnlocked) return;
            _playOneShot('bird-chirp', 0.2);
            scheduleBird(); 
        }, delay);
    }

    function scheduleLeaf() {
        leafTimeout = setTimeout(() => {
            if (!isUnlocked) return;
            _playOneShot('leaf-rustle', 0.15);
            scheduleLeaf();
        }, 33000);
    }

    // --- API ---
    return {
        unlock: unlock,
        stopAmbient: stopAmbient,
        startAmbient: startAmbient,
        playStoneMove: playStoneMove,
        playInvalidToc: playInvalidToc,
        playVictoryBell: playVictoryBell,
        playElementRestored: playElementRestored
    };
})();
