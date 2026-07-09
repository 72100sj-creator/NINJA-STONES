/**
 * Ninja Stones - V0.1.0
 * Système de Points d'Harmonie et Jardins Génériques
 */

// --- NOUVEAU : CONFIGURATION DES JARDINS (Générique) ---
// Pour ajouter un jardin plus tard, il suffit de rajouter un objet ici
const GARDENS_CONFIG = [
    {
        id: 'bamboo',
        name: 'Jardin du Bambou',
        thresholds: [5, 10, 20, 35, 50, 75, 100], // Paliers d'évolution
        points: 0 // Sera chargé depuis la sauvegarde
    }
    // Exemple futur : { id: 'zen', name: 'Jardin Zen', thresholds: [10, 25, 50], points: 0 }
];

// --- ÉTAT GLOBAL DU JEU ---
const state = {
    level: 1,
    currentGardenIndex: 0, // Quel jardin est en cours de restauration
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
const gardenNameEl = document.getElementById('garden-name');
const progressBarEl = document.getElementById('progress-bar');
const menuBoard = document.getElementById('menu-board');
const playBtn = document.getElementById('play-btn');

const boardElement = document.getElementById('board');
const restartBtn = document.getElementById('restart-btn');
const continueBtn = document.getElementById('continue-btn');
const backBtn = document.getElementById('back-btn');
const messageElement = document.getElementById('message');

let tilesElements = {}; 

// --- NOUVEAU : MATHS DU SYSTÈME D'HARMONIE ---

/** Calcule le stade visuel (1 à 4) en fonction des points */
function getGardenStage(garden) {
    let stage = 1;
    for (let i = 0; i < garden.thresholds.length; i++) {
        if (garden.points >= garden.thresholds[i]) {
            stage = i + 2; // Stade 2, 3, 4...
        }
    }
    // On plafonne le stade visuel au nombre de classes CSS existantes (4)
    return Math.min(stage, 4);
}

/** Calcule le pourcentage de remplissage de la barre */
function getGardenProgressPercent(garden) {
    let stage = getGardenStage(garden);
    let currentThreshold = (stage === 1) ? 0 : garden.thresholds[stage - 2];
    
    // Si on a dépassé le dernier palier
    if (stage > garden.thresholds.length) return 100;

    let nextThreshold = garden.thresholds[stage - 1];
    let progress = (garden.points - currentThreshold) / (nextThreshold - currentThreshold);
    return Math.min(progress * 100, 100);
}

// --- NAVIGATION ---
function showScreen(screenName) {
    screenMenu.classList.remove('active');
    screenGame.classList.remove('active');
    if (screenName === 'menu') screenMenu.classList.add('active');
    if (screenName === 'game') screenGame.classList.add('active');
}

// --- SAUVEGARDE GÉNÉRIQUE ---
function loadProgress() {
    try {
        const savedLevel = localStorage.getItem('ninjaStonesLevel');
        if (savedLevel) state.level = parseInt(savedLevel, 10);

        const savedGardens = JSON.parse(localStorage.getItem('ninjaStonesGardens'));
        if (savedGardens) {
            savedGardens.forEach(savedGarden => {
                // On met à jour les points dans notre configuration de base
                const configGarden = GARDENS_CONFIG.find(g => g.id === savedGarden.id);
                if (configGarden) configGarden.points = savedGarden.points;
            });
        }
    } catch (e) {}
}

function saveProgress() {
    try {
        localStorage.setItem('ninjaStonesLevel', state.level.toString());
        // On sauvegarde uniquement l'ID et les points de chaque jardin
        const gardensToSave = GARDENS_CONFIG.map(g => ({ id: g.id, points: g.points }));
        localStorage.setItem('ninjaStonesGardens', JSON.stringify(gardensToSave));
    } catch (e) {}
}

// --- JARDIN VISUEL ---
function updateGardenVisual(boardEl) {
    boardEl.classList.remove('garden-stage-2', 'garden-stage-3', 'garden-stage-4');
    let currentGarden = GARDENS_CONFIG[state.currentGardenIndex];
    let stage = getGardenStage(currentGarden);
    
    if (stage >= 2) boardEl.classList.add('garden-stage-' + stage);
}

// --- MENU ---
function renderMenu() {
    levelDisplay.textContent = `Niveau ${state.level}`;
    
    let currentGarden = GARDENS_CONFIG[state.currentGardenIndex];
    
    // Mise à jour de l'interface d'harmonie
    gardenNameEl.textContent = currentGarden.name;
    progressBarEl.style.width = getGardenProgressPercent(currentGarden) + '%';
    
    // Mise à jour du visuel
    updateGardenVisual(menuBoard);
    
    menuBoard.innerHTML = '';
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

// --- LOGIQUE DE DIFFICULTÉ ---
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
            
            // NOUVEAU : SYSTÈME D'HARMONIE
            let currentGarden = GARDENS_CONFIG[state.currentGardenIndex];
            currentGarden.points += 1; // +1 Point d'Harmonie
            
            // Calcul du prochain palier pour le message
            let nextThreshold = currentGarden.thresholds.find(t => t > currentGarden.points);
            let progressText = nextThreshold ? `Prochain palier : ${nextThreshold}` : "Jardin maîtrisé";
            
            messageElement.textContent = `L'équilibre est rétabli. (${progressText})`;
            
            void messageElement.offsetWidth; 
            messageElement.classList.add('visible');
            continueBtn.classList.remove('hidden');
            
            saveProgress(); // Sauvegarde les nouveaux points
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
    renderMenu(); // Met à jour la barre de progression
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
