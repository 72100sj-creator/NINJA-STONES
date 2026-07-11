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

    // Carillon doux type bol tibétain, joué à la victoire d'un niveau.
    function playVictoryChime() {
        if (muted) return;
        const audioCtx = ensureContext();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const baseFreq = 392; // sol : tonalité chaude, jamais stridente

        const partials = [
            { ratio: 1,    gain: 0.11 },
            { ratio: 2.01, gain: 0.05 },
            { ratio: 3.0,  gain: 0.025 }
        ];

        partials.forEach(function(p) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(p.gain, now + 0.09);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 3.3);
        });
    }

    loadMutePreference();

    return {
        isMuted: isMuted,
        toggleMuted: toggleMuted,
        playStoneSlide: playStoneSlide,
        playVictoryChime: playVictoryChime
    };
})();
