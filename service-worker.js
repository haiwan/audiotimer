// Name of the cache storage
const CACHE_NAME = 'audio-timer-cache-v1';

// List of all assets to cache immediately upon installation
const urlsToCache = [
    './', // Caches index.html (or the root page)
    'index.html',
    'buzzer.mp3',
    // External libraries that must be available offline
    'https://cdn.tailwindcss.com'
];

// 1. Install Event: Caches all necessary assets
self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                // Use addAll to fetch and cache all URLs in the list
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Fetch Event: Serves content from cache first, then falls back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // If not in cache, try the network
                return fetch(event.request).catch(error => {
                    // This fallback only occurs if the network fetch also fails (i.e., truly offline)
                    console.log('[Service Worker] Fetch failed, request for:', event.request.url);
                    // You could serve a specific offline page here if one existed
                    // Since the main page is cached, it should load successfully.
                });
            })
    );
});

// 3. Activate Event: Cleans up old caches (if you update the CACHE_NAME)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old caches
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
