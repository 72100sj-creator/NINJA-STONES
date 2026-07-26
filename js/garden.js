window.NS_Garden = {
    // Index du jardin (0 à 4) correspondant à un niveau global (1 à 100+).
    // Au-delà du dernier jardin, on reste sur le dernier (pas de crash si on dépasse 100).
    getGardenIndexForLevel: function(level) {
        const C = window.NS_CONSTANTS;
        const index = Math.floor((level - 1) / C.LEVELS_PER_GARDEN);
        return NS_Utils.clamp(index, 0, C.GARDENS_CONFIG.length - 1);
    },

    // Position du niveau A L'INTERIEUR de son jardin (1 à 20).
    getLevelInGarden: function(level) {
        const C = window.NS_CONSTANTS;
        return ((level - 1) % C.LEVELS_PER_GARDEN) + 1;
    },

    getCurrentGarden: function(level, gardensConfig) {
        return gardensConfig[this.getGardenIndexForLevel(level)];
    },

    // Etape visuelle du décor (1 à 4). Le décor évolue sur les niveaux 1 à 16 du jardin
    // (4 niveaux par étape), puis reste stable de 17 à 20 (palier de repos).
    calculateStage: function(levelInGarden) {
        const C = window.NS_CONSTANTS;
        const stage = Math.ceil(Math.min(levelInGarden, 16) / 4);
        return NS_Utils.clamp(stage, 1, C.MAX_VISUAL_STAGE);
    },

    // Progression (0 à 100%) au sein du jardin actuel, pour la barre du menu.
    calculateProgress: function(levelInGarden) {
        const C = window.NS_CONSTANTS;
        return NS_Utils.clamp((levelInGarden / C.LEVELS_PER_GARDEN) * 100, 0, 100);
    },

    // Vrai si ce niveau est le dernier du jardin (20e) : déclenche l'animation de fin de jardin.
    isLastLevelOfGarden: function(levelInGarden) {
        const C = window.NS_CONSTANTS;
        return levelInGarden >= C.LEVELS_PER_GARDEN;
    },

    // Vrai s'il y a un jardin suivant après celui-ci.
    hasNextGarden: function(level, gardensConfig) {
        return this.getGardenIndexForLevel(level) < gardensConfig.length - 1;
    }
};
