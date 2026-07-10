window.NS_CONSTANTS = {
    DEFAULT_GRID_SIZE: 4,
    SHUFFLE_BASE_MOVES: 15,
    SHUFFLE_INCREMENT: 15,
    SHUFFLE_MAX_MOVES: 200,
    STONE_GAP: 4,
    CSS_STAGE_PREFIX: 'garden-stage-',
    MAX_VISUAL_STAGE: 4,
    DEBUG_SCENE: true, // Grille de repères pour le développement (RFC-001) - ne jamais activer en production
    
    // NOUVEAU : La palette officielle de l'Art Bible
    PALETTE: {
        STONE: {
            CLASSIC: { BASE: '#8D8A83', LIGHT: '#A9A69F', DARK: '#6E6B65' }, // Gris chaud
            MOSS:    { BASE: '#6FA86B', LIGHT: '#8DC08A', DARK: '#558A52' }, // Vert doux
            RIVER:   { BASE: '#8FCFD1', LIGHT: '#ABE0E2', DARK: '#6FAEB0' }, // Gris-bleu
            SUN:     { BASE: '#D8A24A', LIGHT: '#E4B86E', DARK: '#BC8A32' }, // Beige doré
            MOON:    { BASE: '#C5C3BE', LIGHT: '#DDDAD5', DARK: '#A9A7A2' }  // Gris clair
        }
    },

    GARDENS_CONFIG: [
        { id: 'bamboo', name: 'Jardin du Bambou', thresholds: [5, 10, 20, 35, 50, 75, 100], points: 0 }
    ]
};
