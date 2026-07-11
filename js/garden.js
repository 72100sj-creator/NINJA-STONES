window.NS_Garden = {
    // Calcule le palier atteint sur l'ensemble des paliers (non limité) - sert de base commune
    calculateProgressStage: function(garden) {
        let stage = 1;
        for (let i = 0; i < garden.thresholds.length; i++) {
            if (garden.points >= garden.thresholds[i]) stage = i + 2;
        }
        return stage;
    },
    // Aspect visuel du jardin (teinte du décor) : volontairement limité à MAX_VISUAL_STAGE apparences
    calculateStage: function(garden) {
        const C = window.NS_CONSTANTS;
        return NS_Utils.clamp(this.calculateProgressStage(garden), 1, C.MAX_VISUAL_STAGE);
    },
    // Progression réelle (barre + texte) : va jusqu'au bout des paliers, jusqu'à "Jardin maîtrisé"
    calculateProgress: function(garden) {
        let stage = this.calculateProgressStage(garden);
        if (stage > garden.thresholds.length) return 100;
        let currentThreshold = (stage === 1) ? 0 : garden.thresholds[stage - 2];
        let nextThreshold = garden.thresholds[stage - 1];
        let progress = (garden.points - currentThreshold) / (nextThreshold - currentThreshold);
        return NS_Utils.clamp(progress * 100, 0, 100);
    },
    awardPoints: function(garden, amount) {
        garden.points += amount;
        let nextThreshold = garden.thresholds.find(t => t > garden.points);
        return nextThreshold ? `Prochain palier : ${nextThreshold}` : "Jardin maîtrisé";
    }
};
