/**
 * audio.js
 * Gestion de l'identité sonore - Version iOS Safe
 * Attend que les fichiers soient prêts avant de les lire.
 */
window.NS_Audio = (function() {
    let isUnlocked = false;
    
    const PATHS = {
        breeze: '../assets/sounds/breeze-loop.mp3',
        fountain: '../assets/sounds/fountain-plop.mp3',
        bird: '../assets/sounds/bird-chirp.mp3',
        leaf: '../assets/sounds/leaf-rustle.mp3',
        stoneMove: '../assets/sounds/stone-move.mp3',
        invalidToc: '../assets/sounds/invalid-toc.mp3',
        victoryBell: '../assets/sounds/victory-bell.mp3'
    };

    let sounds = {};
    let birdTimeout = null;
    let leafTimeout = null;

    function init() {
        sounds.breeze = new Audio(PATHS.breeze);
        sounds.fountain = new Audio(PATHS.fountain);
        sounds.bird = new Audio(PATHS.bird);
        sounds.leaf = new Audio(PATHS.leaf);
        sounds.stoneMove = new Audio(PATHS.stoneMove);
        sounds.invalidToc = new Audio(PATHS.invalidToc);
        sounds.victoryBell = new Audio(PATHS.victoryBell);

        // Réglages des fonds sonores
        sounds.breeze.loop = true;
        sounds.fountain.loop = true;
        
        // On NE MET PAS preload = 'none' pour laisser Safari les précharger tranquillement en arrière-plan
    }

    /**
     * Déverrouille l'audio et lance l'ambiance au bon moment.
     */
    function unlock() {
        if (isUnlocked) return;
        isUnlocked = true;
        startAmbient();
    }

    /**
     * Lance les sons d'ambiance de manière sécurisée pour iOS.
     */
    function startAmbient() {
        if (!isUnlocked) return;

        // On vérifie si le fichier de la brise est prêt (readyState 3 = HAVE_ENOUGH_DATA)
        if (sounds.breeze.readyState >= 3) {
            _doPlaySound('breeze', 0.15);
            _doPlaySound('fountain', 0.12);
            scheduleBird();
            scheduleLeaf();
        } else {
            // Sinon, on attend qu'il soit prêt avant de jouer
            sounds.breeze.addEventListener('canplaythrough', function() {
                _doPlaySound('breeze', 0.15);
                _doPlaySound('fountain', 0.12);
                scheduleBird();
                scheduleLeaf();
            }, { once: true });
            // On force le téléchargement au cas où Safari est en pause
            sounds.breeze.load();
        }
    }

    /**
     * Arrête l'ambiance avec un fondu doux
     */
    function stopAmbient() {
        fadeOut('breeze');
        fadeOut('fountain');
        clearTimeout(birdTimeout);
        clearTimeout(leafTimeout);
    }

    // --- EFFETS SONORES D'INTERACTION ---

    function playStoneMove() {
        _playWhenReady('stoneMove', 0.25);
    }

    function playInvalidToc() {
        _playWhenReady('invalidToc', 0.15);
    }

    function playVictoryBell() {
        _playWhenReady('victoryBell', 0.4);
    }

    function playElementRestored() {
        _playWhenReady('leaf', 0.2);
    }

    // --- LOGIQUE SPORADIQUE (Oiseau et Feuille) ---

    function scheduleBird() {
        const delay = 20000 + Math.random() * 20000;
        birdTimeout = setTimeout(() => {
            if (!isUnlocked) return;
            _playWhenReady('bird', 0.2);
            scheduleBird(); 
        }, delay);
    }

    function scheduleLeaf() {
        leafTimeout = setTimeout(() => {
            if (!isUnlocked) return;
            _playWhenReady('leaf', 0.15);
            scheduleLeaf();
        }, 33000);
    }

    // --- FONCTIONS UTILITAIRES INTERNES ---

    /* Joue un son immédiatement (pour l'ambiance) */
    function _doPlaySound(name, volume) {
        const sound = sounds[name];
        if (!sound) return;
        sound.volume = volume || 0.1;
        
        var playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(function(error) {
                console.warn("Audio bloqué ou interrompu :", error.message);
            });
        }
    }

    /* Joue un son en vérifiant d'abord qu'il est prêt (pour les interactions) */
    function _playWhenReady(name, volume) {
        const sound = sounds[name];
        if (!sound) return;

        if (sound.readyState >= 3) {
            _doPlaySound(name, volume);
        } else {
            sound.addEventListener('canplaythrough', function() {
                _doPlaySound(name, volume);
            }, { once: true });
            sound.load();
        }
    }

    /* Fondu sortant pour ne pas couper brutalement */
    function fadeOut(name) {
        const sound = sounds[name];
        if (!sound) return;
        let vol = sound.volume;
        let fadeInterval = setInterval(function() {
            if (vol > 0.01) {
                vol -= 0.01;
                sound.volume = vol;
            } else {
                sound.pause();
                clearInterval(fadeInterval);
            }
        }, 50);
    }

    // --- INITIALISATION ---
    init();

    // API Publique
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
