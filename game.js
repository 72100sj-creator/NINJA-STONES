/**
 * Ninja Stones - V0.0.3
 * Restructuration pour préparer Niveaux / Mouvements / Progression
 */

// --- ÉTAT GLOBAL DU JEU (Prêt pour la progression) ---
const state = {
    level: 1,           // Futur : niveau actuel
    moves: 0,           // Futur : compteur de mouvements
    gridSize: 4,        // Futur : pourra passer à 3, 5, etc.
    totalTiles: 16,     // Calculé dynamiquement
    grid: [],           // Le plateau (0 = case vide)
    isPlaying: false    // Futur : gestion des animations bloquantes
};

// Éléments du DOM
const boardElement = document.getElementById('board');
const restartBtn = document.getElementById('restart-btn');
const messageElement = document.getElementById('message');

// Dictionnaire pour stocker les éléments DOM de chaque pierre
let tilesElements = {}; 


/**
 * Initialise ou réinitialise une partie selon l'état actuel
 */
function initGame() {
    // Mise à jour des valeurs dérivées de la taille de la grille
    state.totalTiles = state.gridSize * state.gridSize;
    state.moves = 0;
    state.isPlaying = true;
    messageElement.textContent = '';

    // Générer et mélanger le plateau
    state.grid = generateSolvedGrid();
    shuffleGrid(state.grid);

    // Affichage
    renderBoard();
}

/**
 * Génère une grille résolue [1, 2, 3... N-1, 0]
 */
function generateSolvedGrid() {
    let grid = [];
    for (let i = 1; i < state.totalTiles; i++) {
        grid.push(i);
    }
    grid.push(0);
    return grid;
}

/**
 * Mélange la grille par mouvements aléatoires valides.
 * Garantit à 100% que le puzzle est résolvable (pas de frustration).
 */
function shuffleGrid(grid) {
    let emptyIndex = grid.indexOf(0);
    // Le nombre de mouvements pourrait dépendre du 'state.level' à l'avenir
    let shuffleMoves = 200; 

    for (let i = 0; i < shuffleMoves; i++) {
        let neighbors = getAdjacentIndexes(emptyIndex);
        let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Échange
        grid[emptyIndex] = grid[randomNeighbor];
        grid[randomNeighbor] = 0;
        emptyIndex = randomNeighbor;
    }
}

/**
 * Récupère les index des cases voisines (Haut, Bas, Gauche, Droite)
 */
function getAdjacentIndexes(index) {
    let row = Math.floor(index / state.gridSize);
    let col = index % state.gridSize;
    let neighbors = [];

    if (row > 0) neighbors.push(index - state.gridSize);
    if (row < state.gridSize - 1) neighbors.push(index + state.gridSize);
    if (col > 0) neighbors.push(index - 1);
    if (col < state.gridSize - 1) neighbors.push(index + 1);

    return neighbors;
}

/**
 * Affiche les pierres sur le plateau
 */
function renderBoard() {
    boardElement.innerHTML = '';
    tilesElements = {};

    const boardWidth = boardElement.clientWidth;
    const gap = 4; 
    const stoneSize = (boardWidth - (gap * (state.gridSize + 1))) / state.gridSize;

    for (let i = 0; i < state.totalTiles; i++) {
        let value = state.grid[i];
        if (value === 0) continue;

        let row = Math.floor(i / state.gridSize);
        let col = i % state.gridSize;

        let x = gap + col * (stoneSize + gap);
        let y = gap + row * (stoneSize + gap);

        const stone = document.createElement('div');
        stone.className = 'stone';
        stone.textContent = value;
        stone.style.width = `${stoneSize}px`;
        stone.style.height = `${stoneSize}px`;
        stone.style.transform = `translate(${x}px, ${y}px)`;

        stone.addEventListener('click', () => handleTileClick(value));

        boardElement.appendChild(stone);
        tilesElements[value] = stone;
    }
}

/**
 * Gère le clic sur une pierre
 */
function handleTileClick(value) {
    if (!state.isPlaying) return;

    let clickedIndex = state.grid.indexOf(value);
    let emptyIndex = state.grid.indexOf(0);

    let neighbors = getAdjacentIndexes(emptyIndex);
    
    if (neighbors.includes(clickedIndex)) {
        // Inverser dans la logique
        state.grid[emptyIndex] = value;
        state.grid[clickedIndex] = 0;

        // Mise à jour de la structure de progression
        state.moves++; 

        // Mettre à jour l'animation
        updateTilePosition(value, emptyIndex);

        // Vérifier la victoire
        if (checkWin()) {
            state.isPlaying = false;
            messageElement.textContent = "Jardin restauré.";
            // Futur : déclencher la sauvegarde de la progression ici
        }
    }
}

/**
 * Met à jour la position CSS d'une pierre
 */
function updateTilePosition(value, newIndex) {
    const stone = tilesElements[value];
    if (!stone) return;

    const boardWidth = boardElement.clientWidth;
    const gap = 4;
    const stoneSize = (boardWidth - (gap * (state.gridSize + 1))) / state.gridSize;

    let row = Math.floor(newIndex / state.gridSize);
    let col = newIndex % state.gridSize;
    
    let x = gap + col * (stoneSize + gap);
    let y = gap + row * (stoneSize + gap);

    stone.style.transform = `translate(${x}px, ${y}px)`;
}

/**
 * Vérifie si le joueur a gagné
 */
function checkWin() {
    for (let i = 0; i < state.totalTiles - 1; i++) {
        if (state.grid[i] !== i + 1) {
            return false;
        }
    }
    return true;
}

// --- ÉCOUTEURS ---
restartBtn.addEventListener('click', initGame);

window.addEventListener('resize', () => {
    for (let i = 0; i < state.totalTiles; i++) {
        let value = state.grid[i];
        if (value !== 0) {
            updateTilePosition(value, i);
        }
    }
});

// --- DÉMARRAGE ---
initGame();
