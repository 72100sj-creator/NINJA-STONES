/**
 * Ninja Stones - V0.0.1
 * Logique de base du puzzle coulissant (15-puzzle)
 */

// Constantes de configuration
const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

// État du jeu
let boardState = []; // Contiendra les numéros des pierres (0 = case vide)
let tilesElements = {}; // Dictionnaire pour stocker les éléments DOM de chaque pierre

// Éléments du DOM
const boardElement = document.getElementById('board');
const restartBtn = document.getElementById('restart-btn');
const messageElement = document.getElementById('message');

/**
 * Initialise le jeu
 */
function initGame() {
    messageElement.textContent = '';
    boardState = generateSolvedBoard();
    shuffleBoard(boardState);
    renderBoard();
}

/**
 * Génère le plateau résolu [1, 2, 3... 15, 0]
 */
function generateSolvedBoard() {
    let board = [];
    for (let i = 1; i < TOTAL_TILES; i++) {
        board.push(i);
    }
    board.push(0); // La case vide est toujours à la fin au départ
    return board;
}

/**
 * Mélange le plateau en effectuant des mouvements aléatoires valides.
 * Garantit à 100% que le puzzle est résolvable (pas de frustration).
 */
function shuffleBoard(board) {
    let emptyIndex = board.indexOf(0);
    let moves = 200; // Nombre de mouvements pour bien mélanger

    for (let i = 0; i < moves; i++) {
        let neighbors = getNeighbors(emptyIndex);
        let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Échange
        board[emptyIndex] = board[randomNeighbor];
        board[randomNeighbor] = 0;
        emptyIndex = randomNeighbor;
    }
}

/**
 * Récupère les index des cases voisines d'un index donné (haut, bas, gauche, droite)
 */
function getNeighbors(index) {
    let row = Math.floor(index / GRID_SIZE);
    let col = index % GRID_SIZE;
    let neighbors = [];

    if (row > 0) neighbors.push(index - GRID_SIZE); // Voisin du haut
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE); // Voisin du bas
    if (col > 0) neighbors.push(index - 1); // Voisin de gauche
    if (col < GRID_SIZE - 1) neighbors.push(index + 1); // Voisin de droite

    return neighbors;
}

/**
 * Affiche les pierres sur le plateau en fonction de boardState
 */
function renderBoard() {
    boardElement.innerHTML = '';
    tilesElements = {};

    // Récupération des tailles calculées par CSS pour positionner les pierres
    const boardWidth = boardElement.clientWidth;
    const gap = 4; // Doit correspondre à --gap dans le CSS
    const stoneSize = (boardWidth - (gap * (GRID_SIZE + 1))) / GRID_SIZE;

    for (let i = 0; i < TOTAL_TILES; i++) {
        let value = boardState[i];
        if (value === 0) continue; // On n'affiche pas la case vide

        let row = Math.floor(i / GRID_SIZE);
        let col = i % GRID_SIZE;

        // Calcul de la position en pixels
        let x = gap + col * (stoneSize + gap);
        let y = gap + row * (stoneSize + gap);

        // Création de l'élément DOM
        const stone = document.createElement('div');
        stone.className = 'stone';
        stone.textContent = value;
        stone.style.width = `${stoneSize}px`;
        stone.style.height = `${stoneSize}px`;
        stone.style.transform = `translate(${x}px, ${y}px)`;

        // Événement au clic/touch
        stone.addEventListener('click', () => handleTileClick(value));

        boardElement.appendChild(stone);
        tilesElements[value] = stone;
    }
}

/**
 * Gère le clic sur une pierre
 */
function handleTileClick(value) {
    let clickedIndex = boardState.indexOf(value);
    let emptyIndex = boardState.indexOf(0);

    // Vérifie si la pierre cliquée est voisine de la case vide
    let neighbors = getNeighbors(emptyIndex);
    
    if (neighbors.includes(clickedIndex)) {
        // Inverser les valeurs dans le tableau d'état
        boardState[emptyIndex] = value;
        boardState[clickedIndex] = 0;

        // Mettre à jour l'animation de la pierre déplacée
        updateTilePosition(value, emptyIndex);

        // Vérifier la victoire
        if (checkWin()) {
            messageElement.textContent = "Jardin restauré.";
        }
    }
}

/**
 * Met à jour la position CSS d'une pierre spécifique avec une animation fluide
 */
function updateTilePosition(value, newIndex) {
    const stone = tilesElements[value];
    if (!stone) return;

    const boardWidth = boardElement.clientWidth;
    const gap = 4;
    const stoneSize = (boardWidth - (gap * (GRID_SIZE + 1))) / GRID_SIZE;

    let row = Math.floor(newIndex / GRID_SIZE);
    let col = newIndex % GRID_SIZE;
    
    let x = gap + col * (stoneSize + gap);
    let y = gap + row * (stoneSize + gap);

    // Le CSS gèrera la transition grâce à la propriété "transition: transform 0.15s"
    stone.style.transform = `translate(${x}px, ${y}px)`;
}

/**
 * Vérifie si le joueur a gagné
 */
function checkWin() {
    for (let i = 0; i < TOTAL_TILES - 1; i++) {
        if (boardState[i] !== i + 1) {
            return false;
        }
    }
    return true;
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS ---
restartBtn.addEventListener('click', initGame);

// Redimensionnement correct si l'utilisateur tourne son téléphone
window.addEventListener('resize', () => {
    // Simple re-rendu sans mélanger pour adapter les tailles
    for (let i = 0; i < TOTAL_TILES; i++) {
        let value = boardState[i];
        if (value !== 0) {
            updateTilePosition(value, i);
        }
    }
});

// --- DÉMARRAGE ---
initGame();