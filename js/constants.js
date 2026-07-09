/**
 * constants.js
 * Toutes les constantes du jeu. Aucune valeur magique ne doit exister ailleurs.
 */
window.NS_CONSTANTS = {
    // Grille
    DEFAULT_GRID_SIZE: 4,
    
    // Mélange
    SHUFFLE_BASE_MOVES: 15,
    SHUFFLE_INCREMENT: 15,
    SHUFFLE_MAX_MOVES: 200,

    // Interface
    STONE_GAP: 4,
    CSS_STAGE_PREFIX: 'garden-stage-',
    MAX_VISUAL_STAGE: 4,

    // Jardins (Données de base)
    GARDENS_CONFIG: [
        {
            id: 'bamboo',
            name: 'Jardin du Bambou',
            thresholds: [5, 10, 20, 35, 50, 75, 100],
            points: 0
        }
    ]
};