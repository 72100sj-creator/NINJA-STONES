window.NS_CONSTANTS = {
    DEFAULT_GRID_SIZE: 4,
    SHUFFLE_BASE_MOVES: 15,
    SHUFFLE_INCREMENT: 15,
    SHUFFLE_MAX_MOVES: 200,
    STONE_GAP: 4,
    MAX_VISUAL_STAGE: 4,
    LEVELS_PER_GARDEN: 20, // chaque jardin dure 20 niveaux (Sprint "5 jardins")
    DEBUG_SCENE: false, // Grille de repères pour le développement (RFC-001) - ne jamais activer en production

    // Messages de victoire, choisis selon l'avancée dans le jardin (début / milieu / approche de la fin).
    // Le message du 20e niveau est géré à part (fin de jardin).
    WIN_MESSAGES: {
        early: [
            "L'équilibre est rétabli.",
            "Une pierre trouve sa place.",
            "Le sable retrouve son calme.",
            "Le jardin respire un peu mieux.",
            "Rien ne presse. Tout arrive."
        ],
        middle: [
            "La patience porte ses fruits.",
            "Le jardin s'éveille doucement.",
            "Chaque pierre a sa juste place.",
            "Le silence s'installe.",
            "L'harmonie gagne du terrain."
        ],
        late: [
            "Le jardin est presque apaisé.",
            "L'ordre ancien refait surface.",
            "Plus qu'un souffle avant la sérénité.",
            "Le jardin reconnaît ta main.",
            "La dernière pierre approche."
        ]
    },

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

    // Chaque jardin dure 20 niveaux. Le décor évolue en 4 étapes visuelles sur les niveaux 1 à 16
    // du jardin, puis reste stable de 17 à 20 (palier de repos avant le jardin suivant).
    GARDENS_CONFIG: [
        { id: 'bamboo', name: 'Jardin du Bambou',
          stageNames: ['Jardin naissant', 'Jardin en éveil', 'Jardin fleurissant', 'Jardin épanoui'],
          backgroundImage: 'assets/images/garden-bamboo-stage-1.jpg',
          stageTints: [
              'linear-gradient(to bottom, rgba(194, 178, 128, 0.15), rgba(143, 168, 110, 0.45))',
              'linear-gradient(to bottom, rgba(168, 184, 122, 0.35), rgba(95, 122, 66, 0.55))',
              'linear-gradient(135deg, rgba(74, 103, 65, 0.55), rgba(122, 155, 104, 0.55))'
          ] },
        { id: 'autumn', name: "Jardin d'Automne",
          stageNames: ['Feuilles naissantes', 'Feuilles dorées', 'Feuilles ardentes', 'Jardin embrasé'],
          backgroundImage: 'assets/images/garden-autumn-stage-1.jpg',
          stageTints: [
              'linear-gradient(to bottom, rgba(200, 150, 90, 0.15), rgba(190, 110, 60, 0.4))',
              'linear-gradient(to bottom, rgba(180, 100, 50, 0.35), rgba(140, 60, 30, 0.5))',
              'linear-gradient(135deg, rgba(120, 50, 20, 0.55), rgba(170, 80, 30, 0.5))'
          ] },
        { id: 'winter', name: "Jardin d'Hiver",
          stageNames: ['Premier givre', 'Jardin gelé', 'Silence blanc', 'Jardin immaculé'],
          backgroundImage: 'assets/images/garden-winter-stage-1.jpg',
          stageTints: [
              'linear-gradient(to bottom, rgba(210, 225, 240, 0.15), rgba(180, 205, 230, 0.35))',
              'linear-gradient(to bottom, rgba(190, 210, 235, 0.3), rgba(150, 180, 215, 0.5))',
              'linear-gradient(135deg, rgba(130, 160, 200, 0.5), rgba(205, 222, 240, 0.4))'
          ] },
        { id: 'sakura', name: 'Jardin des Sakura',
          stageNames: ['Bourgeons timides', 'Sakura en fleur', 'Pluie de pétales', 'Jardin en floraison'],
          backgroundImage: 'assets/images/garden-sakura-stage-1.jpg',
          stageTints: [
              'linear-gradient(to bottom, rgba(250, 210, 220, 0.15), rgba(240, 180, 200, 0.35))',
              'linear-gradient(to bottom, rgba(245, 190, 205, 0.3), rgba(230, 150, 180, 0.5))',
              'linear-gradient(135deg, rgba(220, 130, 160, 0.5), rgba(250, 205, 220, 0.4))'
          ] },
        { id: 'night', name: 'Jardin de Nuit',
          stageNames: ['Crépuscule', 'Lueurs naissantes', 'Nuit étoilée', 'Jardin illuminé'],
          backgroundImage: 'assets/images/garden-night-stage-1.jpg',
          stageTints: [
              'linear-gradient(to bottom, rgba(30, 35, 70, 0.2), rgba(20, 25, 55, 0.4))',
              'linear-gradient(to bottom, rgba(25, 30, 60, 0.35), rgba(15, 18, 45, 0.55))',
              'linear-gradient(135deg, rgba(45, 32, 75, 0.55), rgba(85, 62, 115, 0.45))'
          ] }
    ]
};
