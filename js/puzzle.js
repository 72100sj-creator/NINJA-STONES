window.NS_Puzzle = {
    generateSolvedGrid: function(totalTiles) {
        let grid = [];
        for (let i = 1; i < totalTiles; i++) grid.push(i);
        grid.push(0);
        return grid;
    },
    shuffleGrid: function(grid, gridSize, moves) {
        let emptyIndex = grid.indexOf(0);
        for (let i = 0; i < moves; i++) {
            let neighbors = this.getAdjacentIndexes(emptyIndex, gridSize);
            let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            grid[emptyIndex] = grid[randomNeighbor];
            grid[randomNeighbor] = 0;
            emptyIndex = randomNeighbor;
        }
    },
    getAdjacentIndexes: function(index, gridSize) {
        let row = Math.floor(index / gridSize);
        let col = index % gridSize;
        let neighbors = [];
        if (row > 0) neighbors.push(index - gridSize);
        if (row < gridSize - 1) neighbors.push(index + gridSize);
        if (col > 0) neighbors.push(index - 1);
        if (col < gridSize - 1) neighbors.push(index + 1);
        return neighbors;
    },
    checkWin: function(grid) {
        for (let i = 0; i < grid.length - 1; i++) {
            if (grid[i] !== i + 1) return false;
        }
        return true;
    }
};
