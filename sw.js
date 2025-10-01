const CACHE_NAME = 'xmen-treinos-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/segunda.html',
  '/terca.html',
  '/quarta.html',
  '/quinta.html',
  '/sexta.html',
  '/sabado-domingo.html',
  '/observacoes.html',
  '/dietas.html',
  '/style.css',
  '/xmen-bg.jpg',
  '/icons/xmen-192.png',
  '/icons/xmen-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
