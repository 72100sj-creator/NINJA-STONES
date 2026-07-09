// Service Worker basique pour rendre l'application PWA fonctionnelle
const CACHE_NAME = 'ninja-stones-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/constants.js',
  './js/utils.js',
  './js/save.js',
  './js/levels.js',
  './js/garden.js',
  './js/puzzle.js',
  './js/ui.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
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