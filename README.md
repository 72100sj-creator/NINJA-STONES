🥷 Ninja Stones

Un jeu mobile de puzzle zen et de restauration de jardins.
📁 Architecture du projet

Le projet est organisé de manière modulaire pour garantir une maintenance facile sur le long terme.

ninja-stones/│├── index.html            # Point d'entrée HTML├── manifest.json         # Configuration PWA├── service-worker.js     # Mise en cache hors-ligne (PWA)├── README.md             # Documentation│├── css/│   └── style.css         # Styles visuels et animations│├── js/│   ├── constants.js      # Dictionnaire du jeu (tailles, paliers, noms)│   ├── utils.js          # Fonctions mathématiques génériques│   ├── save.js           # Gestion du LocalStorage│   ├── levels.js         # Logique de difficulté et de niveaux│   ├── garden.js         # Calculs d'Harmonie et d'évolution des jardins│   ├── puzzle.js         # Logique pure du puzzle (grille, déplacements)│   ├── ui.js             # Manipulation du DOM et affichage visuel│   └── app.js            # Chef d'orchestre (Initialisation et événements)│└── assets/    ├── images/           # (Futur) Illustrations    ├── sounds/           # (Futur) Musique et bruitages    └── icons/            # (Futur) Icônes d'application

🧩 Rôle des modules

     constants.js : Centralise toutes les valeurs fixes. Si vous voulez modifier le nombre de points requis pour évoluer un jardin, c'est ici.
     puzzle.js : Ne connaît pas l'interface. Il fournit uniquement des fonctions pour créer une grille, la mélanger et vérifier la victoire.
     garden.js : Calcul les stades visuels et les pourcentages de la barre de progression en fonction des Points d'Harmonie.
     ui.js : S'occupe exclusivement de dessiner les pierres, changer les écrans et animer les éléments HTML.
     app.js : Relie tous les modules entre eux. Il écoute les clics de l'utilisateur, demande à puzzle.js de bouger une pierre, demande à garden.js d'ajouter des points, et dit à ui.js de mettre à jour l'écran.