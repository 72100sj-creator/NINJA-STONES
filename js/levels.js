/**
 * levels.js
 * Gestion des niveaux et de la difficulté.
 */
window.NS_Levels = {
    /**
     * Calcule le nombre de mouvements de mélange pour un niveau donné.
     * @param {number} level - Le niveau actuel
     * @returns {number} Le nombre de mouvements
     */
    getShuffleMoves: function(level) {
        const C = window.NS_CONSTANTS;
        return NS_Utils.clamp(
            C.SHUFFLE_BASE_MOVES + (level - 1) * C.SHUFFLE_INCREMENT, 
            0, 
            C.SHUFFLE_MAX_MOVES
        );
    }
};