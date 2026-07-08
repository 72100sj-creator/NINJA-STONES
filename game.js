/**
 * Ninja Stones - V0.0.3 (Fix Bug iOS)
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

const boardElement = document.getElementById('board');
const restartBtn = document.getElementById('restart-btn');
const messageElement = document.getElementById('message');

let tilesElements = {}; 

function initGame() {
    state.totalTiles = state.gridSize * state.gridSize;
    state.moves = 0;
    state.isPlaying = true;
    messageElement.textContent = '';

    state.grid = generateSolvedGrid();
    shuffleGrid(state.grid);

    renderBoard();
}

function generateSolvedGrid() {
    let grid = [];
    for (let i = 1; i < state.totalTiles; i++) {
        grid.push(i);
    }
    grid.push(0);
    return grid;
}

function shuffleGrid(grid) {
    let emptyIndex = grid.indexOf(0);
    let shuffleMoves = 200; 

    for (let i = 0; i < shuffleMoves; i++) {
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
    
    // SÉCURITÉ iOS : Si Safari n'a pas encore calculé la taille, on force une valeur par défaut
    if (boardWidth === 0) {
        boardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.85;
    }

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
            messageElement.textContent = "Jardin restauré.";
        }
    }
}

function updateTilePosition(value, newIndex) {
    const stone = tilesElements[value];
    if (!stone) return;

    let boardWidth = boardElement.clientWidth;
    if (boardWidth === 0) {
        boardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.85;
    }

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

// --- DÉMARRAGE SÉCURISÉ ---
// On attend que la page ET les styles soient 100% chargés avant de calculer les positions
window.addEventListener('load', initGame);
