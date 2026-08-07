# 🥷 Ninja Stones

Un puzzle coulissant zen, en PWA, jouable sur iPhone.
Le joueur ne débloque pas des récompenses : **il restaure un jardin**.

> *« Une seule pierre à la fois. »*

**Version actuelle : v1.1.6** — le numéro s'affiche en bas de l'écran d'accueil.

---

## Le jeu en bref

Un taquin 4×4 classique, habillé d'un univers **Zen Miniature** : jardins japonais vus de dessus, animations d'ambiance discrètes, sons synthétisés doux.

- **8 jardins**, **160 niveaux** (20 par jardin)
- Chaque jardin **s'éveille progressivement** au fil des niveaux : les couleurs reviennent, les animations apparaissent une à une
- Une **séquence de réveil** contemplative clôt chaque jardin
- Un **grand final** une fois le voyage achevé, rejouable à volonté
- Les jardins traversés sont **revisitables** à tout moment depuis le menu
- Fonctionne **hors connexion**, installable sur l'écran d'accueil

---

## Les jardins

| # | Niveaux | Jardin | Ambiance |
|---|---|---|---|
| 1 | 1-20 | 🎋 Jardin du Bambou | vert, sable clair, sérénité |
| 2 | 21-40 | 🍂 Jardin d'Automne | orange, feuilles, lumière basse |
| 3 | 41-60 | ❄️ Jardin d'Hiver | blanc-bleuté, givre, silence |
| 4 | 61-80 | 🌸 Jardin des Sakura | rose, pétales, floraison |
| 5 | 81-100 | 🌙 Jardin de Nuit | bleu profond, lucioles, étoiles |
| 6 | 101-120 | 🌊 Jardin de l'Eau | verts profonds, reflets, remous |
| 7 | 121-140 | 🔥 Jardin des Braises | rouges sombres, cendres, lueurs |
| 8 | 141-160 | ✨ Jardin Éternel | les sept jardins réunis |

Le **Jardin Éternel** est unique : il démarre déjà restauré et affiche **toutes les animations des sept autres** simultanément. Son image est composée des sept jardins fondus en secteurs rayonnants.

---

## Comment fonctionne la progression

Chaque jardin dure 20 niveaux, découpés ainsi :

```
niv 1   la lanterne respire         niv 11  animation rare 2
niv 3   les bambous se balancent    niv 13  lucioles et dragon
niv 5   le bassin s'anime           niv 15  animation rare 3
niv 7   animation signature         niv 17  animation rare 4
niv 9   animation rare 1            niv 20  → séquence de réveil
```

En parallèle, le décor passe d'un état **endormi** (délavé, assombri) à **pleinement vivant**, en continu du niveau 1 au 10.

**La séquence de réveil** (niveau 20) : le puzzle s'efface, le jardin retourne à son état endormi puis rejoue toute sa renaissance, animations comprises. Elle ne se termine pas seule — le jardin reste vivant jusqu'à ce que le joueur touche l'écran.

---

## Le grand final

Au niveau 160, le voyage s'achève par une séquence contemplative d'environ deux minutes :

1. Les **huit jardins défilent** un par un (15 s chacun), pleinement restaurés, toutes animations actives, leur nom apparaissant en bas comme un générique
2. Le **Jardin Éternel** clôt le défilé
3. Le **Ninja Jardinier apparaît et salue**, accompagné d'un carillon de sept notes
4. Le message final s'affiche — et le jardin reste vivant indéfiniment

Le final est **rejouable** depuis le bouton « Revoir le voyage », qui apparaît sur le menu une fois le niveau 160 atteint.

## Revisiter les jardins

La **frise de progression du menu est cliquable** : chaque pastille de jardin déjà atteint y ramène. Le jeu mémorise séparément le niveau courant et le niveau le plus loin jamais atteint (`ninjaStonesMaxLevel`) — revenir au premier jardin ne referme donc jamais les suivants.

---

## Architecture

Le projet suit une architecture modulaire, sans framework ni dépendance.

```
index.html              structure et couches de la scène
manifest.json           configuration PWA
service-worker.js       mode hors-ligne
privacy.html            politique de confidentialité
mentions-legales.html   mentions légales

css/
  style.css             tout le visuel et les animations

js/
  constants.js          ⭐ configuration des jardins et réglages
  levels.js             les 160 niveaux (nom + difficulté)
  garden.js             progression, restauration, éveil des animations
  puzzle.js             🔒 logique du taquin (verrouillé)
  save.js               sauvegarde locale
  audio.js              sons synthétisés
  ui.js                 affichage et séquence de réveil
  app.js                orchestration
  scene-debug.js        grille de repères (développement)

assets/images/          fonds des jardins, personnage, pierres, icônes
```

### Le Scene Engine (RFC-001)

Toute la scène vit dans un conteneur unique qui garde **toujours le ratio 9:16 de l'image de fond**, quel que soit l'écran. Le décor n'est jamais rogné différemment d'un appareil à l'autre, et tous les éléments décoratifs sont positionnés en pourcentages de cette scène.

### La configuration des jardins (RFC-002)

Chaque jardin est décrit entièrement dans `constants.js` :

```js
{
  id: 'winter',
  name: "Jardin d'Hiver",
  backgroundImage: '...',
  stageNames: [...],
  restoration: { fromLevel, toLevel, start, end },   // comment il s'éveille
  animationUnlocks: { lantern: 1, bamboo: 3, ... },  // quand chaque famille apparaît
  stones: { hueRotate, saturate, brightness }        // teinte de ses pierres
}
```

**Ajouter un jardin** ne demande qu'une image et un bloc de configuration. Les réglages non définis sont hérités de `GARDEN_DEFAULTS` — aucune ligne de logique à écrire.

---

## Ce qui est verrouillé

Le **gameplay n'a jamais été modifié** depuis la version initiale : génération du puzzle, mélange toujours solvable, déplacements, détection de victoire. Toute évolution doit préserver cette base.

---

## Développement

Aucune installation nécessaire : ouvrir `index.html` dans un navigateur suffit.

**Tester un niveau précis** (console du navigateur, puis recharger) :

```js
localStorage.setItem('ninjaStonesLevel', '85')
```

**Afficher la grille de repères** — utile pour positionner un élément dans un nouveau jardin : passer `DEBUG_SCENE` à `true` dans `constants.js`. Une grille en pourcentages s'affiche sur la scène.

**Le dragon et la libellule** — la libellule traverse tous les jardins ; le dragon, bien plus grand et plus lent, est réservé au Jardin des Braises et au Jardin Éternel. Pour des raisons historiques, la classe CSS du dragon s'appelle encore `.dragonfly` et celle de la libellule `.damselfly`.

**Zones libres de l'écran** — le plateau de jeu masque la bande 35-80% en hauteur. Les animations doivent être placées dans les zones dégagées : 13-35% et 80-100% en hauteur, ou les bords 0-10% et 90-100% en largeur.

**Après une mise à jour d'image** conservant le même nom de fichier, incrémenter `CACHE_NAME` dans `service-worker.js`.

---

## Confidentialité

Aucune donnée collectée, aucun compte, aucun serveur, aucune publicité, aucun traceur. La progression est enregistrée uniquement sur l'appareil du joueur.

---

## Historique

| Étape | Contenu |
|---|---|
| Sprint 2 | Scene Engine, premier jardin, plateau, pierres, personnage, animations d'ambiance |
| Sprint 3 | Écran de victoire, transitions, progression du jardin |
| Sprint 4 | 100 niveaux nommés et équilibrés |
| Sprint 5 | Deuxième jardin, bascule automatique |
| Sprint 6 | Ambiance sonore synthétisée |
| Sprint 7 | Icône, PWA, mentions légales, captures App Store |
| RFC-002 | Progression vivante : restauration, éveil des animations, identité par jardin |
| — | 5 jardins supplémentaires, 28 animations rares, séquence de réveil, dragon, mode hors-ligne |
| v1.1.0 | Grand final, jardins revisitables, expressions du personnage |

---

*Ninja Stones — 72100sj-creator, France*
