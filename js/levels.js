window.NS_Levels = {
    getShuffleMoves: function(level) {
        const C = window.NS_CONSTANTS;
        return NS_Utils.clamp(C.SHUFFLE_BASE_MOVES + (level - 1) * C.SHUFFLE_INCREMENT, 0, C.SHUFFLE_MAX_MOVES);
    }
};
