window.NS_Save = {
    load: function(state, gardensConfig) {
        try {
            const savedLevel = localStorage.getItem('ninjaStonesLevel');
            if (savedLevel) state.level = parseInt(savedLevel, 10);
            const savedGardens = JSON.parse(localStorage.getItem('ninjaStonesGardens'));
            if (savedGardens) {
                savedGardens.forEach(savedGarden => {
                    const configGarden = gardensConfig.find(g => g.id === savedGarden.id);
                    if (configGarden) configGarden.points = savedGarden.points;
                });
            }
        } catch (e) {}
    },
    save: function(state, gardensConfig) {
        try {
            localStorage.setItem('ninjaStonesLevel', state.level.toString());
            const gardensToSave = gardensConfig.map(g => ({ id: g.id, points: g.points }));
            localStorage.setItem('ninjaStonesGardens', JSON.stringify(gardensToSave));
        } catch (e) {}
    }
};
