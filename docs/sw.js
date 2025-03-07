const CACHE_NAME = 'lars-vom-mars-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Lars_App_Icon.png',
  './mars_background.png',
  './quack_sound.mp3',
  './chapter1.mp3',
  './chapter2.mp3',
  './chapter3.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
