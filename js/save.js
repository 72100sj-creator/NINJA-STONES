window.NS_Save = {
    load: function(state) {
        try {
            const savedLevel = localStorage.getItem('ninjaStonesLevel');
            if (savedLevel) state.level = parseInt(savedLevel, 10);
        } catch (e) {}
    },
    save: function(state) {
        try {
            localStorage.setItem('ninjaStonesLevel', state.level.toString());
        } catch (e) {}
    }
};
