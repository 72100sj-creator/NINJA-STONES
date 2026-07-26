// Service Worker basique pour rendre l'application PWA fonctionnelle
const CACHE_NAME = 'ninja-stones-v10';
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
  './assets/images/board-frame.png',
  './assets/images/ninja-character.png',
  './assets/images/ninja-character-win.png',
  './assets/images/stone-texture-1.jpg',
  './assets/images/stone-texture-2.jpg',
  './assets/images/stone-texture-3.jpg',
  './assets/images/stone-texture-4.jpg',
  './assets/images/stone-texture-5.jpg',
  './assets/images/icon-512.png',
  './assets/images/icon-192.png',
  './assets/images/icon-180.png',
  './assets/images/icon-32.png'
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
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});