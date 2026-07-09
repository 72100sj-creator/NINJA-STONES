/**
 * app.js
 * Initialisation et orchestration générale.
 */
(function() {
    const C = window.NS_CONSTANTS;

    // État global du jeu
    const state = {
        level: 1,
        currentGardenIndex: 0,
        moves: 0,
        gridSize: C.DEFAULT_GRID_SIZE,
        totalTiles: C.DEFAULT_GRID_SIZE * C.DEFAULT_GRID_SIZE,
        grid: [],
        isPlaying: false
    };

    // Récupération du jardin actif (raccourci)
    function getCurrentGarden() {
        return C.GARDENS_CONFIG[state.currentGardenIndex];
    }

    // --- LOGIQUE DE PARTIE ---

    function startGame() {
        state.totalTiles = state.gridSize * state.gridSize;
        state.moves = 0;
        state.isPlaying = true;
        
        NS_UI.updateHeader(state.level);
        NS_UI.updateGardenVisual(NS_UI.getDomElements().board, NS_Garden.calculateStage(getCurrentGarden()));
        NS_UI.resetGameUI();
        
        setTimeout(() => {
            state.grid = NS_Puzzle.generateSolvedGrid(state.totalTiles);
            NS_Puzzle.shuffleGrid(state.grid, state.gridSize, NS_Levels.getShuffleMoves(state.level));
            NS_UI.renderGameBoard(state.grid, state.gridSize, handleTileClick);
        }, 50);
    }

    function handleTileClick(value) {
        if (!state.isPlaying) return;

        let clickedIndex = state.grid.indexOf(value);
        let emptyIndex = state.grid.indexOf(0);
        
        if (NS_Puzzle.getAdjacentIndexes(emptyIndex, state.gridSize).includes(clickedIndex)) {
            state.grid[emptyIndex] = value;
            state.grid[clickedIndex] = 0;
            state.moves++;
            
            NS_UI.moveTile(value, emptyIndex, state.gridSize);

            if (NS_Puzzle.checkWin(state.grid)) {
                state.isPlaying = false;
                let progressText = NS_Garden.awardPoints(getCurrentGarden(), 1);
                NS_UI.showWinMessage(`L'équilibre est rétabli. (${progressText})`);
                NS_Save.save(state, C.GARDENS_CONFIG);
            }
        }
    }

    function goNextLevel() {
        state.level++;
        NS_Save.save(state, C.GARDENS_CONFIG);
        NS_UI.renderMenu(state, getCurrentGarden());
        NS_UI.showScreen('menu');
    }

    // --- ÉCOUTEURS ---

    NS_UI.getDomElements().playBtn.addEventListener('click', () => {
        NS_UI.showScreen('game');
        startGame();
    });

    NS_UI.getDomElements().backBtn.addEventListener('click', () => {
        NS_UI.renderMenu(state, getCurrentGarden());
        NS_UI.showScreen('menu');
    });

    NS_UI.getDomElements().restartBtn.addEventListener('click', startGame);
    NS_UI.getDomElements().continueBtn.addEventListener('click', goNextLevel);

    window.addEventListener('resize', () => {
        if (NS_UI.getDomElements().screenGame.classList.contains('active')) {
            for (let i = 0; i < state.totalTiles; i++) {
                if (state.grid[i] !== 0) NS_UI.moveTile(state.grid[i], i, state.gridSize);
            }
        } else {
            NS_UI.renderMenu(state, getCurrentGarden());
        }
    });

    // --- DÉMARRAGE AVEC FILET DE SÉCURITÉ ---
    window.addEventListener('load', () => {
        try {
            NS_Save.load(state, C.GARDENS_CONFIG);
            NS_UI.renderMenu(state, getCurrentGarden());
            NS_UI.showScreen('menu');
        } catch (error) {
            // Si ça plante, on affiche l'erreur sur l'écran pour le débogage
            document.body.innerHTML = '<div style="padding:20px;color:red;font-family:monospace;">Erreur de chargement : ' + error.message + '</div>';
        }
    });

})();
