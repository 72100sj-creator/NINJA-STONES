(function() {
    const C = window.NS_CONSTANTS;
    const state = {
        level: 1, maxLevel: 1, moves: 0, gridSize: C.DEFAULT_GRID_SIZE,
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
                if (NS_Garden.isJourneyComplete(state.level)) {
                    // Tout dernier niveau du jeu : le grand final, où les huit jardins défilent.
                    NS_UI.playFinale(function() {
                        NS_UI.renderMenu(state, getCurrentGarden());
                        NS_UI.showScreen('menu');
                    });
                } else if (NS_Garden.isLastLevelOfGarden(levelInGarden)) {
                    // Dernier niveau du jardin : la séquence de réveil rejoue toute sa renaissance,
                    // puis seulement ensuite le message de fin apparaît.
                    let currentGarden = getCurrentGarden();
                    let hasNext = NS_Garden.hasNextGarden(state.level, C.GARDENS_CONFIG);
                    let nextGardenName = hasNext
                        ? C.GARDENS_CONFIG[NS_Garden.getGardenIndexForLevel(state.level) + 1].name
                        : null;
                    NS_UI.playGardenAwakening(currentGarden, function() {
                        NS_UI.showGardenComplete(currentGarden.name, nextGardenName);
                    });
                } else {
                    NS_UI.showWinMessage(NS_Garden.getWinMessage(levelInGarden));
                }
                NS_Save.save(state);
            }
        }
    }

    function goNextLevel() {
        // Une fois tous les jardins traversés, le niveau n'augmente plus :
        // le joueur peut rejouer le dernier jardin, achevé et pleinement vivant.
        if (!NS_Garden.isJourneyComplete(state.level)) {
            state.level++;
            NS_Save.save(state);
        }
        NS_UI.renderMenu(state, getCurrentGarden());
        NS_UI.showScreen('menu');
    }

    NS_UI.getDomElements().playBtn.addEventListener('click', () => { NS_UI.showScreen('game'); startGame(); });
    NS_UI.getDomElements().backBtn.addEventListener('click', () => { NS_UI.renderMenu(state, getCurrentGarden()); NS_UI.showScreen('menu'); });
    NS_UI.getDomElements().continueBtn.addEventListener('click', goNextLevel);
    // Revisiter un jardin déjà atteint : on repart à son premier niveau,
    // sans jamais réduire la progression réelle (maxLevel est conservé).
    NS_UI.setGardenSelectHandler(function(gardenIndex) {
        state.level = gardenIndex * C.LEVELS_PER_GARDEN + 1;
        NS_Save.save(state);
        NS_UI.renderMenu(state, getCurrentGarden());
    });

    NS_UI.getDomElements().finaleBtn.addEventListener('click', () => {
        NS_UI.playFinale(function() {
            NS_UI.renderMenu(state, getCurrentGarden());
            NS_UI.showScreen('menu');
        });
    });
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
