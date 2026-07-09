/**
 * audio.js
 * Moteur audio 100% compatible iOS Safari (HTML5 Audio pur).
 * Contourne le mur du CORS de GitHub Pages.
 */
window.NS_Audio = (function() {
    let isUnlocked = false;
    let fadeIntervals = {}; // Gère les fondus sortants

    const PATHS = {
        breeze: '../assets/sounds/breeze-loop.mp3',
        fountain: '../assets/sounds/fountain-plop.mp3',
        bird: '../assets/sounds/bird-chirp.mp3',
        leaf: '../assets/sounds/leaf-rustle.mp3',
        stoneMove: '../assets/sounds/stone-move.mp3',
        invalidToc: '../assets/sounds/invalid-toc.mp3',
        victoryBell: '../assets/sounds/victory-bell.mp3'
    };

    let audios = {};
    let birdTimeout = null;
    let leafTimeout = null;

    function init() {
        Object.keys(PATHS).forEach(key => {
            const audio = new Audio(PATHS[key]);
            audio.preload = 'auto';
            audios[key] = audio;
        });
    }

    /**
     * Déverrouille l'audio au premier tap, télécharge les fichiers et lance l'ambiance.
     */
    async function unlock() {
        if (isUnlocked) return;
        isUnlocked = true;

        const loader = document.getElementById('audio-loader');
        if (loader) loader.classList.add('visible');

        // Le déverrouillage du contexte est toujours nécessaire sur iOS
        if (!window.AudioContext) window.AudioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (window.AudioContext.state === 'suspended') await window.AudioContext.resume();

        // Charger les fichiers critiques
        const criticalSounds = ['breeze', 'fountain'];
        await Promise.all(criticalSounds.map(key => new Promise(resolve => {
            const onReady = () => {
                audios[key].removeEventListener('canplaythrough', onReady);
                resolve();
            };
            audios[key].addEventListener('canplaythrough', onReady, { once: true });
            audios[key].addEventListener('error', onReady, { once: true }); // Débloque la promesse si le fichier est introuvable
            audios[key].load();
        }));

        if (loader) loader.classList.remove('visible');
        
        startAmbient();
    }

    function startAmbient() {
        if (!isUnlocked) return;
        _playLoop('breeze', 0.15);
        _playLoop('fountain', 0.12);
        scheduleBird();
        scheduleLeaf();
    }

    function stopAmbient() {
        _fadeOut('breeze');
        _fadeOut('fountain');
        clearTimeout(birdTimeout);
        clearTimeout(leafTimeout);
    }

    // --- LOGIQUE INTERNE (HTML5 Pur) ---

    function _playLoop(name, targetVolume) {
        if (!audios[name]) return;
        audios[name].volume = 0; // Démarre à 0 pour éviter le "clic" sec
        audios[name].loop = true;
        audios[name].play().catch(e => console.warn("Audio bloqué par le navigateur :", e));
        
        // Fondu entrant très doux
        let currentVol = 0;
        if (fadeIntervals[name]) clearInterval(fadeIntervals[name]);
        fadeIntervals[name] = setInterval(() => {
            if (currentVol < targetVolume) {
                currentVol += 0.005; 
                if (currentVol > targetVolume) currentVol = targetVolume;
                audios[name].volume = currentVol;
            } else {
                clearInterval(fadeIntervals[name]);
            }
        }, 30); 
    }

    function _fadeOut(name) {
        if (fadeIntervals[name]) clearInterval(fadeIntervals[name]);
        const audio = audios[name];
        if (!audio) return;

        let currentVol = audio.volume;
        fadeIntervals[name] = setInterval(() => {
            if (currentVol > 0.005) {
                currentVol -= 0.005;
                audio.volume = currentVol;
            } else {
                audio.pause();
                audio.volume = 0;
                clearInterval(fadeIntervals[name]);
                delete fadeIntervals[name];
            }
        }, 30);
    }

    function _playOneShot(name, volume) {
        if (!isUnlocked) return;
        let audio = audios[name];
        
        // Si le son est déjà en cours (ex: oiseau trop rapide), on le clone
        if (!audio.paused) {
            audio = audio.cloneNode(true);
        }

        audio.volume = volume;
        audio.play().catch(e => {}); // Ignore silencieusement les blocages iOS
    }

    // --- EFFETS SONORES INTERACTION ---

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

    // --- INITIALISATION ---
    init();

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
