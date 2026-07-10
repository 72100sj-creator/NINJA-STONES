// RFC-001 - Grille de repères pour le développement
// N'affecte jamais le jeu : ne fait rien si NS_CONSTANTS.DEBUG_SCENE vaut false.
(function() {
    if (!window.NS_CONSTANTS || !window.NS_CONSTANTS.DEBUG_SCENE) return;

    var grid = document.getElementById('scene-debug-grid');
    if (!grid) return;

    grid.classList.add('active');

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    // Lignes verticales et horizontales tous les 10%
    for (var i = 10; i < 100; i += 10) {
        var vLine = document.createElementNS(svgNS, 'line');
        vLine.setAttribute('x1', i); vLine.setAttribute('y1', 0);
        vLine.setAttribute('x2', i); vLine.setAttribute('y2', 100);
        svg.appendChild(vLine);

        var hLine = document.createElementNS(svgNS, 'line');
        hLine.setAttribute('x1', 0); hLine.setAttribute('y1', i);
        hLine.setAttribute('x2', 100); hLine.setAttribute('y2', i);
        svg.appendChild(hLine);

        var label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', i + 0.5); label.setAttribute('y', 2.5);
        label.textContent = i + '%';
        svg.appendChild(label);
    }
    grid.appendChild(svg);
})();
