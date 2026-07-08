/**
 * Ninja Stones - V0.0.9 (Taille du plateau inratable)
 */

const state = {
    level: 1,
    moves: 0,
    gridSize: 4, 
    totalTiles: 16,
    grid: [],
    isPlaying: false
};

const screenMenu = document.getElementById('screen-menu');
const screenGame = document.getElementById('screen-game');

const levelDisplay = document.getElementById('level-display'); 
const menuBoard = document.getElementById('menu-board');
const playBtn = document.getElementById('play-btn');

const boardElement = document.getElementById('board');
const restartBtn = document.getElementById('restart-btn');
const continueBtn = document.getElementById('continue-btn');
const backBtn = document.getElementById('back-btn');
const messageElement = document.getElementById('message');

let tilesElements = {}; 

// --- NAVIGATION ---
function showScreen(screenName) {
    screenMenu.classList.remove('active');
    screenGame.classList.remove('active');
    
    if (screenName === 'menu') screenMenu.classList.add('active');
    if (screenName === 'game') screenGame.classList.add('active');
}

// --- SAUVEGARDE ---
function loadProgress() {
    try {
        const savedLevel = localStorage.getItem('ninjaStonesLevel');
        if (savedLevel) state.level = parseInt(savedLevel, 10);
    } catch (e) {}
}

function saveProgress() {
    try {
        localStorage.setItem('ninjaStonesLevel', state.level.toString());
    } catch (e) {}
}

// --- JARDIN ---
function updateGardenVisual(boardEl) {
    boardEl.classList.remove('garden-stage-2', 'garden-stage-3', 'garden-stage-4');
    if (state.level >= 10) boardEl.classList.add('garden-stage-4');
    else if (state.level >= 7) boardEl.classList.add('garden-stage-3');
    else if (state.level >= 4) boardEl.classList.add('garden-stage-2');
}

// --- MENU ---
function renderMenu() {
    levelDisplay.textContent = `Niveau ${state.level}`;
    updateGardenVisual(menuBoard);
    
    menuBoard.innerHTML = '';
    // Le CSS garantit maintenant que clientWidth est parfait
    let boardWidth = menuBoard.clientWidth;
    const gap = 4; 
    const stoneSize = (boardWidth - (gap * (state.gridSize + 1))) / state.gridSize;

    for (let i = 1; i < state.totalTiles; i++) {
        let row = Math.floor((i - 1) / state.gridSize);
        let col = (i - 1) % state.gridSize;
        let x = gap + col * (stoneSize + gap);
        let y = gap + row * (stoneSize + gap);

        const stone = document.createElement('div');
        stone.className = 'stone';
        stone.textContent = i;
        stone.style.width = `${stoneSize}px`;
        stone.style.height = `${stoneSize}px`;
        stone.style.transform = `translate(${x}px, ${y}px)`;
        menuBoard.appendChild(stone);
    }
}

// --- DIFFICULTÉ ---
function getShuffleMovesForLevel(level) {
    return Math.min(15 + (level - 1) * 15, 200);
}

// --- JEU ---
function initGame() {
    state.totalTiles = state.gridSize * state.gridSize;
    state.moves = 0;
    state.isPlaying = true;
    
    levelDisplay.textContent = `Niveau ${state.level}`;
    updateGardenVisual(boardElement);
    continueBtn.classList.add('hidden');
    messageElement.classList.remove('visible');
    
    setTimeout(() => {
        messageElement.textContent = '';
        state.grid = generateSolvedGrid();
        shuffleGrid(state.grid, getShuffleMovesForLevel(state.level));
        renderBoard();
    }, 50);
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
playBtn.addEventListener('click', () => {
    showScreen('game');
    initGame();
});

backBtn.addEventListener('click', () => {
    renderMenu();
    showScreen('menu');
});

restartBtn.addEventListener('click', initGame);

continueBtn.addEventListener('click', () => {
    state.level++; 
    saveProgress(); 
    renderMenu();
    showScreen('menu'); 
});

window.addEventListener('resize', () => {
    if (screenGame.classList.contains('active')) {
        for (let i = 0; i < state.totalTiles; i++) {
            let value = state.grid[i];
            if (value !== 0) updateTilePosition(value, i);
        }
    } else {
        renderMenu();
    }
});

// --- DÉMARRAGE ---
window.addEventListener('load', () => {
    loadProgress(); 
    renderMenu();   
    showScreen('menu');
});
