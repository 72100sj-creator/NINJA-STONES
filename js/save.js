/**
 * save.js
 * Gestion de la sauvegarde locale (LocalStorage).
 */
window.NS_Save = {
    STORAGE_LEVEL_KEY: 'ninjaStonesLevel',
    STORAGE_GARDENS_KEY: 'ninjaStonesGardens',

    /**
     * Charge les données depuis le téléphone et met à jour l'état.
     * @param {Object} state - L'état global du jeu
     * @param {Array} gardensConfig - La configuration des jardins
     */
    load: function(state, gardensConfig) {
        try {
            const savedLevel = localStorage.getItem(this.STORAGE_LEVEL_KEY);
            if (savedLevel) state.level = parseInt(savedLevel, 10);

            const savedGardens = JSON.parse(localStorage.getItem(this.STORAGE_GARDENS_KEY));
            if (savedGardens) {
                savedGardens.forEach(savedGarden => {
                    const configGarden = gardensConfig.find(g => g.id === savedGarden.id);
                    if (configGarden) configGarden.points = savedGarden.points;
                });
            }
        } catch (e) {
            console.warn("Erreur de chargement de la sauvegarde :", e);
        }
    },

    /**
     * Sauvegarde l'état actuel dans le téléphone.
     * @param {Object} state - L'état global du jeu
     * @param {Array} gardensConfig - La configuration des jardins
     */
    save: function(state, gardensConfig) {
        try {
            localStorage.setItem(this.STORAGE_LEVEL_KEY, state.level.toString());
            const gardensToSave = gardensConfig.map(g => ({ id: g.id, points: g.points }));
            localStorage.setItem(this.STORAGE_GARDENS_KEY, JSON.stringify(gardensToSave));
        } catch (e) {
            console.warn("Erreur de sauvegarde :", e);
        }
    }
};
