window.NS_UI = (function() {
    let dom = {};
    let tilesElements = {};

    function cacheDomElements() {
        dom.screenMenu = document.getElementById('screen-menu');
        dom.screenGame = document.getElementById('screen-game');
        dom.levelDisplay = document.getElementById('level-display');
        dom.gardenName = document.getElementById('garden-name');
        dom.progressBar = document.getElementById('progress-bar');
        dom.board = document.getElementById('board');
        dom.gardenBackdrop = document.getElementById('garden-backdrop');
        dom.playBtn = document.getElementById('play-btn');
        dom.backBtn = document.getElementById('back-btn');
        dom.continueBtn = document.getElementById('continue-btn');
        dom.message = document.getElementById('message');
        dom.winOverlay = document.getElementById('win-overlay');
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

    function updateHeader(level) { dom.levelDisplay.textContent = `Niveau ${level}`; }

    function updateGardenVisual(boardEl, stage) {
        const C = window.NS_CONSTANTS;
        for (let i = 2; i <= C.MAX_VISUAL_STAGE; i++) boardEl.classList.remove(C.CSS_STAGE_PREFIX + i);
        if (stage >= 2) boardEl.classList.add(C.CSS_STAGE_PREFIX + stage);
    }

    function renderMenu(state, gardenConfig) {
        updateHeader(state.level);
        dom.gardenName.textContent = gardenConfig.name;
        dom.progressBar.style.width = NS_Garden.calculateProgress(gardenConfig) + '%';
        updateGardenVisual(dom.gardenBackdrop, NS_Garden.calculateStage(gardenConfig));
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

    function showWinMessage(text) {
        dom.message.textContent = text;
        dom.winOverlay.classList.add('visible');
    }

    function resetGameUI() {
        dom.winOverlay.classList.remove('visible');
        dom.message.textContent = '';
    }

    cacheDomElements();

    return {
        showScreen: showScreen, updateHeader: updateHeader, updateGardenVisual: updateGardenVisual,
        renderMenu: renderMenu, renderGameBoard: renderGameBoard, moveTile: moveTile,
        showWinMessage: showWinMessage, resetGameUI: resetGameUI, getDomElements: function() { return dom; }
    };
})();
