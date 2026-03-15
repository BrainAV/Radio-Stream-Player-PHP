const CACHE_NAME = 'radio-player-v2.2.6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.php',
  '/styles.css',
  '/player.js',
  '/visualizer.js',
  '/api.js',
  '/settings.js',
  '/state.js',
  '/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install Event - Caching App Shell
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Cleaning up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('[Service Worker] Clearing Old Cache');
              return caches.delete(cache);
            }
          })
        );
      }),
      self.clients.claim() // Take control of all open clients immediately
    ])
  );
});

// Fetch Event - Network First, falling back to cache
// Note: For radio streams, we always want network. Metadata proxy too.
self.addEventListener('fetch', (event) => {
  // Never cache API calls or streams
  if (event.request.url.includes('/api/') || event.request.url.includes('api.djay.ca')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
