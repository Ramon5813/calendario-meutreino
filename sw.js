const CACHE_NAME = 'xmen-treinos-v2'; // versão do cache
const STATIC_ASSETS = [
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
  '/icons/xmen-512.png',
  '/offline.html'
];

// Instalando SW e cacheando arquivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativando SW e limpando caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch: cache primeiro, depois rede, com fallback offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // Salva no cache para uso futuro
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Se falhar e não estiver em cache, retorna offline.html
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});
