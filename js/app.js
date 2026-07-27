(function() {
    const C = window.NS_CONSTANTS;
    const state = {
        level: 1, moves: 0, gridSize: C.DEFAULT_GRID_SIZE,
        totalTiles: C.DEFAULT_GRID_SIZE * C.DEFAULT_GRID_SIZE, grid: [], isPlaying: false
    };

    // Le jardin actif se déduit toujours du niveau global (plus besoin de le sauvegarder à part).
    function getCurrentGarden() { return NS_Garden.getCurrentGarden(state.level, C.GARDENS_CONFIG); }

    function startGame() {
        state.totalTiles = state.gridSize * state.gridSize;
        state.moves = 0;
        state.isPlaying = true;
        NS_UI.updateHeader(state.level);
        let levelInGarden = NS_Garden.getLevelInGarden(state.level);
        NS_UI.updateGardenVisual(NS_UI.getDomElements().gardenBackdrop, getCurrentGarden(), NS_Garden.calculateStage(levelInGarden), levelInGarden);
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
            NS_Audio.playStoneSlide();
            if (NS_Puzzle.checkWin(state.grid)) {
                state.isPlaying = false;
                NS_Audio.playVictoryChime();
                let levelInGarden = NS_Garden.getLevelInGarden(state.level);
                if (NS_Garden.isLastLevelOfGarden(levelInGarden)) {
                    // Dernier niveau du jardin : animation de fin dédiée, différente de la victoire classique
                    let currentGarden = getCurrentGarden();
                    let hasNext = NS_Garden.hasNextGarden(state.level, C.GARDENS_CONFIG);
                    let nextGardenName = hasNext
                        ? C.GARDENS_CONFIG[NS_Garden.getGardenIndexForLevel(state.level) + 1].name
                        : null;
                    NS_UI.showGardenComplete(currentGarden.name, nextGardenName);
                } else {
                    NS_UI.showWinMessage("L'équilibre est rétabli.");
                }
                NS_Save.save(state);
            }
        }
    }

    function goNextLevel() {
        state.level++;
        NS_Save.save(state);
        NS_UI.renderMenu(state, getCurrentGarden());
        NS_UI.showScreen('menu');
    }

    NS_UI.getDomElements().playBtn.addEventListener('click', () => { NS_UI.showScreen('game'); startGame(); });
    NS_UI.getDomElements().backBtn.addEventListener('click', () => { NS_UI.renderMenu(state, getCurrentGarden()); NS_UI.showScreen('menu'); });
    NS_UI.getDomElements().continueBtn.addEventListener('click', goNextLevel);
    NS_UI.getDomElements().muteBtn.addEventListener('click', () => { NS_Audio.toggleMuted(); NS_UI.updateMuteButton(); });

    window.addEventListener('resize', () => {
        if (NS_UI.getDomElements().screenGame.classList.contains('active')) {
            for (let i = 0; i < state.totalTiles; i++) { if (state.grid[i] !== 0) NS_UI.moveTile(state.grid[i], i, state.gridSize); }
        } else { NS_UI.renderMenu(state, getCurrentGarden()); }
    });

    window.addEventListener('load', () => {
        NS_Save.load(state);
        NS_UI.renderMenu(state, getCurrentGarden());
        NS_UI.showScreen('menu');
        NS_UI.updateMuteButton();
    });
})();
