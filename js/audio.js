/**
 * audio.js
 * Moteur audio compatible iOS Safari (Web Audio API).
 * Télécharge et décode les sons en mémoire au premier tap.
 */
window.NS_Audio = (function() {
    let isUnlocked = false;
    let audioContext = null;
    
    const PATHS = {
        breeze: '../assets/sounds/breeze-loop.mp3',
        fountain: '../assets/sounds/fountain-plop.mp3',
        bird: '../assets/sounds/bird-chirp.mp3',
        leaf: '../assets/sounds/leaf-rustle.mp3',
        stoneMove: '../assets/sounds/stone-move.mp3',
        invalidToc: '../assets/sounds/invalid-toc.mp3',
        victoryBell: '../assets/sounds/victory-bell.mp3'
    };

    let audioBuffers = {}; // Stocke les sons décodés en mémoire
    let birdTimeout = null;
    let leafTimeout = null;
    let loopNodes = {}; // Gère les sons qui bouclent (vent, eau)

    async function unlock() {
        if (isUnlocked) return;
        isUnlocked = true;
        
        // Affiche le message de chargement
        const loader = document.getElementById('audio-loader');
        if (loader) loader.classList.add('visible');

        // 1. Créer le contexte audio (Obligatoire sur iOS)
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // 2. Télécharger et décoder tous les MP3 en mémoire
        const fetchPromises = Object.keys(PATHS).map(async (key) => {
            try {
                const response = await fetch(PATHS[key]);
                const arrayBuffer = await response.arrayBuffer();
                audioBuffers[key] = await audioContext.decodeAudioData(arrayBuffer);
            } catch (error) {
                console.warn("Erreur chargement audio pour " + key + ":", error);
            }
        });

        // 3. Attendre que tout soit prêt
        await Promise.all(fetchPromises);

        // 4. Cacher le message et lancer la musique
        if (loader) loader.classList.remove('visible');
        startAmbient();
    }

    function startAmbient() {
        if (!isUnlocked) return;
        _startLoop('breeze', 0.15, true);
        _startLoop('fountain', 0.12, true);
        scheduleBird();
        scheduleLeaf();
    }

    function stopAmbient() {
        _stopLoop('breeze');
        _stopLoop('fountain');
        clearTimeout(birdTimeout);
        clearTimeout(leafTimeout);
    }

    // --- EFFETS SONORES INTERACTION ---

    function playStoneMove() { _playOneShot('stoneMove', 0.25); }
    function playInvalidToc() { _playOneShot('invalidToc', 0.15); }
    function playVictoryBell() { _playOneShot('victoryBell', 0.4); }
    function playElementRestored() { _playOneShot('leaf', 0.2); }

    // --- LOGIQUE INTERNE (Web Audio API) ---

    function _playOneShot(name, volume) {
        if (!isUnlocked || !audioBuffers[name]) return;
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = audioBuffers[name];
        gainNode.gain.value = volume;
        gainNode.connect(source);
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
    }

    function _startLoop(name, volume) {
        if (!isUnlocked || !audioBuffers[name]) return;
        _stopLoop(name); // Arrête l'ancienne boucle s'il y en a une

        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(audioContext.destination);
        loopNodes[name] = { gain: gainNode };

        const playLoop = () => {
            if (!isUnlocked) return;
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffers[name];
            source.connect(loopNodes[name].gain);
            source.start(0);
            source.onended = playLoop; // Relance quand le son se termine
        };
        playLoop();
    }

    function _stopLoop(name) {
        if (loopNodes[name]) {
            loopNodes[name].gain.gain.value = 0; // Baisse le volume à 0 (le stop() coupe trop brutalement)
            delete loopNodes[name];
        }
    }

    // --- LOGIQUE SPORADIQUE ---

    function scheduleBird() {
        const delay = 20000 + Math.random() * 20000;
        birdTimeout = setTimeout(() => {
            if (!isUnlocked) return;
            _playOneShot('bird', 0.2);
            scheduleBird(); 
        }, delay);
    }

    function scheduleLeaf() {
        leafTimeout = setTimeout(() => {
            if (!isUnlocked) return;
            _playOneShot('leaf', 0.15);
            scheduleLeaf();
        }, 33000);
    }

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
