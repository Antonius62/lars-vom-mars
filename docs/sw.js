const CACHE_NAME = 'lars-vom-mars-v1';

// Dateien, die im Cache gespeichert werden sollen
const FILES_TO_CACHE = [
  './',
  './index.html',
  './audiobook.html',
  './admin.html',
  './lars_vom_mars_song.wav',
  './quack_sound.mp3',
  './mars_background.png',
  './manifest.json'
];

// Installation des Service Workers
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installation');
  
  // Cache erstellen und Dateien hinzufügen
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
});

// Aktivierung des Service Workers
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  // Alte Caches löschen
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch-Ereignis abfangen
self.addEventListener('fetch', (event) => {
  console.log('[ServiceWorker] Fetch', event.request.url);
  
  // Strategie: Cache zuerst, dann Netzwerk als Fallback
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache-Hit - Datei aus dem Cache zurückgeben
        if (response) {
          return response;
        }
        
        // Ansonsten Anfrage ans Netzwerk weiterleiten
        return fetch(event.request)
          .then((response) => {
            // Wichtig: Response klonen, da sie nur einmal verwendet werden kann
            const responseToCache = response.clone();
            
            // Neue Dateien im Cache speichern
            if (event.request.method === 'GET') {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch((error) => {
            // Bei Netzwerkfehlern eine Offline-Seite anzeigen oder einen Fehler zurückgeben
            console.error('Fetch fehlgeschlagen:', error);
            
            // Wenn es eine HTML-Anfrage war, könnte eine Offline-Seite zurückgegeben werden
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // Andere Fehler werden weitergeleitet
            throw error;
          });
      })
  );
});

// IndexedDB-Daten behandeln
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
