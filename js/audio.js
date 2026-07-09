/**
 * audio.js
 * Moteur audio 100% compatible iOS Safari (Web Audio API + MediaElementSource).
 * Contourne les restrictions CORS de Safari en laissant le navigateur gérer les MP3.
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

    let audioElements = {}; // Stocke les balises <audio>
    let sourceNodes = {};   // Stocke les connexions Web Audio
    let gainNodes = {};     // Stocke les contrôles de volume
    let birdTimeout = null;
    let leafTimeout = null;

    /**
     * Déverrouille l'audio au premier tap, télécharge les fichiers et lance l'ambiance.
     */
    async function unlock() {
        if (isUnlocked) return;
        isUnlocked = true;
        
        const loader = document.getElementById('audio-loader');
        if (loader) loader.classList.add('visible');

        // 1. Créer le contexte audio (Requis par iOS)
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // 2. Créer les balises audio natives
        Object.keys(PATHS).forEach(key => {
            const audio = new Audio(PATHS[key]);
            audio.preload = 'auto';
            audioElements[key] = audio;
        });

        // 3. Attendre que les fichiers essentiels soient prêts (ou qu'ils échouent gracieusement)
        const criticalSounds = ['breeze', 'fountain'];
        await Promise.all(criticalSounds.map(key => {
            return new Promise((resolve) => {
                if (!audioElements[key]) { resolve(); return; }
                
                const onReady = () => {
                    // Détache les écouteurs pour libérer la mémoire
                    audioElements[key].removeEventListener('canplaythrough', onReady);
                    audioElements[key].removeEventListener('error', onReady);
                    resolve();
                };
                
                audioElements[key].addEventListener('canplaythrough', onReady, { once: true });
                audioElements[key].addEventListener('error', onReady, { once: true });
                
                // Force le téléchargement
                audioElements[key].load();
            });
        }));

        // 4. Cacher le loader et lancer l'ambiance
        if (loader) loader.classList.remove('visible');
        startAmbient();
    }

    function startAmbient() {
        if (!isUnlocked) return;
        _startLoop('breeze', 0.15);
        _startLoop('fountain', 0.12);
        scheduleBird();
        scheduleLeaf();
    }

    function stopAmbient() {
        _stopLoop('breeze');
        _stopLoop('fountain');
        clearTimeout(birdTimeout);
        clearTimeout(leafTimeout);
    }

    // --- LOGIQUE INTERNE (La solution Safari) ---

    function _startLoop(name, volume) {
        _stopLoop(name); // Coupe l'ancienne boucle s'il y en a une
        const audio = audioElements[name];
        if (!audio || !audioContext) return;

        audio.loop = true;
        audio.volume = 0; // Commence à 0 pour le fondu entrant
        audio.play().catch(e => console.warn("Audio bloqué :", e));

        // Brancher vers Web Audio pour le contrôle précis
        const sourceNode = audioContext.createMediaElementSource(audio);
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Volume initial à 0
        
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        sourceNodes[name] = sourceNode;
        gainNodes[name] = gainNode;
        
        // Fondu entrant
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.5);
    }

    function _stopLoop(name) {
        if (sourceNodes[name] && gainNodes[name]) {
            // Fondu sortant
            gainNodes[name].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            
            // Pause le fichier audio après le fondu
            setTimeout(() => {
                if (audioElements[name]) audioElements[name].pause();
                
                // Débranche proprement pour libérer la mémoire du téléphone
                try { sourceNodes[name].disconnect(); } catch(e) {}
                delete sourceNodes[name];
                delete gainNodes[name];
            }, 600); // 600ms = durée du fondu
        }
    }

    // --- EFFETS SONORES INTERACTION ---

    function _playOneShot(name, volume) {
        if (!isUnlocked) return;
        
        // Utilise l'audio du menu, ou le clone si on le rejoue trop vite (Safari bloque si on appelle play() sur un son déjà en cours)
        let audio = audioElements[name];
        if (!audio) return;

        if (!audio.paused) {
            audio = audio.cloneNode(true); // Crée une copie temporaire
        }

        const sourceNode = audioContext.createMediaElementSource(audio);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        audio.play().catch(e => console.warn("Audio bloqué :", e));

        // Nettoie la copie temporaire une fois le son fini
        if (audio !== audioElements[name]) {
            audio.addEventListener('ended', () => {
                try { sourceNode.disconnect(); } catch(e) {}
            }, { once: true });
        }
    }

    function playStoneMove() { _playOneShot('stoneMove', 0.25); }
    function playInvalidToc() { _playOneShot('invalidToc', 0.15); }
    function playVictoryBell() { _playOneShot('victoryBell', 0.4); }
    function playElementRestored() { _playOneShot('leaf', 0.2); }

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

    // --- API PUBLIQUE ---
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
