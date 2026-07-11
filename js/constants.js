window.NS_CONSTANTS = {
    DEFAULT_GRID_SIZE: 4,
    SHUFFLE_BASE_MOVES: 15,
    SHUFFLE_INCREMENT: 15,
    SHUFFLE_MAX_MOVES: 200,
    STONE_GAP: 4,
    MAX_VISUAL_STAGE: 4,
    DEBUG_SCENE: false, // Grille de repères pour le développement (RFC-001) - ne jamais activer en production
    
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
        { id: 'bamboo', name: 'Jardin du Bambou', thresholds: [5, 10, 20, 35, 50, 75, 100], points: 0,
          stageNames: ['Jardin naissant', 'Jardin en éveil', 'Jardin fleurissant', 'Jardin épanoui'],
          backgroundImage: 'assets/images/garden-bamboo-stage-1.jpg',
          stageTints: [
              'linear-gradient(to bottom, rgba(194, 178, 128, 0.15), rgba(143, 168, 110, 0.45))',
              'linear-gradient(to bottom, rgba(168, 184, 122, 0.35), rgba(95, 122, 66, 0.55))',
              'linear-gradient(135deg, rgba(74, 103, 65, 0.55), rgba(122, 155, 104, 0.55))'
          ] },
        { id: 'autumn', name: "Jardin d'Automne", thresholds: [5, 10, 20, 35, 50, 75, 100], points: 0,
          stageNames: ['Feuilles naissantes', 'Feuilles dorées', 'Feuilles ardentes', 'Jardin embrasé'],
          backgroundImage: 'assets/images/garden-autumn-stage-1.jpg',
          stageTints: [
              'linear-gradient(to bottom, rgba(200, 150, 90, 0.15), rgba(190, 110, 60, 0.4))',
              'linear-gradient(to bottom, rgba(180, 100, 50, 0.35), rgba(140, 60, 30, 0.5))',
              'linear-gradient(135deg, rgba(120, 50, 20, 0.55), rgba(170, 80, 30, 0.5))'
          ] }
    ]
};
