/**
 * Ninja Stones - V0.0.7
 * Évolution visuelle du jardin en fonction du niveau
 */

// --- ÉTAT GLOBAL DU JEU ---
const state = {
    level: 1,
    moves: 0,
    gridSize: 4, 
    totalTiles: 16,
    grid: [],
    isPlaying: false
};

// --- ÉLÉMENTS DU DOM ---
const boardElement = document.getElementById('board');
const restartBtn = document.getElementById('restart-btn');
const continueBtn = document.getElementById('continue-btn');
const messageElement = document.getElementById('message');
const levelDisplay = document.getElementById('level-display');

let tilesElements = {}; 

// --- GESTION DE LA SAUVEGARDE ---
function loadProgress() {
    try {
        const savedLevel = localStorage.getItem('ninjaStonesLevel');
        if (savedLevel) {
            state.level = parseInt(savedLevel, 10);
        }
    } catch (e) {
        console.log("Sauvegarde locale indisponible.");
    }
}

function saveProgress() {
    try {
        localStorage.setItem('ninjaStonesLevel', state.level.toString());
    } catch (e) {
        console.log("Impossible de sauvegarder.");
    }
}

// --- NOUVEAU : LOGIQUE D'ÉVOLUTION DU JARDIN ---

/**
 * Détermine le stade visuel du jardin en fonction du niveau.
 * Le stade est déduit du niveau, pas besoin de le sauvegarder séparément !
 */
function updateGardenVisual() {
    // On retire l'ancienne classe de jardin au cas où on changerait de stade
    boardElement.classList.remove('garden-stage-2', 'garden-stage-3', 'garden-stage-4');

    if (state.level >= 10) {
        boardElement.classList.add('garden-stage-4');
    } else if (state.level >= 7) {
        boardElement.classList.add('garden-stage-3');
    } else if (state.level >= 4) {
        boardElement.classList.add('garden-stage-2');
    }
    // Si niveau 1, 2 ou 3 : on ne met aucune classe supplémentaire, c'est le sable nu par défaut
}

// --- LOGIQUE DE DIFFICULTÉ ---
function getShuffleMovesForLevel(level) {
    const baseMoves = 15;     
    const increment = 15;     
    const maxMoves = 200;     
    return Math.min(baseMoves + (level - 1) * increment, maxMoves);
}

// --- LOGIQUE PRINCIPALE ---
function initGame() {
    state.totalTiles = state.gridSize * state.gridSize;
    state.moves = 0;
    state.isPlaying = true;
    
    levelDisplay.textContent = `Niveau ${state.level}`;
    updateGardenVisual(); // NOUVEAU : On applique la couleur du jardin
    
    continueBtn.classList.add('hidden');
    messageElement.classList.remove('visible');
    
    setTimeout(() => {
        messageElement.textContent = '';
        state.grid = generateSolvedGrid();
        shuffleGrid(state.grid, getShuffleMovesForLevel(state.level));
        renderBoard();
    }, 300);
}

function generateSolvedGrid() {
    let grid = [];
    for (let i = 1; i < state.totalTiles; i++) grid.push(i);
    grid.push(0);
    return grid;
}

function shuffleGrid(grid, moves) {
    let emptyIndex = grid.indexOf(0);
    for (let i = 0; i < moves; i++) {
        let neighbors = getAdjacentIndexes(emptyIndex);
        let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        grid[emptyIndex] = grid[randomNeighbor];
        grid[randomNeighbor] = 0;
        emptyIndex = randomNeighbor;
    }
}

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

function renderBoard() {
    boardElement.innerHTML = '';
    tilesElements = {};
    let boardWidth = boardElement.clientWidth;
    if (boardWidth === 0) boardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.85;

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

function handleTileClick(value) {
    if (!state.isPlaying) return;
    let clickedIndex = state.grid.indexOf(value);
    let emptyIndex = state.grid.indexOf(0);
    let neighbors = getAdjacentIndexes(emptyIndex);
    
    if (neighbors.includes(clickedIndex)) {
        state.grid[emptyIndex] = value;
        state.grid[clickedIndex] = 0;
        state.moves++; 
        updateTilePosition(value, emptyIndex);

        if (checkWin()) {
            state.isPlaying = false; 
            
            // NOUVEAU : Message lié à l'univers
            messageElement.textContent = "L'équilibre est rétabli.";
            
            void messageElement.offsetWidth; 
            messageElement.classList.add('visible');
            continueBtn.classList.remove('hidden');
            saveProgress();
        }
    }
}

function updateTilePosition(value, newIndex) {
    const stone = tilesElements[value];
    if (!stone) return;
    let boardWidth = boardElement.clientWidth;
    if (boardWidth === 0) boardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.85;
    const gap = 4;
    const stoneSize = (boardWidth - (gap * (state.gridSize + 1))) / state.gridSize;
    let row = Math.floor(newIndex / state.gridSize);
    let col = newIndex % state.gridSize;
    let x = gap + col * (stoneSize + gap);
    let y = gap + row * (stoneSize + gap);
    stone.style.transform = `translate(${x}px, ${y}px)`;
}

function checkWin() {
    for (let i = 0; i < state.totalTiles - 1; i++) {
        if (state.grid[i] !== i + 1) return false;
    }
    return true;
}

// --- ÉCOUTEURS ---
restartBtn.addEventListener('click', initGame);
continueBtn.addEventListener('click', () => {
    state.level++; 
    saveProgress(); 
    initGame();     
});

window.addEventListener('resize', () => {
    for (let i = 0; i < state.totalTiles; i++) {
        let value = state.grid[i];
        if (value !== 0) updateTilePosition(value, i);
    }
});

// --- DÉMARRAGE ---
window.addEventListener('load', () => {
    loadProgress(); 
    initGame();
});
