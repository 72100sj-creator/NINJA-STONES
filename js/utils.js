/**
 * utils.js
 * Fonctions génériques réutilisables. Aucune logique métier.
 */
window.NS_Utils = {
    // Limite une valeur entre un min et un max
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};