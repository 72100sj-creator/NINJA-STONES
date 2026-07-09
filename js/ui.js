window.NS_UI = (function() {
    let dom = {};
    let tilesElements = {};

    function cacheDomElements() {
        dom.screenMenu = document.getElementById('screen-menu');
        dom.screenGame = document.getElementById('screen-game');
        dom.levelDisplay = document.getElementById('level-display');
        dom.gardenName = document.getElementById('garden-name');
        dom.progressBar = document.getElementById('progress-bar');
        dom.menuBoard = document.getElementById('menu-board');
        dom.board = document.getElementById('board');
        dom.playBtn = document.getElementById('play-btn');
        dom.backBtn = document.getElementById('back-btn');
        dom.restartBtn = document.getElementById('restart-btn');
        dom.continueBtn = document.getElementById('continue-btn');
        dom.message = document.getElementById('message');
    }

    function showScreen(name) {
        dom.screenMenu.classList.remove('active');
        dom.screenGame.classList.remove('active');
        if (name === 'menu') dom.screenMenu.classList.add('active');
        if (name === 'game') dom.screenGame.classList.add('active');
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
        updateGardenVisual(dom.menuBoard, NS_Garden.calculateStage(gardenConfig));
        dom.menuBoard.innerHTML = '';
        tilesElements = {};
        _renderStones(dom.menuBoard, NS_Puzzle.generateSolvedGrid(state.totalTiles), state.gridSize, dom.menuBoard.clientWidth, null);
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
        void dom.message.offsetWidth;
        dom.message.classList.add('visible');
        dom.continueBtn.classList.remove('hidden');
    }

    function resetGameUI() {
        dom.continueBtn.classList.add('hidden');
        dom.message.classList.remove('visible');
        dom.message.textContent = '';
    }

    cacheDomElements();

    return {
        showScreen: showScreen, updateHeader: updateHeader, updateGardenVisual: updateGardenVisual,
        renderMenu: renderMenu, renderGameBoard: renderGameBoard, moveTile: moveTile,
        showWinMessage: showWinMessage, resetGameUI: resetGameUI, getDomElements: function() { return dom; }
    };
})();
