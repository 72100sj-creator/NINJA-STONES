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
        dom.finaleBtn = document.getElementById('finale-btn');
        dom.backBtn = document.getElementById('back-btn');
        dom.continueBtn = document.getElementById('continue-btn');
        dom.message = document.getElementById('message');
        dom.nextGardenMessage = document.getElementById('next-garden-message');
        dom.winOverlay = document.getElementById('win-overlay');
        dom.muteBtn = document.getElementById('mute-btn');
        dom.awakeningLayer = document.getElementById('awakening-layer');
        dom.finaleLayer = document.getElementById('finale-layer');
        dom.finaleGardenName = document.getElementById('finale-garden-name');
        dom.finaleMessage = document.getElementById('finale-message');
        dom.finaleHint = document.querySelector('.finale-hint');
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

        // RFC-002 : chaque famille d'animations s'éveille au seuil défini pour ce jardin
        NS_Garden.getAllAnimationClasses().forEach(c => dom.gameScene.classList.remove(c));
        NS_Garden.getUnlockedAnimationClasses(lig, gardenConfig).forEach(c => dom.gameScene.classList.add(c));

        // RFC-002 : les pierres s'accordent à la palette du jardin. Le filtre est posé sur le
        // conteneur (qui ne contient que les pierres), ce qui préserve leurs variations individuelles.
        if (dom.board) dom.board.style.filter = NS_Garden.getStoneFilter(gardenConfig);

        // À partir du niveau 17 sur 20, un signe avant-coureur du jardin suivant apparaît discrètement
        const approaching = lig >= 17;
        dom.gameScene.classList.toggle('next-garden-hint', approaching);
    }

    // Frise des jardins : montre le chemin parcouru et ce qui reste à découvrir
    // La frise est cliquable : tout jardin déjà atteint peut être revisité.
    // On se base sur le niveau le plus loin jamais atteint, jamais sur le niveau courant,
    // pour qu'un retour en arrière ne referme aucun jardin.
    let onGardenSelect = null;
    function setGardenSelectHandler(fn) { onGardenSelect = fn; }

    function renderGardenTrail(level, maxLevel) {
        const C = window.NS_CONSTANTS;
        const currentIndex = NS_Garden.getGardenIndexForLevel(level);
        const maxIndex = NS_Garden.getGardenIndexForLevel(maxLevel || level);
        dom.gardenTrail.innerHTML = '';
        C.GARDENS_CONFIG.forEach(function(g, i) {
            const dot = document.createElement('span');
            dot.className = 'trail-dot trail-' + g.id;
            if (i === currentIndex) dot.classList.add('current');
            else if (i <= maxIndex) dot.classList.add('visited');
            else dot.classList.add('locked');

            if (i <= maxIndex) {
                dot.classList.add('selectable');
                dot.title = g.name;
                dot.addEventListener('click', function() {
                    if (onGardenSelect) onGardenSelect(i);
                });
            }
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
        renderGardenTrail(state.level, state.maxLevel);
        // Le final devient rejouable une fois le voyage achevé
        dom.finaleBtn.classList.toggle('hidden', !NS_Garden.isJourneyComplete(state.maxLevel || state.level));
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

    // ===== Séquence de réveil du jardin (fin d'un jardin) =====
    // Le puzzle s'efface, le jardin retourne à son état endormi, puis rejoue toute sa
    // renaissance. Abrégeable d'une simple touche.
    let awakeningTimers = [];
    let awakeningPrimed = [];

    // Chaque animation passe l'essentiel de son cycle à attendre, immobile, puis exécute son
    // mouvement. Cette table indique à quel endroit du cycle ce mouvement commence.
    // On y avance chaque animation au début du réveil : elles se déclenchent donc toutes
    // presque aussitôt, mais se jouent à leur vitesse naturelle.
    const DEBUT_DU_MOUVEMENT = {
        // Familles de base
        'bamboo-stalk': 0.58, 'lantern-glow': 0, 'lantern-ground-glow': 0,
        'ripple-ring': 0, 'pond-sparkle': 0.88, 'firefly': 0, 'dragonfly': 0.74, 'damselfly': 0.78,
        'falling-leaf': 0, 'falling-leaf-autumn': 0, 'falling-leaf-autumn2': 0,
        'falling-petal': 0, 'snowflake': 0, 'next-hint': 0,
        // Bambou
        'koi-shadow': 0, 'bamboo-shoot': 0, 'dew-drop': 0.52, 'high-bird': 0.66,
        // Automne
        'gust-leaf': 0.74, 'ground-swirl': 0.55, 'sun-ray': 0.62, 'morning-mist': 0.48,
        // Hiver
        'frost': 0.82, 'powder': 0.76, 'moon-halo': 0,
        // Sakura
        'sp-petal': 0.60, 'sakura-branch': 0.56, 'branch-petal': 0.62,
        'pond-petal': 0, 'petal-haze': 0.44,
        // Nuit
        'shooting-star': 0.85, 'star': 0.68, 'moon-reflection': 0, 'lone-firefly': 0.34,
        // Eau
        'wr': 0, 'lily-pad': 0, 'glint': 0.72, 'water-stream': 0.52,
        // Braises
        'ember': 0.46, 'coal': 0, 'ash': 0, 'smoke-wisp': 0.50
    };

    function amorcerAnimations() {
        awakeningPrimed = [];
        Object.keys(DEBUT_DU_MOUVEMENT).forEach(function(classe) {
            const debut = DEBUT_DU_MOUVEMENT[classe];
            Array.prototype.forEach.call(document.querySelectorAll('.' + classe), function(el) {
                const duree = parseFloat(getComputedStyle(el).animationDuration);
                if (!duree) return;   // animation inactive dans ce jardin : rien à faire
                el.style.animationDelay = (-(debut * duree)).toFixed(2) + 's';
                awakeningPrimed.push(el);
            });
        });
    }

    function rendreAnimationsNormales() {
        awakeningPrimed.forEach(function(el) { el.style.animationDelay = ''; });
        awakeningPrimed = [];
    }

    function clearAwakeningTimers() {
        awakeningTimers.forEach(function(t) { clearTimeout(t); });
        awakeningTimers = [];
    }

    function finishAwakening(onFinish) {
        clearAwakeningTimers();
        rendreAnimationsNormales();
        dom.awakeningLayer.classList.remove('visible');
        dom.awakeningLayer.onclick = null;
        dom.gameScene.classList.remove('awakening');
        // État final : jardin pleinement restauré, toutes ses animations éveillées
        dom.gardenBackdrop.style.transition = '';
        if (typeof onFinish === 'function') onFinish();
    }

    function playGardenAwakening(gardenConfig, onFinish) {
        const DURATION = 10000;
        clearAwakeningTimers();

        dom.gameScene.classList.add('awakening');
        dom.awakeningLayer.classList.add('visible');

        // 1. Le jardin retourne à son état endormi, toutes animations éteintes
        NS_Garden.getAllAnimationClasses().forEach(function(c) { dom.gameScene.classList.remove(c); });
        dom.gardenBackdrop.style.transition = 'none';
        dom.gardenBackdrop.style.filter = NS_Garden.getRestorationFilter(1, gardenConfig);
        void dom.gardenBackdrop.offsetWidth; // force la prise en compte de l'état de départ

        // 2. Chaque animation est avancée au début de son mouvement : toutes se déclencheront
        //    dès leur réveil, sans que leur vitesse soit modifiée.
        amorcerAnimations();

        // 3. Puis le jardin renaît en continu sur toute la durée de la séquence
        dom.gardenBackdrop.style.transition = 'filter ' + (DURATION / 1000) + 's linear';
        dom.gardenBackdrop.style.filter = NS_Garden.getRestorationFilter(9999, gardenConfig);

        // 4. Ses animations réapparaissent une à une, dans l'ordre où le joueur les a découvertes
        const unlocks = NS_Garden.getSetting(gardenConfig, 'animationUnlocks');
        const ordre = Object.keys(unlocks).sort(function(a, b) { return unlocks[a] - unlocks[b]; });
        const pas = (DURATION - 2000) / Math.max(ordre.length, 1);
        ordre.forEach(function(cle, i) {
            awakeningTimers.push(setTimeout(function() {
                dom.gameScene.classList.add('anim-' + cle);
            }, 700 + i * pas));
        });

        // 5. Aucune fin automatique : le jardin reste vivant tant que le joueur ne touche pas
        //    l'écran. Le message n'apparaît qu'à ce moment-là.
        dom.awakeningLayer.onclick = function() { finishAwakening(onFinish); };
    }

    // ===== Grand final =====
    // Les huit jardins défilent un par un, toutes animations éveillées, puis le Ninja salue.
    // Comme la séquence de réveil, elle ne se termine jamais d'elle-même : le dernier jardin
    // reste vivant tant que le joueur ne touche pas l'écran.
    let finaleTimers = [];

    function clearFinaleTimers() {
        finaleTimers.forEach(function(t) { clearTimeout(t); });
        finaleTimers = [];
    }

    function stopFinale(onFinish) {
        clearFinaleTimers();
        rendreAnimationsNormales();
        dom.finaleLayer.classList.remove('visible');
        dom.finaleMessage.classList.remove('visible');
        dom.finaleHint.classList.remove('visible');
        dom.finaleLayer.onclick = null;
        dom.gameScene.classList.remove('awakening');
        dom.gardenBackdrop.style.transition = '';
        if (typeof onFinish === 'function') onFinish();
    }

    function playFinale(onFinish) {
        const C = window.NS_CONSTANTS;
        const PAR_JARDIN = 15000;
        const jardins = C.GARDENS_CONFIG;
        clearFinaleTimers();

        dom.gameScene.classList.add('awakening');   // efface le puzzle et l'interface
        dom.finaleLayer.classList.add('visible');
        dom.finaleMessage.classList.remove('visible');
        dom.finaleHint.classList.remove('visible');
        dom.gardenBackdrop.style.transition = 'background-image 1.6s ease, filter 1.6s ease';

        function montrerJardin(i) {
            const g = jardins[i];
            // updateGardenVisual pose la classe du jardin affiché (garden-water, garden-winter...) :
            // c'est indispensable, car chaque animation est conditionnée à son jardin d'origine.
            // Sans elle, seules les animations universelles apparaîtraient.
            updateGardenVisual(dom.gardenBackdrop, g, 4, 20);
            NS_Garden.getAllAnimationClasses().forEach(function(c) { dom.gameScene.classList.add(c); });
            // Le navigateur doit d'abord recalculer les styles du nouveau jardin : sans ce délai,
            // amorcerAnimations lirait encore les durées de l'ancien et ignorerait les nouvelles
            // animations (elles resteraient invisibles pendant tout le passage du jardin).
            finaleTimers.push(setTimeout(amorcerAnimations, 60));
            dom.finaleGardenName.textContent = g.name;
            dom.finaleGardenName.classList.remove('show');
            void dom.finaleGardenName.offsetWidth;
            dom.finaleGardenName.classList.add('show');
        }

        jardins.forEach(function(g, i) {
            finaleTimers.push(setTimeout(function() { montrerJardin(i); }, i * PAR_JARDIN));
        });

        // Une fois tous les jardins traversés : le message et le salut du Ninja
        const finDefile = jardins.length * PAR_JARDIN;
        finaleTimers.push(setTimeout(function() {
            dom.finaleGardenName.classList.remove('show');
            dom.finaleMessage.classList.add('visible');
            NS_Audio.playFinaleChime();
        }, finDefile));
        finaleTimers.push(setTimeout(function() {
            dom.finaleHint.classList.add('visible');
        }, finDefile + 4000));

        // Touchable à tout moment : on abrège et on revient au menu
        dom.finaleLayer.onclick = function() { stopFinale(onFinish); };
    }

    function updateMuteButton() {
        const muted = NS_Audio.isMuted();
        dom.muteBtn.textContent = muted ? '🔇' : '🔊';
        dom.muteBtn.setAttribute('aria-label', muted ? 'Activer le son' : 'Couper le son');
    }

    function resetGameUI() {
        // Sécurité : si une séquence de réveil ou le final était en cours, on referme proprement
        clearAwakeningTimers();
        clearFinaleTimers();
        dom.finaleLayer.classList.remove('visible');
        dom.finaleMessage.classList.remove('visible');
        dom.finaleHint.classList.remove('visible');
        dom.finaleLayer.onclick = null;
        rendreAnimationsNormales();
        dom.awakeningLayer.classList.remove('visible');
        dom.awakeningLayer.onclick = null;
        dom.gameScene.classList.remove('awakening');
        dom.gardenBackdrop.style.transition = '';

        dom.winOverlay.classList.remove('visible', 'garden-final');
        dom.message.textContent = '';
        dom.nextGardenMessage.textContent = '';
    }

    cacheDomElements();

    return {
        showScreen: showScreen, updateHeader: updateHeader, updateGardenVisual: updateGardenVisual,
        renderMenu: renderMenu, renderGameBoard: renderGameBoard, moveTile: moveTile,
        showWinMessage: showWinMessage, showGardenComplete: showGardenComplete,
        playGardenAwakening: playGardenAwakening, playFinale: playFinale,
        setGardenSelectHandler: setGardenSelectHandler,
        resetGameUI: resetGameUI, updateMuteButton: updateMuteButton,
        getDomElements: function() { return dom; }
    };
})();
