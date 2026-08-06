// Sprint 6 - Ambiance sonore
// Sons entièrement synthétisés (Web Audio), aucun fichier audio à charger.
// Respecte toujours l'état "silence" choisi par le joueur, mémorisé d'une session à l'autre.
window.NS_Audio = (function() {
    let ctx = null;
    let muted = false;

    function loadMutePreference() {
        try {
            muted = localStorage.getItem('ninjaStonesMuted') === 'true';
        } catch (e) {}
    }

    function isMuted() { return muted; }

    function setMuted(value) {
        muted = value;
        try { localStorage.setItem('ninjaStonesMuted', muted ? 'true' : 'false'); } catch (e) {}
    }

    function toggleMuted() {
        setMuted(!muted);
        return muted;
    }

    // Le contexte audio ne peut être créé/relancé que suite à un vrai geste de l'utilisateur
    // (règle des navigateurs) : on le crée seulement au premier son réellement joué.
    function ensureContext() {
        if (!ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;
            ctx = new AudioContextClass();
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // Petit "toc" doux de pierre sur le sable. Légère variation de hauteur à chaque fois
    // pour ne jamais sonner deux fois exactement pareil.
    function playStoneSlide() {
        if (muted) return;
        const audioCtx = ensureContext();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        const baseFreq = 190 + Math.random() * 55;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, now + 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Carillon doux type bol tibétain / clochettes à vent, joué à la victoire d'un niveau.
    // Trois notes égrenées (jamais frappées ensemble) qui se superposent en s'éteignant,
    // pour un rendu à la fois mélodique et enveloppant.
    function playVictoryChime() {
        if (muted) return;
        const audioCtx = ensureContext();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        // Petit arpège chaud (sol - do - mi), chaque note un peu plus discrète que la précédente
        const notes = [
            { freq: 392.00, delay: 0,    gain: 1.0 },  // sol
            { freq: 523.25, delay: 0.34, gain: 0.82 }, // do
            { freq: 659.25, delay: 0.72, gain: 0.65 }  // mi
        ];
        const decay = 4.4;

        notes.forEach(function(note) {
            const startTime = now + note.delay;
            const partials = [
                { ratio: 1,    gain: 0.11 * note.gain },
                { ratio: 2.01, gain: 0.05 * note.gain },
                { ratio: 3.0,  gain: 0.022 * note.gain }
            ];
            partials.forEach(function(p) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.freq * p.ratio, startTime);

                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(p.gain, startTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(startTime);
                osc.stop(startTime + decay + 0.1);
            });
        });
    }

    // Carillon du grand final : une phrase plus longue et plus ample que celle de victoire.
    // Sept notes, comme les sept saisons traversées, qui s'éteignent lentement ensemble.
    function playFinaleChime() {
        if (muted) return;
        const audioCtx = ensureContext();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        // Montée sol - do - mi - sol - la - do - mi, puis un accord tenu très doux
        const notes = [
            { freq: 392.00, delay: 0,    gain: 1.0 },   // sol
            { freq: 523.25, delay: 0.42, gain: 0.94 },  // do
            { freq: 659.25, delay: 0.84, gain: 0.88 },  // mi
            { freq: 783.99, delay: 1.30, gain: 0.80 },  // sol aigu
            { freq: 880.00, delay: 1.86, gain: 0.70 },  // la
            { freq: 1046.50, delay: 2.44, gain: 0.58 }, // do aigu
            { freq: 1318.51, delay: 3.05, gain: 0.44 }, // mi aigu
            // accord final tenu
            { freq: 392.00, delay: 3.75, gain: 0.85 },
            { freq: 523.25, delay: 3.78, gain: 0.62 },
            { freq: 783.99, delay: 3.81, gain: 0.45 }
        ];
        const decay = 6.5;

        notes.forEach(function(note) {
            const startTime = now + note.delay;
            const partials = [
                { ratio: 1,    gain: 0.10 * note.gain },
                { ratio: 2.01, gain: 0.045 * note.gain },
                { ratio: 3.0,  gain: 0.02 * note.gain }
            ];
            partials.forEach(function(p) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.freq * p.ratio, startTime);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(p.gain, startTime + 0.12);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(startTime);
                osc.stop(startTime + decay + 0.1);
            });
        });
    }

    loadMutePreference();

    return {
        isMuted: isMuted,
        toggleMuted: toggleMuted,
        playStoneSlide: playStoneSlide,
        playVictoryChime: playVictoryChime,
        playFinaleChime: playFinaleChime
    };
})();
