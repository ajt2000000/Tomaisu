const CACHE_VERSION = 'v1';
const CACHE_NAME = `${registration.scope}!${CACHE_VERSION}`;

const urlsToCache = [
  '.',
  'index.html',
  'icon.webp',
  'js/jquery.min.js',
  'style.css',
  'en.html',
  'sp.html',
  'tr.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => {
        return cacheName.startsWith(`${registration.scope}!`) && cacheName !== CACHE_NAME;
      });
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheName) => {
        return caches.delete(cacheName);
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
    .then((response) => {
      if (response) {
        return response;
      }

      let fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        let responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Listen for messages from the main script
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName.startsWith(`${registration.scope}!`))
                  .map((cacheName) => caches.delete(cacheName))
      );
    });
  }
});
