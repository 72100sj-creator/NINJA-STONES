window.NS_Garden = {
    // Index du jardin (0 à 4) correspondant à un niveau global (1 à 100+).
    // Au-delà du dernier jardin, on reste sur le dernier (pas de crash si on dépasse 100).
    getGardenIndexForLevel: function(level) {
        const C = window.NS_CONSTANTS;
        const index = Math.floor((level - 1) / C.LEVELS_PER_GARDEN);
        return NS_Utils.clamp(index, 0, C.GARDENS_CONFIG.length - 1);
    },

    // Position du niveau A L'INTERIEUR de son jardin (1 à 20).
    // Passé le dernier jardin, on reste sur son dernier niveau plutôt que de tout recommencer
    // à zéro : le jardin final demeure achevé et vivant.
    getLevelInGarden: function(level) {
        const C = window.NS_CONSTANTS;
        const dernierNiveau = C.GARDENS_CONFIG.length * C.LEVELS_PER_GARDEN;
        if (level >= dernierNiveau) return C.LEVELS_PER_GARDEN;
        return ((level - 1) % C.LEVELS_PER_GARDEN) + 1;
    },

    // Vrai si le joueur a terminé l'ensemble des jardins.
    isJourneyComplete: function(level) {
        const C = window.NS_CONSTANTS;
        return level >= C.GARDENS_CONFIG.length * C.LEVELS_PER_GARDEN;
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
    },

    // Choisit un message de victoire adapté à l'avancée dans le jardin, sans jamais répéter
    // deux fois de suite le même sur des niveaux consécutifs (le message dépend du niveau).
    getWinMessage: function(levelInGarden) {
        const C = window.NS_CONSTANTS;
        let group;
        if (levelInGarden <= 7) group = C.WIN_MESSAGES.early;
        else if (levelInGarden <= 14) group = C.WIN_MESSAGES.middle;
        else group = C.WIN_MESSAGES.late;
        return group[(levelInGarden - 1) % group.length];
    },

    // ===== RFC-002 : lecture de la configuration =====
    // Un jardin peut ne définir qu'une partie de ses réglages : le reste vient des valeurs
    // par défaut. C'est ce qui permet d'ajouter un jardin sans tout redéclarer.
    getSetting: function(garden, blockName) {
        const C = window.NS_CONSTANTS;
        const defaults = (C.GARDEN_DEFAULTS && C.GARDEN_DEFAULTS[blockName]) || {};
        const own = (garden && garden[blockName]) || {};
        const merged = {};
        Object.keys(defaults).forEach(function(k) { merged[k] = defaults[k]; });
        Object.keys(own).forEach(function(k) { merged[k] = own[k]; });
        return merged;
    },

    // Avancée de la restauration, de 0 (jardin endormi) à 1 (jardin pleinement restauré).
    getRestorationRatio: function(levelInGarden, garden) {
        const r = this.getSetting(garden, 'restoration');
        const from = r.fromLevel || 1;
        const to = r.toLevel || 10;
        if (to <= from) return 1;
        return NS_Utils.clamp((levelInGarden - from) / (to - from), 0, 1);
    },

    // Filtre CSS correspondant à l'état de restauration du jardin à ce niveau.
    // Ne change qu'au changement de niveau : aucun coût image par image.
    getRestorationFilter: function(levelInGarden, garden) {
        const r = this.getSetting(garden, 'restoration');
        const start = r.start || {};
        const end = r.end || {};
        const t = this.getRestorationRatio(levelInGarden, garden);
        function mix(key, fallback) {
            const a = (typeof start[key] === 'number') ? start[key] : fallback;
            const b = (typeof end[key] === 'number') ? end[key] : fallback;
            return (a + (b - a) * t).toFixed(3);
        }
        return 'saturate(' + mix('saturate', 1) + ') brightness(' + mix('brightness', 1) +
               ') contrast(' + mix('contrast', 1) + ')';
    },

    // Une famille d'animations est-elle éveillée à ce niveau ?
    isAnimationUnlocked: function(key, levelInGarden, garden) {
        const unlocks = this.getSetting(garden, 'animationUnlocks');
        const threshold = (typeof unlocks[key] === 'number') ? unlocks[key] : 1;
        return levelInGarden >= threshold;
    },

    // Liste des classes à poser sur la scène pour activer les familles éveillées.
    getUnlockedAnimationClasses: function(levelInGarden, garden) {
        const unlocks = this.getSetting(garden, 'animationUnlocks');
        const self = this;
        return Object.keys(unlocks).filter(function(key) {
            return self.isAnimationUnlocked(key, levelInGarden, garden);
        }).map(function(key) { return 'anim-' + key; });
    },

    // Toutes les classes de familles possibles (pour pouvoir les retirer proprement).
    getAllAnimationClasses: function() {
        const C = window.NS_CONSTANTS;
        const defaults = (C.GARDEN_DEFAULTS && C.GARDEN_DEFAULTS.animationUnlocks) || {};
        const keys = {};
        Object.keys(defaults).forEach(function(k) { keys[k] = true; });
        C.GARDENS_CONFIG.forEach(function(g) {
            Object.keys(g.animationUnlocks || {}).forEach(function(k) { keys[k] = true; });
        });
        return Object.keys(keys).map(function(k) { return 'anim-' + k; });
    },

    // Filtre CSS harmonisant les pierres avec la palette du jardin.
    getStoneFilter: function(garden) {
        const s = this.getSetting(garden, 'stones');
        const hue = (typeof s.hueRotate === 'number') ? s.hueRotate : 0;
        const sat = (typeof s.saturate === 'number') ? s.saturate : 1;
        const bri = (typeof s.brightness === 'number') ? s.brightness : 1;
        return 'hue-rotate(' + hue + 'deg) saturate(' + sat + ') brightness(' + bri + ')';
    }
};
