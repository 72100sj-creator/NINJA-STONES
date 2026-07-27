window.NS_UI = (function() {
    let dom = {};
    let tilesElements = {};

    function cacheDomElements() {
        dom.screenMenu = document.getElementById('screen-menu');
        dom.screenGame = document.getElementById('screen-game');
        dom.levelDisplay = document.getElementById('level-display');
        dom.levelNameDisplay = document.getElementById('level-name-display');
        dom.gardenName = document.getElementById('garden-name');
        dom.gardenStage = document.getElementById('garden-stage');
        dom.gardenTrail = document.getElementById('garden-trail');
        dom.progressBar = document.getElementById('progress-bar');
        dom.board = document.getElementById('board');
        dom.gardenBackdrop = document.getElementById('garden-backdrop');
        dom.gameScene = document.getElementById('game-scene');
        dom.playBtn = document.getElementById('play-btn');
        dom.backBtn = document.getElementById('back-btn');
        dom.continueBtn = document.getElementById('continue-btn');
        dom.message = document.getElementById('message');
        dom.nextGardenMessage = document.getElementById('next-garden-message');
        dom.winOverlay = document.getElementById('win-overlay');
        dom.muteBtn = document.getElementById('mute-btn');
    }

    function showScreen(name) {
        const target = (name === 'menu') ? dom.screenMenu : dom.screenGame;
        const current = dom.screenMenu.classList.contains('active') ? dom.screenMenu
            : (dom.screenGame.classList.contains('active') ? dom.screenGame : null);

        if (current === target) return;

        if (current) {
            current.classList.remove('active');
            setTimeout(() => { target.classList.add('active'); }, 420);
        } else {
            target.classList.add('active');
        }
    }

    function updateHeader(level) {
        dom.levelDisplay.textContent = `Niveau ${level}`;
        dom.levelNameDisplay.textContent = NS_Levels.getLevelName(level);
    }

    function updateGardenVisual(boardEl, gardenConfig, stage, levelInGarden) {
        boardEl.style.backgroundImage = `url('${gardenConfig.backgroundImage}')`;

        // RFC-002 : le jardin part endormi (délavé, assombri) et retrouve ses couleurs
        // au fil des niveaux. Le filtre ne change qu'au changement de niveau, jamais image par image.
        const lig = (typeof levelInGarden === 'number') ? levelInGarden : 1;
        boardEl.style.filter = NS_Garden.getRestorationFilter(lig, gardenConfig);

        const C = window.NS_CONSTANTS;
        C.GARDENS_CONFIG.forEach(g => dom.gameScene.classList.remove('garden-' + g.id));
        dom.gameScene.classList.add('garden-' + gardenConfig.id);

        // À partir du niveau 17 sur 20, un signe avant-coureur du jardin suivant apparaît discrètement
        const approaching = lig >= 17;
        dom.gameScene.classList.toggle('next-garden-hint', approaching);
    }

    // Frise des jardins : montre le chemin parcouru et ce qui reste à découvrir
    function renderGardenTrail(level) {
        const C = window.NS_CONSTANTS;
        const currentIndex = NS_Garden.getGardenIndexForLevel(level);
        dom.gardenTrail.innerHTML = '';
        C.GARDENS_CONFIG.forEach(function(g, i) {
            const dot = document.createElement('span');
            dot.className = 'trail-dot trail-' + g.id;
            if (i < currentIndex) dot.classList.add('visited');
            else if (i === currentIndex) dot.classList.add('current');
            else dot.classList.add('locked');
            dom.gardenTrail.appendChild(dot);
        });
    }

    function renderMenu(state, gardenConfig) {
        updateHeader(state.level);
        dom.gardenName.textContent = gardenConfig.name;
        let levelInGarden = NS_Garden.getLevelInGarden(state.level);
        dom.progressBar.style.width = NS_Garden.calculateProgress(levelInGarden) + '%';
        let stage = NS_Garden.calculateStage(levelInGarden);
        dom.gardenStage.textContent = gardenConfig.stageNames[stage - 1];
        updateGardenVisual(dom.gardenBackdrop, gardenConfig, stage, levelInGarden);
        renderGardenTrail(state.level);
        tilesElements = {};
    }

    function renderGameBoard(grid, gridSize, onTileClickCallback) {
        dom.board.innerHTML = '';
        tilesElements = {};
        _renderStones(dom.board, grid, gridSize, dom.board.clientWidth, onTileClickCallback);
    }

    function _renderStones(containerEl, grid, gridSize, boardWidth, onClickCallback) {
        const C = window.NS_CONSTANTS;
        const gap = C.STONE_GAP; 
        const stoneSize = (boardWidth - (gap * (gridSize + 1))) / gridSize;
        for (let i = 0; i < grid.length; i++) {
            let value = grid[i];
            if (value === 0) continue;
            let row = Math.floor(i / gridSize);
            let col = i % gridSize;
            let x = gap + col * (stoneSize + gap);
            let y = gap + row * (stoneSize + gap);
            const stone = document.createElement('div');
            stone.className = 'stone';
            stone.textContent = value;
            stone.style.width = `${stoneSize}px`;
            stone.style.height = `${stoneSize}px`;
            stone.style.animationDelay = `${i * 0.035}s`;
            stone.style.transform = `translate(${x}px, ${y}px)`;
            if (onClickCallback) stone.addEventListener('click', () => onClickCallback(value));
            containerEl.appendChild(stone);
            tilesElements[value] = stone;
        }
    }

    function moveTile(value, newIndex, gridSize) {
        const stone = tilesElements[value];
        if (!stone) return;
        const C = window.NS_CONSTANTS;
        let boardWidth = stone.parentElement.clientWidth;
        const gap = C.STONE_GAP;
        const stoneSize = (boardWidth - (gap * (gridSize + 1))) / gridSize;
        let row = Math.floor(newIndex / gridSize);
        let col = newIndex % gridSize;
        let x = gap + col * (stoneSize + gap);
        let y = gap + row * (stoneSize + gap);
        stone.style.transform = `translate(${x}px, ${y}px)`;
    }

    // Victoire d'un niveau ordinaire (pas le dernier du jardin)
    function showWinMessage(text) {
        dom.message.textContent = text;
        dom.nextGardenMessage.textContent = '';
        dom.winOverlay.classList.remove('garden-final');
        dom.winOverlay.classList.add('visible');
    }

    // Fin de jardin (20e niveau) : mise en scène dédiée, plus marquée que la victoire classique
    function showGardenComplete(gardenName, nextGardenName) {
        dom.message.textContent = `${gardenName} est achevé.`;
        dom.nextGardenMessage.textContent = nextGardenName ? `${nextGardenName} s'éveille...` : 'Tous les jardins sont maîtrisés.';
        dom.winOverlay.classList.add('garden-final');
        dom.winOverlay.classList.add('visible');
    }

    function updateMuteButton() {
        const muted = NS_Audio.isMuted();
        dom.muteBtn.textContent = muted ? '🔇' : '🔊';
        dom.muteBtn.setAttribute('aria-label', muted ? 'Activer le son' : 'Couper le son');
    }

    function resetGameUI() {
        dom.winOverlay.classList.remove('visible', 'garden-final');
        dom.message.textContent = '';
        dom.nextGardenMessage.textContent = '';
    }

    cacheDomElements();

    return {
        showScreen: showScreen, updateHeader: updateHeader, updateGardenVisual: updateGardenVisual,
        renderMenu: renderMenu, renderGameBoard: renderGameBoard, moveTile: moveTile,
        showWinMessage: showWinMessage, showGardenComplete: showGardenComplete,
        resetGameUI: resetGameUI, updateMuteButton: updateMuteButton,
        getDomElements: function() { return dom; }
    };
})();
