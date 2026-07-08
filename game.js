/**
 * Ninja Stones - V0.0.9 (Fix Safari iOS Ghost Layout)
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

// --- NOUVEAU : SUPER FONCTION DE SÉCURITÉ POUR SAFARI ---
/**
 * Force le calcul de la largeur du plateau.
 * Safari retarde parfois ce calcul quand on change d'écran.
 */
function getSafeBoardWidth(boardEl) {
    // 1. Essai normal
    let width = boardEl.clientWidth;
    if (width > 0) return width;
    
    // 2. Forcer Safari à calculer via les styles CSS
    width = parseFloat(getComputedStyle(boardEl).width);
    if (width > 0) return width;
    
    // 3. Si tout échoue, calcul mathématique de secours
    return Math.min(window.innerWidth, window.innerHeight * 0.8) * 0.85;
}

// --- NAVIGATION ENTRE LES ÉCRANS ---
function showScreen(screenName) {
    screenMenu.classList.remove('active');
    screenGame.classList.remove('active');
    
    if (screenName === 'menu') {
        screenMenu.classList.add('active');
    } else if (screenName === 'game') {
        screenGame.classList.add('active');
    }
}

// --- GESTION DE LA SAUVEGARDE ---
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

// --- LOGIQUE D'ÉVOLUTION DU JARDIN ---
function updateGardenVisual(boardEl) {
    boardEl.classList.remove('garden-stage-2', 'garden-stage-3', 'garden-stage-4');
    if (state.level >= 10) boardEl.classList.add('garden-stage-4');
    else if (state.level >= 7) boardEl.classList.add('garden-stage-3');
    else if (state.level >= 4) boardEl.classList.add('garden-stage-2');
}

// --- RENDU DU MENU ---
function renderMenu() {
    levelDisplay.textContent = `Niveau ${state.level}`;
    updateGardenVisual(menuBoard);
    
    menuBoard.innerHTML = '';
    // Utilisation de la fonction sécurisée
    let boardWidth = getSafeBoardWidth(menuBoard);
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

// --- LOGIQUE DE DIFFICULTÉ ---
function getShuffleMovesForLevel(level) {
    return Math.min(15 + (level - 1) * 15, 200);
}

// --- LOGIQUE PRINCIPALE DU JEU ---
function initGame() {
    state.totalTiles = state.gridSize * state.gridSize;
    state.moves = 0;
    state.isPlaying = true;
    
    levelDisplay.textContent = `Niveau ${state.level}`;
    
    updateGardenVisual(boardElement);
    continueBtn.classList.add('hidden');
    messageElement.classList.remove('visible');
    
    // On utilise requestAnimationFrame : cela dit à Safari "attends que l'écran soit dessiné AVANT de lancer la suite"
    requestAnimationFrame(() => {
        messageElement.textContent = '';
        state.grid = generateSolvedGrid();
        shuffleGrid(state.grid, getShuffleMovesForLevel(state.level));
        renderBoard();
    });
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
    let row = Math.floor(index / state
