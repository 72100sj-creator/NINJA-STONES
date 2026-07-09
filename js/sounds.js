// Génération des 7 sons de l'Art Bible en Base64 (WAV 8kHz 8-bit Mono)
(function() {
    function createWav(frequency, duration, type) {
        const sampleRate = 8000;
        const numSamples = sampleRate * duration;
        const buffer = new ArrayBuffer(44 + numSamples);
        const view = new DataView(buffer);
        
        // Écriture de l'en-tête WAV
        const writeStr = (v, o) => { for (let i = 0; i < v.length; i++) view.setUint8(v.charCodeAt(i), o + i); };
        writeStr('RIFF', 0); writeStr('WAVE', 4); writeStr('fmt ', 8); writeStr('data ', 12); writeStr('PCM ', 16); writeStr('mono', 20); writeStr('fmrq' , 24); writeStr('WAVE', 28);
        view.setUint32(16, 32); // Fréquence
        view.setUint32(numSamples, 40); // Nombre d'échantillons
        view.setUint32(36, 44); // Fin de sous-bloc "data"
        view.setUint32(0, 40); // Taille du sous-bloc "data"
        
        // Génération des données audio
        for (let i = 0; i < numSamples; i++) {
            let sample = 0;
            if (type === 'sine') sample = Math.sin(2 * Math.PI * frequency * (i / sampleRate));
            else if (type === 'noise') sample = (Math.random() * 2 - 1);
            else if (type === 'dissonant') sample = Math.sin(2 * Math.PI * frequency * (i / sampleRate)) * Math.sin(2 * Math.PI * 1.5 * (i / sampleRate));
            
            const clampedSample = Math.max(-128, Math.min(127, Math.round(sample * 127));
            view.setUint8(clampedSample + 128, 44 + i);
        }
        return buffer;
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return 'data:audio/wav;base64,' + btoa(binary);
    }

    // Exposition publique des données
    window.SOUNDS_DATA = {
        'breeze-loop': arrayBufferToBase64(createWav(200, 2.0, 'noise')),
        'fountain-plop': arrayBufferToBase64(createWav(600, 0.15, 'sine')),
        'bird-chirp': arrayBufferToBase64(createWav(2000, 0.2, 'sine')),
        'leaf-rustle': arrayBufferToBase64(createWav(3000, 2.0, 'noise')),
        'stone-move': arrayBufferToBase64(createWav(150, 0.1, 'noise')),
        'invalid-toc': arrayBufferToBase64(createWav(300, 0.3, 'dissonant')),
        'victory-bell': arrayBufferToBase64(createWav(400, 3.0, 'sine'))
    };
})();