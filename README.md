🥷 Ninja Stones

Un jeu mobile de puzzle zen et de restauration de jardins.
📁 Architecture du projet

Le projet est organisé de manière modulaire pour garantir une maintenance facile sur le long terme.

🧩 Rôle des modules

     constants.js : Centralise toutes les valeurs fixes. Si vous voulez modifier le nombre de points requis pour évoluer un jardin, c'est ici.
     puzzle.js : Ne connaît pas l'interface. Il fournit uniquement des fonctions pour créer une grille, la mélanger et vérifier la victoire.
     garden.js : Calcul les stades visuels et les pourcentages de la barre de progression en fonction des Points d'Harmonie.
     ui.js : S'occupe exclusivement de dessiner les pierres, changer les écrans et animer les éléments HTML.
     app.js : Relie tous les modules entre eux. Il écoute les clics de l'utilisateur, demande à puzzle.js de bouger une pierre, demande à garden.js d'ajouter des points, et dit à ui.js de mettre à jour l'écran.
