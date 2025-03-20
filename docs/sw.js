const CACHE_NAME = 'lars-vom-mars-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './lars_vom_mars_song.wav',
                './quack_sound.mp3',
                './mars_background.png',
                './Lars_App_Icon.png',
                './manifest.json'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Immer einen neuen Request machen
            return fetch(event.request).then((networkResponse) => {
                // Cache aktualisieren
                if (networkResponse) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback auf Cache wenn offline
                return response;
            });
        })
    );
});
