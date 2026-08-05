window.NS_CONSTANTS = {
    DEFAULT_GRID_SIZE: 4,
    SHUFFLE_BASE_MOVES: 15,
    SHUFFLE_INCREMENT: 15,
    SHUFFLE_MAX_MOVES: 200,
    STONE_GAP: 4,
    MAX_VISUAL_STAGE: 4,
    LEVELS_PER_GARDEN: 20, // chaque jardin dure 20 niveaux (Sprint "5 jardins")
    DEBUG_SCENE: false, // Grille de repères pour le développement (RFC-001) - ne jamais activer en production

    // ===== RFC-002 : valeurs par défaut =====
    // Tout jardin qui ne définit pas son propre bloc hérite de celles-ci.
    // C'est ce qui permet d'ajouter un jardin avec une configuration minimale.
    GARDEN_DEFAULTS: {
        // Restauration visuelle : le jardin passe d'endormi (délavé, sombre) à pleinement vivant
        restoration: {
            fromLevel: 1, toLevel: 10,
            start: { saturate: 0.30, brightness: 0.82, contrast: 0.92 },
            end:   { saturate: 1,    brightness: 1,    contrast: 1 }
        },
        // Niveau (dans le jardin) à partir duquel chaque famille d'animations s'éveille.
        // 'lantern' à 1 = le souffle minimal conservé dès le premier niveau.
        animationUnlocks: {
            lantern: 1,     // respiration de la lanterne + halo au sol
            bamboo: 3,      // balancement des bambous
            pond: 5,        // ondes et reflets du bassin
            signature: 7,   // animation propre au jardin (feuilles, neige, pétales...)
            extra1: 9,      // 1re animation rare, propre au jardin
            extra2: 11,     // 2e animation rare
            ambient: 13,    // lucioles et libellule
            extra3: 15,     // 3e animation rare
            extra4: 17      // 4e animation rare, la dernière avant le réveil du jardin
        },
        // Harmonisation des pierres avec la palette du jardin (aucun nouvel asset nécessaire :
        // les 5 textures existantes sont simplement réaccordées).
        stones: { hueRotate: 0, saturate: 1, brightness: 1 }
    },

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

    // Chaque jardin dure 20 niveaux. Il s'éveille progressivement (restoration) et ses animations
    // apparaissent une famille à la fois (animationUnlocks). Un nouveau jardin = une image + un bloc ici.
    GARDENS_CONFIG: [
        { id: 'bamboo', name: 'Jardin du Bambou',
          stageNames: ['Jardin naissant', 'Jardin en éveil', 'Jardin fleurissant', 'Jardin épanoui'],
          backgroundImage: 'assets/images/garden-bamboo-stage-1.jpg',
          // Le bambou est la référence : pierres non retouchées, restauration standard
          stones: { hueRotate: 0, saturate: 1, brightness: 1 } },
        { id: 'autumn', name: "Jardin d'Automne",
          stageNames: ['Feuilles naissantes', 'Feuilles dorées', 'Feuilles ardentes', 'Jardin embrasé'],
          backgroundImage: 'assets/images/garden-autumn-stage-1.jpg',
          stones: { hueRotate: -100, saturate: 0.85, brightness: 1.06 } },
        { id: 'winter', name: "Jardin d'Hiver",
          stageNames: ['Premier givre', 'Jardin gelé', 'Silence blanc', 'Jardin immaculé'],
          backgroundImage: 'assets/images/garden-winter-stage-1.jpg',
          // L'hiver part déjà pâle : on le désature moins fort pour éviter un gris terne
          restoration: {
              fromLevel: 1, toLevel: 10,
              start: { saturate: 0.40, brightness: 0.86, contrast: 0.94 },
              end:   { saturate: 1,    brightness: 1,    contrast: 1 }
          },
          stones: { hueRotate: 78, saturate: 0.5, brightness: 1.16 } },
        { id: 'sakura', name: 'Jardin des Sakura',
          stageNames: ['Bourgeons timides', 'Sakura en fleur', 'Pluie de pétales', 'Jardin en floraison'],
          backgroundImage: 'assets/images/garden-sakura-stage-1.jpg',
          // Le rose disparaît fortement quand le jardin dort : contraste de renaissance plus marqué
          restoration: {
              fromLevel: 1, toLevel: 10,
              start: { saturate: 0.22, brightness: 0.84, contrast: 0.92 },
              end:   { saturate: 1,    brightness: 1,    contrast: 1 }
          },
          stones: { hueRotate: 218, saturate: 0.78, brightness: 1.1 } },
        { id: 'night', name: 'Jardin de Nuit',
          stageNames: ['Crépuscule', 'Lueurs naissantes', 'Nuit étoilée', 'Jardin illuminé'],
          backgroundImage: 'assets/images/garden-night-stage-1.jpg',
          // La nuit est déjà sombre : on l'assombrit à peine, sinon le décor devient illisible
          restoration: {
              fromLevel: 1, toLevel: 10,
              start: { saturate: 0.35, brightness: 0.90, contrast: 0.95 },
              end:   { saturate: 1,    brightness: 1,    contrast: 1 }
          },
          // Les lucioles font partie de l'identité du jardin de nuit : elles arrivent plus tôt
          animationUnlocks: { lantern: 1, bamboo: 3, pond: 5, signature: 7, extra1: 9, ambient: 10, extra2: 11, extra3: 15, extra4: 17 },
          stones: { hueRotate: 95, saturate: 0.6, brightness: 0.8 } },
        { id: 'water', name: "Jardin de l'Eau",
          stageNames: ['Eau dormante', 'Premiers remous', 'Courants vifs', 'Jardin limpide'],
          backgroundImage: 'assets/images/garden-water-stage-1.jpg',
          // Déjà vert et sombre : on le désature modérément pour ne pas le rendre gris
          restoration: {
              fromLevel: 1, toLevel: 10,
              start: { saturate: 0.32, brightness: 0.84, contrast: 0.93 },
              end:   { saturate: 1,    brightness: 1,    contrast: 1 }
          },
          stones: { hueRotate: 85, saturate: 0.8, brightness: 1.0 } },
        { id: 'embers', name: 'Jardin des Braises',
          stageNames: ['Cendres froides', 'Premières lueurs', 'Braises ardentes', 'Jardin incandescent'],
          backgroundImage: 'assets/images/garden-embers-stage-1.jpg',
          // Le contraste de renaissance le plus fort du jeu : des cendres éteintes aux braises vives
          restoration: {
              fromLevel: 1, toLevel: 10,
              start: { saturate: 0.15, brightness: 0.72, contrast: 0.90 },
              end:   { saturate: 1,    brightness: 1,    contrast: 1 }
          },
          stones: { hueRotate: -118, saturate: 1.05, brightness: 0.92 } }
    ]
};
