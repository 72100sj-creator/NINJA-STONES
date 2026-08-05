// Service Worker basique pour rendre l'application PWA fonctionnelle
const CACHE_NAME = 'ninja-stones-v17';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './privacy.html',
  './mentions-legales.html',
  './css/style.css',
  './js/app.js',
  './js/constants.js',
  './js/utils.js',
  './js/audio.js',
  './js/save.js',
  './js/levels.js',
  './js/garden.js',
  './js/puzzle.js',
  './js/ui.js',
  './js/scene-debug.js',
  './assets/images/garden-bamboo-stage-1.jpg',
  './assets/images/garden-autumn-stage-1.jpg',
  './assets/images/garden-winter-stage-1.jpg',
  './assets/images/garden-sakura-stage-1.jpg',
  './assets/images/garden-night-stage-1.jpg',
  './assets/images/garden-water-stage-1.jpg',
  './assets/images/garden-embers-stage-1.jpg',
  './assets/images/board-frame.png',
  './assets/images/ninja-character.png',
  './assets/images/ninja-character-win.png',
  './assets/images/ninja-character-calm.png',
  './assets/images/stone-texture-1.jpg',
  './assets/images/stone-texture-2.jpg',
  './assets/images/stone-texture-3.jpg',
  './assets/images/stone-texture-4.jpg',
  './assets/images/stone-texture-5.jpg',
  './assets/images/icon-512.png?v=2',
  './assets/images/icon-192.png?v=2',
  './assets/images/icon-180.png?v=2',
  './assets/images/icon-32.png?v=2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    // Réseau d'abord : une mise à jour mise en ligne est visible immédiatement.
    fetch(event.request)
      .then(response => {
        // On garde une copie fraîche pour l'usage hors connexion
        const copie = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copie)).catch(() => {});
        return response;
      })
      // Hors connexion (ou serveur injoignable) : on sert la copie enregistrée
      .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
  );
});
