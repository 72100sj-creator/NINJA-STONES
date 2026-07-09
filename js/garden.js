window.NS_Garden = {
    calculateStage: function(garden) {
        const C = window.NS_CONSTANTS;
        let stage = 1;
        for (let i = 0; i < garden.thresholds.length; i++) {
            if (garden.points >= garden.thresholds[i]) stage = i + 2;
        }
        return NS_Utils.clamp(stage, 1, C.MAX_VISUAL_STAGE);
    },
    calculateProgress: function(garden) {
        let stage = this.calculateStage(garden);
        let currentThreshold = (stage === 1) ? 0 : garden.thresholds[stage - 2];
        if (stage > garden.thresholds.length) return 100;
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
