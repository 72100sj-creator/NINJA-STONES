window.NS_Save = {
    load: function(state) {
        try {
            const savedLevel = localStorage.getItem('ninjaStonesLevel');
            if (savedLevel) state.level = parseInt(savedLevel, 10);
            // Niveau le plus loin jamais atteint : permet de revisiter un jardin terminé
            // sans jamais perdre sa progression réelle.
            const savedMax = localStorage.getItem('ninjaStonesMaxLevel');
            state.maxLevel = savedMax ? parseInt(savedMax, 10) : state.level;
            if (state.maxLevel < state.level) state.maxLevel = state.level;
        } catch (e) {}
    },
    save: function(state) {
        try {
            if (!state.maxLevel || state.maxLevel < state.level) state.maxLevel = state.level;
            localStorage.setItem('ninjaStonesLevel', state.level.toString());
            localStorage.setItem('ninjaStonesMaxLevel', state.maxLevel.toString());
        } catch (e) {}
    }
};
