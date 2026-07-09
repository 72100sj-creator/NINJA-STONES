/**
 * audio.js
 * Gestion de l'identité sonore de manière invisible et légère.
 * Utilise l'API Web Audio standard pour être compatible PWA.
 */
window.NS_Audio = (function() {
    let isUnlocked = false;
    
    // Chemins vers les assets (remonte depuis le dossier js/)
    const PATHS = {
        breeze: '../assets/sounds/breeze-loop.mp3',
        fountain: '../assets/sounds/fountain-plop.mp3',
        bird: '../assets/sounds/bird-chirp.mp3',
        leaf: '../assets/sounds/leaf-rustle.mp3',
        stoneMove: '../assets/sounds/stone-move.mp3',
        invalidToc: '../assets/sounds/invalid-toc.mp3',
        victoryBell: '../assets/sounds/victory-bell.mp3'
    };

    // Éléments audio (créés une seule fois pour économiser la mémoire)
    let sounds = {};
    let birdTimeout = null;
    let leafTimeout = null;

    function init() {
        // On crée les objets audio
        sounds.breeze = new Audio(PATHS.breeze);
        sounds.fountain = new Audio(PATHS.fountain);
        sounds.bird = new Audio(PATHS.bird);
        sounds.leaf = new Audio(PATHS.leaf);
        sounds.stoneMove = new Audio(PATHS.stoneMove);
        sounds.invalidToc = new Audio(PATHS.invalidToc);
        sounds.victoryBell = new Audio(PATHS.victoryBell);

        // Réglages des fonds sonores (Volume très bas pour être subliminal)
        sounds.breeze.loop = true;
        sounds.breeze.volume = 0.15;

        sounds.fountain.loop = true;
        sounds.fountain.volume = 0.12;

        // Désactiver le preload sur mobile pour économiser la data au démarrage
        Object.values(sounds).forEach(sound => {
            sound.preload = 'none';
        });
    }

    /**
     * Déverrouille l'audio. DOIT être appelé lors d'un clic (ex: bouton Jouer).
     */
    function unlock() {
        if (isUnlocked) return;
        isUnlocked = true;
        
        // On force le chargement et la lecture de la brise
        sounds.breeze.load();
        playSound('breeze', 0.15);
        
        // On lance les éléments sporadiques
        scheduleBird();
        scheduleLeaf();
    }

    /**
     * Arrête l'ambiance (quand on quitte le puzzle)
     */
    function stopAmbient() {
        fadeOut('breeze');
        fadeOut('fountain');
        clearTimeout(birdTimeout);
        clearTimeout(leafTimeout);
    }

    /**
     * Relance l'ambiance
     */
    function startAmbient() {
        if (!isUnlocked) return;
        playSound('breeze', 0.15);
        playSound('fountain', 0.12);
        scheduleBird();
        scheduleLeaf();
    }

    // --- EFFETS SONORES D'INTERACTION ---

    function playStoneMove() {
        playSound('stoneMove', 0.25);
    }

    function playInvalidToc() {
        playSound('invalidToc', 0.15);
    }

    function playVictoryBell() {
        playSound('victoryBell', 0.4);
    }

    function playElementRestored() {
        // Le vent + une note cristalline (simulé par le son de feuille plus aigu)
        playSound('leaf', 0.2);
    }

    // --- LOGIQUE SPORADIQUE (Oiseau et Feuille) ---

    function scheduleBird() {
        // Aléatoire entre 20 et 40 secondes (Art Bible)
        const delay = 20000 + Math.random() * 20000;
        birdTimeout = setTimeout(() => {
            if (!isUnlocked) return;
            playSound('bird', 0.2);
            scheduleBird(); // On reprogramme le prochain
        }, delay);
    }

    function scheduleLeaf() {
        // Tombe toutes les ~33 secondes
        leafTimeout = setTimeout(() => {
            if (!isUnlocked) return;
            playSound('leaf', 0.15);
            scheduleLeaf();
        }, 33000);
    }

    // --- FONCTIONS UTILITAIRES ---

    function playSound(name, volume) {
        const sound = sounds[name];
        if (!sound) return;

        // On règle le volume dynamiquement
        sound.volume = volume || 0.1;
        
        // On remet le son au début (utile pour l'oiseau qui est court)
        if (!sound.loop) {
            sound.currentTime = 0;
        }

        // .play() retourne une Promise. On l'attrape pour éviter les erreurs 
        // si l'utilisateur coupe le son ou si l'audio est interrompu
        var playPromise = sound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(function(error) {
                console.log("Audio bloqué ou interrompu :", error);
            });
        }
    }

    function fadeOut(name) {
        const sound = sounds[name];
        if (!sound) return;
        
        // On diminue progressivement le volume
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